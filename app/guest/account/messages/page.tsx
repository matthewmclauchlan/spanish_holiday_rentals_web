'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
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
  conversationType?: string; // "support" if it's a support conversation
}

export default function ConversationListPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversations() {
      if (!user) return;
      try {
        const res = await fetch(`/api/conversations?userId=${user.$id}`);
        const data = await res.json();
        console.log('Fetched conversations:', data);
        if (data.error) {
          setError(data.error);
        } else {
          setConversations(data.conversations || []);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unknown error');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, [user]);

  if (loading) return <div>Loading conversations...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Conversations</h1>
      {conversations.length === 0 ? (
        <p>No conversations found.</p>
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
                        {conv.conversationType === 'support' && (
                          <span className="ml-2 text-sm text-blue-600">[Support]</span>
                        )}
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
