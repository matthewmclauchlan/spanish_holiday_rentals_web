'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
  senderId: string;
  content: string;
  timestamp: string;
}

export interface Conversation {
  _id: string;
  participants: string[];
  messages: Message[];
}

export default function SupportDashboard() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchSupportConversations() {
      if (!user) return;
      try {
        const res = await fetch('/api/supportConversations');
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setConversations(data.conversations || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSupportConversations();
  }, [user]);

  if (loading) return <div>Loading support conversations...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Support Dashboard</h1>
      {conversations.length === 0 ? (
        <p>No support conversations found.</p>
      ) : (
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
      )}
    </div>
  );
}
