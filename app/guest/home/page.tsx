// /app/guest/home/page.tsx
'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function GuestHomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users to sign in.
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4">
        <h1 className="text-3xl font-bold text-center">
          Welcome, {user?.name || 'Guest'}!
        </h1>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {/* Navigation buttons for additional guest actions */}
        <div className="flex justify-around mt-8">
          <button
            onClick={() => router.push('/guest/explore')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition"
          >
            Explore Properties
          </button>
          <button
            onClick={() => router.push('/guest/profile')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition"
          >
            Your Profile
          </button>
        </div>
        {/* Additional guest content can be added here */}
        <section className="mt-10">
          <p className="text-center text-gray-700">
            This is your guest dashboard. Browse properties, view your booking history, and more.
          </p>
        </section>
      </main>
      <footer className="p-4 text-center">
        <p>&copy; {new Date().getFullYear()} Spanish Holiday Rentals</p>
      </footer>
    </div>
  );
}
