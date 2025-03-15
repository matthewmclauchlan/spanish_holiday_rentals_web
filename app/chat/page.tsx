// app/chat/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
  messageId?: string;
  senderId: string;
  content: string;
  timestamp: string;
  read?: boolean;
  status?: 'sending' | 'sent' | 'failed';
  bookingId?: string; // ✅ Ensure we store the booking ID inside messages
}

export interface Conversation {
  _id: string;
  participants: string[];
  messages: Message[];
}

export default function ConversationListPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchConversations() {
      if (!user) return;
      try {
        const res = await fetch(`/api/conversations?userId=${user.$id}`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setConversations(data.conversations || []);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, [user]);

  // Always show "Contact Support" even if no conversations exist.
  const handleContactSupport = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/createSupportConversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: 'N/A', userId: user.$id }),
      });
      const data = await response.json();
      if (data.conversationId) {
        router.push(`/chat/${encodeURIComponent(data.conversationId)}`);
      } else {
        router.push(`/chat/support`);
      }
    } catch (error) {
      console.error('Error creating support conversation:', error);
    }
  };

  if (loading) return <div>Loading conversations...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Conversations</h1>
      {conversations.length === 0 ? (
        <div>
          <p>No conversations found.</p>
          <button
            onClick={handleContactSupport}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Contact Support
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {conversations.map((conv) => {
              const lastMessage = conv.messages[conv.messages.length - 1];
              return (
                <li key={conv._id}>
                  <Link href={`/chat/${encodeURIComponent(conv._id)}`}>
  <div className="block p-4 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
    <div className="flex justify-between">
      <span className="font-medium text-gray-800 dark:text-white">
        Conversation: {conv._id}
      </span>
      {lastMessage && (
        <span className="text-sm text-gray-500">
          {new Date(lastMessage.timestamp).toLocaleString()}
        </span>
      )}
    </div>
    {lastMessage && (
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        Last message: {lastMessage.content}
      </p>
    )}
  </div>
</Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-8">
            <button
              onClick={handleContactSupport}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Contact Support
            </button>
          </div>
        </>
      )}
    </div>
  );
}
