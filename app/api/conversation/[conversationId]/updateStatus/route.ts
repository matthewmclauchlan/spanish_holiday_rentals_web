import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function POST(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  // Await dynamic parameters
  const { conversationId } = await params;
  // Parse the JSON payload for status, openedBy, and senderAvatarUrl
  const { status, openedBy, senderAvatarUrl } = await request.json();

  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
  }
  if (!status) {
    return NextResponse.json({ error: 'Missing status' }, { status: 400 });
  }

  // Build the target URL using your live chat-backend service URL.
  // Ensure NEXT_PUBLIC_CHAT_BACKEND_URL is set in your Vercel environment.
  const backendUrl = process.env.NEXT_PUBLIC_CHAT_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { error: 'Chat backend URL is not configured' },
      { status: 500 }
    );
  }
  const updateUrl = `${backendUrl}/api/conversation/${conversationId}/updateStatus`;

  try {
    // Proxy the request to your chat-backend service.
    const response = await fetch(updateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, openedBy, senderAvatarUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Error updating conversation status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
