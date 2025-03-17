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
    // Update the conversation document with the new system message.
    const result = await conversationsCollection.updateOne(
      { _id: conversationId },
      {
        $push: { messages: systemMessage },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 1) {
      return NextResponse.json({ success: true, message: systemMessage });
    } else {
      return NextResponse.json({ error: 'Conversation not found or message not added' }, { status: 404 });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Error in /api/sendSystemMessage:", errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
  
}