import axios from 'axios';

/**
 * Manually sends booking details to Glide.
 * @param {object} bookingData - The booking details.
 * @returns {Promise<object>} - The response from Glide.
 */
export async function sendBookingToGlide(bookingData) {
  try {
    console.log("sendBookingToGlide called with bookingData:", JSON.stringify(bookingData));

    // Map booking data to Glide table columns.
    const columnValues = {
      "osSGC": bookingData.bookingReference,          // bookingReference
      "zzS6X": bookingData.status,                      // status
      "OxHg9": bookingData.userId,                      // userId
      "pqFGm": bookingData.cancellationPolicy,          // cancellationPolicy
      "7bQyT": bookingData.startDate,                   // startDate
      "cr54X": bookingData.endDate,                      // endDate
      "eBGjO": bookingData.createdAt,                   // createdAt
      "KKnqL": bookingData.updatedAt,                   // updatedAt
      "mTi6H": bookingData.totalPrice,                  // totalPrice
      "jZhQc": bookingData.adults,                      // adults
      "nMEJR": bookingData.children,                    // children
      "DACXd": bookingData.babies,                      // babies
      "k0pZu": bookingData.pets,                        // pets
      "WUIZR": bookingData.propertyId,                 // propertyId
      "V0IbZ": bookingData.hostId,                      // hostId
      "lpVka": bookingData.paymentId,                   // paymentId
      "ceqf6": bookingData.customerEmail,              // customerEmail
      "priceRules": bookingData.appliedPriceRuleIds     // appliedPriceRuleIds – adjust as needed
    };

    console.log("Mapped column values:", JSON.stringify(columnValues));

    // Build the payload for Glide.
    const glidePayload = {
      appID: process.env.GLIDE_APP_ID, // Must be set in your environment variables
      mutations: [
        {
          kind: "add-row-to-table",
          tableName: process.env.GLIDE_TABLE_NAME, // Must be set in your environment variables
          columnValues: columnValues
        }
      ]
    };

    const glideEndpoint = process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables";
    console.log("GLIDE_API_KEY:", process.env.GLIDE_API_KEY);
    console.log("GLIDE_APP_ID:", process.env.GLIDE_APP_ID);
    console.log("GLIDE_TABLE_NAME:", process.env.GLIDE_TABLE_NAME);
    console.log("Glide endpoint:", glideEndpoint);
    console.log("Glide payload:", JSON.stringify(glidePayload));

    // Send a POST request to Glide.
    const glideResponse = await axios.post(
      glideEndpoint,
      glidePayload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GLIDE_API_KEY}` // Must be set in your environment variables
        }
      }
    );

    console.log("Successfully pushed booking data to Glide:", JSON.stringify(glideResponse.data));
    return glideResponse.data;
  } catch (err) {
    console.error("Error pushing booking data to Glide:", err.response ? err.response.data : err.message);
    throw err;
  }
}
