import axios from 'axios';

/**
 * Manually sends booking details to Glide.
 * @param {object} bookingData - The booking details.
 * @returns {Promise<object>} - The response from Glide.
 */
export async function sendBookingToGlide(bookingData) {
  try {
    // Map booking data to Glide table columns.
    // Replace the keys (like "osSGC", "zzS6X", etc.) with your actual Glide column IDs.
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

    console.log("Glide endpoint:", process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables");
    console.log("Glide payload:", JSON.stringify(glidePayload));

    // Send a POST request to Glide.
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

    console.log("Successfully pushed booking data to Glide:", JSON.stringify(glideResponse.data));
    return glideResponse.data;
  } catch (err) {
    console.error("Error pushing booking data to Glide:", err);
    throw err;
  }
}
