'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getConversationMessages, Message as APIMessage } from '../../lib/api';
import { useParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
import Image from 'next/image';
import { getAvatarUrl } from '../../lib/appwrite';

// Extend your message interface to include an optional "read" property
export interface Message extends APIMessage {
  senderAvatar?: string;
  read?: boolean;
}

// Initialize Socket.IO client (ensure this URL is correct for your backend)
const socket = io('http://localhost:4000');

export default function ConversationDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  // Use a ref to track message timestamps that have already been marked as read
  const markedReadTimestamps = useRef<Set<string>>(new Set());

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

    socket.on('receiveMessage', (message: Message) => {
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('messageRead', ({ messageTimestamp }: { messageTimestamp: string }) => {
      console.log('Message read event received for timestamp:', messageTimestamp);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.timestamp === messageTimestamp ? { ...msg, read: true } : msg
        )
      );
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('messageRead');
    };
  }, [conversationId]);

  // Emit markAsRead for any unread messages (sent by others) that haven't yet been marked
  useEffect(() => {
    if (!user) return;
    messages.forEach((msg) => {
      if (msg.senderId !== user.$id && !msg.read && !markedReadTimestamps.current.has(msg.timestamp)) {
        console.log(`Emitting markAsRead for message with timestamp: ${msg.timestamp}`);
        socket.emit('markAsRead', { conversationId, messageTimestamp: msg.timestamp });
        markedReadTimestamps.current.add(msg.timestamp);
      }
    });
  }, [messages, user, conversationId]);

  const handleSend = () => {
    if (input.trim() !== '' && user) {
      const message: Message = {
        senderId: user.$id,
        content: input,
        timestamp: new Date().toISOString(),
        senderAvatar: user.avatarUrl || undefined,
        read: false,
      };
      console.log('Sending message:', message);
      // Optimistically update the UI
      setMessages((prevMessages) => [...prevMessages, message]);
      socket.emit('sendMessage', { conversationId, ...message });
      setInput('');
    }
  };

  // Determine the avatar URL for a message
  const getSenderAvatar = (msg: Message) => {
    if (msg.senderId === user?.$id) {
      return user.avatarUrl ? getAvatarUrl(user.avatarUrl) : '/assets/icons/avatar.png';
    }
    return msg.senderAvatar ? getAvatarUrl(msg.senderAvatar) : '/assets/icons/avatar.png';
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Conversation Detail</h1>
      <div className="border p-4 h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded flex flex-col gap-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${msg.senderId === user?.$id ? 'self-end flex-row-reverse' : 'self-start'}`}
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={getSenderAvatar(msg)}
                alt="Sender avatar"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <div
              className={`p-2 rounded max-w-xs break-words ${
                msg.senderId === user?.$id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white'
              }`}
            >
              <p>{msg.content}</p>
              <div className="flex justify-end items-center mt-1">
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                {msg.senderId === user?.$id && (
                  <span className="ml-2 text-xs font-bold">
                    {msg.read ? (
                      <span className="text-green-500">✓✓ Read</span>
                    ) : (
                      <span className="text-blue-300">✓ Sent</span>
                    )}
                  </span>
                )}
              </div>
            </div>
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
