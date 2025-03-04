'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '../lib/types';
import CustomCalendar, { DateRange } from './CustomCalendar';
import { BookingRules } from '../lib/types';

interface BookingCardProps {
  pricePerNight: number;
  cleaningFee?: number;
  bookings?: Booking[];
  bookingRules?: BookingRules | null;
}

const BookingCard: React.FC<BookingCardProps> = ({
  pricePerNight,
  cleaningFee = 50,
  bookings = [],
  bookingRules,
}) => {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>({});

  const nights =
    checkIn && checkOut
      ? Math.max(
          Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
          0
        )
      : 0;
  const subtotal = nights * pricePerNight;
  const total = subtotal + cleaningFee;

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

      {nights > 0 && (
        <div className="mb-4">
          <div className="flex justify-between">
            <span className="text-gray-700">
              €{pricePerNight} x {nights} night{nights > 1 ? 's' : ''}
            </span>
            <span className="text-gray-700">€{subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Cleaning fee</span>
            <span className="text-gray-700">€{cleaningFee}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>€{total}</span>
          </div>
        </div>
      )}

      {/* Reserve button is hidden when the calendar modal is open */}
      {!isDateModalOpen && (
        <button
          onClick={routerPushToPayment}
          disabled={!checkIn || !checkOut || nights === 0}
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
