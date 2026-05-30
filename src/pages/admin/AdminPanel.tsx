import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
  Wrench,
  Code2
} from 'lucide-react';
import { paths } from '@/config/paths';
import { getAuthToken } from '@/config/cloudflare';
import BookingsSection from '@/components/admin/BookingsSection';
import RoomsSection from '@/components/admin/RoomsSection';
import PropertySection from '@/components/admin/PropertySection';
import PackagesSection from '@/components/admin/PackagesSection';
import AmenitiesSection from '@/components/admin/AmenitiesSection';
import MarketingCategoriesSection from '@/components/admin/MarketingCategoriesSection';
import SimplifiedHomepageManager from '@/components/admin/SimplifiedHomepageManager';
import HomepageContentManager from '@/components/admin/HomepageContentManager';
import InclusionsSection from '@/components/admin/InclusionsSection';
import GTMSettingsSection from '@/components/admin/GTMSettingsSection';
import ICalSyncManager from '@/components/admin/ICalSyncManager';
import ImagesLibrarySection from '@/components/admin/ImagesLibrarySection';
import SchemaLibrarySection from '@/components/admin/SchemaLibrarySection';
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

import { useVillaInfo } from '@/hooks/useVillaInfo';
import { Toaster } from '@/components/ui/sonner';
import { BedDouble, CalendarCheck, Bot } from 'lucide-react';

// Navigation groups — Samudra 5-IA sidebar
const navGroups = [
  {
    label: 'Operations',
    items: [
      { id: 'overview',  label: 'Dashboard', icon: LayoutDashboard },
      { id: 'bookings',  label: 'Bookings',  icon: CalendarCheck },
      { id: 'calendar',  label: 'Calendar',  icon: Calendar },
    ],
  },
  {
    label: 'Library',
    items: [
      { id: 'images-library',    label: 'Images',     icon: Image },
      { id: 'amenities-library', label: 'Amenities',  icon: Sparkles },
      { id: 'inclusions',        label: 'Inclusions', icon: Check },
      { id: 'schema-library',    label: 'Schema',     icon: Code2 },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { id: 'rooms',    label: 'Rooms',    icon: BedDouble },
      { id: 'packages', label: 'Packages', icon: Package },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'homepage',  label: 'Villa Page',          icon: Home },
      { id: 'property',  label: 'Property',            icon: Building },
      { id: 'marketing', label: 'Package Categories',  icon: Tag },
    ],
  },
  {
    label: 'Insights',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'gtm',      label: 'GTM',      icon: Tag },
      { id: 'ai-admin', label: 'AI Concierge', icon: Bot, external: 'https://ai-admin-samudra.pages.dev/pembantu/login' },
    ],
  },
];

