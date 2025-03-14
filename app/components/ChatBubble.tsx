'use client';

import React from 'react';
import Image from 'next/image';

interface ChatBubbleProps {
  content: string;
  timestamp: string;
  isSender: boolean; // true if the current user sent the message
  read?: boolean;    // whether the message has been read (for sent messages)
  senderAvatarUrl?: string; // URL for the sender's avatar (for received messages)
}

export default function ChatBubble({ content, timestamp, isSender, read = false, senderAvatarUrl }: ChatBubbleProps) {
  // Styling: sent messages use a blue background; received messages use a white background.
  const bubbleStyle = isSender
    ? "bg-blue-600 text-white self-end"  // Sent messages
    : "bg-white text-black self-start";  // Received messages

  return (
    <div className="flex items-end gap-2">
      {/* For received messages, show the sender's avatar if available */}
      {!isSender && senderAvatarUrl && (
        <div className="relative w-8 h-8 rounded-full overflow-hidden">
          <Image
            src={senderAvatarUrl}
            alt="Sender avatar"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
      )}
      <div className={`max-w-[80%] p-3 rounded-lg my-2 ${bubbleStyle}`}>
        <p className="text-sm">{content}</p>
        <div className="flex justify-end items-center mt-1">
          <span className="text-xs text-gray-500">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
          {/* Show the read receipt indicator for sent messages if read is true */}
          {isSender && read && (
            <span className="ml-2 text-xs text-green-500 mt-1">Read</span>
          )}
        </div>
      </div>
    </div>
  );
}
