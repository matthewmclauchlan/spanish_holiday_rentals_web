'use client';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';

export default function SignInPage() {
  const { signIn, signInWithGoogle, fetchUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      await fetchUser();
      setTimeout(() => {
        window.location.assign('/guest/home');
      }, 500);
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          alt="Your Company"
          src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          width={40}
          height={40}
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <div className="text-sm">
                <a href="/password-reset" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:outline-indigo-600"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="mt-4 flex justify-center">
          <button
            onClick={signInWithGoogle}
            className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
          >
            Sign in with Google
          </button>
        </div>
        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{' '}
          <a href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
