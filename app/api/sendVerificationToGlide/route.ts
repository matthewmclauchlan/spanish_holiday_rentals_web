import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received verification data:", body);
    
    const glidePayload = {
      appID: process.env.GLIDE_APP_ID, // e.g., "pjjqOZCYKIg5iaCeGQr2"
      mutations: [
        {
          kind: "add-row-to-table", // mutation kind to add a new row
          tableName: process.env.GLIDE_GUEST_VERIFICATIONS_TABLE, // e.g., "native-table-Txvevn7ilRAqJ2iUvSIP"
          columnValues: {
            "CAsxe": body.userId,            // userId column key
            "BYcc9": body.verificationImage, // image column key
            "1Btud": body.status,             // status column key (e.g., "pending")
            "bgr70": body.submissionDate,
            "DuLnH": body.userName,                 // new: user's name
            "5u0Hp": body.userEmail,                       // new: user's email
            "3R0Ft": body.userPhone 
          }
        }
      ]
    };
    
    console.log("Sending payload to Glide:", glidePayload);
    
    const glideEndpoint = process.env.GLIDE_BOOKINGS_ENDPOINT || "https://api.glideapp.io/api/function/mutateTables";
    
    const glideResponse = await axios.post(glideEndpoint, glidePayload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GLIDE_API_KEY}`
      }
    });
    
    console.log("Glide response:", glideResponse.data);
    return NextResponse.json({ success: true, data: glideResponse.data });
  } catch (error: unknown) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error in API sendVerificationToGlide:", errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
