'use client';

import React, { useState } from 'react';
import { Booking, BookingRules } from '../lib/types';

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface CustomCalendarProps {
  selectedRange: DateRange;
  onSelectRange: (range: DateRange) => void;
  bookings?: Booking[];
  bookingRules?: BookingRules | null;
  onClose: () => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selectedRange,
  onSelectRange,
  bookings = [],
  bookingRules = null,
  onClose,
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [warning, setWarning] = useState<string>('');

  // Normalize a date to midnight (ignore time)
  const normalizeDate = (d: Date): Date =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  // Check if a given date is booked.
  const isDateBooked = (date: Date): boolean => {
    const normDate = normalizeDate(date);
    return bookings.some((booking) => {
      const start = normalizeDate(new Date(booking.startDate));
      const end = normalizeDate(new Date(booking.endDate));
      return normDate.getTime() >= start.getTime() && normDate.getTime() < end.getTime();
    });
  };

  // Generate a calendar matrix for the month.
  // Out-of-month cells are null (rendered blank).
  const getCalendarMatrix = (month: Date): (Date | null)[][] => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const weeks: (Date | null)[][] = [];
    let week: (Date | null)[] = [];
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      week.push(null);
    }
    for (let day = 1; day <= lastDay.getDate(); day++) {
      week.push(new Date(month.getFullYear(), month.getMonth(), day));
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
    return weeks;
  };

  // Handle day click with validation:
  const handleDayClick = (date: Date) => {
    setWarning('');
    if (!selectedRange.from || (selectedRange.from && selectedRange.to)) {
      // Validate advance notice (if provided)
      if (bookingRules && bookingRules.advanceNotice) {
        const minCheckIn = new Date();
        minCheckIn.setDate(today.getDate() + bookingRules.advanceNotice);
        if (normalizeDate(date).getTime() < normalizeDate(minCheckIn).getTime()) {
          setWarning(`Check-in must be at least ${bookingRules.advanceNotice} day(s) in advance.`);
          return;
        }
      }
      onSelectRange({ from: date, to: undefined });
    } else {
      // There is a start date; attempt to set end date.
      const start = normalizeDate(selectedRange.from);
      const end = normalizeDate(date);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (nights < 0) {
        onSelectRange({ from: date, to: undefined });
        return;
      }
      if (bookingRules) {
        if (nights < bookingRules.minStay) {
          setWarning(`This property requires a minimum stay of ${bookingRules.minStay} nights.`);
          onSelectRange({});
          return;
        }
        if (nights > bookingRules.maxStay) {
          setWarning(`This property allows a maximum stay of ${bookingRules.maxStay} nights.`);
          onSelectRange({});
          return;
        }
      }
      onSelectRange({ from: selectedRange.from, to: date });
    }
  };

  const renderMonth = (month: Date) => {
    const weeks = getCalendarMatrix(month);
    return (
      <div className="p-2">
        <div className="text-center font-bold mb-2 text-gray-900 dark:text-white">
          {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <div className="grid grid-cols-7 text-center text-xs md:text-sm font-bold mb-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, index) => (
            <div key={index} className="text-gray-900 dark:text-white">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weeks.map((week, wi) =>
            week.map((date, di) => {
              if (!date) {
                return <div key={`${wi}-${di}`} className="w-10 h-10"></div>;
              }
              const normDate = normalizeDate(date);
              const disabled = isDateBooked(date);
              let cellClasses = 'w-10 h-10 flex items-center justify-center cursor-pointer';
              if (disabled) {
                cellClasses += ' bg-gray-300 dark:bg-gray-600 text-gray-400 dark:text-gray-700';
              }
              if (selectedRange.from && !selectedRange.to) {
                if (normDate.getTime() === normalizeDate(selectedRange.from).getTime()) {
                  cellClasses += ' bg-blue-500 text-white dark:bg-blue-600';
                }
              }
              if (selectedRange.from && selectedRange.to) {
                const fromTime = normalizeDate(selectedRange.from).getTime();
                const toTime = normalizeDate(selectedRange.to).getTime();
                const dateTime = normDate.getTime();
                if (dateTime === fromTime || dateTime === toTime) {
                  cellClasses += ' bg-blue-500 text-white dark:bg-blue-600';
                } else if (dateTime > fromTime && dateTime < toTime) {
                  cellClasses += ' bg-blue-200 text-blue-900 dark:bg-blue-600 dark:text-blue-200';
                }
              }
              return (
                <div
                  key={`${wi}-${di}`}
                  className={cellClasses}
                  onClick={() => handleDayClick(date)}
                >
                  {date.getDate()}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const nextMonthHandler = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonthHandler = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        {warning && (
          <div className="mb-4 text-red-600 text-sm text-center">{warning}</div>
        )}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevMonthHandler}
            className="px-2 py-1 border rounded bg-gray-200 dark:bg-gray-600 dark:text-white"
          >
            Prev
          </button>
          <div className="font-bold text-gray-900 dark:text-white">Select Dates</div>
          <button
            onClick={nextMonthHandler}
            className="px-2 py-1 border rounded bg-gray-200 dark:bg-gray-600 dark:text-white"
          >
            Next
          </button>
        </div>
        <div className="flex space-x-4">
          {renderMonth(currentMonth)}
          {renderMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
        </div>
        <button
          onClick={onClose}
          className="absolute bottom-2 right-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CustomCalendar;
