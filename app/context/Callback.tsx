// /app/(auth)/callback/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { fetchUser } = useAuth();

  useEffect(() => {
    async function handleCallback() {
      await fetchUser();
      // Redirect to your desired page after login, e.g. guestTabs.
      router.push('/guest/guestTabs');
    }
    handleCallback();
  }, [fetchUser, router]);

  return <p>Loading...</p>;
}
