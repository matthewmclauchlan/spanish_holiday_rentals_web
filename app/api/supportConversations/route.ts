import { NextResponse } from 'next/server';

export async function GET(_request: Request) {
  // Mark _request as used to avoid ESLint warning.
  void _request;

  // Get support user ID from environment (or use a default)
  const supportUserId = process.env.SUPPORT_USER_ID || '67d2eb99001ca2b957ce';
  
  // Get the live chat-backend URL from environment variable
  const backendUrl = process.env.NEXT_PUBLIC_CHAT_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { error: 'Chat backend URL is not configured' },
      { status: 500 }
    );
  }
  
  // Construct target URL for the chat-backend's conversations endpoint
  // Here, we assume your chat-backend API supports filtering by supportUserId via query parameters.
  const targetUrl = `${backendUrl}/api/conversations?supportUserId=${encodeURIComponent(supportUserId)}`;
  
  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Error fetching support conversations' },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching support conversations:', errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
