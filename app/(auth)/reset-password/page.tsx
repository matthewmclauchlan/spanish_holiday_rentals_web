// /app/(auth)/reset-password/page.tsx
'use client';
import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { account } from '../../lib/appwrite';

function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId') || '';
  const secret = searchParams.get('secret') || '';
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await account.updateRecovery(userId, secret, newPassword);
      setMessage('Password updated successfully.');
      // Redirect to sign in page after a short delay
      setTimeout(() => router.push('/signin'), 2000);
    } catch (error) {
      console.error(error);
      setMessage('Failed to update password. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <label className="block text-sm font-medium">New Password:</label>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        className="block w-full rounded-md border border-gray-300 px-3 py-2"
      />
      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
      >
        Update Password
      </button>
      {message && <p className="text-center text-sm">{message}</p>}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
