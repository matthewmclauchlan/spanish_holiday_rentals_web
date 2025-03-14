'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface SessionData {
  payment_intent: string;
  amount_total: number;
  currency: string;
  created: number;
  metadata?: {
    bookingReference?: string;  // Use bookingReference here
    bookingDate?: string;
  };
  error?: string;
}

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/checkout-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data: SessionData) => {
          if (data.error) {
            setError(data.error);
          } else {
            setSessionData(data);
          }
        })
        .catch((err) => {
          console.error('Error fetching session:', err);
          setError('Error fetching session data.');
        });
    } else {
      setError('Missing session_id.');
    }
  }, [sessionId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <p>Loading payment details...</p>
      </div>
    );
  }

  const { payment_intent, amount_total, currency, created, metadata } = sessionData;
  // Use metadata.bookingReference here.
  const bookingId =
    metadata?.bookingReference || "BKG-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const bookingDate = metadata?.bookingDate
    ? new Date(metadata.bookingDate).toLocaleString()
    : new Date(created * 1000).toLocaleString();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Payment Successful!</h1>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md shadow-md w-full max-w-md">
        <p className="text-gray-700 dark:text-gray-300"><strong>Payment ID:</strong> {payment_intent}</p>
        <p className="text-gray-700 dark:text-gray-300"><strong>Booking ID:</strong> {bookingId}</p>
        <p className="text-gray-700 dark:text-gray-300"><strong>Amount Paid:</strong> {(amount_total / 100).toFixed(2)} {currency.toUpperCase()}</p>
        <p className="text-gray-700 dark:text-gray-300"><strong>Date &amp; Time:</strong> {bookingDate}</p>
      </div>
      <div className="mt-6 text-gray-700 dark:text-gray-300 text-center">
        <p>Please keep your Booking ID for future reference.</p>
        <p className="mt-2">
          If you have any questions regarding your payment or booking, please contact our support team.
        </p>
      </div>
    </div>
  );
}
