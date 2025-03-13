// app/api/conversation/[conversationId]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '../../../../chat-backend/db';

interface Conversation {
  _id: string;
  participants: string[];
  messages: { senderId: string; content: string; timestamp: Date }[];
  createdAt: Date;
}

export async function GET(
  request: Request,
  context: { params: Record<string, string> }
): Promise<NextResponse> {
  // Get the conversationId from the params
  const { conversationId } = context.params;
  const decodedConversationId = decodeURIComponent(conversationId);

  if (!decodedConversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
  }

  try {
    const db = await connectDB();
    // Tell TypeScript that our documents use string IDs
    const conversationsCollection = db.collection<Conversation & { _id: string }>('conversations');
    // We cast decodedConversationId to any to override the default ObjectId expectation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversation = await conversationsCollection.findOne({ _id: decodedConversationId as any });
    const messages = conversation?.messages ?? [];
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching conversation:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
