import React, { useState, useMemo } from 'react';

interface BookedDate {
  id: number;
  pickup_date: string;
  return_date: string;
  status: string;
  user_name: string;
}

interface CarCalendarProps {
  bookedDates: BookedDate[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  minDate?: string;
  label: string;
  isRange?: boolean;
  rangeStart?: string;
  rangeEnd?: string;
  mode?: 'single' | 'range' | 'same-day';
}

const CarCalendar: React.FC<CarCalendarProps> = ({
  bookedDates,
  selectedDate,
  onDateSelect,
  minDate,
  label,
  isRange = false,
  rangeStart,
  rangeEnd,
  mode = 'range',
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const minAllowedDate = useMemo(() => {
    if (!minDate) return today;
    const [year, month, day] = minDate.split('-').map(Number);
    return new Date(year, month - 1, day);
  }, [minDate, today]);

  // Parse booked dates and create a set of disabled dates
  const disabledDates = useMemo(() => {
    const disabled = new Set<string>();
    bookedDates.forEach((booking) => {
      const pickup = parseDateString(booking.pickup_date);
      const returnDate = parseDateString(booking.return_date);
      
      // Add all dates from pickup to return (inclusive)
      const current = new Date(pickup);
      while (current <= returnDate) {
        disabled.add(formatDate(current));
        current.setDate(current.getDate() + 1);
      }
    });
    return disabled;
  }, [bookedDates]);

  const isDateDisabled = (date: Date): boolean => {
    const dateStr = formatDate(date);
    
    // Disable past dates
    if (date < minAllowedDate) return true;
    
    // Disable booked dates
    if (disabledDates.has(dateStr)) return true;
    
    return false;
  };

  const isDateInRange = (date: Date): boolean => {
    if (!rangeStart) return false;
    
    const dateStr = formatDate(date);
    
    if (!rangeEnd) {
      // When only start is selected, show preview range
      if (dateStr === rangeStart) return true;
      const start = parseDateString(rangeStart);
      return date > start && date <= (hoveredDate ? parseDateString(hoveredDate) : start);
    }
    
    const start = parseDateString(rangeStart);
    const end = parseDateString(rangeEnd);
    return date >= start && date <= end;
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Helper function to format date in local timezone (YYYY-MM-DD)
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse date string safely (handles timezone issues)
  const parseDateString = (dateStr: string): Date => {
    // Create date from YYYY-MM-DD using local timezone
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    const dateStr = formatDate(date);
    
    if (mode === 'same-day') {
      // For same-day booking mode: single click selects start, second click on same date completes same-day booking
      if (!rangeStart || (rangeStart && rangeEnd) || rangeStart !== dateStr) {
        // Start new selection (single day initially)
        onDateSelect(dateStr);
      } else if (rangeStart === dateStr) {
        // Clicking same date again converts to same-day booking
        onDateSelect(`${dateStr} to ${dateStr}`);
      }
    } else if (isRange || mode === 'range') {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Start new range
        onDateSelect(dateStr);
      } else {
        // Complete the range
        const selected = parseDateString(dateStr);
        const start = parseDateString(rangeStart);
        if (selected >= start) {
          onDateSelect(`${rangeStart} to ${dateStr}`);
        } else {
          onDateSelect(dateStr); // Start over if clicked before start date
        }
      }
    } else {
      // Single day selection
      onDateSelect(dateStr);
    }
  };

  const renderCalendarDays = (): React.ReactNode[] => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days: React.ReactNode[] = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = formatDate(date);
      const disabled = isDateDisabled(date);
      const isSelected = !isRange && mode !== 'range' && mode !== 'same-day'
        ? dateStr === selectedDate 
        : false;
      const isRangeStart = (isRange || mode === 'range' || mode === 'same-day') && rangeStart === dateStr;
      const isRangeEnd = (isRange || mode === 'range' || mode === 'same-day') && rangeEnd === dateStr;
      const inRange = (isRange || mode === 'range' || mode === 'same-day') && isDateInRange(date);

      let cellClass = 'p-2 text-sm transition-all cursor-pointer rounded-sm ';
      
      if (disabled) {
        cellClass += 'bg-red-500/10 text-red-400 cursor-not-allowed line-through opacity-50 ';
      } else if (rangeStart && rangeEnd && rangeStart === rangeEnd && rangeStart === dateStr) {
        // Same-day booking - highlight with green
        cellClass += 'bg-green-500/30 text-green-400 font-bold border-2 border-green-500 ';
      } else if (isSelected || isRangeStart) {
        cellClass += 'bg-[#d4af37] text-black font-bold ';
      } else if (isRangeEnd) {
        cellClass += 'bg-[#d4af37]/50 text-black font-bold ';
      } else if (inRange) {
        cellClass += 'bg-[#d4af37]/20 ';
      } else {
        cellClass += 'hover:bg-white/10 text-white ';
      }

      days.push(
        <div
          key={day}
          className={cellClass}
          onClick={() => handleDateClick(date)}
          onMouseEnter={() => setHoveredDate(dateStr)}
          onMouseLeave={() => setHoveredDate(null)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
        {label}
      </label>
      
      <div className="glass rounded-sm p-4">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white/10 rounded-sm transition-all text-white/60 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h3 className="text-lg font-bold serif gold-text">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-white/10 rounded-sm transition-all text-white/60 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-[10px] uppercase tracking-widest text-white/30">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>

        {/* Selected Date Display */}
        {selectedDate && !isRange && mode !== 'range' && mode !== 'same-day' && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-white/60">
              Selected: <span className="gold-text font-bold">{(() => {
                const [year, month, day] = selectedDate.split('-').map(Number);
                return new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              })()}</span>
            </p>
          </div>
        )}

        {(isRange || mode === 'range' || mode === 'same-day') && rangeStart && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-white/60">
              From: <span className="gold-text font-bold">{(() => {
                const [year, month, day] = rangeStart.split('-').map(Number);
                return new Date(year, month - 1, day).toLocaleDateString();
              })()}</span>
              {rangeEnd && (
                <> → <span className="gold-text font-bold">{(() => {
                  const [year, month, day] = rangeEnd.split('-').map(Number);
                  return new Date(year, month - 1, day).toLocaleDateString();
                })()}</span></>
              )}
            </p>
          </div>
        )}

        {/* Same-day booking info */}
        {mode === 'same-day' && (
          <p className="text-xs text-white/30 mt-2">
            Click once to select a date, or click the same date again for same-day booking
          </p>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#d4af37] rounded-sm"></div>
            <span className="text-white/40">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/20 rounded-sm"></div>
            <span className="text-white/40">Booked</span>
          </div>
          {(isRange || mode === 'range' || mode === 'same-day') && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#d4af37]/20 rounded-sm border border-[#d4af37]"></div>
              <span className="text-white/40">Range</span>
            </div>
          )}
          {mode === 'same-day' && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/30 rounded-sm border border-green-500"></div>
              <span className="text-white/40">Same Day</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarCalendar;
