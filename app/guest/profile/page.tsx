'use client';

import React, { useEffect, useState } from 'react';
import { account, databases, config } from '../../lib/appwrite';
import { Query, Models } from 'appwrite';

interface Booking extends Models.Document {
  bookingReference: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
}

interface AppwriteUser extends Models.Document {
  name: string;
  email: string;
}

function AccountInfo({ user }: { user: AppwriteUser }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Account Information</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
}

function BillingDetails() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Billing Details</h2>
      <p><strong>Payment Method:</strong> Visa ending in 4242</p>
      <p><strong>Subscription:</strong> Premium Plan</p>
      <p><strong>Next Payment:</strong> 2025-04-01</p>
    </div>
  );
}

function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const user = await account.get();
        console.log("Logged in user ID:", user.$id);
        const response = await databases.listDocuments<Booking>(
          config.databaseId,
          config.bookingsCollectionId,
          [Query.equal('userId', user.$id)]
        );
        console.log("Bookings fetched:", response.documents);
        setBookings(response.documents);
      } catch (err: unknown) {
        let errorMessage = 'Unable to load bookings.';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        console.error('Error fetching bookings:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  if (loading) return <p>Loading booking history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Booking History</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul className="list-disc pl-5 space-y-2">
          {bookings.map((booking) => (
            <li key={booking.$id} className="bg-white p-4 rounded shadow">
              <p><strong>Booking Reference:</strong> {booking.bookingReference}</p>
              <p>
                <strong>Dates:</strong> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
              </p>
              <p><strong>Status:</strong> {booking.status}</p>
              <p><strong>Total Price:</strong> €{booking.totalPrice.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<'account' | 'billing' | 'bookings'>('account');
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [userError, setUserError] = useState<string>('');

  useEffect(() => {
    account
      .get()
      .then((response) => setUser(response as unknown as AppwriteUser))
      .catch((err) => {
        console.error('Error fetching user details:', err);
        setUserError('Error fetching user details.');
      });
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white text-black p-4 border-r">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <nav className="space-y-4">
          <button
            onClick={() => setActiveSection('account')}
            className={`block w-full text-left px-4 py-2 rounded ${activeSection === 'account' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            Account Information
          </button>
          <button
            onClick={() => setActiveSection('billing')}
            className={`block w-full text-left px-4 py-2 rounded ${activeSection === 'billing' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            Billing Details
          </button>
          <button
            onClick={() => setActiveSection('bookings')}
            className={`block w-full text-left px-4 py-2 rounded ${activeSection === 'bookings' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            Booking History
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 bg-white text-black">
        {activeSection === 'account' && (
          <>
            {userError && <p className="text-red-500">{userError}</p>}
            {user ? <AccountInfo user={user} /> : <p>Loading account information...</p>}
          </>
        )}
        {activeSection === 'billing' && <BillingDetails />}
        {activeSection === 'bookings' && <BookingHistory />}
      </main>
    </div>
  );
}
