import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { PhotoGallery } from '@/components/PhotoGallery';
import RoomImageGallery from '@/components/RoomImageGallery';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Package } from '@/types';
import { packageService } from '@/services/packageService';
import { useVillaInfo } from '@/hooks/useVillaInfo';
import { paths } from '@/config/paths';
import {
  ArrowLeft,
  Clock,
  Users,
  Gift,
  Star,
  Calendar,
  Tag,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  Home,
  Wifi,
  Car,
  Heart,
  Coffee,
  Bath,
  Check,
  Utensils,
  Plane,
  Map,
  Headphones,
  Waves,
  ChefHat,
  Sun,
  Music,
  Mountain,
  Apple,
  Wine,
  Bus,
  Bike,
  Activity,
  Leaf,
  Dumbbell,
  Zap,
  Shirt,
  Archive,
  Camera,
  Flower,
  PartyPopper,
  Search
} from 'lucide-react';
import NotFound from '../shared/NotFound';
import BookingSkeleton from '@/components/BookingSkeleton';
import { formatRupiah } from '@/utils/currency';

const PackageDetails = () => {
  // Icon mapper function to convert backend icon strings to Lucide React components
  const getAmenityIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'wifi': Wifi, 'car': Car, 'heart': Heart, 'coffee': Coffee, 'bath': Bath,
      'sparkles': Sparkles, 'star': Star
    };
    return iconMap[iconName?.toLowerCase()] || Star;
  };

  // Icon mapper for inclusions
  const getInclusionIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'check': Check, 'check-circle': Check, 'coffee': Coffee, 'utensils': Utensils,
      'heart': Heart, 'cup-soda': Coffee, 'apple': Apple, 'wine': Wine,
      'car': Car, 'plane': Plane, 'bus': Bus, 'bike': Bike,
      'sparkles': Sparkles, 'map': Map, 'chef-hat': ChefHat, 'sun': Sun,
      'music': Music, 'home': Home, 'mountain': Mountain,
      'headphones': Headphones, 'shirt': Shirt, 'clock': Clock, 'phone': Phone,
      'archive': Archive, 'waves': Waves, 'activity': Activity, 'leaf': Leaf,
      'dumbbell': Dumbbell, 'zap': Zap, 'gift': Gift, 'party-popper': PartyPopper,
      'camera': Camera, 'flower': Flower
    };
    return iconMap[iconName?.toLowerCase()] || CheckCircle2;
  };

  const { packageId } = useParams<{ packageId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { villaInfo } = useVillaInfo();

  // Extract booking parameters from URL
  const checkIn = searchParams.get('checkin');
  const checkOut = searchParams.get('checkout');
  const guests = parseInt(searchParams.get('guests') || '2');
  const [pkg, setPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [packageInclusions, setPackageInclusions] = useState<any[]>([]);
  const [inclusionsLoading, setInclusionsLoading] = useState(true);
  const [packageRooms, setPackageRooms] = useState<any[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempCheckIn, setTempCheckIn] = useState(checkIn || '');
  const [tempCheckOut, setTempCheckOut] = useState(checkOut || '');
  const [tempGuests, setTempGuests] = useState(guests);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Room image lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxRoom, setLightboxRoom] = useState<any>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxCurrentIndex, setLightboxCurrentIndex] = useState(0);
  const [lightboxLoading, setLightboxLoading] = useState(false);

  // Navigation functions for lightbox
  const lightboxNext = () => {
    if (lightboxImages.length > 1) {
      setLightboxCurrentIndex((prev) => (prev + 1) % lightboxImages.length);
    }
  };

  const lightboxPrev = () => {
    if (lightboxImages.length > 1) {
      setLightboxCurrentIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
    }
  };

  // Function to fetch room images for lightbox
  const openRoomLightbox = async (room: any) => {
    setLightboxRoom(room);
    setLightboxLoading(true);
    setLightboxOpen(true);
    setLightboxImages([]);
    setLightboxCurrentIndex(0);

    try {
      // Try fetching from room API first
      const response = await fetch(`https://bookingengine-8g1-boe-kxn.pages.dev/api/rooms/${room.room_id}`);
      const data = await response.json();

      if (data.success && data.data?.images?.length > 0) {
        // Sort with primary image first, then use all images
        const sortedImages = [...data.data.images].sort((a: any, b: any) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return 0;
        });
        const imageUrls = sortedImages.map((img: any) => img.url);
        setLightboxImages(imageUrls);
      } else {
        // Fallback: try room type folder
        const roomType = room.type || room.room_type || '';
        const folder = roomType.replace(/\s+/g, '');
        const fallbackResp = await fetch(`https://bookingengine-8g1-boe-kxn.pages.dev/api/rooms/images/${encodeURIComponent(folder)}`);
        const fallbackData = await fallbackResp.json();

        if (fallbackData.success && fallbackData.data?.images?.length > 0) {
          const imageUrls = fallbackData.data.images.map((img: any) => {
            const filename = img.filename || img;
            return img.url || `/images/rooms/${folder}/${filename}`;
          });
          setLightboxImages(imageUrls);
        } else {
          setLightboxImages(['/images/ui/placeholder.svg']);
        }
      }
    } catch (error) {
      console.error('Error fetching room images:', error);
      setLightboxImages(['/images/ui/placeholder.svg']);
    } finally {
      setLightboxLoading(false);
    }
  };

  // Helper function to safely parse inclusions data
  const parseInclusions = (data: any): string[] => {
    try {
      if (Array.isArray(data)) {
        return data;
      }
      if (typeof data === 'string' && data.trim().length > 0) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {

      return [];
    }
  };
  const [error, setError] = useState<string | null>(null);

  // Dynamic contact information helpers
  const getContactPhone = () => {
    return villaInfo?.phone || "+1 (555) 123-4567";
  };

  const getContactEmail = () => {
    return villaInfo?.email || "support@villa.com";
  };

  // Fetch package rooms from package-rooms relationship API
  useEffect(() => {
    const fetchPackageRooms = async () => {
      if (!packageId) return;
      try {
        setRoomsLoading(true);
        const response = await fetch(paths.buildApiUrl(`packages/${packageId}/rooms`));
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const rooms = data.data || [];
            setPackageRooms(rooms);
            // Set default selected room
            const defaultRoom = rooms.find(room => room.is_default) || rooms[0];
            if (defaultRoom) {
              setSelectedRoom(defaultRoom);
            }
          }
        } else {
          console.log('Package rooms API not available yet');
          setPackageRooms([]);
        }
      } catch (error) {
        console.log('Package rooms API not ready:', error);
        setPackageRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    };

    if (packageId) {
      fetchPackageRooms();
    }
  }, [packageId]);

  // Fetch package inclusions
  useEffect(() => {
    const fetchPackageInclusions = async () => {
      if (!packageId) return;
      try {
        setInclusionsLoading(true);
        const response = await fetch(paths.buildApiUrl(`packages/${packageId}/inclusions`));
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPackageInclusions(data.inclusions || []);
          }
        } else {
          console.log('Package inclusions API not available yet');
          // API file not uploaded yet, use sample data for package 1
          if (packageId === '1') {
            setPackageInclusions([
              { inclusion_id: 1, name: 'Welcome Breakfast', category: 'meals', icon: 'coffee', description: 'Complimentary breakfast on arrival day' },
              { inclusion_id: 2, name: 'Daily Continental Breakfast', category: 'meals', icon: 'utensils', description: 'Fresh breakfast served daily' },
              { inclusion_id: 7, name: 'Airport Transfer (Round Trip)', category: 'transport', icon: 'car', description: 'Private car service to/from airport' },
              { inclusion_id: 12, name: 'Spa Treatment (60 min)', category: 'activities', icon: 'sparkles', description: 'Choice of massage or facial treatment' },
              { inclusion_id: 19, name: '24/7 Concierge Service', category: 'services', icon: 'headphones', description: 'Round-the-clock assistance' },
              { inclusion_id: 25, name: 'Pool & Spa Access', category: 'wellness', icon: 'waves', description: 'Full access to wellness facilities' },
              { inclusion_id: 30, name: 'Honeymoon Surprise Setup', category: 'special', icon: 'heart', description: 'Romantic room decoration' }
            ]);
          } else {
            setPackageInclusions([]);
          }
        }
      } catch (error) {
        console.log('Package inclusions API not ready:', error);
        // API file not uploaded yet, use sample data for package 1
        if (packageId === '1') {
          setPackageInclusions([
            { inclusion_id: 1, name: 'Welcome Breakfast', category: 'meals', icon: 'coffee', description: 'Complimentary breakfast on arrival day' },
            { inclusion_id: 2, name: 'Daily Continental Breakfast', category: 'meals', icon: 'utensils', description: 'Fresh breakfast served daily' },
            { inclusion_id: 7, name: 'Airport Transfer (Round Trip)', category: 'transport', icon: 'car', description: 'Private car service to/from airport' },
            { inclusion_id: 12, name: 'Spa Treatment (60 min)', category: 'activities', icon: 'sparkles', description: 'Choice of massage or facial treatment' },
            { inclusion_id: 19, name: '24/7 Concierge Service', category: 'services', icon: 'headphones', description: 'Round-the-clock assistance' },
            { inclusion_id: 25, name: 'Pool & Spa Access', category: 'wellness', icon: 'waves', description: 'Full access to wellness facilities' },
            { inclusion_id: 30, name: 'Honeymoon Surprise Setup', category: 'special', icon: 'heart', description: 'Romantic room decoration' }
          ]);
        } else {
          setPackageInclusions([]);
        }
      } finally {
        setInclusionsLoading(false);
      }
    };

    if (packageId) {
      fetchPackageInclusions();
    }
  }, [packageId]);

  useEffect(() => {
    const fetchPackage = async () => {
      if (!packageId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await packageService.getPackageById(packageId);
        setPackage(response.data);

        // Track package details page view & view_item
        import('@/utils/ga4Analytics').then(({ trackPackageDetailsPage, trackViewItem }) => {
          trackPackageDetailsPage({
            package_id: response.data.id,
            package_name: response.data.name,
            price: response.data.price || response.data.base_price,
            package_type: response.data.type,
          });

          trackViewItem({
            item_id: response.data.id,
            item_name: response.data.name,
            item_category: response.data.type || 'Package',
            price: Number(response.data.price || response.data.base_price || 0),
            currency: 'IDR'
          });
        });
      } catch (err: any) {
        console.error('Package fetch error:', err);

        // Provide more specific error messages
        if (err.message && err.message.includes('not found')) {
          setError(`Package with ID ${packageId} was not found.`);
        } else if (err.message && err.message.includes('500')) {
          setError("Server error occurred. Please try again later.");
        } else {
          setError("Failed to fetch package details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId]);

  if (loading) {
    return <BookingSkeleton />;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!pkg) {
    return <NotFound />;
  }

  // Check if package is inactive - API returns is_active (1/0), not available
  // Also check date validity
  const isActive = pkg.is_active === 1 || pkg.is_active === true;
  const today = new Date().toISOString().split('T')[0];
  const dateValid = (!pkg.valid_from || today >= pkg.valid_from) &&
    (!pkg.valid_until || today <= pkg.valid_until);

  if (!isActive || !dateValid) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2 text-hotel-navy">Package Not Available</h2>
            <p className="text-hotel-bronze mb-4">
              This package is currently not available for booking.
            </p>
            <Button onClick={() => navigate('/packages')}>
              View Available Packages
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const discountPercentage = parseFloat(pkg.discount_percentage);
  const basePrice = parseFloat(pkg.price || pkg.base_price || '0');
  const originalPrice = basePrice / (1 - discountPercentage / 100);

  // Calculate final price with room adjustment
  const calculateFinalPrice = () => {
    if (!selectedRoom) return basePrice;

    const roomAdjustment = parseFloat(selectedRoom.price_adjustment) || 0;

    if (selectedRoom.adjustment_type === 'percentage') {
      return basePrice * (1 + roomAdjustment / 100);
    } else {
      return basePrice + roomAdjustment;
    }
  };

  const finalPrice = calculateFinalPrice();

  const handleBookNow = () => {
    // Require dates and room selection before proceeding to booking
    if (!tempCheckIn || !tempCheckOut) {
      window.alert('Please select check-in and check-out dates first.');
      return;
    }

    const roomId = selectedRoom?.room_id || selectedRoom?.id;
    if (!roomId) {
      window.alert('Please select a room to continue.');
      return;
    }

    const params = new URLSearchParams();
    params.set('package', pkg.id.toString());
    params.set('room', roomId.toString());
    params.set('checkin', tempCheckIn);
    params.set('checkout', tempCheckOut);
    params.set('guests', guests.toString());
    params.set('basePrice', basePrice.toString());
    params.set('finalPrice', finalPrice.toString());
    params.set('roomAdjustment', (selectedRoom?.price_adjustment || 0).toString());
    params.set('adjustmentType', selectedRoom?.adjustment_type || 'fixed');

    // Track book now click
    import('@/utils/ga4Analytics').then(({ trackButtonClick }) => {
      trackButtonClick({
        button_name: 'book_now',
        package_name: pkg.name,
        package_id: pkg.id.toString(),
        room_name: selectedRoom?.name || selectedRoom?.room_name,
        check_in: tempCheckIn,
        check_out: tempCheckOut,
        value: finalPrice,
        currency: 'IDR'
      });
    });

    navigate(`/book?${params.toString()}`);
  };

  // Get the image URL from either images array or image_url field
  const getPackageImageUrl = () => {
    // If pkg.images is an array and has items, use the first one
    if (pkg.images && Array.isArray(pkg.images) && pkg.images.length > 0) {
      return pkg.images[0];
    }

    // Fallback to image_url field (for backward compatibility)
    if (pkg.image_url) {
      return pkg.image_url;
    }

    // Default images based on package type
    const typeImageMap: Record<string, string> = {
      'Romance': '/images/packages/romantic-escape.jpg',
      'Business': '/images/packages/business-elite.jpg',
      'Family': '/images/ui/placeholder.svg',
      'Adventure': '/images/ui/placeholder.svg',
      'Wellness': '/images/ui/placeholder.svg',
      'Culture': '/images/ui/placeholder.svg'
    };

    return typeImageMap[pkg.type || pkg.package_type] || '/images/ui/placeholder.svg';
  };

  // Get all package images for carousel (up to 5)
  const getPackageImages = (): string[] => {
    const images: string[] = [];

    // If pkg.images is an array, use up to 5 images
    if (pkg.images && Array.isArray(pkg.images) && pkg.images.length > 0) {
      return pkg.images.slice(0, 5);
    }

    // Fallback to single image_url
    if (pkg.image_url) {
      images.push(pkg.image_url);
    }

    // If still no images, use default based on type
    if (images.length === 0) {
      const fallbackUrl = getPackageImageUrl();
      images.push(fallbackUrl);
    }

    return images;
  };

  // Dynamic theme configuration
  const packageTheme = {
    colors: {
      primary: '#E6A500', // hotel-gold
      secondary: '#2F3A4F', // hotel-navy
      accent: '#8B9A7A', // hotel-sage
      background: '#F5F2E8', // hotel-cream
      text: '#7A5C3F' // hotel-bronze
    },
    typography: {
      fontFamily: 'Inter, serif',
      headingStyle: 'font-medium'
    },
    layout: {
      borderRadius: '8px',
      spacing: 'normal'
    }
  };

  // Package configuration using database marketing_category
  const getPackageConfig = () => {
    // Use marketing_category from database if available
    const pkgAny = pkg as any;
    const marketingCategory = pkgAny.marketing_category || pkgAny.category || pkg.type || pkgAny.package_type;

    // If we have marketing_category data from database, use it directly
    if (pkgAny.marketing_category && typeof pkgAny.marketing_category === 'object') {
      return {
        badge: pkgAny.marketing_category.badge || pkgAny.marketing_category.name || marketingCategory,
        subtitle: pkgAny.marketing_category.subtitle || pkgAny.marketing_category.description || 'Luxury Experience',
        tags: pkgAny.marketing_category.tags || pkgAny.marketing_category.features || []
      };
    }

    // Fallback configurations if no database marketing_category
    const type = (marketingCategory || '').toLowerCase();
    const configs = {
      romance: {
        badge: 'Romantic Getaway',
        subtitle: 'Luxury Romance',
        tags: ['Premium Service', 'Intimate Setting', 'Couples Only']
      },
      business: {
        badge: 'Business Package',
        subtitle: 'Executive Experience',
        tags: ['Business Center', 'Fast WiFi', 'Meeting Rooms']
      },
      family: {
        badge: 'Family Package',
        subtitle: 'Family Adventure',
        tags: ['Family Friendly', 'Kids Activities', 'Group Rates']
      },
      wellness: {
        badge: 'Wellness Retreat',
        subtitle: 'Health & Wellness',
        tags: ['Spa Access', 'Healthy Cuisine', 'Fitness Center']
      },
      adventure: {
        badge: 'Adventure Package',
        subtitle: 'Outdoor Adventure',
        tags: ['Adventure Sports', 'Nature Tours', 'Active Lifestyle']
      },
      culture: {
        badge: 'Cultural Experience',
        subtitle: 'Cultural Journey',
        tags: ['Local Culture', 'Guided Tours', 'Authentic Experience']
      }
    };

    return configs[type] || {
      badge: pkgAny.badge || marketingCategory || 'Special Package',
      subtitle: pkgAny.subtitle || 'Luxury Experience',
      tags: pkgAny.tags || ['Premium Service', 'All Inclusive', 'Exclusive Access']
    };
  };

  const packageConfig = getPackageConfig();

  // Main render - Full production design with proper typography
  return (
    <div className="min-h-screen bg-hotel-cream">

      {/* Hero Section with Package Images - Contained style like homepage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 pt-6">
        <Header />
        <div className="mt-8">
          <PhotoGallery images={pkg.images || []} />
        </div>
      </div>

      {/* Package Title Banner */}
      <div className="bg-white border-b border-gray-100 py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-hotel-gold text-xs md:text-sm font-semibold mb-3 uppercase tracking-widest">
            {packageConfig.badge}
          </p>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium mb-4 leading-tight tracking-tight text-hotel-charcoal">{pkg.name}</h1>
          <p className="text-base md:text-lg text-hotel-bronze max-w-3xl leading-relaxed">{pkg.description}</p>
          <div className="flex flex-wrap gap-3 md:gap-4 mt-6">
            {pkg.duration && (
              <span className="inline-flex items-center gap-2 text-sm text-hotel-bronze">
                <Clock className="w-4 h-4 text-hotel-gold" />
                {pkg.duration}
              </span>
            )}
            {pkg.max_guests && (
              <span className="inline-flex items-center gap-2 text-sm text-hotel-bronze">
                <Users className="w-4 h-4 text-hotel-gold" />
                Max {pkg.max_guests} Guests
              </span>
            )}
            {packageConfig.tags?.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} className="bg-hotel-gold/10 text-hotel-gold border-hotel-gold/30 text-xs px-3 py-1">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {/* Back Link */}
        <Link to="/packages" className="inline-flex items-center text-hotel-bronze hover:text-hotel-navy mb-8 group text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Packages
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Package Details */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">

            {/* Date Selection Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                {/* Dates */}
                <div className="flex gap-2 md:flex-1">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Check-in</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={tempCheckIn}
                        onChange={(e) => setTempCheckIn(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-hotel-sage focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Check-out</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={tempCheckOut}
                        onChange={(e) => setTempCheckOut(e.target.value)}
                        min={tempCheckIn || new Date().toISOString().split('T')[0]}
                        className="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-hotel-sage focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Nights Display */}
                {tempCheckIn && tempCheckOut && (
                  <div className="text-xs text-hotel-sage text-center md:hidden">
                    {Math.max(1, Math.ceil((new Date(tempCheckOut).getTime() - new Date(tempCheckIn).getTime()) / (1000 * 3600 * 24)))} night(s)
                  </div>
                )}

                {/* Divider */}
                <div className="hidden md:block w-px h-10 bg-gray-200"></div>

                {/* Guests */}
                <div className="relative md:min-w-[180px]">
                  <label className="block text-xs text-gray-500 mb-1">Guests</label>
                  <div
                    className="flex items-center justify-between gap-2 cursor-pointer border border-gray-300 px-3 py-2.5 rounded-lg hover:border-hotel-sage transition-colors"
                    onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{tempGuests} Guest{tempGuests !== 1 ? 's' : ''}</span>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${showGuestDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                  </div>

                  {/* Guest Dropdown */}
                  {showGuestDropdown && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Guests</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); setTempGuests(Math.max(1, tempGuests - 1)); }}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >-</button>
                          <span className="w-8 text-center">{tempGuests}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setTempGuests(Math.min(pkg?.max_guests || 10, tempGuests + 1)); }}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >+</button>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowGuestDropdown(false); }}
                        className="w-full mt-3 bg-hotel-sage text-white py-2 rounded-lg hover:bg-hotel-sage-dark transition-colors text-sm"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>

                {/* Button */}
                <button
                  onClick={() => {
                    if (tempCheckIn && tempCheckOut) {
                      const params = new URLSearchParams(window.location.search);
                      params.set('checkin', tempCheckIn);
                      params.set('checkout', tempCheckOut);
                      params.set('guests', tempGuests.toString());
                      navigate(`${window.location.pathname}?${params.toString()}`, { replace: true });
                    } else {
                      alert('Please select check-in and check-out dates');
                    }
                  }}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-hotel-sage text-white px-6 py-3 rounded-lg font-medium hover:bg-hotel-sage-dark transition-colors whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  <span>Check Availability</span>
                </button>
              </div>
            </div>

            {/* Package Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
              <h2 className="font-display text-lg md:text-xl font-medium text-hotel-charcoal mb-3">Package Overview</h2>
              <p className="text-xs text-hotel-gold font-semibold mb-3 uppercase tracking-widest">
                {packageConfig.subtitle}
              </p>
              <p className="text-sm md:text-base text-hotel-bronze leading-relaxed">{pkg.description}</p>
            </div>

            {/* What's Included */}
            {packageInclusions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
                <h2 className="font-display text-lg md:text-xl font-medium text-hotel-charcoal mb-5 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-hotel-gold" />
                  What's Included
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {packageInclusions.map((inclusion: any, index: number) => {
                    const IconComponent = getInclusionIcon(inclusion.icon);
                    return (
                      <div key={inclusion.inclusion_id || index} className="flex items-start gap-3 p-3.5 md:p-4 bg-hotel-cream/50 rounded-lg border border-gray-100">
                        <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 bg-hotel-gold/10 rounded-full flex items-center justify-center">
                          <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-hotel-gold" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm md:text-base text-hotel-charcoal">{inclusion.name}</h3>
                          {inclusion.description && (
                            <p className="text-xs md:text-sm text-hotel-bronze mt-1 leading-relaxed">{inclusion.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Choose Your Room */}
            {packageRooms.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
                <h2 className="font-display text-xl md:text-2xl font-semibold text-hotel-charcoal mb-2">
                  Choose Your Room
                </h2>
                <p className="text-sm text-gray-500 mb-6">Select from our available room types for this package</p>
                <div className="space-y-4">
                  {packageRooms.map((room: any) => {
                    const roomName = room.room_name || room.name;
                    const roomDescription = room.room_description || room.description;
                    // Handle both string arrays and object arrays for images - apply formatRupiah for mobile compatibility
                    const rawImages = room.images || [];
                    const roomImages = rawImages.map((img: any) => {
                      const imgUrl = typeof img === 'string' ? img : (img.url || img);
                      // Apply URL conversion for mobile compatibility using existing formatRupiah import's r2 module
                      return imgUrl.startsWith('https://pub-') ? imgUrl.replace('https://pub-e303ec878512482fa87c065266e6bedd.r2.dev', 'https://alphadigitalagency.id') : imgUrl;
                    });

                    return (
                      <div
                        key={room.room_id || room.id}
                        className={`bg-white rounded-lg border transition-all duration-200 flex flex-col sm:flex-row overflow-hidden ${selectedRoom?.room_id === room.room_id
                          ? 'border-hotel-gold shadow-lg ring-2 ring-hotel-gold/30'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                        onClick={() => setSelectedRoom(room)}
                      >
                        {/* Room Image - Full width on mobile, fixed width on desktop */}
                        <div className="relative w-full sm:w-48 h-40 sm:h-32 flex-shrink-0">
                          {roomImages.length > 0 ? (
                            <img
                              src={roomImages[0]}
                              alt={roomName}
                              className="w-full h-full object-cover cursor-pointer"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <Home className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                          {roomImages.length > 1 && (
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                              +{roomImages.length - 1} more
                            </div>
                          )}
                        </div>

                        {/* Room Content - Right Side */}
                        <div className="flex-1 p-4 flex flex-col justify-between min-h-[100px] sm:min-h-[128px]">
                          {/* Title and Price */}
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg text-hotel-charcoal flex-1 pr-3">
                              {roomName}
                            </h3>
                            <span className={`text-base font-bold whitespace-nowrap ${room.price_adjustment > 0 ? 'text-hotel-gold' : 'text-green-600'}`}>
                              {room.price_adjustment === 0
                                ? 'Rp 0'
                                : room.adjustment_type === 'percentage'
                                  ? `${room.price_adjustment > 0 ? '+' : ''}${room.price_adjustment}%`
                                  : `${room.price_adjustment > 0 ? '+' : ''}${formatRupiah(Math.abs(room.price_adjustment))}`
                              }
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1">
                            {roomDescription || 'Premium room option for this package with quality amenities and services.'}
                          </p>

                          {/* Select Button */}
                          <div className="flex justify-start">
                            <button
                              className={`px-4 py-2 text-sm font-semibold rounded transition-colors ${selectedRoom?.room_id === room.room_id
                                ? 'bg-hotel-gold text-white hover:bg-hotel-gold/90'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRoom(room);
                                // Track add_cart (room selection)
                                import('@/utils/ga4Analytics').then(({ trackAddToCart }) => {
                                  trackAddToCart({
                                    item_id: room.room_id,
                                    item_name: roomName,
                                    item_category: 'Room',
                                    price: Number(room.price_adjustment) || 0,
                                    quantity: 1,
                                    currency: 'IDR'
                                  });
                                });
                              }}
                            >
                              {selectedRoom?.room_id === room.room_id ? (
                                <>
                                  <Check className="w-4 h-4 mr-1.5 inline" />
                                  SELECTED
                                </>
                              ) : (
                                'SELECT ROOM'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Booking Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
              <h2 className="font-display text-lg md:text-xl font-medium text-hotel-charcoal mb-5 flex items-center gap-2">
                <Tag className="w-5 h-5 text-hotel-gold" />
                Booking Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                {/* Valid Period */}
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-11 md:h-11 bg-hotel-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 md:w-5.5 md:h-5.5 text-hotel-gold" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-hotel-charcoal">Valid Period</h4>
                    <p className="text-xs md:text-sm text-hotel-bronze mt-0.5 leading-relaxed">
                      {pkg.valid_from && pkg.valid_until
                        ? `${new Date(pkg.valid_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(pkg.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : 'Available year-round'
                      }
                    </p>
                  </div>
                </div>

                {/* Stay Duration */}
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-11 md:h-11 bg-hotel-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 md:w-5.5 md:h-5.5 text-hotel-gold" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-hotel-charcoal">Stay Duration</h4>
                    <p className="text-xs md:text-sm text-hotel-bronze mt-0.5 leading-relaxed">{pkg.duration || 'Flexible duration'}</p>
                  </div>
                </div>

                {/* Max Guests */}
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-11 md:h-11 bg-hotel-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 md:w-5.5 md:h-5.5 text-hotel-gold" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-hotel-charcoal">Guests</h4>
                    <p className="text-xs md:text-sm text-hotel-bronze mt-0.5 leading-relaxed">Up to {pkg.max_guests || 2} guests</p>
                  </div>
                </div>

                {/* Room Selection */}
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-11 md:h-11 bg-hotel-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 md:w-5.5 md:h-5.5 text-hotel-gold" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-hotel-charcoal">Room Selection</h4>
                    <p className="text-xs md:text-sm text-hotel-bronze mt-0.5 leading-relaxed">Dedicated room included</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
              <h2 className="font-display text-lg md:text-xl font-medium text-hotel-charcoal mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-hotel-gold" />
                Terms & Conditions
              </h2>
              <p className="text-xs md:text-sm text-hotel-bronze leading-relaxed">
                Standard villa booking terms apply. Packages are subject to availability and blackout dates may apply.
              </p>
            </div>
          </div>

          {/* Right Section - Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 sticky top-6 overflow-hidden">
              {/* Header */}
              <div className="bg-hotel-cream border-b border-gray-100 p-5 md:p-6">
                <h3 className="font-display text-base md:text-lg font-medium text-hotel-charcoal">Booking Summary</h3>
              </div>

              {/* Summary Details */}
              <div className="p-5 md:p-6 space-y-3.5">
                <div className="flex justify-between text-sm">
                  <span className="text-hotel-bronze">Package</span>
                  <span className="font-medium text-hotel-charcoal text-right max-w-[55%] leading-snug">{pkg.name}</span>
                </div>

                {selectedRoom && (
                  <div className="flex justify-between text-sm">
                    <span className="text-hotel-bronze">Room Type</span>
                    <span className="font-medium text-hotel-charcoal">{selectedRoom.name}</span>
                  </div>
                )}

                {pkg.duration && (
                  <div className="flex justify-between text-sm">
                    <span className="text-hotel-bronze">Duration</span>
                    <span className="font-medium text-hotel-charcoal">{pkg.duration}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-hotel-bronze">Guests</span>
                  <span className="font-medium text-hotel-charcoal">{guests} guests</span>
                </div>

                <hr className="border-gray-100 my-4" />

                <div className="flex justify-between text-sm">
                  <span className="text-hotel-bronze">Base Price</span>
                  <span className="font-medium text-hotel-charcoal">{formatRupiah(basePrice)}</span>
                </div>

                {selectedRoom && selectedRoom.price_adjustment !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-hotel-bronze">Room Adjustment</span>
                    <span className={`font-medium ${selectedRoom.price_adjustment > 0 ? 'text-hotel-gold' : 'text-green-600'}`}>
                      {selectedRoom.adjustment_type === 'percentage'
                        ? `${selectedRoom.price_adjustment > 0 ? '+' : ''}${selectedRoom.price_adjustment}%`
                        : `${selectedRoom.price_adjustment > 0 ? '+' : ''}${formatRupiah(selectedRoom.price_adjustment)}`
                      }
                    </span>
                  </div>
                )}

                {discountPercentage > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-hotel-bronze">Discount</span>
                    <span className="font-medium text-green-600">-{discountPercentage}%</span>
                  </div>
                )}

                <hr className="border-gray-100 my-4" />

                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-hotel-charcoal text-sm">Total Amount</span>
                  <span className="text-xl md:text-2xl font-bold text-hotel-gold">{formatRupiah(finalPrice)}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-4">
                  <Button
                    onClick={handleBookNow}
                    className="w-full bg-hotel-gold hover:bg-hotel-gold/90 text-white font-semibold py-3 text-sm uppercase tracking-wide"
                  >
                    Book Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-200 text-hotel-bronze hover:bg-gray-50 font-medium text-sm"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Add to Wishlist
                  </Button>
                </div>

                {/* Contact Info */}
                {villaInfo && (
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <h4 className="font-medium text-sm text-hotel-charcoal mb-2">Need Assistance?</h4>
                    <p className="text-xs text-hotel-bronze mb-3 leading-relaxed">Our concierge team is available 24/7 to help you plan your perfect stay.</p>
                    {villaInfo.phone && (
                      <a href={`tel:${villaInfo.phone}`} className="flex items-center gap-2 text-hotel-gold hover:underline font-medium text-sm">
                        <Phone className="w-4 h-4" />
                        {villaInfo.phone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );


};

export default PackageDetails;
