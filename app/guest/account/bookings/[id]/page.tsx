'use client';

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
      const docId = booking.$id;
      const response = await fetch("https://spanish-holiday-rentals-web.vercel.app/api/createSupportConversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: docId, userId: userData.$id }),
      });
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);
  
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Failed to parse JSON:", jsonError);
        setError("Received an invalid JSON response from support API.");
        return;
      }
  
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
        <h1 className="text-2xl font-semibold mb-6 text-white">
          Booking Details
        </h1>

        {/* Content Container without card styling */}
        <div className="space-y-6">
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
              <h2 className="text-lg font-semibold text-white">
                {booking.property.name}
              </h2>
            </div>
          )}

          {/* Booking Summary */}
          <div>
            <p className="text-white">
              <strong>Booking Reference:</strong> {booking.bookingReference}
            </p>
            <p className="text-white">
              <strong>Dates:</strong>{" "}
              {new Date(booking.startDate).toLocaleDateString()} -{" "}
              {new Date(booking.endDate).toLocaleDateString()}
            </p>
            <p className="text-white">
              <strong>Status:</strong> {booking.status}
            </p>
            <p className="text-white">
              <strong>Total:</strong> €{booking.totalPrice.toFixed(2)}
            </p>
          </div>

          <hr className="border-t border-white" />

          {/* Stay Details Placeholder */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Stay Details
            </h3>
            <p className="text-white">
              [Placeholder: Check-in instructions, guest capacity, amenities, etc.]
            </p>
          </div>

          <hr className="border-t border-white" />

          {/* Payment Details Placeholder */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Payment Details
            </h3>
            <p className="text-white">
              [Placeholder: Breakdown of total cost, taxes, fees, payment method, etc.]
            </p>
          </div>

          <hr className="border-t border-white" />

          {/* Property Details Placeholder */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Property Details
            </h3>
            <p className="text-white">
              [Placeholder: Full description of the property, images, location, map, amenities, etc.]
            </p>
          </div>

          <hr className="border-t border-white" />

          {/* Next Steps Placeholder */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Next Steps
            </h3>
            <p className="text-white">
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
