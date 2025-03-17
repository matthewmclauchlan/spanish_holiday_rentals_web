import sdk from 'node-appwrite';
import axios from 'axios';

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

    // Retrieve the payload.
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

    // Validate the webhook secret.
    const expectedSecret = process.env.GLIDE_GUEST_APPROVAL_WEBHOOK_SECRET;
    if (!payload.auth || (payload.auth || "").trim() !== (expectedSecret || "").trim()) {
      log("Webhook secret mismatch. Received:", payload.auth);
      return res.json({ success: false, error: "Unauthorized: invalid webhook secret" });
    }
    log("Webhook secret validated.");

    // Extract fields.
    const {
      userId,
      image,
      status,
      moderationComments,
      decisionDate,
      submissionDate,
      approvedBy,
      buttonFlag,
      userName,
      email,
      phoneNumber
    } = payload;

    // Update the verification document.
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
    const dataPayload = {
      userId,
      status,
      moderationComments,
      decisionDate,
      submissionDate,
      approvedBy,
      buttonFlag,
      image,
      userName,
      email,
      phoneNumber
    };

    if (verificationDoc) {
      log("Updating existing document: " + verificationDoc.$id);
      responseData = await databases.updateDocument(
        databaseId,
        collectionId,
        verificationDoc.$id,
        dataPayload
      );
    } else {
      log("Creating new verification document.");
      responseData = await databases.createDocument(
        databaseId,
        collectionId,
        sdk.ID.unique(),
        dataPayload
      );
    }

    log("Verification document updated/created: " + JSON.stringify(responseData));
    
    // If the status is "approved" or "needs_info", trigger a conversation.
    if (status === "approved" || status === "needs_info") {
      // Call the createSupportConversation endpoint.
      const createConvEndpoint = process.env.CREATE_SUPPORT_CONVERSATION_ENDPOINT || "http://localhost:4000/api/createSupportConversation";
      // For guest-initiated, you might include bookingId; for verification, omit it.
      const payloadForConversation = {
        userId,
        // Optionally include bookingId if applicable.
      };
      let conversationId;
      try {
        const convResponse = await axios.post(createConvEndpoint, payloadForConversation, {
          headers: { "Content-Type": "application/json" }
        });
        conversationId = convResponse.data.conversationId;
        log("Conversation created with ID:", conversationId);
      } catch (convError) {
        error("Error creating conversation: " + convError.message);
      }
      
      // Prepare the system message content.
      let systemContent = "";
      if (status === "approved") {
        systemContent = "Your ID has been verified. You do not need to reply.";
      } else if (status === "needs_info") {
        systemContent = "Support has requested additional information regarding your verification. Please reply with a new image or additional details.";
      }
      
      // Trigger a system message if conversationId is available.
      if (conversationId && systemContent) {
        const systemMessagePayload = {
          conversationId,
          content: systemContent
        };
        const chatEndpoint = process.env.CHAT_SYSTEM_MESSAGE_ENDPOINT || "http://localhost:4000/api/sendSystemMessage";
        try {
          await axios.post(chatEndpoint, systemMessagePayload, {
            headers: { "Content-Type": "application/json" }
          });
          log("System message triggered for conversation:", conversationId);
        } catch (chatError) {
          error("Error triggering system message: " + chatError.message);
        }
      }
    }
    
    return res.json({ success: true, data: responseData });
  } catch (err) {
    error("Error in Cloud Function: " + err.message);
    return res.json({ success: false, error: err.message });
  }
}
