'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';

export default function SignUpPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await signUp(email, password, name);
      // Redirect to a verification pending page.
      router.push('/auth/verification-pending');
    } catch {
      setError('Failed to create account. Please try again.');
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch {
      setError('Failed to sign up with Google. Please try again.');
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-white dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          alt="Spanish Holiday Rentals"
          src="/assets/images/shr_logo.png"
          width={120}
          height={40}
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create a new account
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Full Name
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-white outline-1 outline-gray-300 dark:outline-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-300 focus:outline-2 focus:outline-indigo-600"
              />
            </div>
          </div>
          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-white outline-1 outline-gray-300 dark:outline-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-300 focus:outline-2 focus:outline-indigo-600"
              />
            </div>
          </div>
          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-white outline-1 outline-gray-300 dark:outline-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-300 focus:outline-2 focus:outline-indigo-600"
              />
            </div>
          </div>
          {/* Sign Up Button */}
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:outline-indigo-600"
            >
              Sign up
            </button>
          </div>
        </form>
        {/* Sign Up with Google */}
        <div className="mt-4">
          <button
            onClick={handleGoogleSignUp}
            className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
          >
            Sign up with Google
          </button>
        </div>
        <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <a
            href="/signin"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
