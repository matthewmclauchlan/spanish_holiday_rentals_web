import sdk from 'node-appwrite';

const client = new sdk.Client();
client
  .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT) // e.g., "https://cloud.appwrite.io/v1"
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const collectionId = process.env.USER_VERIFICATIONS_COLLECTION_ID;
const databaseId = process.env.APPWRITE_DATABASE_ID;

export default async function handler({ req, res, log, error }) {
  try {
    // Verify the webhook secret
    const receivedSecret = req.headers['x-webhook-secret'];
    if (receivedSecret !== process.env.GLIDE_GUEST_APPROVAL_WEBHOOK_SECRET) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    // Parse the JSON payload from Glide
    const {
      userId,
      image,
      status,
      moderationComments,
      decisionDate,
      submissionDate,
      approvedBy,
      buttonFlag
    } = req.body;

    log(`Received payload: ${JSON.stringify(req.body)}`);

    // Attempt to fetch an existing verification document for this user
    let verificationDoc;
    try {
      const result = await databases.listDocuments(
        databaseId,
        collectionId,
        [sdk.Query.equal("userId", userId)]
      );
      if (result.documents.length > 0) {
        verificationDoc = result.documents[0];
      }
    } catch (fetchError) {
      error("Error fetching verification document: " + fetchError.message);
    }

    let responseData;
    if (verificationDoc) {
      // Update the existing document
      responseData = await databases.updateDocument(
        databaseId,
        collectionId,
        verificationDoc.$id,
        {
          verified: status === 'approved',
          moderationComments,
          decisionDate,
          submissionDate,
          approvedBy,
          buttonFlag,
          image,
        }
      );
    } else {
      // Create a new verification document
      responseData = await databases.createDocument(
        databaseId,
        collectionId,
        sdk.ID.unique(),
        {
          userId,
          verified: status === 'approved',
          moderationComments,
          decisionDate,
          submissionDate,
          approvedBy,
          buttonFlag,
          image,
        }
      );
    }

    log(`Verification document updated/created: ${JSON.stringify(responseData)}`);
    return res.json({ success: true, data: responseData });
  } catch (err) {
    error("Error in Cloud Function: " + err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
