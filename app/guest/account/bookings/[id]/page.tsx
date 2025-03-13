'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { account, databases, config, getPropertyById, getImageUrl } from '../../../../lib/appwrite';
import { Models } from 'appwrite';
import Image from 'next/image';
import Link from 'next/link';

interface Booking extends Models.Document {
  bookingReference: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  propertyId: string;
}

interface Property {
  $id: string;
  name: string;
  mainImage?: string;
}

interface BookingWithProperty extends Booking {
  property?: Property;
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  // Ensure bookingId is a string
  const bookingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [booking, setBooking] = useState<BookingWithProperty | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookingDetails() {
      if (!bookingId) {
        setError('Booking ID not provided.');
        setLoading(false);
        return;
      }
      try {
        // Fetch the booking document using bookingId
        const response = await databases.getDocument<Booking>(
          config.databaseId,
          config.bookingsCollectionId,
          bookingId as string
        );
        let propertyData: Property | undefined;
        try {
          const propertyDoc = await getPropertyById(response.propertyId);
          if (propertyDoc && propertyDoc.fields) {
            propertyData = {
              $id: propertyDoc.$id,
              name: propertyDoc.fields.name,
              mainImage: propertyDoc.fields.mainImage,
            };
          }
        } catch {
          // If property details aren't available, leave propertyData undefined.
        }
        const bookingWithProperty: BookingWithProperty = {
          ...response,
          property: propertyData,
        };
        setBooking(bookingWithProperty);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unable to load booking details.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchBookingDetails();
  }, [bookingId]);

  const handleSupport = async () => {
    try {
      // Fetch the logged-in user's data
      const userData = await account.get();
      // Call the support conversation API endpoint on your backend
      const response = await fetch('http://localhost:4000/createSupportConversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingId, userId: userData.$id }),
      });
      const data = await response.json();
      if (data.conversationId) {
        // Navigate to the chat page for the created conversation
        router.push(`/chat/${data.conversationId}`);
      } else {
        alert('Failed to create support conversation.');
      }
    } catch (error) {
      console.error('Error creating support conversation:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error || !booking) return <div className="text-red-500">Error: {error || 'Booking not found'}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Booking Details</h1>
      <div className="border p-4 rounded-lg bg-white dark:bg-gray-800">
        {booking.property ? (
          <div className="flex items-center gap-4">
            {booking.property.mainImage ? (
              <Image
                src={getImageUrl(booking.property.mainImage)}
                alt={booking.property.name}
                width={100}
                height={100}
                className="rounded-md"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-md"></div>
            )}
            <div className="font-medium text-gray-800 dark:text-white">
              {booking.property.name}
            </div>
          </div>
        ) : (
          <p>Property details not available.</p>
        )}
        <p className="mt-4">
          <strong>Booking Reference:</strong> {booking.bookingReference}
        </p>
        <p className="mt-2">
          <strong>Dates:</strong> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
        </p>
        <p className="mt-2">
          <strong>Total Payment:</strong> €{booking.totalPrice.toFixed(2)}
        </p>
        <p className="mt-2">
          <strong>Status:</strong> {booking.status}
        </p>
        <button
          onClick={handleSupport}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Need support with this booking? Contact Us
        </button>
      </div>
    </div>
  );
}
