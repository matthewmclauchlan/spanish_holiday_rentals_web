import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import { sendBookingToGlide } from "./sendBookingToGlide.js";

// Log environment variables to verify they are loaded:
console.log("GLIDE_API_KEY:", process.env.GLIDE_API_KEY);
console.log("GLIDE_APP_ID:", process.env.GLIDE_APP_ID);
console.log("GLIDE_TABLE_NAME:", process.env.GLIDE_TABLE_NAME);

// Create a sample bookingData object similar to what your production webhook would use.
const sampleBookingData = {
  bookingReference: "BKG-TEST1234",
  status: "confirmed",
  userId: "67c47cfb1993fc5d9914",
  cancellationPolicy: "strict",
  startDate: "2025-06-09T22:00:00.000Z",
  endDate: "2025-06-12T22:00:00.000Z",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  totalPrice: 410,
  adults: 1,
  children: 1,
  babies: 1,
  pets: 1,
  propertyId: "67b115860003fbebcf30",
  hostId: "67c4752d776656fe77dc",
  paymentId: "pi_3QzyEhAebOulCYsN1AM3JXDQ",
  customerEmail: "info@spanishholidayrentals.co.uk",
  appliedPriceRuleIds: [] // Adjust as needed
};

async function testGlideCall() {
  try {
    const result = await sendBookingToGlide(sampleBookingData);
    console.log("Test Glide call successful:", result);
  } catch (err) {
    console.error("Test Glide call failed:", err);
  }
}

testGlideCall();
