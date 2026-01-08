import React, { useState } from 'react';
import { CalendarIntegration } from '@/components/CalendarIntegration';
import { PackageCalendarManager } from '@/components/admin/PackageCalendarManager';
import { Calendar, Package } from 'lucide-react';

export const CalendarTestPage: React.FC = () => {
  const [showGlobalCalendar, setShowGlobalCalendar] = useState(false);
  const [showPackageCalendar, setShowPackageCalendar] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center space-x-3">
          <Calendar className="h-8 w-8" />
          <span>Calendar Integration UI Test</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Global Calendar Integration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Global Calendar</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Manage calendar integration for all bookings across all packages and rooms.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowGlobalCalendar(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Open Global Calendar Integration
              </button>
              
              <div className="text-sm text-gray-500">
                <strong>Features:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Export all bookings to iCal</li>
                  <li>Package filtering support</li>
                  <li>Platform integration (Airbnb, Google, etc.)</li>
                  <li>Automatic sync monitoring</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Package-Specific Calendar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Package className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Package Calendar</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Manage calendar integration for a specific package with one-to-one Airbnb mapping.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowPackageCalendar(true)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Open Package Calendar Manager
              </button>
              
              <div className="text-sm text-gray-500">
                <strong>Features:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Package-specific iCal feeds</li>
                  <li>One-to-one Airbnb integration</li>
                  <li>External block management</li>
                  <li>Conflict prevention</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* API Endpoints Documentation */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Endpoints Available</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Global Calendar APIs</h3>
              <div className="space-y-2 text-sm font-mono bg-gray-50 p-3 rounded">
                <div>GET /api/ical.php?action=calendar</div>
                <div>GET /api/ical.php?action=subscribe</div>
                <div>GET /api/ical.php?action=sync_all</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Package-Specific APIs</h3>
              <div className="space-y-2 text-sm font-mono bg-gray-50 p-3 rounded">
                <div>GET /api/ical.php?action=calendar&package_id=1</div>
                <div>GET /api/ical.php?action=package_calendar&package_id=1</div>
                <div>POST /api/package_calendar_sync.php?action=setup_airbnb</div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Examples</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">1. Global Calendar Export</h3>
              <code className="block text-sm bg-white p-2 rounded mt-1">
                https://yoursite.com/api/ical.php?action=calendar&format=ics
              </code>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">2. Romantic Package Calendar</h3>
              <code className="block text-sm bg-white p-2 rounded mt-1">
                https://yoursite.com/api/ical.php?action=calendar&package_id=1&format=ics
              </code>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">3. WebCal Subscription</h3>
              <code className="block text-sm bg-white p-2 rounded mt-1">
                webcal://yoursite.com/api/ical.php?action=calendar&package_id=1&format=ics
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Global Calendar Integration Modal */}
      <CalendarIntegration
        isOpen={showGlobalCalendar}
        onClose={() => setShowGlobalCalendar(false)}
        bookingFilter="all"
      />

      {/* Package Calendar Manager Modal */}
      <PackageCalendarManager
        packageId={1}
        packageName="Romantic Getaway Package"
        isOpen={showPackageCalendar}
        onClose={() => setShowPackageCalendar(false)}
      />
    </div>
  );
};

export default CalendarTestPage;