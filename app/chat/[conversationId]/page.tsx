'use client';

import React, { useEffect, useState } from 'react';
import { getConversationMessages, Message } from '../../lib/api';
import { useParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';

// Initialize Socket.IO client
const socket = io('http://localhost:4000');

export default function ConversationDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    async function fetchMessages() {
      try {
        const data = await getConversationMessages(conversationId);
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching conversation messages:', error);
      }
    }
    fetchMessages();

    // Listen for new messages from Socket.IO
    socket.on('receiveMessage', (message: Message) => {
      // Optionally, check that the message belongs to this conversation.
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [conversationId]);

  const handleSend = () => {
    if (input.trim() !== '' && user) {
      const message: Message = {
        senderId: user.$id,
        content: input,
        timestamp: new Date().toISOString(),
      };
      // Optimistically update the UI
      setMessages((prevMessages) => [...prevMessages, message]);
      socket.emit('sendMessage', { conversationId, ...message });
      setInput('');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Conversation Detail</h1>
      <div className="border p-4 h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <p className="text-gray-800 dark:text-white">{msg.content}</p>
            <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
