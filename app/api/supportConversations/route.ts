// app/api/supportConversations/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '../../../chat-backend/db';

export async function GET(_request: Request) {
  void _request; // Mark _request as used to avoid ESLint warning.
  
  try {
    const db = await connectDB();
    const conversationsCollection = db.collection('conversations');
    // Query for conversations where the participants array includes "support"
    const conversations = await conversationsCollection.find({ participants: 'support' }).toArray();
    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching support conversations:', errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
