'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Booking, BookingRules, PriceRules, PriceAdjustment } from '../lib/types';
import CustomCalendar, { DateRange } from './CustomCalendar';
import { account } from '../lib/appwrite'; // Adjust path to your Appwrite config file

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BookingCardProps {
  pricePerNight: number; // fallback value (overridden by priceRules if provided)
  cleaningFee?: number;  // fallback cleaning fee
  bookings?: Booking[];
  bookingRules?: BookingRules | null;
  priceRules?: PriceRules | null;
  priceAdjustments?: PriceAdjustment[];
}

const BookingCard: React.FC<BookingCardProps> = ({
  pricePerNight,
  cleaningFee = 50,
  bookings = [],
  bookingRules,
  priceRules,
  priceAdjustments = [],
}) => {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>({});
  const [customerEmail, setCustomerEmail] = useState<string>("");

  // Retrieve the logged-in user's email from Appwrite.
  useEffect(() => {
    account.get()
      .then((response) => {
        setCustomerEmail(response.email);
      })
      .catch((error) => {
        console.error("Error fetching user email:", error);
      });
  }, []);

  // Helper to normalize a date to midnight.
  const normalizeDate = (d: Date): Date =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  // Compute nightly cost based on price adjustments and rules.
  const computeNightlyPrice = (date: Date): number => {
    const normDate = normalizeDate(date);
    const adjustment = priceAdjustments.find((adj) => {
      const adjDate = normalizeDate(new Date(adj.date));
      return adjDate.getTime() === normDate.getTime();
    });
    if (adjustment && !adjustment.blocked && adjustment.overridePrice) {
      return adjustment.overridePrice;
    }
    if (priceRules) {
      const day = date.getDay();
      return day === 0 || day === 6
        ? priceRules.basePricePerNightWeekend
        : priceRules.basePricePerNight;
    }
    return pricePerNight;
  };

  // Calculate total nightly cost over the selected range.
  const calculateNightlyCost = (): number => {
    if (!checkIn || !checkOut) return 0;
    let totalCost = 0;
    const current = new Date(checkIn);
    while (current < checkOut) {
      totalCost += computeNightlyPrice(current);
      current.setDate(current.getDate() + 1);
    }
    return totalCost;
  };

  const nightlyCost = calculateNightlyCost();

  // Apply discount if applicable.
  let discountPercent = 0;
  if (priceRules && checkIn && checkOut) {
    const nightsCount = Math.ceil(
      (normalizeDate(checkOut).getTime() - normalizeDate(checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (nightsCount >= 30) {
      discountPercent = priceRules.monthlyDiscount;
    } else if (nightsCount >= 7) {
      discountPercent = priceRules.weeklyDiscount;
    }
  }
  const discountedNightlyCost = nightlyCost - (nightlyCost * discountPercent) / 100;

  // Use cleaning fee from priceRules if available.
  const finalCleaningFee = priceRules ? priceRules.cleaningFee : cleaningFee;
  const totalCost = discountedNightlyCost + finalCleaningFee;

  // Stripe checkout handler.
  const handleCheckout = async () => {
    const stripe = await stripePromise;
    const lineItems = [
      {
        price_data: {
          currency: 'eur',
          product_data: { name: 'Property Booking' },
          unit_amount: Math.round(totalCost * 100), // in cents
        },
        quantity: 1,
      },
    ];
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineItems,
          successUrl: window.location.origin + '/payment-success?session_id={CHECKOUT_SESSION_ID}',
          cancelUrl: window.location.origin + '/payment-cancel',
          customerEmail, // dynamically retrieved from Appwrite
        }),
      });
      const data = await response.json();
      if (!data.id) {
        console.error('Checkout session creation failed:', data.error || data);
        return;
      }
      const sessionId = data.id;
      if (stripe) {
        const result = await stripe.redirectToCheckout({ sessionId });
        if (result.error) {
          console.error(result.error.message);
        }
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  const openDateModal = () => {
    setIsDateModalOpen(true);
  };

  const closeDateModal = () => {
    setIsDateModalOpen(false);
  };

  const handleSelectRange = (range: DateRange) => {
    setSelectedRange(range);
    setCheckIn(range.from || null);
    setCheckOut(range.to || null);
  };

  return (
    <div className="border p-4 bg-white rounded-lg shadow-md relative">
      <h3 className="text-xl font-bold mb-4">Book this property</h3>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Check-in</label>
          <input
            type="text"
            readOnly
            onClick={openDateModal}
            value={checkIn ? checkIn.toLocaleDateString() : ''}
            placeholder="Select check-in date"
            className="border p-2 w-full cursor-pointer"
          />
        </div>
        <div>
          <label className="block mb-1">Check-out</label>
          <input
            type="text"
            readOnly
            onClick={openDateModal}
            value={checkOut ? checkOut.toLocaleDateString() : ''}
            placeholder="Select check-out date"
            className="border p-2 w-full cursor-pointer"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Guests</label>
        <select
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value))}
          className="border p-2 w-full"
        >
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
      {nightlyCost > 0 && (
        <div className="mb-4">
          <div className="flex justify-between">
            <span className="text-gray-700">Nightly Cost</span>
            <span className="text-gray-700">€{nightlyCost.toFixed(2)}</span>
          </div>
          {discountPercent > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-700">Discount ({discountPercent}%)</span>
              <span className="text-gray-700">
                -€{((nightlyCost * discountPercent) / 100).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-700">Cleaning fee</span>
            <span className="text-gray-700">€{finalCleaningFee.toFixed(2)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>€{totalCost.toFixed(2)}</span>
          </div>
        </div>
      )}
      {!isDateModalOpen && (
        <button
          onClick={handleCheckout}
          disabled={!checkIn || !checkOut || totalCost === 0}
          className="w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-50"
        >
          Reserve
        </button>
      )}
      {isDateModalOpen && (
        <CustomCalendar
          selectedRange={selectedRange}
          onSelectRange={handleSelectRange}
          bookings={bookings}
          bookingRules={bookingRules}
          onClose={closeDateModal}
        />
      )}
    </div>
  );
};

export default BookingCard;
