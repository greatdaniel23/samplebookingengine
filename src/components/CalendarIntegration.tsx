import React, { useState, useEffect } from 'react';
import { Calendar, Download, Link, Copy, Check, AlertCircle } from 'lucide-react';
import { calendarService, CalendarUrls } from '../services/calendarService';

interface CalendarIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
  bookingFilter?: string;
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  isOpen,
  onClose,
  bookingFilter = 'all'
}) => {
  const [calendarUrls, setCalendarUrls] = useState<CalendarUrls | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCalendarUrls();
    }
  }, [isOpen]);

  const loadCalendarUrls = async () => {
    try {
      setLoading(true);
      setError(null);
      const urls = await calendarService.getSubscriptionUrls();
      setCalendarUrls(urls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar URLs');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCalendar = async (status: string = 'all') => {
    try {
      await calendarService.exportCalendar({ status: status as any });
      // Success feedback could be added here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export calendar');
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await calendarService.copyToClipboard(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      setError('Failed to copy URL to clipboard');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Calendar Integration
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Export Section */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Calendar
            </h3>
            <p className="text-gray-600 mb-4">
              Download your bookings as an .ics file to import into any calendar application.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleExportCalendar('all')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                All Bookings
              </button>
              <button
                onClick={() => handleExportCalendar('confirmed')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirmed Only
              </button>
              <button
                onClick={() => handleExportCalendar('pending')}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Pending Only
              </button>
            </div>
          </div>

          {/* Subscription URLs Section */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Link className="w-5 h-5" />
              Calendar Subscription
            </h3>
            <p className="text-gray-600 mb-4">
              Use these URLs to keep your calendar apps synchronized with live booking data.
            </p>

            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Loading calendar URLs...</p>
              </div>
            ) : calendarUrls ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📱 Standard Calendar URL (Google, Outlook, etc.):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={calendarUrls.subscribe_url}
                      readOnly
                      className="flex-1 text-sm bg-white border rounded px-3 py-2 text-gray-600 font-mono"
                    />
                    <button
                      onClick={() => handleCopyUrl(calendarUrls.subscribe_url)}
                      className="bg-gray-600 text-white px-3 py-2 text-sm rounded hover:bg-gray-700 flex items-center gap-1"
                    >
                      {copiedUrl === calendarUrls.subscribe_url ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🍎 Webcal URL (Apple Calendar):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={calendarUrls.webcal_url}
                      readOnly
                      className="flex-1 text-sm bg-white border rounded px-3 py-2 text-gray-600 font-mono"
                    />
                    <button
                      onClick={() => handleCopyUrl(calendarUrls.webcal_url)}
                      className="bg-gray-600 text-white px-3 py-2 text-sm rounded hover:bg-gray-700 flex items-center gap-1"
                    >
                      {copiedUrl === calendarUrls.webcal_url ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={loadCalendarUrls}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Sync URLs
              </button>
            )}
          </div>

          {/* Platform Instructions */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">
              📚 Platform Integration Guide
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-blue-700 mb-2">🗓️ Google Calendar</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Open Google Calendar</li>
                  <li>2. Click "+" next to "Other calendars"</li>
                  <li>3. Select "From URL"</li>
                  <li>4. Paste Standard URL</li>
                  <li>5. Click "Add calendar"</li>
                </ol>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium text-orange-700 mb-2">📧 Microsoft Outlook</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Open Outlook Calendar</li>
                  <li>2. Click "Add calendar" → "Subscribe from web"</li>
                  <li>3. Paste Standard URL</li>
                  <li>4. Name calendar and click "Import"</li>
                </ol>
              </div>

              <div className="border-l-4 border-gray-500 pl-4">
                <h4 className="font-medium text-gray-700 mb-2">🍎 Apple Calendar</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Open Calendar app</li>
                  <li>2. File → New Calendar Subscription</li>
                  <li>3. Paste Webcal URL</li>
                  <li>4. Configure settings and click "OK"</li>
                </ol>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium text-red-700 mb-2">🏠 Airbnb / Booking Platforms</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Go to listing calendar settings</li>
                  <li>2. Find "Import calendar"</li>
                  <li>3. Paste Standard URL</li>
                  <li>4. Set sync frequency (hourly)</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              ✨ Calendar Integration Benefits
            </h3>
            <ul className="text-blue-700 space-y-1">
              <li>• Prevent double bookings across platforms</li>
              <li>• Automatic availability updates</li>
              <li>• Sync with personal calendars</li>
              <li>• Real-time booking visibility</li>
              <li>• Professional calendar management</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarIntegration;