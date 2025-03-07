'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function VerificationPendingPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <h1 className="text-2xl font-bold">Account Verification Pending</h1>
      <p className="mt-4 text-center">
        Your account has been created but is not yet verified. An email has been sent (or your account is awaiting manual verification). Once your account is verified by an administrator, you can sign in.
      </p>
      <button
        onClick={() => router.push('/signin')}
        className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
      >
        Go to Sign In
      </button>
    </div>
  );
}
