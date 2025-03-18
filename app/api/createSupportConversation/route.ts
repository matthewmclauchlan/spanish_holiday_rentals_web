import { NextResponse } from 'next/server';

interface CreateSupportConversationRequest {
  bookingId?: string; // Optional when initiated by guest.
  userId: string;
  initiatedBy?: 'guest' | 'support';
}

export async function POST(request: Request) {
  // Parse incoming JSON payload.
  const { bookingId, userId, initiatedBy = 'guest' } = (await request.json()) as CreateSupportConversationRequest;
  
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }
  
  // Get the chat-backend URL from the environment.
  const backendUrl = process.env.NEXT_PUBLIC_CHAT_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: 'Chat backend URL not configured' }, { status: 500 });
  }
  
  // Construct the target URL using the chat-backend endpoint.
  // Our chat-backend service defines the create conversation endpoint at POST /api/conversations.
  const targetUrl = `${backendUrl}/api/conversations`;
  
  try {
    // Forward the POST request to the chat-backend service.
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, userId, initiatedBy }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error || 'Error creating conversation' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json({ conversationId: data.conversationId }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating conversation:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
