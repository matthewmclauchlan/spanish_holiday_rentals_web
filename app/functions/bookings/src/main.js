// main.js – Appwrite Cloud Function to push booking data to Glide using axios
import axios from 'axios';

export default async function pushBookingToGlide(context, req) {
  try {
    // Log the APPWRITE_FUNCTION_DATA environment variable to see the payload
    context.log("APPWRITE_FUNCTION_DATA:", process.env.APPWRITE_FUNCTION_DATA);

    // Read payload from environment variable (this is how event triggers pass data)
    let rawPayload = process.env.APPWRITE_FUNCTION_DATA || "";
    context.log("Raw Payload:", rawPayload);

    if (!rawPayload || rawPayload.trim() === "") {
      throw new Error("No booking data provided in payload.");
    }

    // Parse the payload
    let payload;
    try {
      payload = JSON.parse(rawPayload);
    } catch (parseError) {
      throw new Error("Failed to parse booking payload: " + parseError.message);
    }
    context.log("Parsed booking payload:", JSON.stringify(payload));

    // Map booking data to Glide table columns
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
      "ceqf6": payload.customerEmail          // customer_email
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
