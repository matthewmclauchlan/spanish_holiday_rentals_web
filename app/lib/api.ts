export interface Message {
  senderId: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

export async function getConversationMessages(conversationId: string): Promise<{ messages: Message[] }> {
  const res = await fetch(`/api/conversation/${conversationId}`);
  if (!res.ok) {
      throw new Error('Failed to fetch messages');
  }
  return await res.json();
}

export async function getBookingDetails(conversationId: string) {
  // ✅ Extract only the `bookingId` from `conversationId`
  const bookingId = conversationId.split('-')[0]; // Gets first segment (Booking ID)

  console.log(`🔹 Fetching booking details for bookingId: ${bookingId}`);

  const response = await fetch(`http://localhost:4000/api/bookings/${bookingId}`);
  
  if (!response.ok) {
      throw new Error('Failed to fetch booking details');
  }
  
  return response.json();
}
