'use client';

import React from 'react';

interface Props {
  onSelect: (type: 'booking' | 'general') => void;
}

export default function SupportRequestSelector({ onSelect }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">What is your issue related to?</h2>
      <div className="flex gap-4">
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => onSelect('booking')}
        >
          Booking
        </button>
        <button
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={() => onSelect('general')}
        >
          General Inquiry
        </button>
      </div>
    </div>
  );
}

