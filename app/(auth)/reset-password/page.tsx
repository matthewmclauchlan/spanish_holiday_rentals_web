// /app/(auth)/reset-password/page.tsx
'use client';
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { account } from '../../lib/appwrite';

export default function ResetPasswordPage() {
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
      setTimeout(() => router.push('/signin'), 2000);
    } catch (error) {
      console.error(error);
      setMessage('Failed to update password. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>New Password:</label>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <button type="submit">Update Password</button>
      {message && <p>{message}</p>}
    </form>
  );
}
