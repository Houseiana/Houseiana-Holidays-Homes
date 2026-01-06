import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  calendarMonth: Date;
  setCalendarMonth: (date: Date) => void;
  checkIn: Date | null;
  checkOut: Date | null;
  onDateClick: (date: Date) => void;
}

export const CalendarView = ({
  calendarMonth,
  setCalendarMonth,
  checkIn,
  checkOut,
  onDateClick
}: CalendarViewProps) => {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(calendarMonth);
  const days = [];
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const isCheckIn = checkIn && date.toDateString() === checkIn.toDateString();
    const isCheckOut = checkOut && date.toDateString() === checkOut.toDateString();
    const isInRange = checkIn && checkOut && date > checkIn && date < checkOut;
    const isPast = date < new Date(new Date().setHours(0,0,0,0));

    days.push(
      <button
        key={day}
        disabled={isPast}
        onClick={() => onDateClick(date)}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-colors ${
          isPast ? 'text-gray-300 cursor-not-allowed' :
          isCheckIn || isCheckOut ? 'bg-gray-900 text-white' :
          isInRange ? 'bg-gray-100' :
          'hover:bg-gray-100'
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold">
          {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="w-10 h-8 flex items-center justify-center text-xs text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};

export default CalendarView;
