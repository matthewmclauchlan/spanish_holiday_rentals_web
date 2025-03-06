import axios from 'axios';

export default async ({ req, res, log, error }) => {
  try {
    // Retrieve the raw payload from the request body or environment variable.
    let rawPayload = '';
    if (req && req.body) {
      rawPayload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      log("Using req.body payload:", rawPayload);
    } else if (process.env.APPWRITE_FUNCTION_DATA) {
      rawPayload = process.env.APPWRITE_FUNCTION_DATA;
      log("Using APPWRITE_FUNCTION_DATA payload:", rawPayload);
    }
    
    if (!rawPayload || rawPayload.trim() === "") {
      throw new Error("No booking data provided in payload.");
    }
    
    // First parse: Parse the outer JSON payload.
    let payloadObj = JSON.parse(rawPayload);
    log("First parsed payload:", JSON.stringify(payloadObj));
    
    // Check if the payload is wrapped inside a 'data' property
    let bookingData;
    if (payloadObj.data) {
      // Second parse: Parse the inner JSON string.
      bookingData = JSON.parse(payloadObj.data);
    } else {
      bookingData = payloadObj;
    }
    
    log("Booking data after double parse:", JSON.stringify(bookingData));
    
    // Map booking data to Glide table columns.
    const columnValues = {
      "osSGC": bookingData.bookingReference,
      "zzS6X": bookingData.status,
      "OxHg9": bookingData.userId,
      "pqFGm": bookingData.cancellationPolicy,
      "7bQyT": bookingData.checkIn,
      "cr54X": bookingData.checkOut,
      "eBGjO": bookingData.createdAt,
      "KKnqL": bookingData.updatedAt,
      "mTi6H": bookingData.totalPrice,
      "jZhQc": bookingData.adults,
      "nMEJR": bookingData.children,
      "DACXd": bookingData.infants,
      "k0pZu": bookingData.pets,
      "WUIZR": bookingData.propertyId,
      "V0IbZ": bookingData.hostId,
      "lpVka": bookingData.paymentId,
      "ceqf6": bookingData.customerEmail
    };
    log("Mapped column values:", JSON.stringify(columnValues));
    
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
    log("Glide endpoint:", process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables");
    log("Glide payload:", JSON.stringify(glidePayload));
    
    // Send the POST request to Glide.
    const glideResponse = await axios.post(
      process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables",
      glidePayload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GLIDE_API_KEY}`
        }
      }
    );
    
    log("Successfully pushed booking data to Glide:", JSON.stringify(glideResponse.data));
    
    return res.json({
      message: "Booking data pushed successfully",
      glideResponse: glideResponse.data,
    });
    
  } catch (err) {
    error("Error pushing booking data to Glide:", err);
    return res.json({ error: err.message });
  }
};
