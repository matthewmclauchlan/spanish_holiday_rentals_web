// lib/api.ts
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
  