import sdk from 'node-appwrite';

const client = new sdk.Client();
client
  .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

export default async function handler({ req, res, log, error }) {
  try {
    log("Function execution started.");
    // Log available keys and specific body properties for debugging.
    log("Request keys: " + Object.keys(req).join(", "));
    log("Raw req.bodyText: " + req.bodyText);
    log("Raw req.bodyJson: " + JSON.stringify(req.bodyJson));

    // Try to get the raw payload from req.bodyJson, req.bodyText, or req.body.
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
    return res.json({ success: true, payload });
  } catch (err) {
    error("Error in Cloud Function: " + err.message);
    return res.json({ success: false, error: err.message });
  }
}
