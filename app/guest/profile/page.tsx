'use client';

import React, { useEffect, useState } from 'react';
import { account, databases, config } from '../../lib/appwrite';
import { Query, Models } from 'appwrite';

// Define a custom user type that extends Appwrite's Document type.
interface AppwriteUser extends Models.Document {
  name: string;
  email: string;
  // Add any additional properties you expect from your user document.
}

// Define an interface for a Booking document that extends Appwrite's Document
interface Booking extends Models.Document {
  bookingReference: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  // Add additional booking fields as needed
}

// Component to display account information
function AccountInfo({ user }: { user: AppwriteUser }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Account Information</h2>
      <p>
        <strong>Name:</strong> {user.name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      {/* Additional fields and edit options */}
    </div>
  );
}

// Component to display billing details (example static content)
function BillingDetails() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Billing Details</h2>
      <p>
        <strong>Payment Method:</strong> Visa ending in 4242
      </p>
      <p>
        <strong>Subscription:</strong> Premium Plan
      </p>
      <p>
        <strong>Next Payment:</strong> 2025-04-01
      </p>
      {/* Options to update payment methods or view invoices */}
    </div>
  );
}

// Component to display booking history
function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Retrieve the logged-in user's details to filter bookings.
    account
      .get()
      .then((user) => {
        // Query Appwrite for bookings where userId equals the logged-in user's ID.
        return databases.listDocuments<Booking>(
          config.databaseId,
          config.bookingsCollectionId,
          [Query.equal('userId', user.$id)]
        );
      })
      .then((response) => {
        setBookings(response.documents);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching bookings:', err);
        setError('Unable to load bookings.');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading bookings...</p>;
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
              <p>
                <strong>Booking Reference:</strong> {booking.bookingReference}
              </p>
              <p>
                <strong>Dates:</strong>{' '}
                {new Date(booking.startDate).toLocaleDateString()} -{' '}
                {new Date(booking.endDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong> {booking.status}
              </p>
              <p>
                <strong>Total Price:</strong> ${booking.totalPrice.toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Main Profile Page with Sidebar Layout
export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<'account' | 'billing' | 'bookings'>('account');
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [userError, setUserError] = useState<string>('');

  useEffect(() => {
    account
      .get()
      .then((response) => {
        // Convert the result to unknown first, then to AppwriteUser.
        setUser(response as unknown as AppwriteUser);
      })
      .catch((err) => {
        console.error('Error fetching user details:', err);
        setUserError('Error fetching user details.');
      });
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <nav className="space-y-4">
          <button
            onClick={() => setActiveSection('account')}
            className={`block w-full text-left px-4 py-2 rounded ${
              activeSection === 'account' ? 'bg-gray-700' : 'hover:bg-gray-600'
            }`}
          >
            Account Information
          </button>
          <button
            onClick={() => setActiveSection('billing')}
            className={`block w-full text-left px-4 py-2 rounded ${
              activeSection === 'billing' ? 'bg-gray-700' : 'hover:bg-gray-600'
            }`}
          >
            Billing Details
          </button>
          <button
            onClick={() => setActiveSection('bookings')}
            className={`block w-full text-left px-4 py-2 rounded ${
              activeSection === 'bookings' ? 'bg-gray-700' : 'hover:bg-gray-600'
            }`}
          >
            Booking History
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 bg-gray-100">
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
