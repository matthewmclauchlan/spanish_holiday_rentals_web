import sdk from 'node-appwrite';

const client = new sdk.Client();
client
  .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT) // e.g., "https://cloud.appwrite.io/v1"
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const collectionId = process.env.NEXT_PUBLIC_GUEST_VERIFICATIONS_COLLECTION_ID; // Use the updated env variable name
const databaseId = process.env.APPWRITE_DATABASE_ID;

export default async function handler({ req, res, log, error }) {
  try {
    log("Function execution started.");

    const receivedSecret =
  req.headers['x-webhook-secret'] ||
  req.body.webhookSecret ||
  req.body.GLIDE_GUEST_APPROVAL_WEBHOOK_SECRET;

    if (receivedSecret !== process.env.GLIDE_GUEST_APPROVAL_WEBHOOK_SECRET) {
      log("Webhook secret mismatch.");
      return res.json({ success: false, error: 'Unauthorized' });
    }

    const payload = req.body;
    log("Payload received: " + JSON.stringify(payload));

    const {
      userId,
      image,
      status, // now using status directly
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
          status, // store status directly
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
          status, // store status directly
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
