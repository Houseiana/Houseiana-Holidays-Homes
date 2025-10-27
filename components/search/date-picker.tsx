'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onCheckInChange: (date: Date | null) => void;
  onCheckOutChange: (date: Date | null) => void;
  onClose?: () => void;
  focusedInput?: 'checkIn' | 'checkOut';
}

interface DayButtonProps {
  date: Date;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isToday: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

const DayButton = ({
  date,
  isSelected,
  isInRange,
  isRangeStart,
  isRangeEnd,
  isToday,
  isDisabled,
  onClick
}: DayButtonProps) => {
  const day = date.getDate();

  let className = "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ";

  if (isDisabled) {
    className += "text-gray-300 cursor-not-allowed ";
  } else if (isRangeStart || isRangeEnd) {
    className += "bg-gray-900 text-white ";
  } else if (isInRange) {
    className += "bg-gray-100 text-gray-900 ";
  } else if (isToday) {
    className += "bg-gray-900 text-white ";
  } else {
    className += "text-gray-900 hover:bg-gray-100 ";
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={className}
    >
      {day}
    </button>
  );
};

const DateRangeButton = ({
  label,
  selected,
  onClick
}: {
  label: string;
  selected: boolean;
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
      selected
        ? 'bg-gray-900 text-white border-gray-900'
        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
    }`}
  >
    {label}
  </button>
);

export default function DatePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  onClose,
  focusedInput = 'checkIn'
}: DatePickerProps) {
  // Handle undefined onClose
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingRange, setSelectingRange] = useState<'checkIn' | 'checkOut'>(focusedInput);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(new Date(year, month, -startingDayOfWeek + i + 1));
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false;
    return date >= checkIn && date <= checkOut;
  };

  const isDateDisabled = (date: Date) => {
    const currentMonthYear = currentMonth.getFullYear();
    const currentMonthMonth = currentMonth.getMonth();
    const dateMonth = date.getMonth();
    const dateYear = date.getFullYear();

    // Disable if not in current month or if in the past
    return (dateYear !== currentMonthYear || dateMonth !== currentMonthMonth) || date < today;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (selectingRange === 'checkIn') {
      onCheckInChange(date);
      if (checkOut && date >= checkOut) {
        onCheckOutChange(null);
      }
      setSelectingRange('checkOut');
    } else {
      if (checkIn && date < checkIn) {
        onCheckInChange(date);
        onCheckOutChange(checkIn);
      } else {
        onCheckOutChange(date);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const setQuickDateRange = (days: number) => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + days);

    onCheckInChange(start);
    onCheckOutChange(end);
  };

  const clearDates = () => {
    onCheckInChange(null);
    onCheckOutChange(null);
    setSelectingRange('checkIn');
  };

  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Select dates
          </h3>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick date range buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <DateRangeButton
            label="Exact dates"
            selected={true}
            onClick={() => {}}
          />
          <DateRangeButton
            label="± 1 day"
            selected={false}
            onClick={() => setQuickDateRange(1)}
          />
          <DateRangeButton
            label="± 2 days"
            selected={false}
            onClick={() => setQuickDateRange(2)}
          />
          <DateRangeButton
            label="± 3 days"
            selected={false}
            onClick={() => setQuickDateRange(3)}
          />
          <DateRangeButton
            label="± 7 days"
            selected={false}
            onClick={() => setQuickDateRange(7)}
          />
          <DateRangeButton
            label="± 14 days"
            selected={false}
            onClick={() => setQuickDateRange(14)}
          />
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current Month */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h4 className="text-lg font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h4>
              <div className="w-8"></div>
            </div>

            {/* Week headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((date, index) => {
                const isToday = date.toDateString() === today.toDateString();
                const isInRange = isDateInRange(date);
                const isRangeStart = checkIn && date.toDateString() === checkIn.toDateString();
                const isRangeEnd = checkOut && date.toDateString() === checkOut.toDateString();
                const isDisabled = isDateDisabled(date);

                return (
                  <DayButton
                    key={index}
                    date={date}
                    isSelected={!!isRangeStart || !!isRangeEnd}
                    isInRange={isInRange}
                    isRangeStart={!!isRangeStart}
                    isRangeEnd={!!isRangeEnd}
                    isToday={isToday}
                    isDisabled={isDisabled}
                    onClick={() => handleDateClick(date)}
                  />
                );
              })}
            </div>
          </div>

          {/* Next Month */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8"></div>
              <h4 className="text-lg font-semibold">
                {monthNames[nextMonth.getMonth()]} {nextMonth.getFullYear()}
              </h4>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Week headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(nextMonth).map((date, index) => {
                const isToday = date.toDateString() === today.toDateString();
                const isInRange = isDateInRange(date);
                const isRangeStart = checkIn && date.toDateString() === checkIn.toDateString();
                const isRangeEnd = checkOut && date.toDateString() === checkOut.toDateString();
                const isDisabled = isDateDisabled(date);

                return (
                  <DayButton
                    key={index}
                    date={date}
                    isSelected={!!isRangeStart || !!isRangeEnd}
                    isInRange={isInRange}
                    isRangeStart={!!isRangeStart}
                    isRangeEnd={!!isRangeEnd}
                    isToday={isToday}
                    isDisabled={isDisabled}
                    onClick={() => handleDateClick(date)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={clearDates}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
          >
            Clear dates
          </button>
          <div className="text-sm text-gray-600">
            {checkIn && checkOut ? (
              `${checkOut.getTime() - checkIn.getTime() === 24 * 60 * 60 * 1000 ? '1 night' :
                Math.ceil((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000)) + ' nights'} selected`
            ) : selectingRange === 'checkIn' ? (
              'Select check-in date'
            ) : (
              'Select check-out date'
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}