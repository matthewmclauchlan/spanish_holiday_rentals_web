import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectDB } from '../../../../../chat-backend/db';

interface UpdateData {
  status: string;
  updatedAt: string;
  openedBy?: string;
}

interface Message {
  messageId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  status: string;
  senderAvatarUrl: string;
}

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function POST(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  // Await dynamic parameters
  const { conversationId } = await params;
  // Expect the payload to include status, openedBy, and senderAvatarUrl
  const { status, openedBy, senderAvatarUrl } = await request.json();

  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
  }
  if (!status) {
    return NextResponse.json({ error: 'Missing status' }, { status: 400 });
  }

  try {
    const db = await connectDB();
    const conversationsCollection = db.collection('conversations');

    const updateData: UpdateData = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (status === "in-progress" && openedBy) {
      updateData.openedBy = openedBy;
    }

    // Prepare update operations.
    const updateOps: { $set: UpdateData; $push?: { messages: Message } } = {
      $set: updateData,
    };

    // If conversation is resolved, add a system message including the support user's avatar.
    if (status === "resolved") {
      const systemMessage: Message = {
        messageId: new ObjectId().toHexString(),
        senderId: openedBy, // the support user's ID
        content: "This conversation has been closed.",
        timestamp: new Date().toISOString(),
        read: false,
        status: "sent",
        senderAvatarUrl: senderAvatarUrl || "",
      };
      updateOps.$push = { messages: systemMessage };
    }

    await conversationsCollection.updateOne(
      { _id: conversationId },
      updateOps
    );
    return NextResponse.json({ message: 'Conversation status updated' }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
