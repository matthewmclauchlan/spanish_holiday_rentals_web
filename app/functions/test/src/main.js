// main.js – Minimal booking test function
export default async ({ req, res, log, error }) => {
  try {
    // Read the payload from the HTTP request (if available) or from the environment variable.
    let rawPayload = '';
    if (req && req.body) {
      // In HTTP mode, req.body might be set.
      rawPayload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      log("Using req.body payload:", rawPayload);
    } else if (process.env.APPWRITE_FUNCTION_DATA) {
      // For background functions (or when testing via the /executions endpoint)
      rawPayload = process.env.APPWRITE_FUNCTION_DATA;
      log("Using APPWRITE_FUNCTION_DATA payload:", rawPayload);
    }
    
    if (!rawPayload || rawPayload.trim() === "") {
      throw new Error("No booking data provided in payload.");
    }
    
    // Log and return the raw payload for testing.
    log("Raw booking payload:", rawPayload);
    
    return res.json({
      message: "Payload received successfully",
      rawPayload,
    });
    
  } catch (err) {
    error("Error in processing payload:", err);
    return res.json({ error: err.message });
  }
};
