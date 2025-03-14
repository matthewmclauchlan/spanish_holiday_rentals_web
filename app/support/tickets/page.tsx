'use client';

import React from 'react';

export default function SupportTicketsPage() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Support Tickets</h1>
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        Here you can view and manage support tickets submitted by customers.
      </p>
      {/* Replace this with your actual tickets table or list */}
      <div className="border rounded p-4 bg-white dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No tickets available at the moment.</p>
      </div>
    </div>
  );
}
