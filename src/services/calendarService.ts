// Calendar sync and iCal integration service
import { paths } from '../config/paths';

// Unified calendar item types (internal bookings + external blocks)
export interface BookingRange {
  id: number;
  check_in: string; // ISO date (YYYY-MM-DD)
  check_out: string; // ISO date (YYYY-MM-DD)
  status: string; // pending|confirmed|cancelled|checked_in|checked_out
  type: 'booking';
}

export interface ExternalBlockRange {
  id: number;
  start_date: string; // ISO date
  end_date: string;   // ISO date
  source: string;
  summary?: string;
  description?: string;
  type: 'external';
}

export type CalendarItem = BookingRange | ExternalBlockRange;

export interface CalendarUrls {
  success: boolean;
  subscribe_url: string;
  webcal_url: string;
  instructions: {
    google_calendar: string;
    outlook: string;
    apple_calendar: string;
    airbnb: string;
  };
}

export interface iCalExportOptions {
  status?: 'all' | 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'checked_out';
  from_date?: string;
  to_date?: string;
  format?: 'ics' | 'json';
}

class CalendarService {
  private apiBase: string;

  constructor() {
    this.apiBase = paths.buildApiUrl('');
  }

  /** Fetch raw bookings (no server-side date filtering yet) */
  async fetchBookings(): Promise<BookingRange[]> {
    try {
      const res = await fetch(`${this.apiBase}bookings.php`);
      const json = await res.json();
      if (!json.success) return [];
      return (json.data || []).map((b: any) => ({
        id: Number(b.id),
        check_in: b.check_in,
        check_out: b.check_out,
        status: b.status || 'confirmed',
        type: 'booking' as const
      }));
    } catch (e) {
      console.error('Failed to fetch bookings', e);
      return [];
    }
  }

  /** Fetch external calendar blocks */
  async fetchExternalBlocks(params: { source?: string; from?: string; to?: string } = {}): Promise<ExternalBlockRange[]> {
    try {
      const qs = new URLSearchParams();
      if (params.source) qs.append('source', params.source);
      if (params.from) qs.append('from', params.from);
      if (params.to) qs.append('to', params.to);
      const res = await fetch(`${this.apiBase}external_blocks.php?${qs.toString()}`);
      const json = await res.json();
      if (!json.success) return [];
      return (json.data || []).map((e: any) => ({
        id: Number(e.id),
        start_date: e.start_date,
        end_date: e.end_date,
        source: e.source,
        summary: e.summary,
        description: e.description,
        type: 'external' as const
      }));
    } catch (e) {
      console.error('Failed to fetch external blocks', e);
      return [];
    }
  }

  /** Merge bookings + external blocks into unified list */
  async fetchUnifiedCalendar(options: { source?: string; from?: string; to?: string } = {}): Promise<CalendarItem[]> {
    const [bookings, external] = await Promise.all([
      this.fetchBookings(),
      this.fetchExternalBlocks(options)
    ]);
    return [...bookings, ...external];
  }

  /** Color mapping for unified items */
  colorFor(item: CalendarItem): string {
    if (item.type === 'external') return '#dc2626'; // red
    switch (item.status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#16a34a';
      case 'checked_in': return '#0d9488';
      case 'checked_out': return '#3b82f6';
      case 'cancelled': return '#6b7280';
      default: return '#2563eb';
    }
  }

