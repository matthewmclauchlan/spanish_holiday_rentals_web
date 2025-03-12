'use client';

import React, { useState, useEffect } from 'react';
import { Booking, BookingRules, PriceRules, PriceAdjustment, HouseRules } from '../lib/types';
import CustomCalendar, { DateRange } from './CustomCalendar';
import { account } from '../lib/appwrite';
import { useRouter } from 'next/navigation';

interface BookingCardProps {
  pricePerNight: number;
  cleaningFee?: number;
  bookings?: Booking[];
  bookingRules?: BookingRules | null;
  priceRules?: PriceRules | null;
  priceAdjustments?: PriceAdjustment[];
  propertyTitle: string;
  propertyImageUrl: string;
  // cancellationPolicy is passed from BookingRules (read-only, not selectable)
  cancellationPolicy: string;
  houseRules?: HouseRules | null;
}

const BookingCard: React.FC<BookingCardProps> = ({
  pricePerNight,
  cleaningFee = 50,
  bookings = [],
  bookingRules,
  priceRules,
  priceAdjustments = [],
  propertyTitle,
  propertyImageUrl,
  cancellationPolicy,
  houseRules,
}) => {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState<number>(1);
  const [childCount, setChildCount] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [pets, setPets] = useState<number>(0);
  const [customerEmail, setCustomerEmail] = useState<string>("");
  
  // Date modal states
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>({});
  
  const router = useRouter();
  
  useEffect(() => {
    account.get()
      .then((response) => setCustomerEmail(response.email))
      .catch((error) => {
        console.error("Error fetching user email:", error);
      });
  }, []);
  
  // Use houseRules.guestsMax if provided; otherwise default to 6.
  // Total head count = adults + childCount + infants must not exceed maxGuests.
  const maxGuests = houseRules?.guestsMax ?? 6;
  
  const normalizeDate = (d: Date): Date =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
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
  const finalCleaningFee = priceRules ? priceRules.cleaningFee : cleaningFee;
  const totalCost = discountedNightlyCost + finalCleaningFee;
  
  // Enforce guest limits for adults, children, and infants.
  const handleAdultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAdults = parseInt(e.target.value) || 1;
    if (newAdults + childCount + infants > maxGuests) {
      setAdults(maxGuests - childCount - infants);
    } else {
      setAdults(newAdults);
    }
  };
  
  const handleChildChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChildCount = parseInt(e.target.value) || 0;
    if (adults + newChildCount + infants > maxGuests) {
      setChildCount(maxGuests - adults - infants);
    } else {
      setChildCount(newChildCount);
    }
  };
  
  const handleInfantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInfants = parseInt(e.target.value) || 0;
    if (adults + childCount + newInfants > maxGuests) {
      setInfants(maxGuests - adults - childCount);
    } else {
      setInfants(newInfants);
    }
  };
  
  // Functions for date modal.
  const openDateModal = () => setIsDateModalOpen(true);
  const closeDateModal = () => setIsDateModalOpen(false);
  const handleSelectRange = (range: DateRange) => {
    setSelectedRange(range);
    setCheckIn(range.from || null);
    setCheckOut(range.to || null);
  };
  
  // On Reserve, store booking details in localStorage and navigate to the confirmation page.
  const handleReserveClick = () => {
    if (!checkIn || !checkOut) return;
    const bookingDetails = {
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      adults,
      childCount,
      infants,
      pets,
      totalCost,
      nightlyCost,
      discountPercent,
      finalCleaningFee,
      cancellationPolicy, // read-only from props, coming from BookingRules
      propertyTitle,
      propertyImageUrl,
      customerEmail,
      maxGuests,
    };
    console.log("Saving booking details:", bookingDetails); // Log booking details
    localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    router.push('/booking-confirmation');
  };
  
  return (
    <div className="border p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md relative">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Book this property</h3>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-gray-900 dark:text-white">Check-in</label>
          <input
            type="text"
            readOnly
            onClick={openDateModal}
            value={checkIn ? checkIn.toLocaleDateString() : ''}
            placeholder="Select check-in date"
            className="border p-2 w-full cursor-pointer text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-900 dark:text-white">Check-out</label>
          <input
            type="text"
            readOnly
            onClick={openDateModal}
            value={checkOut ? checkOut.toLocaleDateString() : ''}
            placeholder="Select check-out date"
            className="border p-2 w-full cursor-pointer text-gray-900 dark:text-white"
          />
        </div>
      </div>
      {/* Guest details inputs */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 text-gray-900 dark:text-white">Adults</label>
          <input
            type="number"
            min="1"
            max={maxGuests - childCount - infants}
            value={adults}
            onChange={handleAdultChange}
            className="border p-2 w-full text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-900 dark:text-white">Children</label>
          <input
            type="number"
            min="0"
            max={maxGuests - adults - infants}
            value={childCount}
            onChange={handleChildChange}
            className="border p-2 w-full text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-900 dark:text-white">Infants</label>
          <input
            type="number"
            min="0"
            max={maxGuests - adults - childCount}
            value={infants}
            onChange={handleInfantChange}
            className="border p-2 w-full text-gray-900 dark:text-white"
          />
        </div>
      </div>
      {/* Pets input */}
      <div className="mb-4">
        <label className="block mb-1 text-gray-900 dark:text-white">Pets (Number)</label>
        <input
          type="number"
          min="0"
          value={pets}
          onChange={(e) => setPets(parseInt(e.target.value) || 0)}
          className="border p-2 w-full text-gray-900 dark:text-white"
        />
      </div>
      {nightlyCost > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-gray-900 dark:text-white">
            <span>Nightly Cost</span>
            <span>€{nightlyCost.toFixed(2)}</span>
          </div>
          {discountPercent > 0 && (
            <div className="flex justify-between text-gray-900 dark:text-white">
              <span>Discount ({discountPercent}%)</span>
              <span>
                -€{((nightlyCost * discountPercent) / 100).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-gray-900 dark:text-white">
            <span>Cleaning fee</span>
            <span>€{finalCleaningFee.toFixed(2)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold text-gray-900 dark:text-white">
            <span>Total</span>
            <span>€{totalCost.toFixed(2)}</span>
          </div>
        </div>
      )}
      {!isDateModalOpen && (
        <button
          onClick={handleReserveClick}
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
