import { NextResponse } from 'next/server';
import { connectDB } from '../../../chat-backend/db';

export async function GET(_request: Request) {
  void _request; // Mark _request as used to avoid ESLint warning.
  
  try {
    const db = await connectDB();
    const conversationsCollection = db.collection('conversations');

    // Use the actual support user id rather than "support"
    const supportUserId = process.env.SUPPORT_USER_ID || '67d2eb99001ca2b957ce';
    const conversations = await conversationsCollection
      .find({ participants: supportUserId })
      .toArray();
      
    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching support conversations:', errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