const AdminPanel: React.FC = () => {
  // URL ?tab= deep-link sync (Sprint 1 P2-11)
  const getInitialTab = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tab');
      const validTabs = ['overview','bookings','calendar','rooms','packages','amenities','amenities-library','inclusions','images-library','schema-library','homepage','property','marketing','analytics','settings','gtm'];
      return t && validTabs.includes(t) ? t : 'overview';
    } catch { return 'overview'; }
  };
  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    try {
      const url = new URL(window.location.href);
      if (tab === 'overview') { url.searchParams.delete('tab'); } else { url.searchParams.set('tab', tab); }
      window.history.replaceState(null, '', url.toString());
    } catch {}
  };
  const [activeCalendarTab, setActiveCalendarTab] = useState<'dashboard' | 'integration'>('dashboard');
  const { villaInfo, refetch: refetchVillaInfo } = useVillaInfo();

  // Initialize automatic sync on component mount
  useEffect(() => {
    const initializeAutoSync = async () => {
      try {
        await calendarService.initializeAutoSync();
        console.log('AdminPanel: Automatic sync initialized');
      } catch (error) {
        console.error('AdminPanel: Failed to initialize automatic sync:', error);
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
      {/* Sonner toast mount — outside sidebar layout, position top-right */}
      <Toaster />
      <Sidebar collapsible="icon">
        {/* Sidebar Header — Samudra brand block */}
        <SidebarHeader className="border-b border-sidebar-border px-6 py-5">
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-script text-samudra-gold text-[18px] leading-none">samudra</p>
            <p className="font-display text-samudra-ink tracking-[0.42em] uppercase text-[11px] mt-1">Admin</p>
          </div>
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
            <span className="font-script text-samudra-gold text-[18px]">s</span>
          </div>
        </SidebarHeader>

        {/* Sidebar Content - Navigation Groups */}
        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="eyebrow px-6 py-3">{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      {item.external ? (
                        <SidebarMenuButton asChild tooltip={item.label}>
                          <a href={item.external} target="_blank" rel="noopener noreferrer">
                            <item.icon className="h-4 w-4 text-samudra-ink-mute" />
                            <span>{item.label}</span>
                            <ExternalLink className="h-3 w-3 ml-auto text-samudra-ink-mute" />
                          </a>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          isActive={activeTab === item.id}
                          onClick={() => setActiveTab(item.id)}
                          tooltip={item.label}
                          className={activeTab === item.id ? 'border-l-2 border-samudra-teal bg-samudra-paper-soft text-samudra-ink' : ''}
                        >
                          <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-samudra-teal' : 'text-samudra-ink-mute'}`} />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {/* Sidebar Footer */}
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:justify-center">
                <span className="flex items-center gap-1.5 eyebrow text-samudra-teal group-data-[collapsible=icon]:justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-samudra-teal flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">online</span>
                </span>
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
          <span className="flex items-center gap-1.5 eyebrow text-samudra-teal">
            <span className="w-1.5 h-1.5 rounded-full bg-samudra-teal" />
            <span>online</span>
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && <OverviewSection setActiveTab={setActiveTab} />}
          {activeTab === 'homepage' && <HomepageContentManager />}
          {activeTab === 'bookings' && <BookingsSection />}
          {activeTab === 'rooms' && <RoomsSection />}
          {activeTab === 'packages' && <PackagesSection />}
          {activeTab === 'amenities' && <AmenitiesSection />}
          {activeTab === 'amenities-library' && <AmenitiesSection />}
          {activeTab === 'inclusions' && <InclusionsSection />}
          {activeTab === 'marketing' && <MarketingCategoriesSection />}
          {activeTab === 'images-library' && <ImagesLibrarySection />}
          {activeTab === 'schema-library' && <SchemaLibrarySection />}
          {activeTab === 'calendar' && <CalendarSection />}
          {activeTab === 'property' && <PropertySection />}
          {activeTab === 'analytics' && <AnalyticsSection />}
          {activeTab === 'settings' && <SettingsSection onSave={refetchVillaInfo} />}
          {activeTab === 'gtm' && <GTMSettingsSection />}
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
    homepage: 'Villa Page Content',
    bookings: 'Booking Management',
    rooms: 'Room Inventory Management',
    packages: 'Sales Tools Management',
    amenities: 'Amenities Management',
    'amenities-library': 'Amenities Library',
    inclusions: 'Inclusions Library',
    'images-library': 'Images Library',
    'schema-library': 'Schema Settings',
    calendar: 'Calendar & Availability Management',
    property: 'Property Management',
    analytics: 'Analytics & Reports',
    settings: 'System Settings',
    gtm: 'GTM Settings'
  };
  return titles[tab] || 'Admin Panel';
};

const getTabDescription = (tab: string) => {
  const descriptions: Record<string, string> = {
    overview: 'System overview and quick actions',
    homepage: 'Edit hero copy, villa info, policies, and social links',
    bookings: 'Manage guest reservations and transactions',
    rooms: 'Manage real inventory - rooms control all availability',
    packages: 'Marketing tools that bundle room + services for customer attraction',
    amenities: 'Manage property features that enhance rooms and packages',
    'amenities-library': 'Manage property features that enhance rooms and packages',
    inclusions: 'Manage package inclusions and benefits for customers',
    'images-library': 'Browse, upload and manage all stored images',
    'schema-library': 'Edit schema.org JSON-LD fields — override per route or site-wide',
    calendar: 'Visual calendar management with external platform integration',
    property: 'Update property information and settings',
    analytics: 'View performance metrics and reports',
    settings: 'Configure system preferences',
    gtm: 'Manage Google Tag Manager containers'
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

        const token = getAuthToken();
        const authHeaders: Record<string, string> = token
          ? { 'Authorization': `Bearer ${token}` }
          : {};

        // Fetch bookings data (requires auth)
        const bookingsResponse = await fetch(paths.buildApiUrl('bookings/list'), {
          headers: authHeaders,
        });
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
        <div className="bg-samudra-paper-soft border border-samudra-paper-deep p-4 card-accent-teal">
          <div className="flex items-center">
            <X className="w-5 h-5 text-samudra-ink-mute mr-3" />
            <h3 className="font-display text-[18px] font-normal text-samudra-ink">API Connection Error</h3>
          </div>
          <div className="mt-2">
            <p className="text-[13px] text-samudra-ink-mute">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 eyebrow text-samudra-paper bg-samudra-ink px-3 py-2 hover:bg-samudra-teal transition-colors"
            >
              Retry
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
        return 'bg-samudra-teal/20 text-samudra-teal';
      case 'pending':
        return 'bg-samudra-gold/20 text-samudra-gold';
      case 'checked_in':
      case 'checked in':
        return 'bg-samudra-ink/20 text-samudra-ink';
      case 'cancelled':
        return 'bg-samudra-ink-mute/20 text-samudra-ink-mute';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':   return 'border border-samudra-teal text-samudra-teal bg-transparent';
      case 'pending':     return 'border border-samudra-gold text-samudra-gold bg-transparent';
      case 'cancelled':   return 'border border-[#7a3d31] text-[#7a3d31] bg-transparent';
      case 'checked_in':  return 'border border-samudra-sand text-samudra-sand bg-transparent';
      default:            return 'border border-samudra-paper-deep text-samudra-ink-mute bg-transparent';
    }
  };

  return (
    <div className="space-y-8">
      {/* Samudra page header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-script text-samudra-gold text-[28px] leading-none mb-2">the state of samudra today</p>
          <h2 className="font-display text-[40px] font-light text-samudra-ink">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <div className="h-px w-[60px] bg-samudra-ink mt-3" style={{ opacity: 0.4 }} />
        </div>
        {/* API connection status — inline, subtle */}
        <div className="flex items-center gap-2 eyebrow text-samudra-teal">
          <span className="w-1.5 h-1.5 rounded-full bg-samudra-teal inline-block" />
          connected
        </div>
      </div>

      {/* KPI Cards — ink-on-paper, Samudra grammar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Calendar,  label: 'Total Bookings',  value: stats.totalBookings,  sub: 'all time' },
          { icon: Home,      label: 'Available Rooms',  value: stats.availableRooms, sub: 'right now' },
          { icon: Package,   label: 'Active Packages',  value: stats.activePackages, sub: 'on sale' },
          { icon: Users,     label: 'Total Guests',     value: stats.totalGuests,    sub: 'in records' },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="bg-samudra-paper border border-samudra-paper-deep p-5 card-accent-teal">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow text-samudra-ink-mute mb-3">{label}</p>
                {loading ? (
                  <div className="h-9 w-16 bg-samudra-paper-soft animate-pulse" />
                ) : (
                  <p className="font-display text-[36px] font-light text-samudra-ink leading-none is-numeric">{value}</p>
                )}
                <p className="font-script text-samudra-gold text-[15px] mt-2">{sub}</p>
              </div>
              <Icon className="h-5 w-5 text-samudra-ink-mute opacity-50 mt-0.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row: Recent Reservations + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reservations */}
        <div className="bg-samudra-paper border border-samudra-paper-deep">
          <div className="px-6 pt-5 pb-3 border-b border-samudra-paper-deep">
            <p className="eyebrow text-samudra-ink-mute">Latest</p>
            <h3 className="font-display text-[22px] font-light text-samudra-ink">Recent Reservations</h3>
          </div>
          <div className="divide-y divide-samudra-paper-deep">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-3/4 bg-samudra-paper-soft animate-pulse" />
                    <div className="h-3 w-1/2 bg-samudra-paper-soft animate-pulse" />
                  </div>
                  <div className="h-5 w-20 bg-samudra-paper-soft animate-pulse" />
                </div>
              ))
            ) : recentBookings.length > 0 ? (
              recentBookings.map((booking, index) => (
                <div key={index} className="flex items-center justify-between px-6 py-4 hover:bg-samudra-paper-soft transition-colors">
                  <div>
                    <p className="font-display text-[16px] font-light text-samudra-ink">
                      {booking.first_name} {booking.last_name}
                    </p>
                    <p className="eyebrow text-samudra-ink-mute mt-0.5">
                      {booking.check_in} — {booking.check_out}
                    </p>
                  </div>
                  <span className={`eyebrow text-[10px] px-2 py-1 ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status || 'Unknown'}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="font-script text-samudra-gold text-[22px] leading-none mb-2">no reservations yet</p>
                <p className="text-[13px] text-samudra-ink-mute">Bookings will appear here as they come in.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions — Samudra outline shelves */}
        <div className="bg-samudra-paper border border-samudra-paper-deep">
          <div className="px-6 pt-5 pb-3 border-b border-samudra-paper-deep">
            <p className="eyebrow text-samudra-ink-mute">Shortcuts</p>
            <h3 className="font-display text-[22px] font-light text-samudra-ink">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-3">
            {[
              { icon: Plus,     label: 'New Reservation', tab: 'bookings' },
              { icon: Building, label: 'Add Room',         tab: 'rooms' },
              { icon: Box,      label: 'New Package',      tab: 'packages' },
              { icon: BarChart3,label: 'View Analytics',   tab: 'analytics' },
            ].map(({ icon: Icon, label, tab }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="w-full flex items-center gap-3 px-4 py-3 border border-samudra-ink text-samudra-ink hover:bg-samudra-ink hover:text-samudra-paper transition-colors group"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                <Icon className="h-4 w-4 text-samudra-ink-mute group-hover:text-samudra-paper transition-colors" />
                <span className="eyebrow">{label}</span>
              </button>
            ))}
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
    <div className={`${bgColor} p-4 border border-samudra-paper-deep`}>
      <div className="flex items-center">
        <IconComponent className={`h-6 w-6 ${textColor} mr-2`} />
        <div>
          <p className={`font-display text-xl font-normal ${valueColor}`}>{value}</p>
          <p className={`eyebrow ${textColor}`}>{label}</p>
        </div>
      </div>
    </div>
  );
};

// Fallback Dashboard Component
const DashboardWithFallbackData: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard icon="bookings" value="--" label="Total Bookings"  bgColor="bg-samudra-paper-soft" textColor="text-samudra-ink-mute" valueColor="text-samudra-ink" />
      <StatCard icon="rooms"    value="--" label="Available Rooms" bgColor="bg-samudra-paper-soft" textColor="text-samudra-ink-mute" valueColor="text-samudra-teal" />
      <StatCard icon="packages" value="--" label="Active Packages" bgColor="bg-samudra-paper-soft" textColor="text-samudra-ink-mute" valueColor="text-samudra-gold" />
      <StatCard icon="guests"   value="--" label="Total Guests"    bgColor="bg-samudra-paper-soft" textColor="text-samudra-ink-mute" valueColor="text-samudra-ink-soft" />
    </div>
    <div className="bg-samudra-paper border border-samudra-paper-deep p-6 text-center">
      <p className="text-[13px] text-samudra-ink-mute">Unable to connect to API. Please check your connection.</p>
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


      // Fetch bookings data for analytics (requires auth)
      const analyticsToken = getAuthToken();
      const analyticsAuthHeaders: Record<string, string> = analyticsToken
        ? { 'Authorization': `Bearer ${analyticsToken}` }
        : {};
      const bookingsResponse = await fetch(paths.buildApiUrl('bookings/list'), {
        headers: analyticsAuthHeaders,
      });
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
      console.error('Error fetching analytics:', error);
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
      <div className="mb-8">
        <p className="font-script text-samudra-gold text-[28px] leading-none mb-2">the numbers will speak</p>
        <h2 className="font-display text-[40px] font-light text-samudra-ink">Analytics</h2>
        <div className="h-px w-[60px] bg-samudra-ink mt-3" style={{ opacity: 0.4 }} />
      </div>

      {/* Key Metrics Cards — Samudra ink-on-paper */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: ClipboardList, label: 'Total Bookings',  value: analytics.totalBookings.toString(),                          sub: 'all time' },
          { icon: DollarSign,   label: 'Total Revenue',    value: `Rp ${analytics.totalRevenue.toLocaleString('id-ID')}`,      sub: 'cumulative' },
          { icon: Building,     label: 'Occupancy Rate',   value: `${analytics.occupancyRate}%`,                               sub: 'of capacity' },
          { icon: Clock,        label: 'Avg Stay',         value: `${analytics.averageStay}d`,                                 sub: 'per booking' },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="bg-samudra-paper border border-samudra-paper-deep p-5 card-accent-teal">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow text-samudra-ink-mute mb-3">{label}</p>
                <p className="font-display text-[30px] font-light text-samudra-ink leading-none is-numeric">{value}</p>
                <p className="font-script text-samudra-gold text-[15px] mt-2">{sub}</p>
              </div>
              <Icon className="h-5 w-5 text-samudra-ink-mute opacity-50 mt-0.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-samudra-paper border border-samudra-paper-deep">
          <div className="px-6 pt-5 pb-3 border-b border-samudra-paper-deep">
            <p className="eyebrow text-samudra-ink-mute">This month</p>
            <h3 className="font-display text-[20px] font-light text-samudra-ink">Monthly Performance</h3>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="eyebrow text-samudra-ink-mute">Bookings This Month</span>
              <span className="font-display text-[20px] text-samudra-ink is-numeric">{analytics.monthlyBookings}</span>
            </div>
            <div className="h-px bg-samudra-paper-deep" />
            <div className="flex justify-between items-center">
              <span className="eyebrow text-samudra-ink-mute">Weekly Revenue</span>
              <span className="font-display text-[16px] text-samudra-ink is-numeric">Rp {analytics.weeklyRevenue.toLocaleString('id-ID')}</span>
            </div>
            <div className="h-px bg-samudra-paper-deep" />
            <div className="flex justify-between items-center">
              <span className="eyebrow text-samudra-ink-mute">Top Room</span>
              <span className="eyebrow border border-samudra-paper-deep text-samudra-ink px-2 py-1">{analytics.topRoom}</span>
            </div>
          </div>
        </div>

        <div className="bg-samudra-paper border border-samudra-paper-deep">
          <div className="px-6 pt-5 pb-3 border-b border-samudra-paper-deep">
            <p className="eyebrow text-samudra-ink-mute">Next 7 days</p>
            <h3 className="font-display text-[20px] font-light text-samudra-ink">Upcoming Activity</h3>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="eyebrow text-samudra-ink-mute">Check-ins</span>
              <span className="font-display text-[20px] text-samudra-ink is-numeric">{analytics.upcomingCheckIns}</span>
            </div>
            <div className="h-px bg-samudra-paper-deep" />
            <div className="flex justify-between items-center">
              <span className="eyebrow text-samudra-ink-mute">Current Occupancy</span>
              <span className="font-display text-[20px] text-samudra-ink is-numeric">{analytics.occupancyRate}%</span>
            </div>
            <div className="h-px bg-samudra-paper-deep" />
            <div className="flex justify-between items-center">
              <span className="eyebrow text-samudra-ink-mute">Total Active Bookings</span>
              <span className="font-display text-[20px] text-samudra-ink is-numeric">{analytics.totalBookings}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Section
interface SettingsSectionProps {
  onSave?: () => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ onSave }) => {
  const [settings, setSettings] = useState({
    siteName: '',
    siteUrl: '',
    adminEmail: '',
    fromEmail: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    currency: 'IDR',
    timezone: 'UTC',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    maintenanceMode: false,
    logo_url: '',
    taxPercentage: 11,
    serviceFeePercentage: 10
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Load settings from database on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [villaRes, emailSettingsRes] = await Promise.all([
        fetch(paths.buildApiUrl('villa') + `?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } }),
        fetch(paths.buildApiUrl('settings'), { headers: { 'Cache-Control': 'no-cache' } }),
      ]);

      let fromEmail = '';
      if (emailSettingsRes.ok) {
        const emailResult = await emailSettingsRes.json();
        fromEmail = emailResult?.data?.from_email || emailResult?.from_email || '';
      }

      if (villaRes.ok) {
        const result = await villaRes.json();
        if (result.success && result.data) {
          const data = result.data;
          setSettings({
            siteName: data.name || '',
            siteUrl: data.website || '',
            adminEmail: data.email || '',
            fromEmail,
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || '',
            currency: data.currency || 'IDR',
            timezone: data.timezone || 'Asia/Jakarta',
            checkInTime: data.checkInTime || data.check_in_time || '15:00',
            checkOutTime: data.checkOutTime || data.check_out_time || '11:00',
            maintenanceMode: data.maintenance_mode === 1 || data.maintenance_mode === true,
            logo_url: data.logo_url || '',
            taxPercentage: data.tax_percentage !== undefined ? parseFloat(data.tax_percentage) : 11,
            serviceFeePercentage: data.service_fee_percentage !== undefined ? parseFloat(data.service_fee_percentage) : 10
          });
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getAuthToken();
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };

      // Save villa info + email settings in parallel
      const [villaRes] = await Promise.all([
        fetch(paths.buildApiUrl('villa'), {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            name: settings.siteName,
            website: settings.siteUrl,
            email: settings.adminEmail,
            phone: settings.phone,
            address: settings.address,
            city: settings.city,
            state: settings.state,
            country: settings.country,
            currency: settings.currency,
            timezone: settings.timezone,
            check_in_time: settings.checkInTime,
            check_out_time: settings.checkOutTime,
            maintenance_mode: settings.maintenanceMode ? 1 : 0,
            logo_url: settings.logo_url,
            tax_percentage: settings.taxPercentage,
            service_fee_percentage: settings.serviceFeePercentage
          })
        }),
        // Save email sender settings to KV so worker picks them up
        fetch(paths.buildApiUrl('settings'), {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            admin_email: settings.adminEmail,
            from_email: settings.fromEmail || settings.adminEmail,
            villa_name: settings.siteName,
          })
        }),
      ]);

      const result = await villaRes.json();
      if (result.success) {
        await loadSettings();
        onSave?.();
        toast.success('Settings saved');
      } else {
        toast.error('Save failed', { description: result.message || 'Unknown error' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Could not save settings', { description: 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const samudraFieldClass = "h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] focus:border-samudra-teal focus:outline-none transition-colors";
  const samudraSelectClass = "h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] focus:border-samudra-teal focus:outline-none transition-colors";
  const samudraLabelClass = "eyebrow block mb-2";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <p className="font-script text-samudra-gold text-[28px] leading-none mb-2">configure your property</p>
          <h2 className="font-display text-[40px] font-light text-samudra-ink">Settings</h2>
          <div className="h-px w-[60px] bg-samudra-ink mt-3" style={{ opacity: 0.4 }} />
        </div>
        <div className="bg-samudra-paper border border-samudra-paper-deep p-12 text-center">
          <div className="animate-spin h-6 w-6 border-2 border-samudra-ink border-t-transparent mx-auto mb-4" />
          <p className="eyebrow text-samudra-ink-mute">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0 pb-20">
      {/* Samudra page header */}
      <div className="mb-8">
        <p className="font-script text-samudra-gold text-[28px] leading-none mb-2">configure your property</p>
        <h2 className="font-display text-[40px] font-light text-samudra-ink">Settings</h2>
        <div className="h-px w-[60px] bg-samudra-ink mt-3" style={{ opacity: 0.4 }} />
      </div>

      <div className="space-y-8">
        {/* ── Section 1: Identity ── */}
        <div className="bg-samudra-paper border border-samudra-paper-deep">
          <div className="px-6 pt-5 pb-3 border-b border-samudra-paper-deep">
            <p className="eyebrow text-samudra-ink-mute">Section 1</p>
            <h3 className="font-display text-[22px] font-light text-samudra-ink">Identity</h3>
          </div>
          <div className="p-6 space-y-5">
            {/* Logo */}
            <div>
              <label className={samudraLabelClass}>Logo</label>
              <div className="flex items-start gap-6">
                <div className="w-28 h-28 border border-samudra-paper-deep bg-samudra-paper-soft flex items-center justify-center overflow-hidden flex-shrink-0">
                  {settings.logo_url ? (
                    <img src={settings.logo_url} alt="Site Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center">
                      <Image className="w-7 h-7 text-samudra-ink-mute mx-auto mb-1" />
                      <span className="eyebrow text-samudra-ink-mute text-[9px]">No logo</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    id="logoUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('Logo too large', { description: 'File must be under 5 MB.' });
                        return;
                      }
                      setUploadingLogo(true);
                      try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('prefix', 'logo');
                        const response = await fetch(paths.buildApiUrl('images/upload'), { method: 'POST', body: formData });
                        const result = await response.json();
                        if (result.success && result.data?.url) {
                          setSettings({ ...settings, logo_url: result.data.url });
                          toast.success('Logo uploaded', { description: 'Click Save to apply.' });
                        } else {
                          toast.error('Logo upload failed', { description: result.error || 'Unknown error' });
                        }
                      } catch (error) {
                        console.error('Logo upload error:', error);
                        toast.error('Logo upload failed', { description: 'Please try again.' });
                      } finally {
                        setUploadingLogo(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('logoUpload')?.click()}
                    disabled={uploadingLogo}
                    className="h-9 px-5 border border-samudra-ink text-samudra-ink hover:bg-samudra-ink hover:text-samudra-paper transition-colors eyebrow text-[10px] tracking-[0.3em] disabled:opacity-50"
                    style={{ fontFamily: 'var(--font-label)' }}
                  >
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </button>
                  {settings.logo_url && (
                    <button
                      type="button"
                      className="block eyebrow text-[10px] text-samudra-ink-mute hover:text-samudra-ink transition-colors"
                      style={{ fontFamily: 'var(--font-label)' }}
                      onClick={() => setSettings({ ...settings, logo_url: '' })}
                    >
                      Remove
                    </button>
                  )}
                  <p className="eyebrow text-samudra-ink-mute text-[10px]">PNG or SVG · max 5 MB</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="siteName" className={samudraLabelClass}>Villa Name</label>
                <input id="siteName" type="text" value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  placeholder="Your Villa Name" className={samudraFieldClass} style={{ fontFamily: 'var(--font-label)' }} />
              </div>
              <div>
                <label htmlFor="siteUrl" className={samudraLabelClass}>Website URL</label>
                <input id="siteUrl" type="url" value={settings.siteUrl}
                  onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                  placeholder="https://yourvilla.com" className={samudraFieldClass} style={{ fontFamily: 'var(--font-label)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Contact ── */}
        <div className="bg-samudra-paper border border-samudra-paper-deep">
          <div className="px-6 pt-5 pb-3 border-b border-samudra-paper-deep">
            <p className="eyebrow text-samudra-ink-mute">Section 2</p>
            <h3 className="font-display text-[22px] font-light text-samudra-ink">Contact</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="adminEmail" className={samudraLabelClass}>Admin / Contact Email</label>
                <input id="adminEmail" type="email" value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  placeholder="admin@yourvilla.com" className={samudraFieldClass} style={{ fontFamily: 'var(--font-label)' }} />
                <p className="eyebrow text-samudra-ink-mute text-[10px] mt-1.5">Receives booking notifications · Reply-To</p>
              </div>
              <div>
                <label htmlFor="fromEmail" className={samudraLabelClass}>Email Sender (From)</label>
                <input id="fromEmail" type="email" value={settings.fromEmail}
                  onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                  placeholder="booking@yourvilla.com" className={samudraFieldClass} style={{ fontFamily: 'var(--font-label)' }} />
                <p className="eyebrow text-samudra-ink-mute text-[10px] mt-1.5">Must be a verified domain</p>
              </div>
              <div>
                <label htmlFor="phone" className={samudraLabelClass}>Phone</label>
                <input id="phone" type="tel" value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+62 xxx xxxx xxxx" className={samudraFieldClass} style={{ fontFamily: 'var(--font-label)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 3: Location ── */}
        <div className="bg-samudra-paper border border-samudra-paper-deep">
          <div className="px-6 pt-5 pb-3 border-b border-samudra-paper-deep">
            <p className="eyebrow text-samudra-ink-mute">Section 3</p>
            <h3 className="font-display text-[22px] font-light text-samudra-ink">Location</h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label htmlFor="address" className={samudraLabelClass}>Street Address</label>
              <input id="address" type="text" value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Street address" className={samudraFieldClass} style={{ fontFamily: 'var(--font-label)' }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label htmlFor="city" className={samudraLabelClass}>City</label>
                <input id="city" type="text" value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  placeholder="City" className={samudraFieldClass} style={{ fontFamily: 'var(--font-label)' }} />
              </div>
              <div>
                <label htmlFor="state" className={samudraLabelClass}>State / Province</label>
                <input id="state" type="text" value={settings.state}
                  onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                  placeholder="State" className={samudraFieldClass} style={{ fontFamily: 'var(--font-label)' }} />
              </div>
              <div>
                <label htmlFor="country" className={samudraLabelClass}>Country</label>
                <input id="country" type="text" value={settings.country}
                  onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                  placeholder="Country" className={samudraFieldClass} style={{ fontFamily: 'var(--font-label)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 4: Operations ── */}
        <div className="bg-samudra-paper border border-samudra-paper-deep">
          <div className="px-6 pt-5 pb-3 border-b border-samudra-paper-deep">
            <p className="eyebrow text-samudra-ink-mute">Section 4</p>
            <h3 className="font-display text-[22px] font-light text-samudra-ink">Operations</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="currency" className={samudraLabelClass}>Currency</label>
                <select id="currency" value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className={samudraSelectClass} style={{ fontFamily: 'var(--font-label)' }}>
                  <option value="IDR">IDR — Indonesian Rupiah</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="MYR">MYR — Malaysian Ringgit</option>
                  <option value="SGD">SGD — Singapore Dollar</option>
                </select>
              </div>
              <div>
                <label htmlFor="timezone" className={samudraLabelClass}>Timezone</label>
                <select id="timezone" value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className={samudraSelectClass} style={{ fontFamily: 'var(--font-label)' }}>
                  <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                  <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                  <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                  <option value="Asia/Singapore">Asia/Singapore</option>
                  <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>
              <div>
                <label htmlFor="checkInTime" className={samudraLabelClass}>Check-in Time</label>
                <input id="checkInTime" type="time" value={settings.checkInTime}
                  onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
                  className={samudraFieldClass} style={{ fontFamily: 'var(--font-label)' }} />
              </div>
              <div>
                <label htmlFor="checkOutTime" className={samudraLabelClass}>Check-out Time</label>
                <input id="checkOutTime" type="time" value={settings.checkOutTime}
                  onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
                  className={samudraFieldClass} style={{ fontFamily: 'var(--font-label)' }} />
              </div>
            </div>

            {/* Tax & Service Fee */}
            <div className="pt-4 border-t border-samudra-paper-deep">
              <p className="eyebrow text-samudra-ink-mute mb-4">Tax & Service Fee</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="taxPercentage" className={samudraLabelClass}>Tax Rate (%)</label>
                  <div className="relative">
                    <input id="taxPercentage" type="number" min="0" max="100" step="0.1"
                      value={settings.taxPercentage}
                      onChange={(e) => setSettings({ ...settings, taxPercentage: parseFloat(e.target.value) || 0 })}
                      className={`${samudraFieldClass} pr-8`} style={{ fontFamily: 'var(--font-label)' }} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 eyebrow text-samudra-ink-mute text-[11px]">%</span>
                  </div>
                  <p className="eyebrow text-samudra-ink-mute text-[10px] mt-1.5">VAT / PPN applied to all bookings</p>
                </div>
                <div>
                  <label htmlFor="serviceFeePercentage" className={samudraLabelClass}>Service Fee (%)</label>
                  <div className="relative">
                    <input id="serviceFeePercentage" type="number" min="0" max="100" step="0.1"
                      value={settings.serviceFeePercentage}
                      onChange={(e) => setSettings({ ...settings, serviceFeePercentage: parseFloat(e.target.value) || 0 })}
                      className={`${samudraFieldClass} pr-8`} style={{ fontFamily: 'var(--font-label)' }} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 eyebrow text-samudra-ink-mute text-[11px]">%</span>
                  </div>
                  <p className="eyebrow text-samudra-ink-mute text-[10px] mt-1.5">Applied on top of subtotal</p>
                </div>
              </div>
              {/* Tax example box — Samudra palette */}
              <div className="mt-4 p-4 bg-samudra-paper-soft border-l-2 border-samudra-teal">
                <p className="eyebrow text-samudra-ink-mute mb-1">Example</p>
                <p className="font-display text-[13px] text-samudra-ink">
                  Rp 1.000.000 booking → Service Fee: Rp {(10000).toLocaleString('id-ID')} (10%) → Tax: Rp {(11000).toLocaleString('id-ID')} (11%) → Total shown to guest
                </p>
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="flex items-center gap-3 pt-4 border-t border-samudra-paper-deep">
              <Switch id="maintenanceMode" checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })} />
              <label htmlFor="maintenanceMode" className="eyebrow cursor-pointer">Enable Maintenance Mode</label>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-samudra-paper border-t border-samudra-paper-deep px-6 py-3 flex items-center justify-end gap-3"
        style={{ boxShadow: '0 -4px 16px rgba(10,14,20,0.06)' }}>
        <button
          type="button"
          onClick={loadSettings}
          disabled={saving || loading}
          className="h-10 px-6 border border-samudra-ink text-samudra-ink hover:bg-samudra-paper-soft transition-colors eyebrow text-[10px] tracking-[0.3em] disabled:opacity-50"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          Discard
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-10 px-6 bg-samudra-ink text-samudra-paper hover:bg-samudra-teal transition-colors eyebrow text-[10px] tracking-[0.3em] disabled:opacity-50"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
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
      return { status: 'inactive', color: 'border border-samudra-ink-mute text-samudra-ink-mute', text: 'Inactive' };
    }

    if (!hasValidFrom && !hasValidUntil) {
      return { status: 'unlimited', color: 'border border-samudra-teal text-samudra-teal', text: 'Always Available' };
    }

    const now = new Date();

    if (hasValidFrom) {
      const fromDate = new Date(pkg.valid_from);
      if (now < fromDate) {
        return { status: 'future', color: 'border border-samudra-gold text-samudra-gold', text: 'Future Available' };
      }
    }

    if (hasValidUntil) {
      const untilDate = new Date(pkg.valid_until);
      if (now > untilDate) {
        return { status: 'expired', color: 'border border-samudra-sand text-samudra-sand', text: 'Expired' };
      }
    }

    return { status: 'active', color: 'border border-samudra-teal text-samudra-teal', text: 'Currently Available' };
  };

  if (loading) {
    return (
      <div className="flex items-center py-8">
        <div className="animate-spin h-5 w-5 border-2 border-samudra-ink border-t-transparent mr-3" />
        <span className="eyebrow text-samudra-ink-mute">Loading packages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-samudra-paper-soft border border-samudra-paper-deep p-4 card-accent-teal">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-[#7a3d31] mr-2" />
          <span className="text-[13px] text-samudra-ink">Error loading packages: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {packages.length === 0 ? (
        <div className="py-10 text-center">
          <p className="font-script text-samudra-gold text-[22px] leading-none mb-2">no packages yet</p>
          <p className="eyebrow text-samudra-ink-mute">Create packages in the Packages section first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {packages.map((pkg, index) => {
            const availability = getAvailabilityStatus(pkg);
            const fromDate = formatDate(pkg.valid_from);
            const untilDate = formatDate(pkg.valid_until);

            return (
              <div key={pkg.id || index} className="bg-samudra-paper border border-samudra-paper-deep p-4">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-display text-[16px] font-light text-samudra-ink break-words flex-1 min-w-0 mr-3">{pkg.name}</h4>
                  <span className={`eyebrow text-[10px] px-2 py-0.5 whitespace-nowrap flex-shrink-0 ${availability.color}`}>
                    {availability.text}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="eyebrow text-samudra-ink-mute">Price</span>
                    <span className="font-display text-[14px] text-samudra-ink is-numeric">Rp {Number(pkg.base_price || pkg.price || 0).toLocaleString('id-ID')}</span>
                  </div>

                  {fromDate && (
                    <div className="flex justify-between items-baseline">
                      <span className="eyebrow text-samudra-ink-mute">From</span>
                      <span className="text-[13px] text-samudra-ink">{fromDate}</span>
                    </div>
                  )}

                  {untilDate && (
                    <div className="flex justify-between items-baseline">
                      <span className="eyebrow text-samudra-ink-mute">Until</span>
                      <span className="text-[13px] text-samudra-ink">{untilDate}</span>
                    </div>
                  )}

                  {!fromDate && !untilDate && (
                    <div className="flex justify-between items-baseline">
                      <span className="eyebrow text-samudra-ink-mute">Dates</span>
                      <span className="text-[13px] text-samudra-ink-mute">No limits set</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-samudra-paper-deep">
                  <p className="eyebrow text-samudra-ink-mute text-[10px]">
                    {availability.status === 'unlimited' && 'Available indefinitely'}
                    {availability.status === 'active' && 'Currently bookable'}
                    {availability.status === 'future' && 'Scheduled for future'}
                    {availability.status === 'expired' && 'Past availability window'}
                    {availability.status === 'inactive' && 'Disabled by admin'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
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

      // Load bookings, packages, and calendar data in parallel (bookings requires auth)
      const calToken = getAuthToken();
      const calAuthHeaders: Record<string, string> = calToken
        ? { 'Authorization': `Bearer ${calToken}` }
        : {};
      const [bookingsResponse, packagesResponse] = await Promise.all([
        fetch(paths.buildApiUrl('bookings/list'), { headers: calAuthHeaders }),
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
        <div className="animate-spin h-6 w-6 border-2 border-samudra-ink border-t-transparent" />
        <span className="ml-3 eyebrow text-samudra-ink-mute">Loading calendar...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-samudra-paper-soft border border-samudra-paper-deep p-4 card-accent-teal">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-[#7a3d31] mr-2" />
          <span className="text-[13px] text-samudra-ink">Error loading calendar data: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards — Samudra ink-on-paper */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Calendar,     label: 'Total Bookings',  value: String(calendarStats.totalBookings || 0),   sub: 'next 30 days' },
          { icon: DollarSign,   label: 'Expected Revenue', value: `Rp ${Number(calendarStats.totalRevenue || 0).toLocaleString('id-ID')}`, sub: 'upcoming' },
          { icon: CheckCircle,  label: 'Confirmed',       value: String(calendarStats.confirmedBookings || 0), sub: 'ready' },
          { icon: Clock,        label: 'Pending',         value: String(calendarStats.pendingBookings || 0),  sub: 'awaiting' },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="bg-samudra-paper border border-samudra-paper-deep p-5 card-accent-teal">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow text-samudra-ink-mute mb-3">{label}</p>
                <p className="font-display text-[28px] font-light text-samudra-ink leading-none is-numeric">{value}</p>
                <p className="font-script text-samudra-gold text-[14px] mt-2">{sub}</p>
              </div>
              <Icon className="h-5 w-5 text-samudra-ink-mute opacity-50 mt-0.5" />
            </div>
          </div>
        ))}
      </div>

      {/* View toggle — Samudra segmented control */}
      <div className="flex items-center justify-between">
        <p className="eyebrow text-samudra-ink-mute">Calendar View</p>
        <div className="flex border border-samudra-ink" style={{ display: 'inline-flex' }}>
          <button
            onClick={() => setSelectedView('summary')}
            className={`px-4 py-2 eyebrow text-[10px] tracking-[0.3em] transition-colors ${selectedView === 'summary'
              ? 'bg-samudra-ink text-samudra-paper'
              : 'bg-samudra-paper text-samudra-ink hover:bg-samudra-paper-soft'
              }`}
            style={{ fontFamily: 'var(--font-label)' }}
          >
            2-Month View
          </button>
          <button
            onClick={() => setSelectedView('detailed')}
            className={`px-4 py-2 eyebrow text-[10px] tracking-[0.3em] border-l border-samudra-ink transition-colors ${selectedView === 'detailed'
              ? 'bg-samudra-ink text-samudra-paper'
              : 'bg-samudra-paper text-samudra-ink hover:bg-samudra-paper-soft'
              }`}
            style={{ fontFamily: 'var(--font-label)' }}
          >
            3-Month + Stats
          </button>
        </div>
      </div>

      {/* Calendar Views — horizontal scroll on mobile (min-width: 640px) */}
      {selectedView === 'summary' ? (
        <div className="bg-samudra-paper border border-samudra-paper-deep p-4 overflow-x-auto">
          <div style={{ minWidth: '640px' }}>
            <CalendarDashboard monthCount={2} />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-samudra-paper border border-samudra-paper-deep p-4 overflow-x-auto">
            <div style={{ minWidth: '640px' }}>
              <CalendarDashboard monthCount={3} />
            </div>
          </div>

          {/* Package Performance Summary */}
          <div className="bg-samudra-paper border border-samudra-paper-deep">
            <div className="px-6 pt-5 pb-3 border-b border-samudra-paper-deep">
              <p className="eyebrow text-samudra-ink-mute">Next 30 Days</p>
              <h5 className="font-display text-[18px] font-light text-samudra-ink">Package Bookings</h5>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {calendarStats.packageBreakdown?.map((item: any, index: number) => (
                <div key={item.package.id || index} className="bg-samudra-paper-soft border border-samudra-paper-deep p-4">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h6 className="font-display text-[14px] font-light text-samudra-ink break-words flex-1 min-w-0">{item.package.name}</h6>
                    <span className="eyebrow text-[10px] px-2 py-0.5 border border-samudra-teal text-samudra-teal whitespace-nowrap flex-shrink-0">
                      {item.bookingCount}
                    </span>
                  </div>
                  <p className="eyebrow text-samudra-ink-mute text-[10px]">Rp {Number(item.totalRevenue || 0).toLocaleString('id-ID')}</p>
                </div>
              )) || (
                  <div className="col-span-full py-6 text-center">
                    <p className="font-script text-samudra-gold text-[18px]">no package bookings</p>
                    <p className="eyebrow text-samudra-ink-mute mt-1">in the next 30 days</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Calendar Section Component
const CalendarSection: React.FC = () => {
  const [activeCalendarTab, setActiveCalendarTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      {/* Samudra page header */}
      <div className="mb-6">
        <p className="font-script text-samudra-gold text-[28px] leading-none mb-2">availability at a glance</p>
        <h2 className="font-display text-[40px] font-light text-samudra-ink">Calendar</h2>
        <div className="h-px w-[60px] bg-samudra-ink mt-3" style={{ opacity: 0.4 }} />
      </div>

      {/* Samudra segmented sub-tabs — no emoji, no rounded-lg */}
      <div className="flex border border-samudra-ink" style={{ display: 'inline-flex' }}>
        <button
          onClick={() => setActiveCalendarTab('dashboard')}
          className={`px-5 py-2.5 eyebrow text-[11px] tracking-[0.3em] transition-colors ${activeCalendarTab === 'dashboard'
            ? 'bg-samudra-ink text-samudra-paper'
            : 'bg-samudra-paper text-samudra-ink hover:bg-samudra-paper-soft'
            }`}
          style={{ fontFamily: 'var(--font-label)' }}
        >
          Calendar View
        </button>
        <button
          onClick={() => setActiveCalendarTab('integration')}
          className={`px-5 py-2.5 eyebrow text-[11px] tracking-[0.3em] border-l border-samudra-ink transition-colors ${activeCalendarTab === 'integration'
            ? 'bg-samudra-ink text-samudra-paper'
            : 'bg-samudra-paper text-samudra-ink hover:bg-samudra-paper-soft'
            }`}
          style={{ fontFamily: 'var(--font-label)' }}
        >
          Integration & Sync
        </button>
      </div>

      {/* Calendar Content */}
      {activeCalendarTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Package Availability Overview */}
          <div className="bg-samudra-paper border border-samudra-paper-deep p-6">
            <div className="px-0 pb-4 mb-4 border-b border-samudra-paper-deep">
              <p className="eyebrow text-samudra-ink-mute mb-1">Package Status</p>
              <h3 className="font-display text-[20px] font-light text-samudra-ink">Availability Timeline</h3>
            </div>
            <PackageAvailabilityVisualization />
          </div>

          {/* Enhanced Calendar Dashboard */}
          <div className="bg-samudra-paper border border-samudra-paper-deep p-6">
            <div className="pb-4 mb-4 border-b border-samudra-paper-deep">
              <p className="eyebrow text-samudra-ink-mute mb-1">Booking Overview</p>
              <h3 className="font-display text-[20px] font-light text-samudra-ink">Calendar</h3>
            </div>
            <EnhancedBookingCalendar />
          </div>
        </div>
      )}

      {activeCalendarTab === 'integration' && (
        <div className="bg-samudra-paper border border-samudra-paper-deep p-6">
          <ICalSyncManager />
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
