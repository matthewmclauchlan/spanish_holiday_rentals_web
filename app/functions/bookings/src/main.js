// main.js – Appwrite Cloud Function to push booking data to Glide using axios
import axios from 'axios';

export default async function pushBookingToGlide(context, req) {
  try {
    // Log the context, request object, and environment variable for debugging.
    context.log("Full context:", JSON.stringify(context));
    context.log("Request object:", JSON.stringify(req));
    context.log("APPWRITE_FUNCTION_DATA:", process.env.APPWRITE_FUNCTION_DATA);

    // Attempt to extract the payload from various possible sources.
    let payload = {};
    if (req && req.body && Object.keys(req.body).length > 0) {
      payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      context.log("Using req.body payload");
    } else if (req && req.payload && Object.keys(req.payload).length > 0) {
      payload = typeof req.payload === "string" ? JSON.parse(req.payload) : req.payload;
      context.log("Using req.payload payload");
    } else if (process.env.APPWRITE_FUNCTION_DATA) {
      payload = JSON.parse(process.env.APPWRITE_FUNCTION_DATA);
      context.log("Using APPWRITE_FUNCTION_DATA payload");
    } else {
      context.log("No payload found in any source");
    }
    
    context.log("Parsed booking payload:", JSON.stringify(payload));
    if (Object.keys(payload).length === 0) {
      throw new Error("No booking data provided in payload.");
    }

    // Map your booking data to the Glide table columns.
    const columnValues = {
      "osSGC": payload.bookingReference,    // booking_reference
      "zzS6X": payload.status,                // status
      "OxHg9": payload.userId,                // appwrite_userId
      "pqFGm": payload.cancellationPolicy,    // cancellation_policy
      "7bQyT": payload.checkIn,               // start_date
      "cr54X": payload.checkOut,              // end_date
      "eBGjO": payload.createdAt,             // created_at
      "KKnqL": payload.updatedAt,             // updated_at
      "mTi6H": payload.totalPrice,            // total_price
      "jZhQc": payload.adults,                // adults
      "nMEJR": payload.children,              // children
      "DACXd": payload.infants,               // infants
      "k0pZu": payload.pets,                  // pets
      "WUIZR": payload.propertyId,            // propertyId
      "V0IbZ": payload.hostId,                // hostId
      "lpVka": payload.paymentId,             // paymentId
      "ceqf6": payload.customerEmail           // customer_email
    };

    context.log("Mapped column values:", JSON.stringify(columnValues));

    // Build the payload for Glide.
    const glidePayload = {
      appID: process.env.GLIDE_APP_ID,
      mutations: [
        {
          kind: "add-row-to-table",
          tableName: process.env.GLIDE_TABLE_NAME,
          columnValues: columnValues
        }
      ]
    };

    context.log("Posting to Glide endpoint:", process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables");
    context.log("Payload to send to Glide:", JSON.stringify(glidePayload));

    // Send the POST request to Glide.
    const response = await axios.post(
      process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables",
      glidePayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GLIDE_API_KEY}`
        }
      }
    );
    
    context.log("Successfully pushed booking data to Glide:", JSON.stringify(response.data));

    return {
      status: 200,
      body: JSON.stringify({ message: "Booking data pushed successfully", data: response.data }),
    };
  } catch (error) {
    context.error("Error pushing booking data to Glide:", error);
    return {
      status: 500,
      body: JSON.stringify({ error: error.message || "An unknown error occurred" }),
    };
  }
}
