import React, { useState, useEffect } from 'react';
import { Calendar, Download, Link, Copy, Check, AlertCircle, Wifi, RefreshCw, Settings } from 'lucide-react';
import { calendarService, CalendarUrls } from '../services/calendarService';
import { icalService } from '../services/icalService';
import { paths } from '@/config/paths';

interface CalendarIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
  bookingFilter?: string;
  embedded?: boolean; // New prop for embedded usage in admin panel
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  isOpen,
  onClose,
  bookingFilter = 'all',
  embedded = false
}) => {
  const [calendarUrls, setCalendarUrls] = useState<CalendarUrls | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Package filtering state  
  const [selectedPackageId, setSelectedPackageId] = useState<string>('all');
  const [packages, setPackages] = useState<any[]>([]);

  // 🔄 Automatic sync state
  const [syncMonitoring, setSyncMonitoring] = useState<{
    lastSync: Record<string, string | null>;
    activePlatforms: string[];
    syncIntervals: Record<string, number>;
    enabledPlatforms: string[];
  }>({
    lastSync: {},
    activePlatforms: [],
    syncIntervals: {},
    enabledPlatforms: []
  });

  const [testingUrl, setTestingUrl] = useState<string>('');
  const [testResult, setTestResult] = useState<{ valid: boolean; eventCount?: number; error?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPackages();
      loadCalendarUrls();
      loadSyncMonitoring();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedPackageId) {
      loadCalendarUrls();
    }
  }, [selectedPackageId]);

  const loadPackages = async () => {
    try {
      const response = await fetch(paths.buildApiUrl('packages'));
      const result = await response.json();
      if (result.success) {
        setPackages(result.data || []);
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
    }
  };

  const loadSyncMonitoring = () => {
    try {
      const monitoring = calendarService.getSyncMonitoringData();
      setSyncMonitoring(monitoring);
    } catch (err) {
      console.error('Failed to load sync monitoring data:', err);
    }
  };

  const loadCalendarUrls = async () => {
    try {
      setLoading(true);
      setError(null);

      if (selectedPackageId && selectedPackageId !== 'all') {
        // Load package-specific calendar URLs
        const urls = await calendarService.getPackageSubscriptionUrls(selectedPackageId);
        setCalendarUrls(urls);
      } else {
        // Load global calendar URLs
        const urls = await calendarService.getSubscriptionUrls();
        setCalendarUrls(urls);
      }
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

  // 🔄 Automatic sync handlers
  const handleManualSync = async (platform: string) => {
    try {
      setError(null);
      await icalService.syncPlatform(platform);
      loadSyncMonitoring(); // Refresh monitoring data
    } catch (err) {
      setError(`Failed to sync ${platform}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleTestIcalUrl = async () => {
    if (!testingUrl) return;

    try {
      setTestResult(null);
      const result = await icalService.testIcalUrl(testingUrl);
      setTestResult(result);
    } catch (err) {
      setTestResult({
        valid: false,
        error: err instanceof Error ? err.message : 'Test failed'
      });
    }
  };

  const handleSyncAllPlatforms = async () => {
    try {
      setError(null);
      await icalService.syncAllPlatforms();
      loadSyncMonitoring(); // Refresh monitoring data
    } catch (err) {
      setError(`Failed to sync platforms: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!isOpen) return null;

  // Embedded mode (for admin panel) - no modal wrapper, just content
  const ContentWrapper = embedded ? 'div' : 'div';
  const containerClasses = embedded
    ? "space-y-6"
    : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

  const innerClasses = embedded
    ? ""
    : "bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto";

  return (
    <div className={containerClasses}>
      <div className={innerClasses}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            {embedded ? 'Integration & Sync' : 'Calendar Integration'}
          </h2>
          {!embedded && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          )}
        </div>

        {/* Package Selector */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calendar Scope
          </label>
          <select
            value={selectedPackageId}
            onChange={(e) => setSelectedPackageId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Bookings (Global Calendar)</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                Package: {pkg.name} ({pkg.type})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {selectedPackageId === 'all'
              ? 'Global calendar includes all bookings from all packages and rooms'
              : 'Package calendar includes only bookings for the selected package'
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* 🔄 Automatic Sync Section */}
          <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-600" />
              Automatic iCal Synchronization
            </h3>
            <p className="text-gray-600 mb-4">
              Monitor and control automatic synchronization with external booking platforms (Airbnb, Booking.com, VRBO).
            </p>

            {/* Platform Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {syncMonitoring.enabledPlatforms.map((platform) => (
                <div key={platform} className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{platform}</span>
                      {syncMonitoring.activePlatforms.includes(platform) ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleManualSync(platform)}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Sync Now
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      Interval: {Math.round(syncMonitoring.syncIntervals[platform] / (60 * 1000))} minutes
                    </div>
                    <div>
                      Last Sync: {syncMonitoring.lastSync[platform]
                        ? new Date(syncMonitoring.lastSync[platform]!).toLocaleString()
                        : 'Never'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sync All Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSyncAllPlatforms}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Sync All Platforms
              </button>

              <button
                onClick={loadSyncMonitoring}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Refresh Status
              </button>
            </div>
          </div>

          {/* 🧪 iCal URL Testing Section */}
          <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Test iCal URL
            </h3>
            <p className="text-gray-600 mb-4">
              Test external iCal URLs to validate format and event count before adding to sync.
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={testingUrl}
                onChange={(e) => setTestingUrl(e.target.value)}
                placeholder="https://www.airbnb.com/calendar/ical/..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleTestIcalUrl}
                disabled={!testingUrl}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test URL
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg ${testResult.valid ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
                {testResult.valid ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>✅ Valid iCal URL - {testResult.eventCount || 0} events found</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>❌ Invalid URL - {testResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>

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