// app/support/conversations/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

interface Message {
  senderId: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

export interface Conversation {
  _id: string;
  participants: string[];
  messages: Message[];
  status: 'new' | 'unanswered' | 'in-progress' | 'resolved';
  createdAt: string;
}

interface RawConversation {
  _id: string;
  participants: string[];
  messages: Message[];
  createdAt: string;
}

export default function SupportDashboard() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'unanswered' | 'in-progress' | 'resolved'>('all');

  useEffect(() => {
    async function fetchSupportConversations() {
      if (!user) return;
      try {
        const res = await fetch('/api/supportConversations');
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else if (data.conversations) {
          // Narrow the type of raw conversation objects.
          const rawConvs = data.conversations as RawConversation[];
          const convs: Conversation[] = rawConvs.map((conv) => {
            let status: Conversation['status'] = 'new';
            if (conv.messages && conv.messages.length > 0) {
              // Example logic: if a support reply exists, mark as "in-progress", else "unanswered"
              const supportReply = conv.messages.find((msg) => msg.senderId === 'support');
              status = supportReply ? 'in-progress' : 'unanswered';
            }
            return {
              _id: conv._id,
              participants: conv.participants,
              messages: conv.messages,
              status,
              createdAt: conv.createdAt,
            };
          });
          setConversations(convs);
          setFilteredConversations(convs);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchSupportConversations();
  }, [user]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredConversations(conversations);
    } else {
      setFilteredConversations(
        conversations.filter((conv) => conv.status === filter)
      );
    }
  }, [filter, conversations]);

  if (loading) return <div>Loading support conversations...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 w-full">
      <h1 className="text-2xl font-bold mb-4">Support Dashboard</h1>
      <div className="mb-4">
        <span className="mr-2 font-medium">Filter:</span>
        {(['all', 'new', 'unanswered', 'in-progress', 'resolved'] as const).map((f) => (
          <label key={f} className="mr-4">
            <input
              type="radio"
              name="filter"
              value={f}
              checked={filter === f}
              onChange={() => setFilter(f)}
              className="mr-1"
            />
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </label>
        ))}
      </div>
      {filteredConversations.length === 0 ? (
        <p>No support conversations found.</p>
      ) : (
        <ul className="space-y-2 w-full">
          {filteredConversations.map((conv) => {
            const lastMessage = conv.messages[conv.messages.length - 1] || null;
            return (
              <li key={conv._id} className="w-full">
                <Link href={`/chat/${encodeURIComponent(conv._id)}`}>
                  <div className="block p-3 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer w-full">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">ID: {conv._id}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {lastMessage ? lastMessage.content : 'No messages yet'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(lastMessage ? lastMessage.timestamp : conv.createdAt).toLocaleString()}
                    </p>
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
