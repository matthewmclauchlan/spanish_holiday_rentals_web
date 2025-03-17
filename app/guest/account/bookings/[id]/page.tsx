"use client"; 

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { account, databases, config, getImageUrl } from "../../../../lib/appwrite";
import { Models } from "appwrite";

interface Booking extends Models.Document {
  bookingReference: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  propertyId: string;
}

interface Property extends Models.Document {
  name: string;
  mainImage?: string;
}

interface BookingWithProperty extends Booking {
  property?: Property;
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [booking, setBooking] = useState<BookingWithProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSupport = async () => {
    if (!booking || !booking.$id) {
      console.error("Booking data or booking ID is missing:", booking);
      setError("Booking ID is missing. Please try again.");
      return;
    }

    try {
      const userData = await account.get();
      const docId = booking.$id; // Use document ID
      // Updated URL to the public endpoint.
      const response = await fetch("https://spanish-holiday-rentals-web.vercel.app/api/createSupportConversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: docId, userId: userData.$id }),
      });
      const data = await response.json();

      if (response.ok && data.conversationId) {
        router.push(`/chat/${encodeURIComponent(data.conversationId)}`);
      } else {
        setError(data.error || "Unable to create support conversation.");
      }
    } catch (err) {
      console.error("Error contacting support:", err);
      setError("Error contacting support. Please try again later.");
    }
  };

  useEffect(() => {
    async function fetchBookingDetails() {
      if (!bookingId) {
        setError("Booking ID not provided.");
        setLoading(false);
        return;
      }
      try {
        const bookingDoc = await databases.getDocument<Booking>(
          config.databaseId,
          config.bookingsCollectionId,
          bookingId
        );
        let propertyDoc: Property | undefined;
        if (bookingDoc.propertyId) {
          propertyDoc = await databases.getDocument<Property>(
            config.databaseId,
            config.propertiesCollectionId,
            bookingDoc.propertyId
          );
        }
        setBooking({ ...bookingDoc, property: propertyDoc });
      } catch (err) {
        console.error(err);
        setError("Error loading booking details.");
      } finally {
        setLoading(false);
      }
    }
    fetchBookingDetails();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen p-4">
        Loading...
      </div>
    );
  }
  if (error || !booking) {
    return (
      <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen p-4">
        <p className="text-red-500">{error || "Booking not found"}</p>
      </div>
    );
  }

  return (
    <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen p-4">
      {/* Container for responsiveness */}
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-50">
          Booking Details
        </h1>

        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700 space-y-4">
          {/* Property Details */}
          {booking.property && (
            <div className="flex items-center gap-4">
              {booking.property.mainImage && (
                <Image
                  src={getImageUrl(booking.property.mainImage)}
                  alt={booking.property.name}
                  width={100}
                  height={100}
                  className="rounded-md object-cover"
                />
              )}
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-50">
                {booking.property.name}
              </h2>
            </div>
          )}

          {/* Booking Summary */}
          <div>
            <p className="text-gray-700 dark:text-gray-200">
              <strong>Booking Reference:</strong> {booking.bookingReference}
            </p>
            <p className="text-gray-700 dark:text-gray-200">
              <strong>Dates:</strong>{" "}
              {new Date(booking.startDate).toLocaleDateString()} -{" "}
              {new Date(booking.endDate).toLocaleDateString()}
            </p>
            <p className="text-gray-700 dark:text-gray-200">
              <strong>Status:</strong> {booking.status}
            </p>
            <p className="text-gray-700 dark:text-gray-200">
              <strong>Total:</strong> €{booking.totalPrice.toFixed(2)}
            </p>
          </div>

          <hr className="border-gray-300 dark:border-gray-700" />

          {/* Stay Details Placeholder */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-50">
              Stay Details
            </h3>
            <p className="text-gray-700 dark:text-gray-200">
              [Placeholder: Check-in instructions, guest capacity, amenities, etc.]
            </p>
          </div>

          <hr className="border-gray-300 dark:border-gray-700" />

          {/* Payment Details Placeholder */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-50">
              Payment Details
            </h3>
            <p className="text-gray-700 dark:text-gray-200">
              [Placeholder: Breakdown of total cost, taxes, fees, payment method, etc.]
            </p>
          </div>

          <hr className="border-gray-300 dark:border-gray-700" />

          {/* Property Details Placeholder */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-50">
              Property Details
            </h3>
            <p className="text-gray-700 dark:text-gray-200">
              [Placeholder: Full description of the property, images, location, map, amenities, etc.]
            </p>
          </div>

          <hr className="border-gray-300 dark:border-gray-700" />

          {/* Next Steps Placeholder */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-50">
              Next Steps
            </h3>
            <p className="text-gray-700 dark:text-gray-200">
              [Placeholder: ID submission instructions, check-in procedure, special requests,
              contact info, etc.]
            </p>
          </div>

          <button
            onClick={handleSupport}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Need Support? Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}
