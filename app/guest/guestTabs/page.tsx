// /app/guest/guestTabs/page.tsx
'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function GuestHomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users back to signin page.
  useEffect(() => {
    console.log('GuestHomePage: user=', user, 'loading=', loading);
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // While checking authentication, optionally render a loading state.
  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <h1 className="text-3xl font-bold text-center mt-8">
        Welcome, {user?.name || 'Guest'}!
      </h1>
      {/* Add additional guest-specific content here */}
    </div>
  );
}
