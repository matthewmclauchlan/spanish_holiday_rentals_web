import { NextResponse } from 'next/server';
import { connectDB } from '../../../chat-backend/db'; // Adjust path if needed

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const db = await connectDB();
    const conversationsCollection = db.collection('conversations');

    // Find all conversation documents where the 'participants' array includes the userId
    const conversations = await conversationsCollection
      .find({ participants: userId })
      .toArray();

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error("Error fetching conversations:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
