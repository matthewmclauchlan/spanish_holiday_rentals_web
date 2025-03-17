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

    // Attempt to retrieve the payload from multiple keys.
    const rawPayload = req.bodyJson || req.bodyText || req.body;
    if (!rawPayload) {
      log("No payload provided.");
      return res.json({ success: false, error: "No payload provided" });
    }
    
    let payload;
    if (typeof rawPayload === "string") {
      try {
        payload = JSON.parse(rawPayload);
      } catch (parseError) {
        log("Error parsing payload: " + parseError.message);
        return res.json({ success: false, error: "Invalid JSON payload" });
      }
    } else {
      payload = rawPayload;
    }
    
    log("Payload received: " + JSON.stringify(payload));

    // Validate the webhook secret from the payload.
    const expectedSecret = process.env.GLIDE_GUEST_APPROVAL_WEBHOOK_SECRET;
    if (!payload.auth || payload.auth !== expectedSecret) {
      log("Webhook secret mismatch. Received:", payload.auth);
      return res.json({ success: false, error: "Unauthorized: invalid webhook secret" });
    }
    log("Webhook secret validated.");

    // Extract expected fields from payload.
    const {
      userId,
      status,
      moderationComments,
      decisionDate,
      submissionDate,
      approvedBy,
    } = payload;

    // Query for an existing verification document for the given user.
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
