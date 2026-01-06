'use client';

import { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isBefore,
  isAfter,
  isWithinInterval,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRange {
  from: string;
  to: string;
}

interface CalendarProps {
  blockedDates?: DateRange[];
  checkIn?: string;
  checkOut?: string;
  onChange: (checkIn: string, checkOut: string) => void;
  minDate?: string;
}

export default function Calendar({ 
  blockedDates = [], 
  checkIn, 
  checkOut, 
  onChange,
  minDate
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // State for internal selection flow (first click sets checkIn, second sets checkOut)
  // If both are set, next click resets and starts new checkIn
  
  const handleDateClick = (date: Date) => {
    if (isBlocked(date)) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Logic: 
    // 1. If no checkIn, set checkIn.
    // 2. If checkIn but no checkOut:
    //    a. If clicked date < checkIn, set new checkIn.
    //    b. If clicked date > checkIn, set checkOut (if range valid).
    // 3. If both set, reset to just checkIn.
    
    if (!checkIn || (checkIn && checkOut)) {
      onChange(dateStr, '');
    } else if (checkIn && !checkOut) {
      const start = parseISO(checkIn);
      if (isBefore(date, start)) {
        onChange(dateStr, '');
      } else {
        // Validation: Verify no blocked dates in between
        if (hasBlockedDatesInBetween(start, date)) {
           // Maybe show error or just don't select?
           // For better UX, let's just reset start to this date if the range is invalid
           onChange(dateStr, '');
        } else {
           onChange(checkIn, dateStr);
        }
      }
    }
  };

  const isBlocked = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check if before minDate
    if (minDate && dateStr < minDate) return true;

    // Check specific blocked ranges
    return blockedDates.some(range => dateStr >= range.from && dateStr <= range.to);
  };

  const hasBlockedDatesInBetween = (start: Date, end: Date) => {
      let current = addDays(start, 1);
      while (isBefore(current, end)) {
          if (isBlocked(current)) return true;
          current = addDays(current, 1);
      }
      return false;
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 rounded-full"
          disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), new Date())}
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-400">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const blocked = isBlocked(day);
        
        const isSelectedStart = checkIn ? isSameDay(day, parseISO(checkIn)) : false;
        const isSelectedEnd = checkOut ? isSameDay(day, parseISO(checkOut)) : false;
        const isInRange = checkIn && checkOut 
            ? isAfter(day, parseISO(checkIn)) && isBefore(day, parseISO(checkOut))
            : false;

        days.push(
          <div
            key={day.toString()}
            className={`
              relative p-0 aspect-square flex items-center justify-center text-sm cursor-pointer
              ${!isSameMonth(day, monthStart) ? 'text-gray-300' : ''}
              ${blocked ? 'text-gray-300 bg-gray-50 line-through cursor-not-allowed' : 'hover:bg-gray-100'}
              ${isSelectedStart ? 'bg-indigo-600 text-white hover:bg-indigo-700 rounded-l-full' : ''}
              ${isSelectedEnd ? 'bg-indigo-600 text-white hover:bg-indigo-700 rounded-r-full' : ''}
              ${isInRange && !blocked ? 'bg-indigo-50' : ''}
              ${isSelectedStart && isSelectedEnd ? 'rounded-full' : ''}
              ${isSelectedStart && !checkOut ? 'rounded-full' : ''}
            `}
            onClick={() => handleDateClick(cloneDay)}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 w-[300px]">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
