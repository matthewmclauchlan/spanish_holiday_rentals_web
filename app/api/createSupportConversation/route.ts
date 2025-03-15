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
  bookingId: string;
  userId: string;
}

export async function POST(request: Request) {
  const { bookingId, userId } = (await request.json()) as CreateSupportConversationRequest;

  if (!bookingId || !userId) {
    return NextResponse.json(
      { error: 'bookingId and userId are required' },
      { status: 400 }
    );
  }

  try {
    const db = await connectDB();
    // Removed the type argument since the collection function isn't generic.
    const conversationsCollection = db.collection('conversations');

    // Normalize bookingId to avoid URL encoding issues
    const normalizedBookingId = bookingId.replace(/\//g, '_');

    // Use the guest's userId and the support user's membership id (from env or fallback)
    const supportUserId = process.env.SUPPORT_USER_ID || '67d2eb99001ca2b957ce';
    const conversationId: string = `${normalizedBookingId}-${userId}-${supportUserId}`;

    const conversation = await conversationsCollection.findOne({ _id: conversationId });
    if (!conversation) {
      const newConversation: Conversation = {
        _id: conversationId,
        participants: [userId, supportUserId],
        messages: [],
        conversationType: 'support',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await conversationsCollection.insertOne(newConversation);
      console.log('✅ New support conversation created:', newConversation);
    } else {
      console.log('ℹ️ Support conversation already exists:', conversation);
    }
    return NextResponse.json({ conversationId }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating support conversation:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
