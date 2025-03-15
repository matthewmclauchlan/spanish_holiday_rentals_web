"use client";

import React from "react";
import Image from "next/image";
import { getAvatarUrl } from "../lib/appwrite"; // adjust path if needed

interface ChatBubbleProps {
  content: string;
  timestamp: string;
  isSender: boolean; // true if the current user sent the message
  read?: boolean;    // whether the message has been read (for sent messages)
  status?: "sending" | "sent" | "failed";
  senderAvatarUrl?: string; // This should be a file ID or full URL
}

export default function ChatBubble({
  content,
  timestamp,
  isSender,
  read = false,
  status,
  senderAvatarUrl,
}: ChatBubbleProps) {
  const bubbleStyle = isSender
    ? "bg-blue-600 text-white self-end dark:bg-blue-800"
    : "bg-gray-200 text-black self-start dark:bg-gray-700 dark:text-white";

  const fallbackAvatar = "/assets/icons/avatar.png";
  let computedAvatarUrl = fallbackAvatar;
  if (senderAvatarUrl && senderAvatarUrl.trim() !== "") {
    if (senderAvatarUrl.includes("assets/icons/avatar.png")) {
      computedAvatarUrl = fallbackAvatar;
    } else if (senderAvatarUrl.startsWith("http")) {
      computedAvatarUrl = senderAvatarUrl;
    } else {
      computedAvatarUrl = getAvatarUrl(senderAvatarUrl);
    }
  }

  return (
    <div className={`flex items-end gap-2 ${isSender ? "justify-end" : "justify-start"}`}>
      {!isSender && (
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
          {isSender && (
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
