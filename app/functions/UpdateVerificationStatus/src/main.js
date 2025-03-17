import sdk from 'node-appwrite';

const client = new sdk.Client();
client
  .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_GUEST_VERIFICATIONS_COLLECTION_ID;
const databaseId = process.env.APPWRITE_DATABASE_ID;

export default async function handler({ req, res, log, error }) {
  try {
    log("Function execution started.");

    // Try to get the raw payload from either req.body or req.payload.
    const rawPayload = req.body || req.payload;
    let payload = {};
    try {
      payload = typeof rawPayload === "string" && rawPayload.trim() !== ""
        ? JSON.parse(rawPayload)
        : rawPayload;
    } catch (parseError) {
      log("Error parsing payload: " + parseError.message);
      return res.json({ success: false, error: "Invalid JSON payload" });
    }
    log("Payload received: " + JSON.stringify(payload));

    // Validate the webhook secret from the body.
    const expectedSecret = process.env.GLIDE_GUEST_APPROVAL_WEBHOOK_SECRET;
    if (payload.auth !== expectedSecret) {
      log("Webhook secret mismatch. Received:", payload.auth);
      return res.json({ success: false, error: "Unauthorized: invalid webhook secret" });
    }
    log("Webhook secret validated.");

    const {
      userId,
      image,
      status,
      moderationComments,
      decisionDate,
      submissionDate,
      approvedBy,
      buttonFlag,
    } = payload;

    let verificationDoc;
    try {
      const result = await databases.listDocuments(
        databaseId,
        collectionId,
        [sdk.Query.equal("userId", userId)]
      );
      log("Documents found: " + result.documents.length);
      if (result.documents.length > 0) {
        verificationDoc = result.documents[0];
      }
    } catch (fetchError) {
      error("Error fetching verification document: " + fetchError.message);
    }

    let responseData;
    if (verificationDoc) {
      log("Updating existing document: " + verificationDoc.$id);
      responseData = await databases.updateDocument(
        databaseId,
        collectionId,
        verificationDoc.$id,
        {
          status,
          moderationComments,
          decisionDate,
          submissionDate,
          approvedBy,
          buttonFlag,
          image,
        }
      );
    } else {
      log("Creating new verification document.");
      responseData = await databases.createDocument(
        databaseId,
        collectionId,
        sdk.ID.unique(),
        {
          userId,
          status,
          moderationComments,
          decisionDate,
          submissionDate,
          approvedBy,
          buttonFlag,
          image,
        }
      );
    }

    log("Verification document updated/created: " + JSON.stringify(responseData));
    return res.json({ success: true, data: responseData });
  } catch (err) {
    error("Error in Cloud Function: " + err.message);
    return res.json({ success: false, error: err.message });
  }
}
