'use client';

import React from 'react';
import Link from 'next/link';

const AccountPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Account</h1>

      {/* Content is centered on the page with full width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Info Card */}
        <div className="bg-gray-800 text-white shadow-md p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Personal Info</h2>
          <p className="text-gray-300">Manage your personal information.</p>
          <Link href="/guest/account/personal-info" className="text-indigo-400 hover:underline">Go to Personal Info</Link>
        </div>

        {/* Billing Details Card */}
        <div className="bg-gray-800 text-white shadow-md p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Billing Details</h2>
          <p className="text-gray-300">Manage your billing details.</p>
          <Link href="/guest/account/billing" className="text-indigo-400 hover:underline">Go to Billing Details</Link>
        </div>

        {/* Booking History Card */}
        <div className="bg-gray-800 text-white shadow-md p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Booking History</h2>
          <p className="text-gray-300">Review your past bookings.</p>
          <Link href="/guest/account/bookings" className="text-indigo-400 hover:underline">Go to Booking History</Link>
        </div>

        {/* Verification Card */}
        <div className="bg-gray-800 text-white shadow-md p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Verification</h2>
          <p className="text-gray-300">Verify your account and information.</p>
          <Link href="/guest/account/verification" className="text-indigo-400 hover:underline">Go to Verification</Link>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
