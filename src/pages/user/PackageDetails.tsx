import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { PhotoGallery } from '@/components/PhotoGallery';
import RoomImageGallery from '@/components/RoomImageGallery';
import Header from '@/components/Header';
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
  PartyPopper
} from 'lucide-react';
import NotFound from '../shared/NotFound';
import BookingSkeleton from '@/components/BookingSkeleton';

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

  // Check if package is inactive - redirect to not found for customers
  if (!pkg.available) {
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
    navigate(`/book?package=${pkg.id}`);
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

  return (
    <div style={{
      '--t-brand-primary-color': packageTheme.colors.primary,
      '--t-brand-secondary-color': packageTheme.colors.secondary,
      '--t-brand-tertiary-color': packageTheme.colors.accent,
      '--t-brand-bg-color': '#ffffff',
      '--t-brand-fg-color': packageTheme.colors.text,
      '--t-text-primary': packageTheme.colors.text,
      '--t-text-secondary': '#666666',
      '--t-text-muted': '#999999',
      '--t-horizontal-vertical-rule': '#e5e7eb',
      '--t-border-light': '#f1f5f9',
      '--t-button-primary-bg': packageTheme.colors.primary,
      '--t-button-primary-hover': packageTheme.colors.secondary,
      '--t-cards-border-radius': packageTheme.layout.borderRadius,
      background: packageTheme.colors.background
    } as React.CSSProperties} className="min-h-screen">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Hotel Header - Shared Component */}
        <section className="mb-8">
          <Header />

          {/* Full-Width Photo Gallery Hero (same as homepage) */}
          <div className="mb-8">
            <div className="relative">
              <PhotoGallery images={getPackageImages()} />

              {/* Package Badge Overlay */}
              <div className="absolute top-6 left-6 z-10">
                <span className="text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: packageTheme.colors.primary }}>
                  {packageConfig.badge}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Two-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main Content - Package First Layout */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Info Section */}
            <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
              <div className="p-8">
                <div className="text-sm font-semibold uppercase tracking-wider mb-2"
                  style={{ color: packageTheme.colors.primary }}>
                  {(pkg as any).category_label || packageConfig.badge}
                </div>
                <h1 className={`text-5xl ${packageTheme.typography.headingStyle} text-hotel-navy mb-6`}
                  style={{ fontFamily: packageTheme.typography.fontFamily }}>
                  {pkg.name}
                </h1>
                <p className="text-lg text-hotel-bronze mb-8 leading-relaxed">
                  {pkg.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-gray-200">
                    {pkg.duration_days ? `${pkg.duration_days} Days` : `${pkg.min_nights || 1}-${pkg.max_nights || 30} Nights`}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-gray-200">
                    Max {pkg.max_guests} Guests
                  </span>
                  {discountPercentage > 0 && (
                    <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {discountPercentage}% OFF
                    </span>
                  )}
                  {((pkg as any).tags || packageConfig.tags).map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-gray-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Dates Selector - Always Visible */}
            <div className="bg-hotel-cream border border-hotel-gold-light rounded-lg shadow-sm mb-8">
              <div className="p-6">
                {(checkIn && checkOut) ? (
                  // Show selected dates
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <Calendar className="h-6 w-6 mr-4 mt-1 text-hotel-gold" />
                        <div>
                          <h3 className="text-xl font-semibold text-hotel-navy mb-2">Selected Dates</h3>
                          <p className="text-lg text-hotel-bronze mb-2">
                            {new Date(checkIn).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            {' - '}
                            {new Date(checkOut).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-hotel-bronze">
                            For {guests} guest{guests > 1 ? 's' : ''} • {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} night{Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="flex items-center text-hotel-navy border-hotel-gold hover:bg-hotel-gold hover:text-white transition-colors"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Change Dates
                      </Button>
                    </div>

                    {/* Calendar Edit Mode */}
                    {showCalendar && (
                      <div className="mt-4 p-3 bg-white rounded-md border border-hotel-gold-light">
                        <div className="flex items-center gap-3 flex-wrap">
                          <input
                            type="date"
                            value={tempCheckIn}
                            onChange={(e) => setTempCheckIn(e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-hotel-gold focus:border-hotel-gold"
                            min={new Date().toISOString().split('T')[0]}
                          />
                          <span className="text-gray-400 text-sm">to</span>
                          <input
                            type="date"
                            value={tempCheckOut}
                            onChange={(e) => setTempCheckOut(e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-hotel-gold focus:border-hotel-gold"
                            min={tempCheckIn || new Date().toISOString().split('T')[0]}
                          />
                          <select
                            value={guests}
                            onChange={(e) => {
                              const newGuests = parseInt(e.target.value);
                              const newSearchParams = new URLSearchParams(window.location.search);
                              newSearchParams.set('guests', newGuests.toString());
                              navigate(`${window.location.pathname}?${newSearchParams.toString()}`, { replace: true });
                            }}
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-hotel-gold focus:border-hotel-gold"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                              <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (tempCheckIn && tempCheckOut) {
                                const newSearchParams = new URLSearchParams(window.location.search);
                                newSearchParams.set('checkin', tempCheckIn);
                                newSearchParams.set('checkout', tempCheckOut);
                                navigate(`${window.location.pathname}?${newSearchParams.toString()}`, { replace: true });
                                setShowCalendar(false);
                              }
                            }}
                            disabled={!tempCheckIn || !tempCheckOut || new Date(tempCheckOut) <= new Date(tempCheckIn)}
                            className="bg-hotel-gold text-white hover:bg-hotel-navy text-xs px-3 py-1"
                          >
                            Update
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setTempCheckIn(checkIn || '');
                              setTempCheckOut(checkOut || '');
                              setShowCalendar(false);
                            }}
                            className="border-hotel-bronze text-hotel-bronze hover:bg-hotel-bronze hover:text-white text-xs px-3 py-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Show date picker when no dates selected
                  <div>
                    <div className="flex items-start mb-4">
                      <Calendar className="h-6 w-6 mr-4 mt-1 text-hotel-gold" />
                      <div>
                        <h3 className="text-xl font-semibold text-hotel-navy mb-2">Select Your Dates</h3>
                        <p className="text-sm text-hotel-bronze">Choose your check-in and check-out dates to continue</p>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-md border border-hotel-gold-light">
                      <div className="flex items-center gap-3 flex-wrap">
                        <input
                          type="date"
                          value={tempCheckIn}
                          onChange={(e) => setTempCheckIn(e.target.value)}
                          placeholder="Check-in"
                          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-hotel-gold focus:border-hotel-gold"
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="date"
                          value={tempCheckOut}
                          onChange={(e) => setTempCheckOut(e.target.value)}
                          placeholder="Check-out"
                          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-hotel-gold focus:border-hotel-gold"
                          min={tempCheckIn || new Date().toISOString().split('T')[0]}
                        />
                        <select
                          value={guests}
                          onChange={(e) => {
                            const newGuests = parseInt(e.target.value);
                            const newSearchParams = new URLSearchParams(window.location.search);
                            newSearchParams.set('guests', newGuests.toString());
                            navigate(`${window.location.pathname}?${newSearchParams.toString()}`, { replace: true });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-hotel-gold focus:border-hotel-gold"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                            <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                        <Button
                          onClick={() => {
                            if (tempCheckIn && tempCheckOut) {
                              const newSearchParams = new URLSearchParams(window.location.search);
                              newSearchParams.set('checkin', tempCheckIn);
                              newSearchParams.set('checkout', tempCheckOut);
                              navigate(`${window.location.pathname}?${newSearchParams.toString()}`, { replace: true });
                            }
                          }}
                          disabled={!tempCheckIn || !tempCheckOut || new Date(tempCheckOut) <= new Date(tempCheckIn)}
                          className="bg-hotel-gold text-white hover:bg-hotel-navy px-6 py-2"
                        >
                          Apply Dates
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Package Overview with Inclusions */}
            <div className="bg-white border border-gray-200 rounded shadow-sm">
              <div className="p-8">
                <h2 className={`text-3xl ${packageTheme.typography.headingStyle} mb-4 text-hotel-navy`}
                  style={{ fontFamily: packageTheme.typography.fontFamily }}>
                  {(pkg as any).overview_title || 'Package Overview'}
                </h2>
                <p className="text-base text-hotel-bronze mb-6">
                  {(pkg as any).overview_subtitle || `A ${(pkg.type || (pkg as any).package_type)?.toLowerCase()} escape crafted for unforgettable moments together`}
                </p>

                <p className="text-lg text-hotel-bronze leading-relaxed mb-8">
                  Experience luxury redefined with thoughtful touches designed for those seeking a
                  memorable escape. Every moment has been carefully orchestrated to create lasting memories through
                  premium accommodations, personalized service, and exclusive amenities.
                </p>

                {/* Package Inclusions (Compact) */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-semibold text-hotel-navy mb-3 uppercase tracking-wide">
                    What's Included
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {!inclusionsLoading && packageInclusions.length > 0 ? (
                      packageInclusions.slice(0, 6).map((inclusion) => (
                        <span
                          key={inclusion.inclusion_id}
                          className="inline-flex items-center text-sm text-gray-600 bg-teal-50 px-3 py-2 rounded-full border border-teal-100 font-medium"
                        >
                          ✓ {inclusion.name}
                        </span>
                      ))
                    ) : (
                      parseInclusions(pkg.inclusions || pkg.includes).slice(0, 6).map((item, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center text-sm text-gray-600 bg-teal-50 px-3 py-2 rounded-full border border-teal-100 font-medium"
                        >
                          ✓ {item}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities moved to sidebar (compact) */}

            {/* Room Selection - Row Style */}
            <div className="bg-white border border-gray-200 rounded shadow-sm">
              <div className="p-8 border-b border-gray-200">
                <h2 className={`text-3xl ${packageTheme.typography.headingStyle} mb-4 text-gray-900`}
                  style={{ fontFamily: packageTheme.typography.fontFamily }}>
                  {(pkg as any).rooms_title || 'Choose Your Room'}
                </h2>
                <p className="text-base text-gray-600">
                  {(pkg as any).rooms_subtitle || 'Select from our available room types for this package'}
                </p>
              </div>

              <div className="p-8">
                <div className="space-y-4">
                  {/* Real Package-Room Relationships from Database */}
                  {!roomsLoading && packageRooms && packageRooms.length > 0 ? (
                    packageRooms
                      .sort((a, b) => a.availability_priority - b.availability_priority)
                      .map((room, index) => (
                        <div
                          key={room.id}
                          className="flex items-center gap-6 p-6 border-2 rounded cursor-pointer transition-all hover:shadow-md"
                          style={{
                            borderColor: selectedRoom?.id === room.id ? packageTheme.colors.primary : '#e5e7eb',
                            backgroundColor: selectedRoom?.id === room.id ? `${packageTheme.colors.primary}10` : 'white'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = `${packageTheme.colors.accent}80`}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = selectedRoom?.id === room.id ? packageTheme.colors.primary : '#e5e7eb'}
                        >
                          {/* Room Image Gallery - Clickable for Lightbox */}
                          <div
                            className="flex-shrink-0 w-32 cursor-pointer group"
                            onClick={(e) => {
                              e.stopPropagation();
                              openRoomLightbox(room);
                            }}
                          >
                            <div className="relative">
                              <RoomImageGallery
                                roomId={room.room_id}
                                roomName={room.room_name}
                                roomType={room.type || room.room_type}
                                fallbackStrategy="room_type"
                                className="h-24"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">Click to enlarge</span>
                              </div>
                            </div>
                          </div>

                          {/* Room Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-medium text-hotel-navy mb-2"
                                  style={{ fontFamily: packageTheme.typography.fontFamily }}>
                                  {room.room_name}
                                </h3>
                                <div className="text-lg font-semibold" style={{ color: packageTheme.colors.primary }}>
                                  {room.adjustment_type === 'percentage'
                                    ? `${room.price_adjustment > 0 ? '+' : ''}${room.price_adjustment}%`
                                    : `${room.price_adjustment > 0 ? '+' : ''}$${Math.abs(room.price_adjustment).toLocaleString()}`
                                  }
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-3 text-sm">
                              {room.description || 'Premium room option for this package with quality amenities and services.'}
                            </p>
                            <div className="flex gap-3">
                              <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                                Package Room
                              </span>
                              {room.max_occupancy_override && (
                                <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                                  Max {room.max_occupancy_override} Guests
                                </span>
                              )}
                              {room.is_default && (
                                <span
                                  className="text-xs font-medium text-white px-2 py-1 rounded-full"
                                  style={{ backgroundColor: packageTheme.colors.primary }}
                                >
                                  Default Choice
                                </span>
                              )}
                              <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                                Priority {room.availability_priority}
                              </span>
                            </div>
                          </div>

                          {/* Select Button */}
                          <div className="flex-shrink-0">
                            <button
                              className="px-6 py-3 text-sm font-semibold uppercase tracking-wide border-2 rounded transition-colors min-w-32"
                              style={{
                                backgroundColor: selectedRoom?.id === room.id ? packageTheme.colors.primary : 'white',
                                color: selectedRoom?.id === room.id ? 'white' : packageTheme.colors.primary,
                                borderColor: packageTheme.colors.primary
                              }}
                              onMouseEnter={(e) => {
                                if (selectedRoom?.id !== room.id) {
                                  e.currentTarget.style.backgroundColor = packageTheme.colors.primary;
                                  e.currentTarget.style.color = 'white';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedRoom?.id !== room.id) {
                                  e.currentTarget.style.backgroundColor = 'white';
                                  e.currentTarget.style.color = packageTheme.colors.primary;
                                }
                              }}
                              onClick={() => setSelectedRoom(room)}
                            >
                              {selectedRoom?.id === room.id ? 'Selected' : 'Select Room'}
                            </button>
                          </div>
                        </div>
                      ))
                  ) : roomsLoading ? (
                    // Loading state for rooms
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  ) : (
                    // No package-room relationships found
                    <div className="text-center py-8 text-gray-500">
                      <h4 className="text-lg font-medium mb-2">No Room Options Configured</h4>
                      <p className="text-sm mb-4">
                        This package does not have specific room assignments. Please contact us to check availability.
                      </p>
                      <Button
                        onClick={handleBookNow}
                        style={{
                          backgroundColor: packageTheme.colors.primary,
                          borderColor: packageTheme.colors.primary
                        }}
                      >
                        Book Package
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Legacy Room Options Support */}
            {!pkg.available_rooms && pkg.room_options && pkg.room_options.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" style={{ color: packageTheme.colors.primary }} />
                    Available Rooms
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {(pkg.available_rooms || pkg.room_options || []).map((room, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {room.room_name || room.name}
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {room.is_default && (
                                <Badge className="text-xs text-white" style={{ backgroundColor: packageTheme.colors.primary }}>
                                  Default Choice
                                </Badge>
                              )}
                              {room.availability_priority && (
                                <Badge variant="outline" className="text-xs border-gray-400 text-gray-600">
                                  Priority {room.availability_priority}
                                </Badge>
                              )}
                              {room.max_occupancy && (
                                <Badge variant="outline" className="text-xs border-green-400 text-green-600">
                                  <Users className="h-3 w-3 mr-1" />
                                  Up to {room.max_occupancy} guests
                                </Badge>
                              )}
                            </div>
                            {room.description && (
                              <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-semibold text-gray-900 text-lg">
                              ${(() => {
                                const price = room.final_price || room.price_override || basePrice;
                                return typeof price === 'number' ? price.toFixed(2) : (parseFloat(price) || basePrice).toFixed(2);
                              })()}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">AUD / Night</div>
                            {room.price_adjustment && room.adjustment_type && (
                              <div className="text-xs text-gray-500 mt-1">
                                {room.adjustment_type === 'percentage' ?
                                  `${room.price_adjustment > 0 ? '+' : ''}${room.price_adjustment}%` :
                                  `${room.price_adjustment > 0 ? '+' : ''}$${Math.abs(room.price_adjustment)}`
                                }
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Room Features */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              Premium Location
                            </span>
                            {room.max_occupancy && (
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {room.max_occupancy} guests
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="text-white border-0"
                            style={{ backgroundColor: packageTheme.colors.primary }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = packageTheme.colors.secondary}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = packageTheme.colors.primary}
                            onClick={() => navigate(`/book?package=${pkg.id}&room=${room.room_id || room.id}`)}
                          >
                            Select Room
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Room Selection Note */}
                  <div className="mt-4 p-3 bg-hotel-cream rounded-lg border border-hotel-gold-light">
                    <div className="flex items-start">
                      <Gift className="h-4 w-4 text-hotel-gold mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-hotel-navy font-medium mb-1">Room Selection</p>
                        <p className="text-hotel-bronze text-xs">
                          All rooms include the same package benefits. Room prices may vary based on location, size, and amenities.
                          Default room is automatically selected during booking.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Package Validity & Booking Information */}
            {(pkg.valid_from || pkg.valid_until || pkg.min_nights || pkg.max_nights || pkg.booking_advance_days) && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" style={{ color: packageTheme.colors.primary }} />
                    Booking Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">

                    {(pkg.valid_from || pkg.valid_until) && (
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 mr-3 mt-0.5" style={{ color: packageTheme.colors.primary }} />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Valid Period</h4>
                          <p className="text-sm text-gray-600">
                            {pkg.valid_from && new Date(pkg.valid_from).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            {pkg.valid_from && pkg.valid_until && ' - '}
                            {pkg.valid_until && new Date(pkg.valid_until).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {(pkg.min_nights || pkg.max_nights) && (
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 mr-3 mt-0.5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Stay Duration</h4>
                          <p className="text-sm text-gray-600">
                            {pkg.min_nights && `Minimum ${pkg.min_nights} night${pkg.min_nights > 1 ? 's' : ''}`}
                            {pkg.min_nights && pkg.max_nights && ' • '}
                            {pkg.max_nights && `Maximum ${pkg.max_nights} night${pkg.max_nights > 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {pkg.booking_advance_days && (
                      <div className="flex items-start">
                        <Tag className="h-5 w-5 mr-3 mt-0.5 text-orange-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Advance Booking</h4>
                          <p className="text-sm text-gray-600">
                            Book at least {pkg.booking_advance_days} day{pkg.booking_advance_days > 1 ? 's' : ''} in advance
                          </p>
                        </div>
                      </div>
                    )}

                    {pkg.room_selection_type && (
                      <div className="flex items-start">
                        <Home className="h-5 w-5 mr-3 mt-0.5 text-purple-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Room Selection</h4>
                          <p className="text-sm text-gray-600">
                            {pkg.room_selection_type === 'multiple' ? 'Choose from available room options' :
                              pkg.room_selection_type === 'upgrade' ? 'Base room with upgrade options' :
                                'Dedicated room included'}
                          </p>
                          {pkg.allow_room_upgrades && (
                            <div className="mt-1 text-xs text-green-600">
                              ✓ Upgrades available ({pkg.upgrade_price_calculation} pricing)
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Package Exclusions */}
            {pkg.exclusions && pkg.exclusions.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Archive className="h-5 w-5 mr-2 text-red-600" />
                    Not Included
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid gap-3">
                    {pkg.exclusions.map((exclusion, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-red-400 rounded-full mr-3 flex-shrink-0"></div>
                        {exclusion}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            {pkg.cancellation_policy && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2" style={{ color: packageTheme.colors.primary }} />
                    Cancellation Policy
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {pkg.cancellation_policy}
                  </p>
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-gray-600" />
                Terms & Conditions
              </h3>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>{pkg.terms_conditions || pkg.terms || 'Standard villa booking terms apply. Packages are subject to availability and blackout dates may apply.'}</p>

                {pkg.room_selection_type === 'upgrade' && (
                  <div className="p-3 rounded border" style={{ backgroundColor: `${packageTheme.colors.primary}10`, borderColor: `${packageTheme.colors.primary}40` }}>
                    <strong style={{ color: packageTheme.colors.secondary }}>Room Upgrades:</strong>
                    <span style={{ color: packageTheme.colors.text }}> Upgrade pricing is calculated using {
                      pkg.upgrade_price_calculation === 'percentage' ? 'percentage-based adjustments' :
                        pkg.upgrade_price_calculation === 'per_night' ? 'per-night rates' :
                          'fixed pricing'
                    }. Upgrades are subject to availability at time of booking.</span>
                  </div>
                )}

                {pkg.room_selection_type === 'multiple' && (
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-800">Room Selection:</strong>
                    <span className="text-green-700"> Choose from available room options during booking. Each room option may have different pricing, amenities, and occupancy limits.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-10 space-y-6">
              {/* Booking Summary Card */}
              <div className="bg-white border border-gray-200 rounded shadow-sm">
                <div className="p-8">
                  <h3 className={`text-xl font-medium text-gray-900 mb-6 text-center`}
                    style={{ fontFamily: packageTheme.typography.fontFamily }}>
                    {(pkg as any).summary_title || 'Booking Summary'}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Package</span>
                      <span className="text-sm text-gray-900 font-medium">{pkg.name}</span>
                    </div>

                    {selectedRoom && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Room Type</span>
                        <span className="text-sm text-gray-900 font-medium">{selectedRoom.room_name}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Duration</span>
                      <span className="text-sm text-gray-900 font-medium">
                        {pkg.duration_days ? `${pkg.duration_days} days` : `${pkg.min_nights || 2} nights`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Guests</span>
                      <span className="text-sm text-gray-900 font-medium">{pkg.max_guests} {pkg.max_guests > 1 ? 'guests' : 'guest'}</span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Base Price</span>
                      <span className="text-sm text-gray-900 font-medium">
                        ${basePrice.toLocaleString()}
                      </span>
                    </div>

                    {selectedRoom && selectedRoom.price_adjustment !== 0 && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Room Adjustment</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {selectedRoom.adjustment_type === 'percentage'
                            ? `${selectedRoom.price_adjustment > 0 ? '+' : ''}${selectedRoom.price_adjustment}%`
                            : `${selectedRoom.price_adjustment > 0 ? '+' : ''}$${Math.abs(selectedRoom.price_adjustment).toLocaleString()}`
                          }
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t-2 font-semibold"
                      style={{ borderColor: packageTheme.colors.primary, color: packageTheme.colors.primary }}>
                      <span className="text-sm">Total Amount</span>
                      <span className="text-2xl font-bold">
                        ${finalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Compact Amenities & Features */}
                  {pkg.amenities && pkg.amenities.length > 0 && (
                    <div className="mt-8 border-t border-gray-200 pt-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {(showAllAmenities ? pkg.amenities : pkg.amenities.slice(0, 6)).map((amenity, index) => (
                          <span key={index} className="inline-flex items-center text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                            {amenity.name}
                          </span>
                        ))}
                      </div>
                      {pkg.amenities.length > 6 && (
                        <button
                          onClick={() => setShowAllAmenities(!showAllAmenities)}
                          className="mt-3 text-xs font-medium hover:underline"
                          style={{ color: packageTheme.colors.primary }}
                        >
                          {showAllAmenities ? 'Show Less' : `Show ${pkg.amenities.length - 6} More`}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-4 mt-8">
                    <Button
                      onClick={() => {
                        if (!checkIn || !checkOut) {
                          alert('Please select check-in and check-out dates first');
                          return;
                        }
                        const roomParam = selectedRoom ? `&room=${selectedRoom.room_id}` : '';
                        const dateParams = (checkIn && checkOut) ? `&checkin=${checkIn}&checkout=${checkOut}&guests=${guests}` : '';
                        // Pass package base price, room adjustment info, and final calculated price
                        const priceParams = `&basePrice=${basePrice}&finalPrice=${finalPrice}`;
                        const roomAdjustmentParams = selectedRoom ? `&roomAdjustment=${selectedRoom.price_adjustment}&adjustmentType=${selectedRoom.adjustment_type}` : '';
                        navigate(`/book?package=${pkg.id}${roomParam}${dateParams}${priceParams}${roomAdjustmentParams}`);
                      }}
                      disabled={!checkIn || !checkOut}
                      className="w-full text-white py-4 text-base font-semibold uppercase tracking-wide transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      style={{
                        backgroundColor: packageTheme.colors.primary,
                        borderColor: packageTheme.colors.primary
                      }}
                      onMouseEnter={(e) => {
                        if (checkIn && checkOut) {
                          e.currentTarget.style.backgroundColor = packageTheme.colors.secondary;
                        }
                      }}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = packageTheme.colors.primary}
                    >
                      {(pkg as any).cta_text || 'Book Now'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 py-3"
                      style={{
                        borderColor: packageTheme.colors.primary,
                        color: packageTheme.colors.primary
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = packageTheme.colors.primary;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = packageTheme.colors.primary;
                      }}
                    >
                      {(pkg as any).secondary_cta || 'Add to Wishlist'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div
                className="border rounded p-6 text-center"
                style={{
                  backgroundColor: packageTheme.colors.background,
                  borderColor: `${packageTheme.colors.primary}30`
                }}
              >
                <h4
                  className="text-base font-semibold mb-3"
                  style={{ color: packageTheme.colors.text }}
                >
                  {(pkg as any).contact_title || 'Need Assistance?'}
                </h4>
                <p
                  className="text-sm mb-4 leading-relaxed"
                  style={{ color: packageTheme.colors.secondary }}
                >
                  {(pkg as any).contact_description || 'Our concierge team is available 24/7 to help you plan your perfect stay.'}
                </p>
                <a
                  href={`tel:${getContactPhone()}`}
                  className="text-lg font-semibold hover:underline"
                  style={{ color: packageTheme.colors.primary }}
                >
                  {getContactPhone()}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Image Lightbox Dialog with Carousel */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 bg-white border-gray-200 overflow-hidden">
          <div className="relative w-full h-[85vh] flex flex-col">
            {/* Close hint */}
            <div className="absolute top-4 right-4 z-20 text-gray-500 text-xs">
              Press ESC or click outside to close
            </div>

            {/* Main Carousel Container */}
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
              {lightboxLoading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                  <p className="text-gray-600 text-sm">Loading images...</p>
                </div>
              ) : lightboxImages.length > 0 ? (
                <Carousel className="w-full max-w-4xl" opts={{ loop: true }}>
                  <CarouselContent>
                    {lightboxImages.map((imageUrl, index) => (
                      <CarouselItem key={index}>
                        <div className="flex items-center justify-center h-[65vh]">
                          <img
                            src={imageUrl}
                            alt={`${lightboxRoom?.room_name || 'Room'} - Image ${index + 1}`}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/ui/placeholder.svg';
                            }}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {lightboxImages.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2 bg-white/90 hover:bg-white border-gray-300 text-gray-700" />
                      <CarouselNext className="right-2 bg-white/90 hover:bg-white border-gray-300 text-gray-700" />
                    </>
                  )}
                </Carousel>
              ) : (
                <div className="text-gray-600 text-center">
                  <p>No images available</p>
                </div>
              )}
            </div>

            {/* Room Info Footer */}
            {lightboxRoom && (
              <div className="bg-white border-t border-gray-200 px-6 py-4 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{lightboxRoom.room_name}</h3>
                <p className="text-sm text-gray-600">
                  {lightboxRoom.description || `${lightboxRoom.type || lightboxRoom.room_type || 'Premium'} room option`}
                </p>
                {lightboxRoom.price_adjustment !== 0 && (
                  <p className="text-hotel-gold font-medium mt-1">
                    {lightboxRoom.adjustment_type === 'percentage'
                      ? `${lightboxRoom.price_adjustment > 0 ? '+' : ''}${lightboxRoom.price_adjustment}%`
                      : `${lightboxRoom.price_adjustment > 0 ? '+' : ''}$${Math.abs(lightboxRoom.price_adjustment).toLocaleString()}`
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default PackageDetails;

