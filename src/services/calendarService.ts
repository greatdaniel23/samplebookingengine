// Calendar sync and iCal integration service
import { paths } from '../config/paths';

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
      
      console.log('📅 Calendar exported successfully');
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