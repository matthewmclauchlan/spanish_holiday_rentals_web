'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface BookingFlowModalProps {
  property: any; // Replace 'any' with your proper property type if available
  onClose: () => void;
  onConfirm: () => void;
}

const BookingFlowModal: React.FC<BookingFlowModalProps> = ({ property, onClose, onConfirm }) => {
  // States for booking dates and guest count
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guestCount, setGuestCount] = useState<number>(1);

  const handleConfirm = () => {
    // Here you would calculate the price breakdown or trigger further booking logic.
    // For now, we simply call onConfirm.
    console.log('Booking confirmed:', { startDate, endDate, guestCount });
    onConfirm();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Book {property.name}</h2>
        <div className="mb-4">
          <label className="block mb-2">Select Dates</label>
          <div className="flex space-x-2">
            <DatePicker
              selected={startDate}
              onChange={(date: Date) => setStartDate(date)}
              placeholderText="Check-in"
              className="border p-2 w-full"
            />
            <DatePicker
              selected={endDate}
              onChange={(date: Date) => setEndDate(date)}
              placeholderText="Check-out"
              className="border p-2 w-full"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Guests</label>
          <input
            type="number"
            value={guestCount}
            onChange={(e) => setGuestCount(parseInt(e.target.value))}
            min={1}
            className="border p-2 w-full"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-indigo-600 text-white rounded">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingFlowModal;
