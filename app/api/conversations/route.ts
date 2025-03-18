import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  // Use the live chat-backend URL from your environment variable.
  const backendUrl = process.env.NEXT_PUBLIC_CHAT_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { error: 'Chat backend URL is not configured' },
      { status: 500 }
    );
  }

  // Build the target URL.
  // Assuming your chat-backend has an endpoint at /api/conversations that accepts a userId query parameter.
  const targetUrl = `${backendUrl}/api/conversations?userId=${encodeURIComponent(userId)}`;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Error fetching conversations' },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error("Error fetching conversations:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
