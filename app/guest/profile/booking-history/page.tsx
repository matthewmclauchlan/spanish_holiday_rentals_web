'use client';

import React, { useEffect, useState } from 'react';
import { account, databases, config } from '../../../lib/appwrite';
import { Query, Models } from 'appwrite';

interface Booking extends Models.Document {
  bookingReference: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  // Add any additional booking fields as needed (like paymentId, etc.)
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        // Get the logged-in user's ID from Appwrite.
        const user = await account.get();
        console.log("Logged in user ID:", user.$id);
        // Query bookings for the current user.
        const response = await databases.listDocuments<Booking>(
          config.databaseId,
          config.bookingsCollectionId,
          [Query.equal('userId', user.$id)]
        );
        console.log("Bookings fetched:", response.documents);
        setBookings(response.documents);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'Unable to load bookings.');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  if (loading) return <div>Loading booking history...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Your Booking History</h1>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((booking) => (
            <li key={booking.$id} className="bg-white p-4 rounded shadow">
              <p>
                <strong>Booking Reference:</strong> {booking.bookingReference}
              </p>
              <p>
                <strong>Dates:</strong> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong> {booking.status}
              </p>
              <p>
                <strong>Total Price:</strong> €{booking.totalPrice.toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
