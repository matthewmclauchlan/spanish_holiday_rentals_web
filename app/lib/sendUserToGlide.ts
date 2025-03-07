// app/lib/glideUsers.ts
import axios, { AxiosError } from 'axios';

interface GlideUserPayload {
  userId: string;
  full_name: string;
  email: string;
  signup_date: string;
  auth_method: string;
  phone?: string;
  // Optional flags:
  status?: string; // e.g., "active", "updated", "deleted"
}

/**
 * Sends a new user row to Glide.
 * This should be called only once when a user is first created.
 */
export async function sendNewUserToGlide(userData: GlideUserPayload): Promise<object> {
  const columnValues = {
    "GrXyO": userData.userId,          // userId
    "qQxzw": userData.full_name,        // full_name
    "0hKqP": userData.email,            // email
    "X4npn": userData.signup_date,      // signup_date
    "brB6Y": userData.auth_method,      // auth_method
    "ecSkN": userData.phone || "",     // phone
    // Optionally, add a status column if desired:
    // "someStatusColumn": userData.status || "active"
  };

  const glidePayload = {
    appID: process.env.GLIDE_APP_ID,
    mutations: [
      {
        kind: "add-row-to-table",
        tableName: process.env.GLIDE_USERS_TABLE_NAME,
        columnValues: columnValues
      }
    ]
  };

  const glideEndpoint = process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables";

  try {
    const glideResponse = await axios.post(glideEndpoint, glidePayload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GLIDE_API_KEY}`
      }
    });
    console.log("Successfully pushed new user data to Glide:", JSON.stringify(glideResponse.data));
    return glideResponse.data;
  } catch (err: unknown) {
    let errorMsg = 'Unknown error';
    if (err instanceof AxiosError) {
      errorMsg = err.response?.data || err.message;
    } else if (err instanceof Error) {
      errorMsg = err.message;
    }
    console.error("Error pushing new user data to Glide:", errorMsg);
    throw err;
  }
}

/**
 * Updates an existing user in Glide.
 * This can be used when a user changes their email or other details.
 */
export async function updateUserInGlide(userData: GlideUserPayload): Promise<object> {
  // Assuming Glide supports update mutations. If not, you might need a workaround,
  // such as sending a new row and flagging the old row as updated.
  const columnValues = {
    "GrXyO": userData.userId,          // userId (this is used to find the record)
    "qQxzw": userData.full_name,        // full_name
    "0hKqP": userData.email,            // email
    "X4npn": userData.signup_date,      // signup_date (or last updated date)
    "brB6Y": userData.auth_method,      // auth_method
    "ecSkN": userData.phone || "",     // phone
    // Add/update a status flag for updated information:
    "status": userData.status || "updated"
  };

  const glidePayload = {
    appID: process.env.GLIDE_APP_ID,
    mutations: [
      {
        kind: "update-row-in-table", // assuming this mutation kind exists
        tableName: process.env.GLIDE_USERS_TABLE_NAME,
        // Identify the row by a unique key, for instance, userId.
        rowId: userData.userId,
        columnValues: columnValues
      }
    ]
  };

  const glideEndpoint = process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables";

  try {
    const glideResponse = await axios.post(glideEndpoint, glidePayload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GLIDE_API_KEY}`
      }
    });
    console.log("Successfully updated user data in Glide:", JSON.stringify(glideResponse.data));
    return glideResponse.data;
  } catch (err: unknown) {
    let errorMsg = 'Unknown error';
    if (err instanceof AxiosError) {
      errorMsg = err.response?.data || err.message;
    } else if (err instanceof Error) {
      errorMsg = err.message;
    }
    console.error("Error updating user data in Glide:", errorMsg);
    throw err;
  }
}

/**
 * Flags a user as deleted in Glide.
 * Instead of removing the user record, update a status flag.
 */
export async function flagUserDeletionInGlide(userId: string): Promise<object> {
  // Here, we assume that the deletion flag is updated in a column (for example, "status")
  const columnValues = {
    "status": "deleted"
  };

  const glidePayload = {
    appID: process.env.GLIDE_APP_ID,
    mutations: [
      {
        kind: "update-row-in-table", // assuming update is supported
        tableName: process.env.GLIDE_USERS_TABLE_NAME,
        rowId: userId,
        columnValues: columnValues
      }
    ]
  };

  const glideEndpoint = process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables";

  try {
    const glideResponse = await axios.post(glideEndpoint, glidePayload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GLIDE_API_KEY}`
      }
    });
    console.log("Successfully flagged user as deleted in Glide:", JSON.stringify(glideResponse.data));
    return glideResponse.data;
  } catch (err: unknown) {
    let errorMsg = 'Unknown error';
    if (err instanceof AxiosError) {
      errorMsg = err.response?.data || err.message;
    } else if (err instanceof Error) {
      errorMsg = err.message;
    }
    console.error("Error flagging user deletion in Glide:", errorMsg);
    throw err;
  }
}
