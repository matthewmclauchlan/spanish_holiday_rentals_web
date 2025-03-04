'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '../lib/types';
import CustomCalendar, { DateRange } from './CustomCalendar';
import { BookingRules, PriceRules, PriceAdjustment } from '../lib/types';

interface BookingCardProps {
  pricePerNight: number; // fallback value (will be overridden by priceRules if provided)
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
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>({});

  // Helper to normalize a date to midnight.
  const normalizeDate = (d: Date): Date =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  // Helper to determine if a given date is a weekend.
  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday (0) or Saturday (6)
  };

  // Compute nightly price for each day based on price adjustments and price rules.
  const computeNightlyPrice = (date: Date): number => {
    const normDate = normalizeDate(date);
    // Check if an override price exists from priceAdjustments.
    const adjustment = priceAdjustments.find((adj) => {
      const adjDate = normalizeDate(new Date(adj.date));
      return adjDate.getTime() === normDate.getTime();
    });
    if (adjustment && !adjustment.blocked && adjustment.overridePrice) {
      return adjustment.overridePrice;
    }
    // Otherwise, if priceRules exist, use weekend price if applicable.
    if (priceRules) {
      return isWeekend(date)
        ? priceRules.basePricePerNightWeekend
        : priceRules.basePricePerNight;
    }
    // Fallback to the passed-in pricePerNight.
    return pricePerNight;
  };

  // Calculate total nightly cost for the selected range.
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

  // Apply discounts if applicable.
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

  // Use cleaning fee from priceRules if available
  const finalCleaningFee = priceRules ? priceRules.cleaningFee : cleaningFee;
  const totalCost = discountedNightlyCost + finalCleaningFee;

  const routerPushToPayment = () => {
    router.push('/payment');
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

      {/* Show cost breakdown only if nights have been selected */}
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

      <button
        onClick={routerPushToPayment}
        disabled={!checkIn || !checkOut || totalCost === 0}
        className="w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-50"
      >
        Reserve
      </button>

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
