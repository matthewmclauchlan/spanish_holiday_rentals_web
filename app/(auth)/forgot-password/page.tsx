// /app/(auth)/forgot-password/page.tsx
'use client';
import React, { useState } from 'react';
import { account } from '../../lib/appwrite';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await account.createRecovery(email, window.location.origin + '/auth/reset');
      setMessage('Recovery email sent. Check your inbox.');
    } catch (error) {
      console.error(error);
      setMessage('Failed to send recovery email.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Email:</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Reset Password</button>
      {message && <p>{message}</p>}
    </form>
  );
}