  /** Build date -> items map (end exclusive for ranges) */
  buildDateRangeMap(items: CalendarItem[]): Record<string, CalendarItem[]> {
    const map: Record<string, CalendarItem[]> = {};
    items.forEach(item => {
      let startStr: string;
      let endStr: string;
      if (item.type === 'booking') {
        startStr = item.check_in;
        endStr = item.check_out;
      } else {
        startStr = item.start_date;
        endStr = item.end_date;
      }
      const start = new Date(startStr + 'T00:00:00');
      const end = new Date(endStr + 'T00:00:00');
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        if (!map[key]) map[key] = [];
        map[key].push(item);
      }
    });
    return map;
  }

  /**
   * Export bookings as iCal file (.ics)
   */
  async exportCalendar(options: iCalExportOptions = {}): Promise<void> {
    try {
      const params = new URLSearchParams({
        action: 'calendar',
        format: 'ics',
        status: options.status || 'all',
        ...(options.from_date && { from_date: options.from_date }),
        ...(options.to_date && { to_date: options.to_date })
      });

      const url = `${this.apiBase}ical.php?${params}`;
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = 'villa-bookings.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      
    } catch (error) {
      console.error('❌ Calendar export failed:', error);
      throw new Error('Failed to export calendar');
    }
  }

  /**
   * Get calendar subscription URLs
   */
  async getSubscriptionUrls(): Promise<CalendarUrls> {
    try {
      const response = await fetch(`${this.apiBase}ical.php?action=subscribe`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get subscription URLs');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Failed to get subscription URLs:', error);
      throw error;
    }
  }

  /**
   * Get iCal data as JSON (for preview or processing)
   */
  async getCalendarData(options: iCalExportOptions = {}): Promise<any> {
    try {
      const params = new URLSearchParams({
        action: 'calendar',
        format: 'json',
        status: options.status || 'all',
        ...(options.from_date && { from_date: options.from_date }),
        ...(options.to_date && { to_date: options.to_date })
      });

      const response = await fetch(`${this.apiBase}ical.php?${params}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get calendar data');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Failed to get calendar data:', error);
      throw error;
    }
  }

  /**
   * Copy text to clipboard with fallback
   */
  copyToClipboard(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
          .then(() => resolve())
          .catch(() => this.fallbackCopyToClipboard(text, resolve, reject));
      } else {
        this.fallbackCopyToClipboard(text, resolve, reject);
      }
    });
  }

  private fallbackCopyToClipboard(text: string, resolve: () => void, reject: (error: Error) => void): void {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        resolve();
      } else {
        reject(new Error('Failed to copy to clipboard'));
      }
    } catch (error) {
      reject(error as Error);
    }
  }

  /**
   * Generate platform-specific instructions
   */
  getPlatformInstructions(): Record<string, { title: string; steps: string[] }> {
    return {
      google: {
        title: '🗓️ Google Calendar',
        steps: [
          'Open Google Calendar in your browser',
          'Click the "+" button next to "Other calendars"',
          'Select "From URL"',
          'Paste the Standard Calendar URL',
          'Click "Add calendar"',
          'Your villa bookings will now appear in Google Calendar'
        ]
      },
      outlook: {
        title: '📧 Microsoft Outlook',
        steps: [
          'Open Outlook Calendar (web or desktop)',
          'Click "Add calendar" → "Subscribe from web"',
          'Paste the Standard Calendar URL',
          'Give your calendar a name (e.g., "Villa Bookings")',
          'Click "Import" or "Subscribe"',
          'Calendar will sync automatically'
        ]
      },
      apple: {
        title: '🍎 Apple Calendar',
        steps: [
          'Open the Calendar app on Mac/iPhone/iPad',
          'Go to File → New Calendar Subscription (Mac) or Settings → Calendars → Add Account (iOS)',
          'Paste the Webcal URL',
          'Configure sync frequency (hourly recommended)',
          'Click "OK" or "Add"',
          'Bookings will appear in your Apple Calendar'
        ]
      },
      airbnb: {
        title: '🏠 Airbnb Integration',
        steps: [
          'Log into your Airbnb host account',
          'Go to your listing → Calendar',
          'Click "Availability settings" → "Import calendar"',
          'Paste the Standard Calendar URL',
          'Set sync frequency to "Hourly" or "Daily"',
          'Save settings - blocked dates will sync automatically'
        ]
      },
      booking: {
        title: '🌐 Booking.com Integration',
        steps: [
          'Log into your Booking.com extranet',
          'Go to Property → Calendar & Pricing',
          'Find "Calendar sync" or "Import calendar"',
          'Add the Standard Calendar URL',
          'Enable automatic sync',
          'Your availability will stay synchronized'
        ]
      },
      vrbo: {
        title: '🏖️ VRBO/Expedia Integration',
        steps: [
          'Log into your VRBO owner account',
          'Go to your property dashboard',
          'Navigate to Calendar & Availability',
          'Look for "Import calendar" or "Connect calendar"',
          'Add the Standard Calendar URL',
          'Enable sync to prevent double bookings'
        ]
      }
    };
  }

  /**
   * Validate iCal URL format
   */
  isValidCalendarUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.includes('ical.php') && 
             urlObj.searchParams.get('action') === 'calendar';
    } catch {
      return false;
    }
  }

  /**
   * Get calendar statistics
   */
  async getCalendarStats(): Promise<{ total: number; by_status: Record<string, number> }> {
    try {
      const data = await this.getCalendarData({ format: 'json' });
      
      const stats = {
        total: data.count || 0,
        by_status: {} as Record<string, number>
      };

      // If we have access to booking data, calculate status breakdown
      // This would require additional API endpoint or data in the response
      
      return stats;
    } catch (error) {
      console.error('❌ Failed to get calendar stats:', error);
      return { total: 0, by_status: {} };
    }
  }
}

// Export singleton instance
export const calendarService = new CalendarService();

// Export default for backwards compatibility
export default calendarService;

// Utility functions for components
export const exportBookingsCalendar = (options?: iCalExportOptions) => {
  return calendarService.exportCalendar(options);
};

export const getCalendarSubscriptionUrls = () => {
  return calendarService.getSubscriptionUrls();
};

export const copyCalendarUrlToClipboard = (url: string) => {
  return calendarService.copyToClipboard(url);
};

// Unified helpers re-export for components
export const fetchUnifiedCalendar = (opts?: { source?: string; from?: string; to?: string }) => calendarService.fetchUnifiedCalendar(opts || {});
export const calendarColorFor = (item: CalendarItem) => calendarService.colorFor(item);
export const buildCalendarDateMap = (items: CalendarItem[]) => calendarService.buildDateRangeMap(items);
