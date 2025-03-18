import { NextResponse } from 'next/server';

export async function GET() {
  // Use the support user ID from the environment variable as a default.
  // If needed, you could also extract a userId from the request here.
  const userId = process.env.SUPPORT_USER_ID || '67d2eb99001ca2b957ce';

  // Get the live chat-backend URL from your environment variable.
  const backendUrl = process.env.NEXT_PUBLIC_CHAT_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { error: 'Chat backend URL is not configured' },
      { status: 500 }
    );
  }

  // Construct the target URL for the chat-backend's conversations endpoint,
  // using the query parameter name "userId" (which your backend expects).
  const targetUrl = `${backendUrl}/api/conversations?userId=${encodeURIComponent(userId)}`;

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
