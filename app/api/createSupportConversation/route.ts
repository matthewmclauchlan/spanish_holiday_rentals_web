import { NextResponse } from 'next/server';
import { connectDB } from '../../../chat-backend/db';

interface Conversation {
  _id: string;
  participants: string[];
  messages: {
    senderId: string;
    content: string;
    timestamp: Date;
    read?: boolean;
    status?: string;
  }[];
  conversationType?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateSupportConversationRequest {
  bookingId?: string; // present when guest initiates support for a booking
  userId: string;
  initiatedBy?: "guest" | "support"; // new flag to differentiate who is starting the conversation
}

export async function POST(request: Request) {
  const { bookingId, userId, initiatedBy = "guest" } = (await request.json()) as CreateSupportConversationRequest;

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  try {
    const db = await connectDB();
    const conversationsCollection = db.collection('conversations');

    let conversationId: string;
    let conversationType: string;

    if (initiatedBy === "guest" && bookingId) {
      // Guest-initiated support conversation for a booking.
      const normalizedBookingId = bookingId.replace(/\//g, '_');
      const supportUserId = process.env.SUPPORT_USER_ID || '67d2eb99001ca2b957ce';
      conversationId = `${normalizedBookingId}-${userId}-${supportUserId}`;
      conversationType = 'support';
    } else if (initiatedBy === "support") {
      // Support-initiated conversation.
      const supportUserId = process.env.SUPPORT_USER_ID || '67d2eb99001ca2b957ce';
      conversationId = `support-${userId}-${supportUserId}`;
      conversationType = 'support-initiated';
    } else {
      // Default case (e.g., verification updates).
      const supportUserId = process.env.SUPPORT_USER_ID || '67d2eb99001ca2b957ce';
      conversationId = `verification-${userId}-${supportUserId}`;
      conversationType = 'verification';
    }

    const conversation = await conversationsCollection.findOne({ _id: conversationId });
    if (!conversation) {
      const newConversation: Conversation = {
        _id: conversationId,
        participants: [userId, process.env.SUPPORT_USER_ID || '67d2eb99001ca2b957ce'],
        messages: [],
        conversationType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await conversationsCollection.insertOne(newConversation);
      console.log('✅ New conversation created:', newConversation);
    } else {
      console.log('ℹ️ Conversation already exists:', conversation);
    }
    return NextResponse.json({ conversationId }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating conversation:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
