import sdk from 'node-appwrite';

const client = new sdk.Client();
client
  .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

export default async function handler({ req, res, log, error }) {
  try {
    log("Function execution started.");
    // Log available keys in the request object
    log("Request keys: " + Object.keys(req).join(", "));
    log("Raw req.body: " + req.body);
    log("Raw req.payload: " + req.payload);

    // Try to get the raw payload from req.body or req.payload.
    const rawPayload = req.body || req.payload;
    if (!rawPayload) {
      log("No payload provided.");
      return res.json({ success: false, error: "No payload provided" });
    }
    
    let payload;
    try {
      payload = typeof rawPayload === "string" ? JSON.parse(rawPayload) : rawPayload;
    } catch (parseError) {
      log("Error parsing payload: " + parseError.message);
      return res.json({ success: false, error: "Invalid JSON payload" });
    }
    
    log("Payload received: " + JSON.stringify(payload));
    return res.json({ success: true, payload });
  } catch (err) {
    error("Error in Cloud Function: " + err.message);
    return res.json({ success: false, error: err.message });
  }
}
