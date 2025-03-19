"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { databases, config, getImageUrl } from "../../lib/appwrite";
import { Models } from "appwrite";
import io from "socket.io-client";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import ChatBubble from "../../components/ChatBubble";

interface Message {
  messageId?: string;
  senderId: string;
  content: string;
  timestamp: string;
  read?: boolean;
  status?: "sending" | "sent" | "failed";
  bookingId?: string;
  senderAvatarUrl?: string;
}

interface Booking extends Models.Document {
  bookingReference: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  propertyId: string;
}

interface Property extends Models.Document {
  name: string;
  mainImage?: string;
}

interface BookingWithProperty extends Booking {
  property?: Property;
}

const socket = io(process.env.NEXT_PUBLIC_CHAT_BACKEND_URL || window.location.origin);

export default function ConversationDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const bookingId = conversationId.split("-")[0];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [booking, setBooking] = useState<BookingWithProperty | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] = useState<string>("new");

  const markedReadIds = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/conversation/${conversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    }
    fetchMessages();
  }, [conversationId]);

  // Auto-scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch booking details only if this is not a verification conversation.
  useEffect(() => {
    if (bookingId === "verification") {
      setLoading(false);
      return;
    }
    async function fetchBookingDetails() {
      try {
        const bookingDoc = await databases.getDocument<Booking>(
          config.databaseId,
          config.bookingsCollectionId,
          bookingId
        );
        let propertyDoc;
        if (bookingDoc.propertyId) {
          propertyDoc = await databases.getDocument<Property>(
            config.databaseId,
            config.propertiesCollectionId,
            bookingDoc.propertyId
          );
        }
        setBooking({ ...bookingDoc, property: propertyDoc });
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setError("Error loading booking details.");
      } finally {
        setLoading(false);
      }
    }
    fetchBookingDetails();
  }, [bookingId]);

  // Setup Socket.IO connection and listeners
  useEffect(() => {
    socket.emit("joinConversation", conversationId);
    const handleReceiveMessage = (message: Message) => {
      if (message.bookingId === bookingId) {
        setMessages((prev) => {
          const index = prev.findIndex((msg) => msg.timestamp === message.timestamp);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = message;
            return updated;
          }
          return [...prev, message];
        });
      }
    };
    socket.on("receiveMessage", handleReceiveMessage);
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [conversationId, bookingId]);

  // Mark messages as read
  useEffect(() => {
    if (!user) return;
    const currentUserId = (user as { $id: string }).$id;
    if (!messages.length) return;
    messages.forEach((msg: Message) => {
      if (
        !msg.read &&
        msg.senderId !== currentUserId &&
        msg.messageId &&
        !markedReadIds.current.has(msg.messageId)
      ) {
        socket.emit("markAsRead", { conversationId, messageId: msg.messageId });
        markedReadIds.current.add(msg.messageId);
        setMessages((prev) =>
          prev.map((m) =>
            m.messageId === msg.messageId ? { ...m, read: true } : m
          )
        );
      }
    });
  }, [messages, user, conversationId]);

  // Handle sending a message
  const handleSend = () => {
    if (!input.trim() || !bookingId || !user) return;
    const currentUserId = (user as { $id: string }).$id;
    const timestamp = new Date().toISOString();
    const message: Message = {
      senderId: currentUserId,
      content: input,
      timestamp,
      read: false,
      status: "sending",
      bookingId,
      senderAvatarUrl: (user as { avatarUrl: string }).avatarUrl,
    };
    setMessages((prev) => [...prev, message]);
    socket.emit("sendMessage", { conversationId, ...message }, (ack: { success: boolean }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.timestamp === timestamp
            ? { ...msg, status: ack.success ? "sent" : "failed" }
            : msg
        )
      );
    });
    setInput("");
  };

  // Support agents update conversation status
  const updateStatus = async (newStatus: "paused" | "in-progress" | "resolved") => {
    const payload: { status: string; openedBy?: string } = { status: newStatus };
    if (newStatus === "in-progress") {
      payload.openedBy = (user as { $id: string }).$id;
    }
    try {
      const res = await fetch(`/api/conversation/${conversationId}/updateStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setConversationStatus(newStatus);
        socket.emit("updateConversationStatus", { conversationId, status: newStatus });
      }
    } catch (err) {
      console.error("Failed to update conversation status", err);
    }
  };

  if (loading) {
    return <div className="p-4 dark:bg-gray-900 dark:text-gray-100">Loading...</div>;
  }
  if (error || (bookingId !== "verification" && !booking)) {
    return (
      <div className="p-4 text-red-500 dark:bg-gray-900 dark:text-gray-100">
        {error || "Booking not found"}
      </div>
    );
  }
  if (!user) {
    return <div>Loading user...</div>;
  }
  const currentUserId = (user as { $id: string }).$id;

  return (
    <div className="p-4 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Conversation Detail</h1>

      {user.roles.includes("support") && (
        <div className="mb-4">
          <span className="text-sm font-semibold">
            Status: <span className="capitalize">{conversationStatus}</span>
          </span>
          <div className="mt-2 flex gap-2">
            <button onClick={() => updateStatus("paused")} className="bg-yellow-600 text-white px-3 py-1 rounded">
              Pause
            </button>
            <button onClick={() => updateStatus("in-progress")} className="bg-blue-600 text-white px-3 py-1 rounded">
              Resume
            </button>
            <button onClick={() => updateStatus("resolved")} className="bg-green-600 text-white px-3 py-1 rounded">
              Resolve
            </button>
          </div>
        </div>
      )}

      <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
        {bookingId !== "verification" && booking && booking.property && (
          <div className="flex items-center gap-4">
            {booking.property.mainImage && (
              <Image
                src={getImageUrl(booking.property.mainImage)}
                alt={booking.property.name}
                width={100}
                height={100}
                className="rounded-md object-cover"
                priority
              />
            )}
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-50">
              {booking.property.name}
            </h2>
          </div>
        )}
        {bookingId !== "verification" && booking && (
          <>
            <p className="mt-4 text-gray-700 dark:text-gray-200">
              <strong>Booking Reference:</strong> {booking.bookingReference}
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-200">
              <strong>Dates:</strong>{" "}
              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-200">
              <strong>Status:</strong> {booking.status}
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-200">
              <strong>Total:</strong> €{booking.totalPrice.toFixed(2)}
            </p>
          </>
        )}
        {bookingId === "verification" && (
          <p className="mt-4 text-gray-700 dark:text-gray-200">
            This conversation is not tied to a booking.
          </p>
        )}
      </div>

      {/* Chat Messages */}
      <div
        className="border p-4 h-80 overflow-y-auto bg-white dark:bg-gray-800 rounded mt-4"
        style={{ scrollbarWidth: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <ChatBubble
              key={msg.messageId || msg.timestamp}
              content={msg.content}
              timestamp={msg.timestamp}
              isSender={msg.senderId === currentUserId}
              read={msg.read}
              status={msg.status}
              senderAvatarUrl={msg.senderId !== currentUserId ? msg.senderAvatarUrl : undefined}
            />
          ))
        ) : (
          <p className="text-gray-500">No messages yet.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow border rounded p-2 dark:bg-gray-700 dark:text-gray-100"
          placeholder="Type your message..."
        />
        <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Send
        </button>
      </div>
    </div>
  );
}
