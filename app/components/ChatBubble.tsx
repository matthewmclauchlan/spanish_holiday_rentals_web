"use client";

import React from "react";
import Image from "next/image";
import { getAvatarUrl } from "../lib/appwrite";

interface ChatBubbleProps {
  content: string;
  timestamp: string;
  isSender: boolean; // true if the current user sent the message
  read?: boolean;    // whether the message has been read (for sent messages)
  status?: "sending" | "sent" | "failed";
  senderAvatarUrl?: string; // file ID or full URL; for system messages, this may be undefined
  system?: boolean;         // optional flag for system messages
}

export default function ChatBubble({
  content,
  timestamp,
  isSender,
  read = false,
  status,
  senderAvatarUrl,
  system = false,
}: ChatBubbleProps) {
  // If it's a system message, we can use a different style.
  const bubbleStyle = system
    ? "bg-gray-300 text-gray-700 italic self-center"
    : isSender
    ? "bg-blue-600 text-white self-end dark:bg-blue-800"
    : "bg-gray-200 text-black self-start dark:bg-gray-700 dark:text-white";

  // Use fallback avatar for non-system messages.
  const fallbackAvatar = "/assets/icons/avatar.png";
  let computedAvatarUrl = fallbackAvatar;
  if (!system && senderAvatarUrl && senderAvatarUrl.trim() !== "") {
    if (senderAvatarUrl.includes("assets/icons/avatar.png")) {
      computedAvatarUrl = fallbackAvatar;
    } else if (senderAvatarUrl.startsWith("http")) {
      computedAvatarUrl = senderAvatarUrl;
    } else {
      computedAvatarUrl = getAvatarUrl(senderAvatarUrl);
    }
  }

  return (
    <div className={`flex items-end gap-2 ${system ? "justify-center" : (isSender ? "justify-end" : "justify-start")}`}>
      {!isSender && !system && (
        <div className="relative w-8 h-8 rounded-full overflow-hidden">
          <Image
            src={computedAvatarUrl}
            alt="Sender avatar"
            width={32}
            height={32}
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error("Failed to load avatar from:", target.src);
            }}
          />
        </div>
      )}
      <div className={`max-w-[80%] p-3 rounded-lg my-2 ${bubbleStyle}`}>
        <p className="text-sm">{content}</p>
        <div className="flex justify-end items-center mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-300">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
          {isSender && !system && (
            <span className="ml-2 text-xs font-bold">
              {status === "failed" ? (
                <span className="text-red-500">✗ Failed</span>
              ) : status === "sending" ? (
                <span className="text-yellow-500">Sending...</span>
              ) : read ? (
                <span className="text-green-500">✓✓ Read</span>
              ) : (
                <span className="text-blue-500">Delivered</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
