import axios from 'axios';
import { createBooking } from '../lib/appwrite'; // Your function to create a booking document

async function processBooking(bookingData: any) {
  try {
    // Create the booking document in Appwrite.
    const bookingResponse = await createBooking(bookingData);
    console.log('Booking created in Appwrite:', bookingResponse);

    // Build the payload for Glide.
    const columnValues = {
      // Map your bookingData fields to your Glide column keys:
      osSGC: bookingData.bookingReference,    // bookingReference
      zzS6X: bookingData.status,                // status
      OxHg9: bookingData.userId,                // userId
      pqFGm: bookingData.cancellationPolicy,    // cancellationPolicy
      "7bQyT": bookingData.startDate,           // startDate
      cr54X: bookingData.endDate,               // endDate
      eBGjO: bookingData.createdAt,             // createdAt
      KKnqL: bookingData.updatedAt,             // updatedAt
      mTi6H: bookingData.totalPrice,            // totalPrice
      jZhQc: bookingData.adults,                // adults
      nMEJR: bookingData.children,              // children
      DACXd: bookingData.babies,                // babies
      k0pZu: bookingData.pets,                  // pets
      WUIZR: bookingData.propertyId,           // propertyId
      V0IbZ: bookingData.hostId,                // hostId
      lpVka: bookingData.paymentId,             // paymentId
      ceqf6: bookingData.customerEmail,         // customerEmail
      priceRules: bookingData.appliedPriceRuleIds // appliedPriceRuleIds (if applicable)
    };

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

    // Call Glide's API endpoint.
    const glideResponse = await axios.post(
      process.env.GLIDE_BOOKINGS_ENDPOINT || 'https://api.glideapp.io/api/function/mutateTables',
      glidePayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GLIDE_API_KEY}`
        }
      }
    );

    console.log("Successfully pushed booking data to Glide:", glideResponse.data);
    return { bookingResponse, glideResponse: glideResponse.data };
  } catch (error) {
    console.error("Error processing booking:", error);
    throw error;
  }
}
