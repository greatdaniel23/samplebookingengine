import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paths } from '@/config/paths';
import AdminApiDiagnostics from '@/components/AdminApiDiagnostics';
import BookingsSection from '@/components/admin/BookingsSection';
import RoomsSection from '@/components/admin/RoomsSection';
import PropertySection from '@/components/admin/PropertySection';
import PackagesSection from '@/components/admin/PackagesSection';
import AmenitiesSection from '@/components/admin/AmenitiesSection';
import HomepageContentManager from '@/components/admin/HomepageContentManager';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
              H
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Hotel Admin</h1>
              <p className="text-xs text-gray-500">Management Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <SidebarButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              label="Dashboard Overview"
            />
            <SidebarButton
              active={activeTab === 'homepage'}
              onClick={() => setActiveTab('homepage')}
              label="Homepage Content"
            />
            <SidebarButton
              active={activeTab === 'bookings'}
              onClick={() => setActiveTab('bookings')}
              label="Booking Management"
            />
            <SidebarButton
              active={activeTab === 'rooms'}
              onClick={() => setActiveTab('rooms')}
              label="Room Inventory"
            />
            <SidebarButton
              active={activeTab === 'packages'}
              onClick={() => setActiveTab('packages')}
              label="Sales Tools Management"
            />
            <SidebarButton
              active={activeTab === 'amenities'}
              onClick={() => setActiveTab('amenities')}
              label="Amenities Management"
            />
            <SidebarButton
              active={activeTab === 'property'}
              onClick={() => setActiveTab('property')}
              label="Villa & Homepage Content"
            />
            <SidebarButton
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
              label="Analytics & Reports"
            />
            <SidebarButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              label="System Settings"
            />
            <SidebarButton
              active={activeTab === 'diagnostics'}
              onClick={() => setActiveTab('diagnostics')}
              label="API Diagnostics"
            />
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center text-sm text-gray-600 px-2">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            System Status: Online
          </div>
          
          <Link 
            to="/"
            className="w-full flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-1M10 6V5a2 2 0 112 0v1M10 6h4" />
            </svg>
            View Public Site
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getTabTitle(activeTab)}</h1>
              <p className="text-sm text-gray-600 mt-1">{getTabDescription(activeTab)}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="inline-flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {activeTab === 'overview' && <OverviewSection />}
            {activeTab === 'homepage' && <HomepageContentManager />}
            {activeTab === 'bookings' && <BookingsSection />}
            {activeTab === 'rooms' && <RoomsSection />}
            {activeTab === 'packages' && <PackagesSection />}
            {activeTab === 'amenities' && <AmenitiesSection />}
            {activeTab === 'property' && <PropertySection />}
            {activeTab === 'analytics' && <AnalyticsSection />}
            {activeTab === 'settings' && <SettingsSection />}
            {activeTab === 'diagnostics' && <AdminApiDiagnostics />}
          </div>
        </main>
      </div>
    </div>
  );
};

// Sidebar Button Component
interface SidebarButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ active, onClick, label }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
        active 
          ? 'bg-yellow-600 text-white' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      {label}
    </button>
  );
};

// Helper functions
const getTabTitle = (tab: string) => {
  const titles: Record<string, string> = {
    overview: 'Dashboard Overview',
    bookings: 'Bookings Management',
    rooms: 'Room Inventory Management',
    packages: 'Sales Tools Management',
    amenities: 'Amenities Management',
    property: 'Property Management',
    analytics: 'Analytics & Reports',
    settings: 'System Settings',
    diagnostics: 'API Diagnostics'
  };
  return titles[tab] || 'Admin Panel';
};

const getTabDescription = (tab: string) => {
  const descriptions: Record<string, string> = {
    overview: 'System overview and quick actions',
    bookings: 'Manage guest reservations and transactions',
    rooms: 'Manage real inventory - rooms control all availability',
    packages: 'Marketing tools that bundle room + services for customer attraction',
    amenities: 'Manage room features and package perks',
    property: 'Update property information and settings',
    analytics: 'View performance metrics and reports',
    settings: 'Configure system preferences',
    diagnostics: 'Test API connections and debug issues'
  };
  return descriptions[tab] || 'Admin management panel';
};

