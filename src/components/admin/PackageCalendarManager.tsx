import React, { useState, useEffect } from 'react';
import { Calendar, Download, Link, Copy, Check, AlertCircle, RefreshCw, Settings, ExternalLink, Trash2 } from 'lucide-react';
import { calendarService, PackageCalendarInfo } from '@/services/calendarService';
import { paths } from '@/config/paths';

interface PackageCalendarManagerProps {
  packageId: number;
  packageName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface AirbnbIntegration {
  platform_name: string;
  api_endpoint: string;
  sync_status: string;
  last_sync_at: string | null;
  config_data: string;
}

interface ExternalBlock {
  source: string;
  block_count: number;
  earliest_block: string;
  latest_block: string;
}

interface PackageDetails {
  id: number;
  name: string;
  valid_from: string | null;
  valid_until: string | null;
  available: number;
  is_active: number;
}

export const PackageCalendarManager: React.FC<PackageCalendarManagerProps> = ({
  packageId,
  packageName,
  isOpen,
  onClose
}) => {
  const [calendarInfo, setCalendarInfo] = useState<PackageCalendarInfo | null>(null);
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [integrations, setIntegrations] = useState<AirbnbIntegration[]>([]);
  const [externalBlocks, setExternalBlocks] = useState<ExternalBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [airbnbUrl, setAirbnbUrl] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    if (isOpen && packageId) {
      loadPackageCalendarData();
    }
  }, [isOpen, packageId]);

  const loadPackageCalendarData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load package calendar info
      const info = await calendarService.getPackageCalendarInfo(packageId);
      setCalendarInfo(info);

      // Load package details for availability dates
      await loadPackageDetails();

      // Load integrations and external blocks
      await loadIntegrations();
    } catch (err) {
      console.error('Failed to load package calendar data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const loadPackageDetails = async () => {
    try {
      const response = await fetch(paths.buildApiUrl(`packages.php?id=${packageId}`));
      const result = await response.json();
      
      if (result.success && result.data) {
        setPackageDetails(result.data);
      }
    } catch (err) {
      console.error('Failed to load package details:', err);
    }
  };

  const loadIntegrations = async () => {
    try {
      const response = await fetch(paths.buildApiUrl(`package_calendar_sync.php?action=get_package_integrations&package_id=${packageId}`));
      const result = await response.json();
      
      if (result.success) {
        setIntegrations(result.integrations || []);
        setExternalBlocks(result.external_blocks || []);
      }
    } catch (err) {
      console.error('Failed to load integrations:', err);
    }
  };

  const setupAirbnbIntegration = async () => {
    if (!airbnbUrl.trim()) {
      setError('Please enter a valid Airbnb calendar URL');
      return;
    }

    setSetupLoading(true);
    setError(null);

    try {
      const response = await fetch(paths.buildApiUrl('package_calendar_sync.php?action=setup_airbnb'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_id: packageId,
          airbnb_url: airbnbUrl
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAirbnbUrl('');
        await loadIntegrations();
        alert('Airbnb calendar integration setup successfully!');
      } else {
        setError(result.error || 'Failed to setup Airbnb integration');
      }
    } catch (err) {
      console.error('Setup failed:', err);
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setSetupLoading(false);
    }
  };

  const syncPackageCalendar = async () => {
    setLoading(true);
    try {
      const response = await fetch(paths.buildApiUrl(`package_calendar_sync.php?action=sync_package&package_id=${packageId}`));
      const result = await response.json();
      
      if (result.success) {
        await loadIntegrations();
        alert('Calendar synchronized successfully!');
      } else {
        setError(result.error || 'Sync failed');
      }
    } catch (err) {
      console.error('Sync failed:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const removeIntegration = async (platform: string) => {
    if (!confirm(`Remove ${platform} integration for this package?`)) return;

    try {
      const response = await fetch(paths.buildApiUrl(`package_calendar_sync.php?action=remove_integration&package_id=${packageId}&platform=${platform}`), {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        await loadIntegrations();
        alert('Integration removed successfully!');
      } else {
        setError(result.error || 'Failed to remove integration');
      }
    } catch (err) {
      console.error('Remove failed:', err);
      setError(err instanceof Error ? err.message : 'Remove failed');
    }
  };

  const copyToClipboard = async (url: string, type: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(type);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportPackageCalendar = async () => {
    try {
      await calendarService.exportPackageCalendar(packageId, { format: 'ics' });
    } catch (err) {
      console.error('Export failed:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Package Calendar Manager</h2>
              <p className="text-sm text-gray-500">{packageName} (ID: {packageId})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading calendar data...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Package Availability Information */}
          {packageDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Package Availability Dates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm font-medium text-gray-700 mb-1">Available From:</div>
                  <div className="text-lg">
                    {packageDetails.valid_from ? (
                      new Date(packageDetails.valid_from).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })
                    ) : (
                      <span className="text-gray-500 italic">No start date set</span>
                    )}
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm font-medium text-gray-700 mb-1">Available Until:</div>
                  <div className="text-lg">
                    {packageDetails.valid_until ? (
                      new Date(packageDetails.valid_until).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    ) : (
                      <span className="text-gray-500 italic">No end date set</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  packageDetails.available && packageDetails.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {packageDetails.available && packageDetails.is_active ? '✅ Package Active' : '❌ Package Inactive'}
                </span>
              </div>
              <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm"
                  title="Go back to edit this package's availability dates"
                >
                  <Settings className="h-4 w-4" />
                  <span>Edit Package Dates</span>
                </button>
                <div className="text-xs text-gray-500 max-w-xs break-words">
                  Close this modal, then click "Edit Sales Tool" to set availability dates
                </div>
              </div>
              {(!packageDetails.valid_from || !packageDetails.valid_until) && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-800 break-words">
                      <strong>Note:</strong> No availability dates are set for this package. 
                      It will be available indefinitely (subject to room inventory and active status).
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Package Calendar URLs */}
          {calendarInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Link className="h-5 w-5" />
                <span>Package Calendar URLs</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white rounded p-3 border">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">iCal Feed URL</label>
                    <code className="text-xs text-gray-600 break-all">{calendarInfo.calendar_url}</code>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => copyToClipboard(calendarInfo.calendar_url, 'ical')}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Copy URL"
                    >
                      {copiedUrl === 'ical' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={exportPackageCalendar}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Download .ics file"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white rounded p-3 border">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">WebCal URL (for subscriptions)</label>
                    <code className="text-xs text-gray-600 break-all">{calendarInfo.webcal_url}</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(calendarInfo.webcal_url, 'webcal')}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors ml-4"
                    title="Copy WebCal URL"
                  >
                    {copiedUrl === 'webcal' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Airbnb Integration Setup */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Airbnb Integration Setup</span>
            </h3>

            {integrations.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 break-words">
                  Connect this package to your Airbnb calendar for automatic availability sync.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    value={airbnbUrl}
                    onChange={(e) => setAirbnbUrl(e.target.value)}
                    placeholder="https://www.airbnb.com/calendar/ical/..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm min-w-0"
                  />
                  <button
                    onClick={setupAirbnbIntegration}
                    disabled={setupLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2 whitespace-nowrap"
                  >
                    {setupLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                    <span>Setup</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {integrations.map((integration, index) => (
                  <div key={index} className="bg-white rounded p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium capitalize">{integration.platform_name}</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          integration.sync_status === 'active' ? 'bg-green-100 text-green-800' :
                          integration.sync_status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {integration.sync_status}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={syncPackageCalendar}
                          disabled={loading}
                          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                          title="Sync now"
                        >
                          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => removeIntegration(integration.platform_name)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                          title="Remove integration"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>URL: <code className="text-xs">{integration.api_endpoint}</code></p>
                      {integration.last_sync_at && (
                        <p>Last sync: {new Date(integration.last_sync_at).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* External Blocks Summary */}
          {externalBlocks.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>External Calendar Blocks</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {externalBlocks.map((block, index) => (
                  <div key={index} className="bg-white rounded p-3 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{block.source}</span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        {block.block_count} blocks
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Range: {block.earliest_block} to {block.latest_block}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>Copy the iCal Feed URL above</li>
              <li>Add it as an "External Calendar" in your Airbnb hosting dashboard</li>
              <li>Enter your Airbnb calendar URL in the integration setup</li>
              <li>The system will automatically sync both ways to prevent double bookings</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCalendarManager;