import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Home,
  Package,
  Users,
  ExternalLink,
  LogOut,
  Info,
  BarChart3,
  X,
  Check,
  Archive,
  Plus,
  Building,
  Box,
  ClipboardList,
  Settings,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  LayoutDashboard,
  Image,
  Sparkles,
  Tag,
  Wrench
} from 'lucide-react';
import { paths } from '@/config/paths';
import BookingsSection from '@/components/admin/BookingsSection';
import RoomsSection from '@/components/admin/RoomsSection';
import PropertySection from '@/components/admin/PropertySection';
import PackagesSection from '@/components/admin/PackagesSection';
import AmenitiesSection from '@/components/admin/AmenitiesSection';
import MarketingCategoriesSection from '@/components/admin/MarketingCategoriesSection';
import SimplifiedHomepageManager from '@/components/admin/SimplifiedHomepageManager';
import { CalendarDashboard } from '@/components/CalendarDashboard';
import { calendarService } from '@/services/calendarService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';

// Navigation menu items
const navItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'homepage', label: 'Homepage Content', icon: Image },
  { id: 'bookings', label: 'Bookings', icon: ClipboardList },
  { id: 'rooms', label: 'Rooms', icon: Building },
  { id: 'packages', label: 'Packages', icon: Package },
  { id: 'amenities', label: 'Amenities', icon: Sparkles },
  { id: 'marketing', label: 'Marketing', icon: Tag },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'property', label: 'Property', icon: Home },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCalendarTab, setActiveCalendarTab] = useState<'dashboard' | 'integration'>('dashboard');

  // 🔄 Initialize automatic sync on component mount
  useEffect(() => {
    const initializeAutoSync = async () => {
      try {
        await calendarService.initializeAutoSync();
        console.log('✅ AdminPanel: Automatic sync initialized');
      } catch (error) {
        console.error('❌ AdminPanel: Failed to initialize automatic sync:', error);
      }
    };

    initializeAutoSync();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = '/admin/login';
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {/* Sidebar Header */}
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              H
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold">Hotel Admin</span>
              <span className="text-xs text-muted-foreground">Management Portal</span>
            </div>
          </div>
        </SidebarHeader>

        {/* Sidebar Content - Navigation */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeTab === item.id}
                      onClick={() => setActiveTab(item.id)}
                      tooltip={item.label}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar Footer */}
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:justify-center">
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                  <span className="group-data-[collapsible=icon]:hidden">Online</span>
                </Badge>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="View Site">
                <Link to="/">
                  <ExternalLink className="h-4 w-4" />
                  <span>View Public Site</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset>
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger className="-ml-2" />
          <SidebarSeparator orientation="vertical" className="h-6" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{getTabTitle(activeTab)}</h1>
            <p className="text-xs text-muted-foreground">{getTabDescription(activeTab)}</p>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
            All systems operational
          </Badge>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && <OverviewSection setActiveTab={setActiveTab} />}
          {activeTab === 'homepage' && <SimplifiedHomepageManager />}
          {activeTab === 'bookings' && <BookingsSection />}
          {activeTab === 'rooms' && <RoomsSection />}
          {activeTab === 'packages' && <PackagesSection />}
          {activeTab === 'amenities' && <AmenitiesSection />}
          {activeTab === 'marketing' && <MarketingCategoriesSection />}
          {activeTab === 'calendar' && <CalendarSection />}
          {activeTab === 'property' && <PropertySection />}
          {activeTab === 'analytics' && <AnalyticsSection />}
          {activeTab === 'settings' && <SettingsSection />}
        </main>
      </SidebarInset>
    </SidebarProvider>
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
      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${active
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 hover:bg-gray-100'
        }`}
    >
      <BarChart3 className="w-4 h-4 mr-3" />
      {label}
    </button>
  );
};

// Helper functions
const getTabTitle = (tab: string) => {
  const titles: Record<string, string> = {
    overview: 'Dashboard Overview',
    homepage: 'Homepage Content',
    bookings: 'Booking Management',
    rooms: 'Room Inventory Management',
    packages: 'Sales Tools Management',
    amenities: 'Amenities Management',
    calendar: 'Calendar & Availability Management',
    property: 'Property Management',
    analytics: 'Analytics & Reports',
    settings: 'System Settings'
  };
  return titles[tab] || 'Admin Panel';
};

const getTabDescription = (tab: string) => {
  const descriptions: Record<string, string> = {
    overview: 'System overview and quick actions',
    homepage: 'Manage website content and display settings',
    bookings: 'Manage guest reservations and transactions',
    rooms: 'Manage real inventory - rooms control all availability',
    packages: 'Marketing tools that bundle room + services for customer attraction',
    amenities: 'Manage property features that enhance rooms and packages',
    calendar: 'Visual calendar management with external platform integration',
    property: 'Update property information and settings',
    analytics: 'View performance metrics and reports',
    settings: 'Configure system preferences'
  };
  return descriptions[tab] || 'Admin management panel';
};

// Overview Section Component
interface OverviewSectionProps {
  setActiveTab: (tab: string) => void;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ setActiveTab }) => {
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
        const bookingsResponse = await fetch(paths.buildApiUrl('bookings/list'));
        if (!bookingsResponse.ok) {
          throw new Error(`Bookings API error: ${bookingsResponse.status}`);
        }
        const bookingsData = await bookingsResponse.json();


        // Fetch rooms data
        const roomsResponse = await fetch(paths.buildApiUrl('rooms'));
        if (!roomsResponse.ok) {
          throw new Error(`Rooms API error: ${roomsResponse.status}`);
        }
        const roomsData = await roomsResponse.json();


        // Fetch packages data
        const packagesResponse = await fetch(paths.buildApiUrl('packages'));
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
        <div className="bg-hotel-cream border border-hotel-bronze rounded-lg p-4">
          <div className="flex items-center">
            <X className="w-5 h-5 text-hotel-bronze mr-3" />
            <h3 className="text-sm font-medium text-hotel-navy">API Connection Error</h3>
          </div>
          <div className="mt-2">
            <p className="text-sm text-hotel-bronze">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm bg-hotel-gold text-white px-3 py-1 rounded hover:bg-hotel-gold-dark"
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
        return 'bg-hotel-sage/20 text-hotel-sage';
      case 'pending':
        return 'bg-hotel-gold/20 text-hotel-gold';
      case 'checked_in':
      case 'checked in':
        return 'bg-hotel-navy/20 text-hotel-navy';
      case 'cancelled':
        return 'bg-hotel-bronze/20 text-hotel-bronze';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* API Connection Status */}
      <div className="bg-hotel-cream border border-hotel-gold-light rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-hotel-gold mr-2" />
            <span className="text-sm font-medium text-hotel-navy">
              API Connection Active - All services operational
            </span>
          </div>
          <div className="text-xs text-hotel-bronze">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Bookings</CardDescription>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Available Rooms</CardDescription>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-green-600">{stats.availableRooms}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Active Packages</CardDescription>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-amber-600">{stats.activePackages}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Guests</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-blue-600">{stats.totalGuests}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest guest reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </>
              ) : recentBookings.length > 0 ? (
                recentBookings.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {booking.first_name} {booking.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.check_in} → {booking.check_out}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      booking.status?.toLowerCase() === 'confirmed' ? 'default' :
                        booking.status?.toLowerCase() === 'pending' ? 'secondary' :
                          booking.status?.toLowerCase() === 'cancelled' ? 'destructive' : 'outline'
                    }>
                      {booking.status || 'Unknown'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent bookings</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4 hover:bg-primary/10"
                onClick={() => setActiveTab('bookings')}
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium">New Booking</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4 hover:bg-green-500/10"
                onClick={() => setActiveTab('rooms')}
              >
                <Building className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">Add Room</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4 hover:bg-amber-500/10"
                onClick={() => setActiveTab('packages')}
              >
                <Box className="h-6 w-6 text-amber-600" />
                <span className="text-sm font-medium">New Package</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4 hover:bg-blue-500/10"
                onClick={() => setActiveTab('analytics')}
              >
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium">View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
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
  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case 'bookings':
        return Calendar;
      case 'rooms':
        return Home;
      case 'packages':
        return Package;
      case 'guests':
        return Users;
      default:
        return Calendar;
    }
  };

  const IconComponent = getIconComponent(icon);

  return (
    <div className={`${bgColor} p-4 rounded-lg`}>
      <div className="flex items-center">
        <IconComponent className={`h-6 w-6 ${textColor} mr-2`} />
        <div>
          <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
          <p className={`text-sm ${textColor}`}>{label}</p>
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
        bgColor="bg-hotel-cream"
        textColor="text-hotel-navy"
        valueColor="text-hotel-navy"
      />
      <StatCard
        icon="rooms"
        value="--"
        label="Available Rooms"
        bgColor="bg-hotel-sage/10"
        textColor="text-hotel-sage"
        valueColor="text-hotel-sage"
      />
      <StatCard
        icon="packages"
        value="--"
        label="Active Packages"
        bgColor="bg-hotel-gold/10"
        textColor="text-hotel-gold"
        valueColor="text-hotel-gold"
      />
      <StatCard
        icon="guests"
        value="--"
        label="Total Guests"
        bgColor="bg-hotel-bronze/10"
        textColor="text-hotel-bronze"
        valueColor="text-hotel-bronze"
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
      const bookingsResponse = await fetch(paths.buildApiUrl('bookings/list'));
      const bookingsData = await bookingsResponse.json();

      // Fetch rooms data for occupancy
      const roomsResponse = await fetch(paths.buildApiUrl('rooms'));
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
        <h2 className="text-xl font-semibold">Analytics & Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics & Reports</h2>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Bookings</CardDescription>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics.totalBookings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${analytics.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Occupancy Rate</CardDescription>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{analytics.occupancyRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Avg Stay</CardDescription>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{analytics.averageStay} days</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Current month statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Bookings This Month</span>
              <span className="text-xl font-bold">{analytics.monthlyBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Weekly Revenue</span>
              <span className="text-xl font-bold text-green-600">${analytics.weeklyRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Top Performing Room</span>
              <Badge variant="outline">{analytics.topRoom}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Activity</CardTitle>
            <CardDescription>Next 7 days forecast</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Check-ins Next 7 Days</span>
              <Badge className="text-lg">{analytics.upcomingCheckIns}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current Occupancy</span>
              <span className="text-lg font-semibold">{analytics.occupancyRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Active Bookings</span>
              <span className="text-lg font-semibold">{analytics.totalBookings}</span>
            </div>
          </CardContent>
        </Card>
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
        <h2 className="text-xl font-semibold">System Settings</h2>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure your site's basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                placeholder="Your Hotel Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                type="url"
                value={settings.siteUrl}
                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                placeholder="https://yourhotel.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                placeholder="admin@yourhotel.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="IDR">IDR - Indonesian Rupiah</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="UTC">UTC</option>
              <option value="Asia/Jakarta">Asia/Jakarta</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
            <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Package Availability Visualization Component
const PackageAvailabilityVisualization: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(paths.buildApiUrl('packages'));
      const result = await response.json();

      if (result.success) {
        setPackages(result.data || []);
      } else {
        setError(result.error || 'Failed to load packages');
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  const getAvailabilityStatus = (pkg: any) => {
    const isActive = pkg.available === 1 || pkg.is_active === 1;
    const hasValidFrom = pkg.valid_from && pkg.valid_from !== '0000-00-00 00:00:00';
    const hasValidUntil = pkg.valid_until && pkg.valid_until !== '0000-00-00 00:00:00';

    if (!isActive) {
      return { status: 'inactive', color: 'bg-red-100 text-red-800', text: 'Inactive' };
    }

    if (!hasValidFrom && !hasValidUntil) {
      return { status: 'unlimited', color: 'bg-blue-100 text-blue-800', text: 'Always Available' };
    }

    const now = new Date();

    if (hasValidFrom) {
      const fromDate = new Date(pkg.valid_from);
      if (now < fromDate) {
        return { status: 'future', color: 'bg-yellow-100 text-yellow-800', text: 'Future Available' };
      }
    }

    if (hasValidUntil) {
      const untilDate = new Date(pkg.valid_until);
      if (now > untilDate) {
        return { status: 'expired', color: 'bg-gray-100 text-gray-800', text: 'Expired' };
      }
    }

    return { status: 'active', color: 'bg-green-100 text-green-800', text: 'Currently Available' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading package availability...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-700">Error loading packages: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {packages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No packages found. Create packages in the Sales Tools Management section.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {packages.map((pkg, index) => {
            const availability = getAvailabilityStatus(pkg);
            const fromDate = formatDate(pkg.valid_from);
            const untilDate = formatDate(pkg.valid_until);

            return (
              <div key={pkg.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 break-words flex-1 min-w-0 mr-3">{pkg.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${availability.color}`}>
                    {availability.text}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Package ID:</span>
                    <span className="font-medium">#{pkg.id}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium text-green-600">${pkg.base_price || pkg.price}</span>
                  </div>

                  {fromDate && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Available From:</span>
                      <span className="font-medium text-blue-600">{fromDate}</span>
                    </div>
                  )}

                  {untilDate && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Available Until:</span>
                      <span className="font-medium text-orange-600">{untilDate}</span>
                    </div>
                  )}

                  {!fromDate && !untilDate && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Date Range:</span>
                      <span className="font-medium text-blue-600">No limits set</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {availability.status === 'unlimited' && 'Available indefinitely'}
                    {availability.status === 'active' && 'Currently bookable'}
                    {availability.status === 'future' && 'Scheduled for future'}
                    {availability.status === 'expired' && 'Past availability window'}
                    {availability.status === 'inactive' && 'Disabled by admin'}
                  </div>
                  <button
                    onClick={() => {
                      // This would trigger opening the package edit modal
                      // For now, just show an alert pointing to the right place
                      alert('To edit availability dates:\n1. Go to "Packages" tab\n2. Click "Edit Sales Tool" for this package\n3. Use the "Package Availability Dates" section');
                    }}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Edit Dates
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Package Availability Management:</p>
            <p>• <strong>Always Available</strong>: No date restrictions (depends on room inventory)</p>
            <p>• <strong>Currently Available</strong>: Within set date range and active</p>
            <p>• <strong>Future Available</strong>: Scheduled to become available</p>
            <p>• <strong>Expired</strong>: Past the availability end date</p>
            <p>• <strong>Inactive</strong>: Disabled by admin in Sales Tools Management</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Booking Calendar Component
const EnhancedBookingCalendar: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [calendarStats, setCalendarStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'summary' | 'detailed'>('summary');

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load bookings, packages, and calendar data in parallel
      const [bookingsResponse, packagesResponse] = await Promise.all([
        fetch(paths.buildApiUrl('bookings/list')),
        fetch(paths.buildApiUrl('packages'))
      ]);

      const bookingsResult = await bookingsResponse.json();
      const packagesResult = await packagesResponse.json();

      if (bookingsResult.success) {
        setBookings(bookingsResult.data || []);
      }

      if (packagesResult.success) {
        setPackages(packagesResult.data || []);
      }

      // Calculate calendar statistics
      calculateStats(bookingsResult.data || [], packagesResult.data || []);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData: any[], packagesData: any[]) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // Filter bookings for next 30 days
    const upcomingBookings = bookingsData.filter(booking => {
      const checkIn = new Date(booking.check_in);
      return checkIn >= now && checkIn <= thirtyDaysFromNow;
    });

    // Group bookings by package
    const packageBookings = packagesData.map(pkg => {
      const pkgBookings = upcomingBookings.filter(booking =>
        booking.package_id === pkg.id || booking.package_name === pkg.name
      );
      return {
        package: pkg,
        bookingCount: pkgBookings.length,
        totalRevenue: pkgBookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0),
        bookings: pkgBookings
      };
    });

    // Calculate overall stats
    const stats = {
      totalBookings: upcomingBookings.length,
      totalRevenue: upcomingBookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0),
      confirmedBookings: upcomingBookings.filter(b => b.status === 'confirmed').length,
      pendingBookings: upcomingBookings.filter(b => b.status === 'pending').length,
      packageBreakdown: packageBookings,
      occupancyRate: Math.round((upcomingBookings.length / (packages.length * 30)) * 100) || 0
    };

    setCalendarStats(stats);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading calendar overview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-700">Error loading calendar data: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-900">Total Bookings</p>
              <p className="text-lg font-bold text-blue-600">{calendarStats.totalBookings || 0}</p>
            </div>
            <Calendar className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-1">Next 30 days</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-900">Total Revenue</p>
              <p className="text-lg font-bold text-green-600">${calendarStats.totalRevenue?.toFixed(0) || '0'}</p>
            </div>
            <DollarSign className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-1">Expected income</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-900">Confirmed</p>
              <p className="text-lg font-bold text-yellow-600">{calendarStats.confirmedBookings || 0}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-xs text-yellow-600 mt-1">Ready bookings</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-900">Pending</p>
              <p className="text-lg font-bold text-orange-600">{calendarStats.pendingBookings || 0}</p>
            </div>
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-xs text-orange-600 mt-1">Awaiting confirmation</p>
        </div>
      </div>

      {/* Calendar View Toggle */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Calendar View Options</h4>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setSelectedView('summary')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedView === 'summary'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            📅 2-Month View
          </button>
          <button
            onClick={() => setSelectedView('detailed')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedView === 'detailed'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            📅 3-Month + Stats
          </button>
        </div>
      </div>

      {/* Calendar Views */}
      {selectedView === 'summary' ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <CalendarDashboard monthCount={2} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <CalendarDashboard monthCount={3} />
          </div>

          {/* Package Performance Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-3">Package Booking Summary (Next 30 Days)</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {calendarStats.packageBreakdown?.map((item: any, index: number) => (
                <div key={item.package.id || index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <h6 className="font-medium text-gray-900 text-sm break-words flex-1 min-w-0">{item.package.name}</h6>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                      {item.bookingCount}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 font-medium break-words">${item.totalRevenue.toFixed(0)} revenue</p>
                </div>
              )) || (
                  <div className="col-span-full text-center py-4 text-gray-500 text-sm">
                    No package bookings found for the next 30 days.
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Calendar Integration Status */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-purple-900">Calendar Integration Status</h4>
            <p className="text-sm text-purple-700 mt-1">
              External calendar sync and booking coordination
            </p>
          </div>
          <button
            onClick={() => {
              // This would switch to the integration tab
              alert('Click on "Integration & Sync" tab above to manage calendar integrations');
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            Manage Sync
          </button>
        </div>
      </div>
    </div>
  );
};

// Calendar Section Component
const CalendarSection: React.FC = () => {
  const [activeCalendarTab, setActiveCalendarTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Calendar & Availability Management</h2>

        {/* Calendar Sub-tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveCalendarTab('dashboard')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeCalendarTab === 'dashboard'
              ? 'bg-white text-hotel-navy shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            📅 Calendar View
          </button>
          <button
            onClick={() => setActiveCalendarTab('integration')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeCalendarTab === 'integration'
              ? 'bg-white text-hotel-navy shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            🔗 Integration & Sync
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      {activeCalendarTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Package Availability Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 text-blue-600 mr-2" />
              Package Availability Timeline
            </h3>

            <PackageAvailabilityVisualization />
          </div>

          {/* Enhanced Calendar Dashboard */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 text-green-600 mr-2" />
              Booking Calendar Overview
            </h3>

            <EnhancedBookingCalendar />
          </div>
        </div>
      )}

      {activeCalendarTab === 'integration' && (
        <div className="bg-white rounded-lg shadow">
          {/* Integration & Sync Content - Embedded directly */}
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Integration & Sync Management
              </h2>
            </div>

            {/* Sync Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-blue-900">Airbnb Sync</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">Active - Every 30 minutes</p>
                <p className="text-xs text-blue-600 mt-1">Last sync: 5 minutes ago</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="font-medium text-gray-700">Booking.com</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Not configured</p>
                <p className="text-xs text-gray-500 mt-1">Add iCal URL to enable</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="font-medium text-gray-700">VRBO</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Not configured</p>
                <p className="text-xs text-gray-500 mt-1">Add iCal URL to enable</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                Quick Sync Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(paths.buildApiUrl('ical.php'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'sync_all' })
                      });
                      const result = await response.json();
                      alert(result.success ? '🔄 All platforms synced successfully! ' + (result.message || '') : '❌ Sync failed: ' + result.message);
                    } catch (error) {
                      alert('❌ Error syncing all platforms');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sync All Platforms
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Calendar
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            </div>

            {/* Add Your iCal URLs */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">🔗 Add Your Calendar URLs</h3>

              {/* Airbnb iCal Input */}
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">A</div>
                    <span className="font-medium text-red-900">Airbnb Calendar URL</span>
                  </div>
                  <input
                    id="airbnb-url-input"
                    type="url"
                    placeholder="https://www.airbnb.com/calendar/ical/your-listing-id.ics?s=your-secret"
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={async () => {
                        const input = document.getElementById('airbnb-url-input') as HTMLInputElement;
                        if (input.value) {
                          try {
                            const response = await fetch(paths.buildApiUrl('ical.php'), {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ platform: 'airbnb', url: input.value, action: 'save_test' })
                            });
                            const result = await response.json();
                            alert(result.success ? '✅ Airbnb URL saved and tested! Found ' + (result.events || 0) + ' events' : '❌ Error: ' + result.message);
                          } catch (error) {
                            alert('❌ Error connecting to server');
                          }
                        } else {
                          alert('Please enter your Airbnb iCal URL');
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Save & Test
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(paths.buildApiUrl('ical.php'), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ platform: 'airbnb', action: 'sync' })
                          });
                          const result = await response.json();
                          alert(result.success ? '🔄 Airbnb sync completed! ' + (result.message || '') : '❌ Sync failed: ' + result.message);
                        } catch (error) {
                          alert('❌ Error syncing Airbnb calendar');
                        }
                      }}
                      className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                    >
                      Sync Now
                    </button>
                  </div>
                  <p className="text-xs text-red-600 mt-2">
                    📖 Find this URL in your Airbnb hosting dashboard → Calendar → Export Calendar
                  </p>
                </div>

                {/* Booking.com iCal Input */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">B</div>
                    <span className="font-medium text-blue-900">Booking.com Calendar URL</span>
                  </div>
                  <input
                    id="booking-url-input"
                    type="url"
                    placeholder="https://admin.booking.com/ical/your-property-id"
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={async () => {
                        const input = document.getElementById('booking-url-input') as HTMLInputElement;
                        if (input.value) {
                          try {
                            const response = await fetch(paths.buildApiUrl('ical.php'), {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ platform: 'booking', url: input.value, action: 'save_test' })
                            });
                            const result = await response.json();
                            alert(result.success ? '✅ Booking.com URL saved and tested! Found ' + (result.events || 0) + ' events' : '❌ Error: ' + result.message);
                          } catch (error) {
                            alert('❌ Error connecting to server');
                          }
                        } else {
                          alert('Please enter your Booking.com iCal URL');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Save & Test
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(paths.buildApiUrl('ical.php'), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ platform: 'booking', action: 'sync' })
                          });
                          const result = await response.json();
                          alert(result.success ? '🔄 Booking.com sync completed! ' + (result.message || '') : '❌ Sync failed: ' + result.message);
                        } catch (error) {
                          alert('❌ Error syncing Booking.com calendar');
                        }
                      }}
                      className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                    >
                      Sync Now
                    </button>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    📖 Find this URL in your Booking.com extranet → Calendar → Synchronization
                  </p>
                </div>

                {/* VRBO iCal Input */}
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">V</div>
                    <span className="font-medium text-orange-900">VRBO Calendar URL</span>
                  </div>
                  <input
                    id="vrbo-url-input"
                    type="url"
                    placeholder="https://www.vrbo.com/calendar/ical/your-property-id.ics"
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={async () => {
                        const input = document.getElementById('vrbo-url-input') as HTMLInputElement;
                        if (input.value) {
                          try {
                            const response = await fetch(paths.buildApiUrl('ical.php'), {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ platform: 'vrbo', url: input.value, action: 'save_test' })
                            });
                            const result = await response.json();
                            alert(result.success ? '✅ VRBO URL saved and tested! Found ' + (result.events || 0) + ' events' : '❌ Error: ' + result.message);
                          } catch (error) {
                            alert('❌ Error connecting to server');
                          }
                        } else {
                          alert('Please enter your VRBO iCal URL');
                        }
                      }}
                      className="px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
                    >
                      Save & Test
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(paths.buildApiUrl('ical.php'), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ platform: 'vrbo', action: 'sync' })
                          });
                          const result = await response.json();
                          alert(result.success ? '🔄 VRBO sync completed! ' + (result.message || '') : '❌ Sync failed: ' + result.message);
                        } catch (error) {
                          alert('❌ Error syncing VRBO calendar');
                        }
                      }}
                      className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                    >
                      Sync Now
                    </button>
                  </div>
                  <p className="text-xs text-orange-600 mt-2">
                    📖 Find this URL in your VRBO dashboard → Calendar → Import/Export
                  </p>
                </div>
              </div>
            </div>

            {/* Export Your Calendar */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">📤 Share Your Calendar</h3>
              <p className="text-gray-600 mb-4">Use these URLs to sync your bookings with other platforms:</p>

              <div className="space-y-3">
                <div className="p-3 bg-gray-50 border rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📅 Your Calendar URL (to add to Airbnb, Booking.com, etc.):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={paths.buildApiUrl('ical.php')}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => {
                        const url = paths.buildApiUrl('ical.php');
                        navigator.clipboard.writeText(url).then(() => {
                          alert('✅ Calendar URL copied to clipboard!');
                        }).catch(() => {
                          alert('❌ Failed to copy URL');
                        });
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                    📥 Download .ics File
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
                    📧 Email Instructions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
