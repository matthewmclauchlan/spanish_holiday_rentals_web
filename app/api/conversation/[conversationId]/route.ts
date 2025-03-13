// app/api/conversation/[conversationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../chat-backend/db';

interface Conversation {
  _id: string;
  participants: string[];
  messages: { senderId: string; content: string; timestamp: Date }[];
  createdAt: Date;
}

// Define a type for the route context parameters as a Promise.
type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  // Await the params since they are provided as a Promise.
  const { conversationId } = await params;

  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
  }

  try {
    const db = await connectDB();
    const conversationsCollection = db.collection<Conversation>('conversations');
    const conversation = await conversationsCollection.findOne({ _id: conversationId });
    const messages = conversation?.messages ?? [];
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching conversation:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