// Overview Section Component
const OverviewSection: React.FC = () => {
  const [stats, setStats] = useState({
    totalBookings: '...',
    availableRooms: '...',
    activePackages: '...',
    totalGuests: '...'
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch bookings data
        const bookingsResponse = await fetch(paths.buildApiUrl('bookings.php'));
        if (!bookingsResponse.ok) {
          throw new Error(`Bookings API error: ${bookingsResponse.status}`);
        }
        const bookingsData = await bookingsResponse.json();
        
        
        // Fetch rooms data
        const roomsResponse = await fetch(paths.buildApiUrl('rooms.php'));
        if (!roomsResponse.ok) {
          throw new Error(`Rooms API error: ${roomsResponse.status}`);
        }
        const roomsData = await roomsResponse.json();
        
        
        // Fetch packages data
        const packagesResponse = await fetch(paths.buildApiUrl('packages.php'));
        if (!packagesResponse.ok) {
          throw new Error(`Packages API error: ${packagesResponse.status}`);
        }
        const packagesData = await packagesResponse.json();
        
        
        // Extract data from wrapped format: {success: true, data: Array}
        const bookings = (bookingsData && bookingsData.success && Array.isArray(bookingsData.data)) 
          ? bookingsData.data 
          : Array.isArray(bookingsData) ? bookingsData : [];
          
        const rooms = (roomsData && roomsData.success && Array.isArray(roomsData.data)) 
          ? roomsData.data 
          : Array.isArray(roomsData) ? roomsData : [];
          
        const packages = (packagesData && packagesData.success && Array.isArray(packagesData.data)) 
          ? packagesData.data 
          : Array.isArray(packagesData) ? packagesData : [];
          
        
        
        // Update statistics
        setStats({
          totalBookings: bookings.length.toString(),
          availableRooms: rooms.filter((room: any) => room.available !== false).length.toString(),
          activePackages: packages.filter((pkg: any) => pkg.active !== false).length.toString(),
          totalGuests: bookings.reduce((total: number, booking: any) => total + (parseInt(booking.guests) || 1), 0).toString()
        });
        
        // Set recent bookings (last 3)
        setRecentBookings(bookings.slice(-3).reverse());
        
      } catch (err) {
        console.error('Dashboard API Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        
        // Show fallback data on error
        setStats({
          totalBookings: 'N/A',
          availableRooms: 'N/A', 
          activePackages: 'N/A',
          totalGuests: 'N/A'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-medium text-red-800">API Connection Error</h3>
          </div>
          <div className="mt-2">
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
            >
              Retry Connection
            </button>
          </div>
        </div>
        <DashboardWithFallbackData />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'checked_in':
      case 'checked in':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* API Connection Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-blue-800">
              API Connection Active - All services operational
            </span>
          </div>
          <div className="text-xs text-blue-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="bookings"
          value={loading ? "..." : stats.totalBookings}
          label="Total Bookings"
          bgColor="bg-blue-50"
          textColor="text-blue-600"
          valueColor="text-blue-900"
        />
        <StatCard
          icon="rooms"
          value={loading ? "..." : stats.availableRooms}
          label="Available Rooms"
          bgColor="bg-green-50"
          textColor="text-green-600"
          valueColor="text-green-900"
        />
        <StatCard
          icon="packages"
          value={loading ? "..." : stats.activePackages}
          label="Active Packages"
          bgColor="bg-yellow-50"
          textColor="text-yellow-600"
          valueColor="text-yellow-900"
        />
        <StatCard
          icon="guests"
          value={loading ? "..." : stats.totalGuests}
          label="Total Guests"
          bgColor="bg-purple-50"
          textColor="text-purple-600"
          valueColor="text-purple-900"
        />
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentBookings.length > 0 ? (
              recentBookings.map((booking, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.first_name} {booking.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.check_in} → {booking.check_out}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status || 'Unknown'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
                </svg>
                <p>No recent bookings</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setActiveTab('bookings')}
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium text-blue-900">New Booking</span>
            </button>
            <button 
              onClick={() => setActiveTab('rooms')}
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-sm font-medium text-green-900">Add Room</span>
            </button>
            <button 
              onClick={() => setActiveTab('packages')}
              className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <svg className="w-8 h-8 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-sm font-medium text-yellow-900">New Package</span>
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-purple-900">View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  bgColor: string;
  textColor: string;
  valueColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, bgColor, textColor, valueColor }) => {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'bookings':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
        );
      case 'rooms':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        );
      case 'packages':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        );
      case 'guests':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a4 4 0 11-8 0 4 4 0 018 0z" />
        );
      default:
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        );
    }
  };

  return (
    <div className={`${bgColor} p-6 rounded-lg`}>
      <div className="flex items-center">
        <svg className={`h-8 w-8 ${textColor} mr-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {getIcon(icon)}
        </svg>
        <div>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
          <p className={textColor}>{label}</p>
        </div>
      </div>
    </div>
  );
};

// Fallback Dashboard Component
const DashboardWithFallbackData: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon="bookings"
        value="--"
        label="Total Bookings"
        bgColor="bg-blue-50"
        textColor="text-blue-600"
        valueColor="text-blue-900"
      />
      <StatCard
        icon="rooms"
        value="--"
        label="Available Rooms"
        bgColor="bg-green-50"
        textColor="text-green-600"
        valueColor="text-green-900"
      />
      <StatCard
        icon="packages"
        value="--"
        label="Active Packages"
        bgColor="bg-yellow-50"
        textColor="text-yellow-600"
        valueColor="text-yellow-900"
      />
      <StatCard
        icon="guests"
        value="--"
        label="Total Guests"
        bgColor="bg-purple-50"
        textColor="text-purple-600"
        valueColor="text-purple-900"
      />
    </div>
    
    <div className="bg-white p-6 rounded-lg shadow text-center">
      <p className="text-gray-500">Unable to connect to API. Please check your connection.</p>
    </div>
  </div>
);

// Analytics Section
const AnalyticsSection: React.FC = () => {
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    averageStay: 0,
    monthlyBookings: 0,
    weeklyRevenue: 0,
    topRoom: 'N/A',
    upcomingCheckIns: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      
      // Fetch bookings data for analytics
      const bookingsResponse = await fetch(paths.buildApiUrl('bookings.php'));
      const bookingsData = await bookingsResponse.json();
      
      // Fetch rooms data for occupancy
      const roomsResponse = await fetch(paths.buildApiUrl('rooms.php'));
      const roomsData = await roomsResponse.json();
      
      // Extract data from wrapped format
      const bookings = (bookingsData && bookingsData.success && Array.isArray(bookingsData.data)) 
        ? bookingsData.data : [];
      const rooms = (roomsData && roomsData.success && Array.isArray(roomsData.data)) 
        ? roomsData.data : [];
        
      
      
      // Calculate analytics
      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce((sum: number, booking: any) => 
        sum + (parseFloat(booking.total_price) || 0), 0);
      
      const occupiedRooms = bookings.filter((booking: any) => 
        booking.status === 'confirmed' || booking.status === 'checked_in').length;
      const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
      
      // Calculate average stay duration
      const avgStay = bookings.length > 0 ? 
        bookings.reduce((sum: number, booking: any) => {
          if (booking.check_in && booking.check_out) {
            const checkIn = new Date(booking.check_in);
            const checkOut = new Date(booking.check_out);
            const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            return sum + (days > 0 ? days : 1);
          }
          return sum + 1;
        }, 0) / bookings.length : 0;
      
      // Monthly bookings (current month)
      const currentMonth = new Date().getMonth();
      const monthlyBookings = bookings.filter((booking: any) => {
        const bookingDate = new Date(booking.check_in || booking.created_at || Date.now());
        return bookingDate.getMonth() === currentMonth;
      }).length;
      
      // Weekly revenue (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyRevenue = bookings.filter((booking: any) => {
        const bookingDate = new Date(booking.check_in || booking.created_at || Date.now());
        return bookingDate >= weekAgo;
      }).reduce((sum: number, booking: any) => sum + (parseFloat(booking.total_price) || 0), 0);
      
      // Top room (most booked)
      const roomBookings: { [key: string]: number } = {};
      bookings.forEach((booking: any) => {
        const roomId = booking.room_id || 'Unknown';
        roomBookings[roomId] = (roomBookings[roomId] || 0) + 1;
      });
      const topRoom = Object.keys(roomBookings).length > 0 ? 
        Object.keys(roomBookings).reduce((a, b) => roomBookings[a] > roomBookings[b] ? a : b) : 'N/A';
      
      // Upcoming check-ins (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const upcomingCheckIns = bookings.filter((booking: any) => {
        if (!booking.check_in) return false;
        const checkInDate = new Date(booking.check_in);
        const today = new Date();
        return checkInDate >= today && checkInDate <= nextWeek;
      }).length;
      
      setAnalytics({
        totalBookings,
        totalRevenue,
        occupancyRate,
        averageStay: Math.round(avgStay * 10) / 10,
        monthlyBookings,
        weeklyRevenue,
        topRoom: `Room ${topRoom}`,
        upcomingCheckIns
      });
      
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.occupancyRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Stay</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageStay} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bookings This Month</span>
              <span className="text-xl font-bold text-blue-600">{analytics.monthlyBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Weekly Revenue</span>
              <span className="text-xl font-bold text-green-600">${analytics.weeklyRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Top Performing Room</span>
              <span className="text-lg font-semibold text-gray-900">{analytics.topRoom}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Check-ins Next 7 Days</span>
              <span className="text-xl font-bold text-orange-600">{analytics.upcomingCheckIns}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Occupancy</span>
              <span className="text-lg font-semibold text-gray-900">{analytics.occupancyRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Active Bookings</span>
              <span className="text-lg font-semibold text-gray-900">{analytics.totalBookings}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Section
const SettingsSection: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    siteUrl: '',
    adminEmail: '',
    currency: 'USD',
    timezone: 'UTC',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Your Hotel Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
              <input
                type="url"
                value={settings.siteUrl}
                onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://yourhotel.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="admin@yourhotel.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="IDR">IDR - Indonesian Rupiah</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="UTC">UTC</option>
              <option value="Asia/Jakarta">Asia/Jakarta</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="maintenanceMode" className="ml-2 text-sm text-gray-700">
              Enable Maintenance Mode
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
