// app/lib/glideVerifications.ts
import axios, { AxiosError } from 'axios';

interface VerificationData {
  userId: string;
  phone: string;
  verificationImage: string;
  status: string; // e.g., "pending"
}

/**
 * Sends a new guest verification record to Glide.
 */
export async function sendVerificationToGlide(
  verificationData: VerificationData
): Promise<object> {
  // Map the verification data to your Glide table columns.
  const columnValues = {
    // Update these keys with your actual Glide column IDs or names.
    "userId": verificationData.userId,
    "phone": verificationData.phone,
    "verificationImage": verificationData.verificationImage,
    "status": verificationData.status,
  };

  const glidePayload = {
    appID: process.env.GLIDE_APP_ID,
    mutations: [
      {
        kind: "add-row-to-table",
        tableName: process.env.GLIDE_GUEST_VERIFICATIONS_TABLE,
        columnValues: columnValues,
      },
    ],
  };

  const glideEndpoint =
    process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables";

  try {
    const response = await axios.post(glideEndpoint, glidePayload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GLIDE_API_KEY}`,
      },
    });
    console.log("Successfully sent verification data to Glide:", response.data);
    return response.data;
  } catch (err: unknown) {
    let errorMsg = "Unknown error";
    if (err instanceof AxiosError) {
      errorMsg = err.response?.data || err.message;
    } else if (err instanceof Error) {
      errorMsg = err.message;
    }
    console.error("Error sending verification data to Glide:", errorMsg);
    throw new Error(errorMsg);
  }
}
