// main.js (or main.ts if you prefer TypeScript)
import sdk from 'node-appwrite';

// Initialize the Appwrite client with environment variables.
const client = new sdk.Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // e.g., https://cloud.appwrite.io/v1
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

// Our Cloud Function's main handler
module.exports = async (req, res) => {
  try {
    // Verify the webhook secret
    const receivedSecret = req.headers['x-webhook-secret'];
    if (receivedSecret !== process.env.GLIDE_GUEST_APPROVAL_WEBHOOK_SECRET) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Parse JSON payload
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

    console.log("Received payload:", req.body);

    // Define the collection ID from environment variables
    const collectionId = process.env.USER_VERIFICATIONS_COLLECTION_ID;
    const databaseId = process.env.APPWRITE_DATABASE_ID;

    // Try to fetch an existing verification document for this user
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
      console.error("Error fetching existing verification document:", fetchError);
    }

    let response;
    if (verificationDoc) {
      // Update the existing document
      response = await databases.updateDocument(
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
          image  // Optionally store the image info if needed
        }
      );
    } else {
      // Create a new verification document
      response = await databases.createDocument(
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
          image  // Optionally store the image info if needed
        }
      );
    }

    console.log("Verification document updated/created:", response);
    return res.json({ success: true, data: response });
  } catch (error) {
    console.error("Error in Cloud Function:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
