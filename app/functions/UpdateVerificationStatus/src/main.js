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

    // Retrieve and parse the payload.
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
    if (!payload.auth || payload.auth.trim() !== expectedSecret.trim()) {
      log("Webhook secret mismatch. Received:", payload.auth);
      return res.json({ success: false, error: "Unauthorized: invalid webhook secret" });
    }
    log("Webhook secret validated.");

    // Extract expected fields.
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

    // Build payload for the verification document.
    const dataPayload = {
      userId,
      status,
      moderationComments,
      decisionDate,
      ...(submissionDate ? { submissionDate } : {}),
      ...(approvedBy ? { approvedBy } : {}),
      ...(buttonFlag ? { buttonFlag } : {}),
      ...(image ? { image } : {}),
      ...(userName ? { userName } : {}),
      ...(email ? { email } : {}),
      ...(phoneNumber ? { phoneNumber } : {}),
    };

    // Query for an existing verification document.
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
    
    // If the status is "approved" or "needs_info", trigger a conversation and system message.
    if (status === "approved" || status === "needs_info") {
      // Use a default bookingId ("verification") for these cases.
      const createConvEndpoint =
        process.env.CREATE_SUPPORT_CONVERSATION_ENDPOINT ||
        "https://spanish-holiday-rentals-web.vercel.app/api/createSupportConversation";
      const conversationPayload = { bookingId: "verification", userId };
      let conversationId;
      try {
        const convResponse = await fetch(createConvEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(conversationPayload)
        });
        const convData = await convResponse.json();
        conversationId = convData.conversationId;
        log("Conversation created with ID:", conversationId);
      } catch (convError) {
        error("Error creating conversation: " + (convError instanceof Error ? convError.message : convError));
      }
      
      // Prepare system message content.
      let systemContent = "";
      if (status === "approved") {
        systemContent = "Your ID has been verified. You do not need to reply.";
      } else if (status === "needs_info") {
        systemContent = "Support has requested additional information regarding your verification. Please reply with a new image or additional details.";
      }
      
      if (conversationId && systemContent) {
        const systemMessagePayload = {
          conversationId,
          content: systemContent
        };
        const chatEndpoint =
          process.env.SEND_SYSTEM_MESSAGE_ENDPOINT ||
          "https://spanish-holiday-rentals-web.vercel.app/api/sendSystemMessage";
        try {
          const chatResponse = await fetch(chatEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.GLIDE_API_KEY}`
            },
            body: JSON.stringify(systemMessagePayload)
          });
          const chatData = await chatResponse.json();
          log("System message triggered for conversation:", conversationId, chatData);
        } catch (chatError) {
          error("Error triggering system message: " + (chatError instanceof Error ? chatError.message : chatError));
        }
      }
    }
    
    return res.json({ success: true, data: responseData });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    error("Error in Cloud Function: " + errorMessage);
    return res.json({ success: false, error: errorMessage });
  }
}
