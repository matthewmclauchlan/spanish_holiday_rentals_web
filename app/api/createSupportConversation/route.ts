import { NextResponse } from 'next/server';

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: Request) {
  try {
    const { bookingId, userId, initiatedBy = "guest" } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Use the live chat-backend URL from your environment variable.
    const backendUrl = process.env.NEXT_PUBLIC_CHAT_BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { error: 'Chat backend URL not configured' },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Construct the target URL for the chat-backend's createSupportConversation endpoint.
    const targetUrl = `${backendUrl}/api/createSupportConversation`;

    // Proxy the POST request to your chat-backend service.
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, userId, initiatedBy }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Error creating conversation' },
        { status: response.status, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      { conversationId: data.conversationId },
      { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating conversation:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
