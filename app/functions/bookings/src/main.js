

export default async function pushBookingToGlide(context, req) {
  try {
    // Log both values for troubleshooting:
    context.log("req:", req);
    context.log("process.env.APPWRITE_FUNCTION_DATA:", process.env.APPWRITE_FUNCTION_DATA);

    // Try to read the payload:
    let rawPayload = "";
    if (req && typeof req.text === "function") {
      rawPayload = await req.text();
      context.log("Read req.text() payload:", rawPayload);
    } else if (req && req.body) {
      rawPayload = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      context.log("Using req.body payload:", rawPayload);
    } else if (process.env.APPWRITE_FUNCTION_DATA) {
      rawPayload = process.env.APPWRITE_FUNCTION_DATA;
      context.log("Using APPWRITE_FUNCTION_DATA payload:", rawPayload);
    }

    if (!rawPayload || rawPayload.trim() === "") {
      throw new Error("No booking data provided in payload.");
    }

    // Parse the payload
    let payload = JSON.parse(rawPayload);
    context.log("Parsed booking payload:", JSON.stringify(payload));

    // (Mapping, Glide payload building, and axios call go here.)
    // … [rest of your function code]

    return {
      status: 200,
      body: JSON.stringify({ message: "Booking data pushed successfully" /*, data: response.data*/ }),
    };
  } catch (error) {
    context.error("Error pushing booking data to Glide:", error);
    return {
      status: 500,
      body: JSON.stringify({ error: error.message || "An unknown error occurred" }),
    };
  }
}
