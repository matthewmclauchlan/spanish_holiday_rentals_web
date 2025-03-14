// app/support/page.tsx
'use client';

import React from 'react';

export default function SupportHomePage() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Support Dashboard Home</h1>
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        Welcome to the Support Dashboard. Here you can manage and respond to customer support queries.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Open Conversations Card */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Open Conversations</h2>
          <p className="text-gray-600 dark:text-gray-400">You have <span className="font-bold">X</span> open conversations.</p>
        </div>
        {/* Pending Tickets Card */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Pending Tickets</h2>
          <p className="text-gray-600 dark:text-gray-400">There are <span className="font-bold">Y</span> pending tickets.</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Below is a summary of your recent support activities.
        </p>
        {/* Placeholder for a list or table of recent activity */}
        <div className="mt-4 border rounded p-4 bg-white dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No recent activity available.</p>
        </div>
      </div>
    </div>
  );
}
