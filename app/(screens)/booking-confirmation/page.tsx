// app/booking-confirmation/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '../../lib/appwrite';

interface BookingDetails {
  checkIn: string;
  checkOut: string;
  adults: number;
  childCount: number;
  infants: number;
  pets: number;
  totalCost: number;
  nightlyCost: number;
  discountPercent: number;
  finalCleaningFee: number;
  cancellationPolicy: string;
  propertyTitle: string;
  propertyImageUrl: string;
  customerEmail: string;
  maxGuests: number;
}

export default function BookingConfirmationPage() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedData = localStorage.getItem('bookingDetails');
    if (storedData) {
      setBookingDetails(JSON.parse(storedData));
    } else {
      router.push('/');
    }
  }, [router]);

  const handleEdit = () => {
    router.push('/');
  };

  const handleConfirmAndPay = async () => {
    console.log("Proceeding to checkout with details:", bookingDetails);
    router.push('/payment-success'); // Replace with your actual checkout call.
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Loading booking details...
      </div>
    );
  }

  // Convert propertyImageUrl to a full URL if needed.
  const imageUrlStr = String(bookingDetails.propertyImageUrl);
  const propertyImageUrl = imageUrlStr.startsWith('http')
    ? imageUrlStr
    : getImageUrl(imageUrlStr);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Booking Review and Cancellation Policy */}
        <div>
          <h1 className="text-3xl font-bold mb-6">Review Your Booking</h1>
          <div className="mb-6">
            <p className="mb-2">
              <strong>Check-in:</strong> {new Date(bookingDetails.checkIn).toLocaleDateString()}
            </p>
            <p className="mb-2">
              <strong>Check-out:</strong> {new Date(bookingDetails.checkOut).toLocaleDateString()}
            </p>
            <p className="mb-2">
              <strong>Guests:</strong> {bookingDetails.adults} Adult(s), {bookingDetails.childCount} Child(ren), {bookingDetails.infants} Infant(s), {bookingDetails.pets} Pet(s)
            </p>
          </div>

          {/* Cancellation Policy Section */}
          <div className="border-t border-gray-300 pt-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">Cancellation Policy</h2>
            <p className="mb-2">
              {bookingDetails.cancellationPolicy === 'strict'
                ? "Free cancellation until 24 hours before check-in. After that, cancellations will incur a fee."
                : "Flexible cancellation with minimal fees. Please review our policy details."}
            </p>
            <Link
              href="/help/how-to-understand-our-cancellation-policies"
              className="text-indigo-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Edit
            </button>
            <button
              onClick={handleConfirmAndPay}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Confirm &amp; Pay
            </button>
          </div>
        </div>

        {/* Right Column: Sticky Property Card with Price Breakdown */}
        <div className="sticky top-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="relative w-full h-64">
              <Image
                src={propertyImageUrl}
                alt={bookingDetails.propertyTitle}
                fill
                className="object-cover rounded"
              />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-center">{bookingDetails.propertyTitle}</h2>
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Price Breakdown</h3>
              <div className="flex justify-between">
                <span>Nightly Cost</span>
                <span>€{bookingDetails.nightlyCost.toFixed(2)}</span>
              </div>
              {bookingDetails.discountPercent > 0 && (
                <div className="flex justify-between">
                  <span>Discount ({bookingDetails.discountPercent}%)</span>
                  <span>
                    -€{((bookingDetails.nightlyCost * bookingDetails.discountPercent) / 100).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Cleaning Fee</span>
                <span>€{bookingDetails.finalCleaningFee.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>€{bookingDetails.totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
