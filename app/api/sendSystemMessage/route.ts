import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { conversationId, content } = await request.json();

    if (!conversationId || !content) {
      return NextResponse.json({ error: "Missing conversationId or content" }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_CHAT_BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json({ error: 'Chat backend URL not configured' }, { status: 500 });
    }

    // Construct the target URL for your chat-backend's sendSystemMessage endpoint.
    const targetUrl = `${backendUrl}/api/sendSystemMessage`;

    // Proxy the request to your live chat-backend service.
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Conversation not found or message not added' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Error in /api/sendSystemMessage:", errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
