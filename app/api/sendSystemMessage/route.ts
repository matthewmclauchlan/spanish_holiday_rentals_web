import { NextResponse } from 'next/server';
import { connectDB } from '../../../chat-backend/db';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { conversationId, content } = await request.json();

    if (!conversationId || !content) {
      return NextResponse.json({ error: "Missing conversationId or content" }, { status: 400 });
    }

    const db = await connectDB();
    const conversationsCollection = db.collection('conversations');

    const systemMessage = {
      messageId: new ObjectId().toHexString(),
      senderId: "system", // Use a reserved identifier for system messages.
      content,
      timestamp: new Date().toISOString(),
      read: false,
      status: "sent",
      system: true // Custom flag to mark system messages.
    };

    await conversationsCollection.updateOne(
      { _id: conversationId },
      { 
        $push: { messages: systemMessage },
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    return NextResponse.json({ success: true, message: systemMessage });
  } catch (error: any) {
    console.error("Error in /api/sendSystemMessage:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
