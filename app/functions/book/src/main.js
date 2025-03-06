import axios from 'axios';

export default async ({ req, res, log, error }) => {
  try {
    // Step 1: Retrieve the raw payload from req.body or environment variable.
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
    
    // Step 2: First parse: Parse the outer payload.
    let payloadObj = JSON.parse(rawPayload);
    log("First parsed payload:", JSON.stringify(payloadObj));
    
    // Step 3: Check if the booking data is wrapped inside a 'data' property.
    let bookingData;
    if (payloadObj.data) {
      bookingData = JSON.parse(payloadObj.data);
    } else {
      bookingData = payloadObj;
    }
    log("Booking data after double parse:", JSON.stringify(bookingData));
    
    // Step 4: Map booking data to Glide table columns.
    // Replace the keys (e.g., "osSGC", "zzS6X", etc.) with your actual Glide column IDs.
    const columnValues = {
      "osSGC": bookingData.bookingReference,          // bookingReference
      "zzS6X": bookingData.status,                      // status
      "OxHg9": bookingData.userId,                      // userId
      "pqFGm": bookingData.cancellationPolicy,          // cancellationPolicy
      "7bQyT": bookingData.startDate,                   // startDate (was checkIn)
      "cr54X": bookingData.endDate,                      // endDate (was checkOut)
      "eBGjO": bookingData.createdAt,                   // createdAt
      "KKnqL": bookingData.updatedAt,                   // updatedAt
      "mTi6H": bookingData.totalPrice,                  // totalPrice
      "jZhQc": bookingData.adults,                      // adults
      "nMEJR": bookingData.children,                    // children
      "DACXd": bookingData.babies,                      // babies (formerly infants)
      "k0pZu": bookingData.pets,                        // pets
      "WUIZR": bookingData.propertyId,                 // propertyId
      "V0IbZ": bookingData.hostId,                      // hostId
      "lpVka": bookingData.paymentId,                   // paymentId
      "ceqf6": bookingData.customerEmail,              // customerEmail
      "priceRules": bookingData.appliedPriceRuleIds     // appliedPriceRuleIds – use your desired column ID here
    };
    log("Mapped column values:", JSON.stringify(columnValues));
    
    // Step 5: Build the payload for Glide.
    const glidePayload = {
      appID: process.env.GLIDE_APP_ID,           // Must be set in your environment variables
      mutations: [
        {
          kind: "add-row-to-table",
          tableName: process.env.GLIDE_TABLE_NAME, // Must be set in your environment variables
          columnValues: columnValues
        }
      ]
    };
    log("Glide endpoint:", process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables");
    log("Glide payload:", JSON.stringify(glidePayload));
    
    // Step 6: Post the payload to Glide.
    const glideResponse = await axios.post(
      process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables",
      glidePayload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GLIDE_API_KEY}` // Must be set in your environment variables
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
