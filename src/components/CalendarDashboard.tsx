import React, { useEffect, useState, useMemo } from 'react';
import { Calendar as DayCalendar } from './ui/calendar';
import { fetchUnifiedCalendar, buildCalendarDateMap, calendarColorFor, CalendarItem } from '../services/calendarService';
import { RefreshCw } from 'lucide-react';

interface CalendarDashboardProps {
  monthCount?: number; // number of months to display
}

// Utility to format date to YYYY-MM-DD
function fmt(date: Date): string { return date.toISOString().slice(0,10); }

export const CalendarDashboard: React.FC<CalendarDashboardProps> = ({ monthCount = 1 }) => {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBookings, setShowBookings] = useState(true);
  const [showExternal, setShowExternal] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true); setError(null);
      const from = fmt(new Date());
      const toDate = new Date(); toDate.setMonth(toDate.getMonth() + 6); // horizon
      const to = fmt(toDate);
      const unified = await fetchUnifiedCalendar({ from, to });
      setItems(unified);
    } catch (e: any) {
      setError(e.message || 'Failed to load calendar');
    } finally { setLoading(false); }
  }

  const filteredItems = useMemo(() => items.filter(i => {
    if (i.type === 'booking' && !showBookings) return false;
    if (i.type === 'external' && !showExternal) return false;
    return true;
  }), [items, showBookings, showExternal]);

  const dateMap = useMemo(() => buildCalendarDateMap(filteredItems), [filteredItems]);

  // Build modifiers for react-day-picker based on dateMap categories
  const bookingDays = new Set<string>();
  const externalDays = new Set<string>();
  const mixedDays = new Set<string>();
  Object.entries(dateMap).forEach(([date, arr]) => {
    const hasBooking = arr.some(a => a.type === 'booking');
    const hasExternal = arr.some(a => a.type === 'external');
    if (hasBooking && hasExternal) mixedDays.add(date);
    else if (hasExternal) externalDays.add(date);
    else if (hasBooking) bookingDays.add(date);
  });

  const modifiers = {
    booking: Array.from(bookingDays).map(d => new Date(d)),
    external: Array.from(externalDays).map(d => new Date(d)),
    mixed: Array.from(mixedDays).map(d => new Date(d))
  };

  const modifiersStyles = {
    booking: { backgroundColor: '#dcfce7' }, // light green
    external: { backgroundColor: '#fee2e2' }, // light red
    mixed: { backgroundColor: '#ede9fe' }     // light purple
  } as any;

  function renderDay(day: Date) {
    const key = fmt(day);
    const dayItems = dateMap[key];
    if (!dayItems || dayItems.length === 0) return <div>{day.getDate()}</div>;
    const topItems = dayItems.slice(0,3); // limit badges
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div>{day.getDate()}</div>
        <div className="flex mt-0.5 gap-[2px] flex-wrap justify-center">
          {topItems.map(it => (
            <span key={it.type + it.id} style={{ background: calendarColorFor(it) }} className="w-2 h-2 rounded-full"></span>
          ))}
          {dayItems.length > topItems.length && <span className="text-[10px] text-gray-600">+{dayItems.length - topItems.length}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Unified Availability Calendar</h2>
        <button onClick={loadData} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50" disabled={loading}>
          <RefreshCw className="w-4 h-4" /> {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      {error && <div className="p-2 bg-red-100 border border-red-300 text-red-700 rounded text-sm">{error}</div>}
      <div className="flex gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showBookings} onChange={e => setShowBookings(e.target.checked)} />
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background:'#16a34a'}}></span>Bookings</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showExternal} onChange={e => setShowExternal(e.target.checked)} />
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background:'#dc2626'}}></span>External Blocks</span>
        </label>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background:'#ede9fe'}}></span>Overlap</span>
          <span className="ml-2">Range end is exclusive</span>
        </div>
      </div>
      <DayCalendar
        mode="single"
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        numberOfMonths={monthCount}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        components={{ Day: (props: any) => renderDay(props.date) }}
      />
      <div className="mt-4 border rounded p-3 max-h-64 overflow-auto">
        <h3 className="text-sm font-medium mb-2">Upcoming Items (next 90 days)</h3>
        <ul className="space-y-1 text-xs">
          {filteredItems
            .slice() // copy
            .sort((a,b) => {
              const aStart = a.type === 'booking' ? a.check_in : a.start_date;
              const bStart = b.type === 'booking' ? b.check_in : b.start_date;
              return aStart.localeCompare(bStart);
            })
            .map(it => {
              const start = it.type === 'booking' ? it.check_in : it.start_date;
              const end = it.type === 'booking' ? it.check_out : it.end_date;
              return (
                <li key={it.type + it.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: calendarColorFor(it) }}></span>
                  <span className="font-mono">{start} → {end}</span>
                  <span className="text-gray-600">{it.type === 'booking' ? it.status : it.source}</span>
                </li>
              );
            })}
          {filteredItems.length === 0 && !loading && <li className="text-gray-500">No items loaded</li>}
          {loading && <li className="text-gray-500">Loading…</li>}
        </ul>
      </div>
    </div>
  );
};

export default CalendarDashboard;
