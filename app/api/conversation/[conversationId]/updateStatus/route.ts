import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function GET(request: Request, { params }: RouteContext): Promise<NextResponse> {
  const { conversationId } = await params;

  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
  }

  // Get the chat-backend URL from the environment variable
  const backendUrl = process.env.NEXT_PUBLIC_CHAT_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: 'Chat backend URL is not configured' }, { status: 500 });
  }

  // Construct the target URL for the conversation retrieval endpoint
  const targetUrl = `${backendUrl}/api/conversation/${conversationId}`;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Error fetching conversation' },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching conversation:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
