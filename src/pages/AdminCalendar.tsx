import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Download, RefreshCw, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { paths } from '@/config/paths';

interface CalendarItem {
  type: 'booking' | 'external';
  id: string | number;
  start: string;
  end: string;
  status?: string;
  source?: string;
  label: string;
}

const AdminCalendar: React.FC = () => {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBookings, setShowBookings] = useState(true);
  const [showExternal, setShowExternal] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    load();
    loadSubscription();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch bookings data
      const response = await fetch(paths.buildApiUrl('bookings.php'));
      const data = await response.json();
      
      if (data.success) {
        const bookingItems: CalendarItem[] = data.data.map((b: any) => ({
          type: 'booking',
          id: b.id,
          start: b.check_in,
          end: b.check_out,
          status: b.status,
          label: `#${b.id} ${b.first_name || ''}`.trim()
        }));
        
        setItems(bookingItems);
      } else {
        setError(data.error || 'Failed to load calendar data');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const res = await fetch(paths.buildApiUrl('ical.php?action=subscribe'));
      const data = await res.json();
      if (data.success) setSubscription(data);
    } catch (e) {
      console.warn('Subscribe URL load failed', e);
    }
  };

  const exportIcs = (status: string = 'all') => {
    const url = paths.buildApiUrl(`ical.php?action=calendar&format=ics&status=${status}`);
    const link = document.createElement('a');
    link.href = url;
    link.download = `villa-bookings-${status}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Calendar exported",
      description: `${status.charAt(0).toUpperCase() + status.slice(1)} bookings exported successfully`
    });
  };

  const buildDateMap = (items: CalendarItem[]) => {
    const map: { [key: string]: CalendarItem[] } = {};
    items.forEach(item => {
      const start = new Date(item.start);
      const end = new Date(item.end);
      
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        (map[key] ||= []).push(item);
      }
    });
    return map;
  };

  const dateMap = useMemo(() => buildDateMap(items), [items]);

  const MonthView: React.FC<{ month: Date }> = ({ month }) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    const cells = [];
    
    // Add padding cells for days before the first day of the month
    for (let i = 0; i < startWeekday; i++) {
      cells.push(
        <div key={`pad-${i}`} className="h-16 bg-gray-50 border rounded p-1"></div>
      );
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, monthIndex, day);
      const key = dateObj.toISOString().slice(0, 10);
      const dayItems = dateMap[key] || [];
      const filtered = dayItems.filter(item => 
        (item.type === 'booking' && showBookings) || 
        (item.type === 'external' && showExternal)
      );
      
      const hasBooking = filtered.some(f => f.type === 'booking');
      const hasExternal = filtered.some(f => f.type === 'external');
      
      let bgColor = 'bg-white';
      if (hasBooking && hasExternal) bgColor = 'bg-purple-100';
      else if (hasBooking) bgColor = 'bg-green-100';
      else if (hasExternal) bgColor = 'bg-red-100';
      
      cells.push(
        <div key={key} className={`h-16 border rounded p-1 flex flex-col text-xs ${bgColor}`}>
          <div className="font-semibold text-sm">{day}</div>
          <div className="flex flex-wrap gap-1 mt-1 overflow-hidden">
            {filtered.slice(0, 3).map((item, idx) => (
              <span
                key={`${item.type}-${item.id}-${idx}`}
                className="px-1 py-0.5 rounded bg-white/70 border text-[10px] truncate"
                title={`${item.label} ${item.start}→${item.end}`}
              >
                {item.type === 'booking' ? 'B' : 'X'}
              </span>
            ))}
            {filtered.length > 3 && (
              <span className="text-[10px] text-gray-600">+{filtered.length - 3}</span>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3">
          {month.toLocaleString('default', { month: 'long' })} {year}
        </h3>
        <div className="grid grid-cols-7 gap-1 text-xs font-medium mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{cells}</div>
      </div>
    );
  };

  const now = new Date();
  const months = [
    new Date(now.getFullYear(), now.getMonth(), 1),
    new Date(now.getFullYear(), now.getMonth() + 1, 1),
    new Date(now.getFullYear(), now.getMonth() + 2, 1)
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <CardTitle>Calendar Overview</CardTitle>
            </div>
            <Button 
              onClick={load} 
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span>Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span>External Block</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span>Overlap</span>
            </div>
            <span className="text-gray-500 text-xs">(End date is exclusive)</span>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showBookings}
                  onChange={(e) => setShowBookings(e.target.checked)}
                  className="rounded"
                />
                <Eye className="h-4 w-4" />
                Bookings
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showExternal}
                  onChange={(e) => setShowExternal(e.target.checked)}
                  className="rounded"
                />
                <Eye className="h-4 w-4" />
                External Blocks
              </label>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => exportIcs('all')} size="sm" className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-1" />
                Export All
              </Button>
              <Button onClick={() => exportIcs('confirmed')} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-1" />
                Confirmed
              </Button>
              <Button onClick={() => exportIcs('pending')} size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                <Download className="h-4 w-4 mr-1" />
                Pending
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription URLs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold">Standard URL:</span>
                <code className="block mt-1 p-2 bg-gray-100 rounded text-xs break-all">
                  {subscription.subscribe_url}
                </code>
              </div>
              <div>
                <span className="font-semibold">WebCal URL:</span>
                <code className="block mt-1 p-2 bg-gray-100 rounded text-xs break-all">
                  {subscription.webcal_url}
                </code>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Use these URLs in Google Calendar, Outlook, or Apple Calendar for live synchronization.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Next 3 Months</CardTitle>
        </CardHeader>
        <CardContent>
          {months.map(month => (
            <MonthView
              key={month.toISOString()}
              month={month}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCalendar;