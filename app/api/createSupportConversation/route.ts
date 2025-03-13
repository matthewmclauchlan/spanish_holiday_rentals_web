// app/api/createSupportConversation/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '../../../chat-backend/db';

// Define a type for the conversation document
interface Conversation {
  _id: string;
  participants: string[];
  messages: {
    senderId: string;
    content: string;
    timestamp: Date;
  }[];
  conversationType?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the expected request body for creating a support conversation
interface CreateSupportConversationRequest {
  bookingId: string;
  userId: string;
}

export async function POST(request: Request) {
  // Cast the request JSON to our defined type
  const { bookingId, userId } = (await request.json()) as CreateSupportConversationRequest;

  if (!bookingId || !userId) {
    return NextResponse.json({ error: 'bookingId and userId are required' }, { status: 400 });
  }

  try {
    const db = await connectDB();
    const conversationsCollection = db.collection<Conversation>('conversations');

    // Normalize bookingId to avoid URL encoding issues (e.g., "N/A" becomes "N_A")
    const normalizedBookingId = bookingId.replace(/\//g, '_');
    // Create a unique conversation ID for support conversations
    const conversationId: string = `${normalizedBookingId}-${userId}-support`;

    // Check if the conversation already exists
    const conversation = await conversationsCollection.findOne({ _id: conversationId });
    if (!conversation) {
      const newConversation: Conversation = {
        _id: conversationId,
        participants: [userId, 'support'], // 'support' represents your support agent/channel
        messages: [],
        conversationType: 'support',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await conversationsCollection.insertOne(newConversation);
    }
    return NextResponse.json({ conversationId }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating support conversation:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
