// app/api/conversation/[conversationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../chat-backend/db';

interface Conversation {
  _id: string;
  participants: string[];
  messages: { senderId: string; content: string; timestamp: Date }[];
  createdAt: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Record<string, string> }
): Promise<NextResponse> {
  const conversationId = params.conversationId;
  const decodedConversationId = decodeURIComponent(conversationId);

  if (!decodedConversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
  }

  try {
    const db = await connectDB();
    const conversationsCollection = db.collection<Conversation>('conversations');
    const conversation = await conversationsCollection.findOne({ _id: decodedConversationId });
    const messages = conversation?.messages ?? [];
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching conversation:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
