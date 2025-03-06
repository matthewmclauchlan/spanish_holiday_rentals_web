// index.js - Appwrite Cloud Function to push booking data to Glide
// Make sure to install node-fetch (npm install node-fetch) or use a runtime that supports fetch.

import fetch from 'node-fetch';


module.exports = async function (context, req) {
  try {
    // Parse the incoming booking data.
    // The data should include fields like:
    // bookingReference, paymentId, startDate, endDate, totalPrice, status,
    // cancellationPolicy, userId, propertyId, hostId, customerEmail, adults, children, infants, pets,
    // createdAt, updatedAt, etc.
    const bookingData = JSON.parse(req.payload);
    console.log("Received booking data:", bookingData);

    // Map your booking data to the Glide table columns.
    // These keys correspond to the column IDs in your Glide table.
    const columnValues = {
      "osSGC": bookingData.bookingReference,    // booking_reference
      "zzS6X": bookingData.status,                // status
      "OxHg9": bookingData.userId,                // appwrite_userId
      "pqFGm": bookingData.cancellationPolicy,    // cancellation_policy
      "7bQyT": bookingData.startDate,             // start_date
      "cr54X": bookingData.endDate,               // end_date
      "eBGjO": bookingData.createdAt,             // created_at
      "KKnqL": bookingData.updatedAt,             // updated_at
      "mTi6H": bookingData.totalPrice,            // total_price
      "jZhQc": bookingData.adults,                // adults
      "nMEJR": bookingData.children,              // children
      "DACXd": bookingData.infants,               // infants
      "k0pZu": bookingData.pets,                  // pets
      "WUIZR": bookingData.propertyId,            // propertyId
      "V0IbZ": bookingData.hostId,                // hostId
      "lpVka": bookingData.paymentId,             // paymentId
      "ceqf6": bookingData.customerEmail           // customer_email
    };

    // Build the payload for Glide.
    const payload = {
      appID: process.env.GLIDE_APP_ID, // e.g., "pjjqOZCYKIg5iaCeGQr2"
      mutations: [
        {
          kind: "add-row-to-table",
          tableName: process.env.GLIDE_TABLE_NAME, // e.g., "native-table-UyUUI1PGwF8XAmicS5jA"
          columnValues: columnValues
        }
      ]
    };

    console.log("Posting to Glide endpoint:", process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables");
    console.log("Payload to send:", payload);

    // Send the POST request to Glide.
    const response = await fetch(process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GLIDE_API_KEY}` // Provided API key
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log("Successfully pushed booking data to Glide:", data);

    return {
      status: 200,
      body: JSON.stringify({ message: "Booking data pushed successfully", data }),
    };
  } catch (error) {
    console.error("Error pushing booking data to Glide:", error);
    return {
      status: 500,
      body: JSON.stringify({ error: error.message || "An unknown error occurred" }),
    };
  }
};
