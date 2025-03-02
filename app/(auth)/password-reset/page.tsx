// /app/(auth)/password-reset/page.tsx
'use client';
import React, { useState } from 'react';
import { account } from '../../lib/appwrite';
import Image from 'next/image';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      // Define the URL to redirect the user after they reset their password.
      const redirectUrl = window.location.origin + '/password-reset-callback';
      await account.createRecovery(email, redirectUrl);
      setMessage('A password reset link has been sent to your email.');
    } catch {
      setError('Failed to send password reset email. Please check your email address.');
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          alt="Spanish Holiday Rentals"
          src="/assets/images/shr_logo.png"
          width={120}
          height={40}
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          Reset your password
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {message && <p className="text-green-500">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Enter your email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:outline-indigo-600"
            >
              Send reset email
            </button>
          </div>
        </form>
        <p className="mt-10 text-center text-sm text-gray-500">
          Remember your password?{' '}
          <a href="/signin" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
