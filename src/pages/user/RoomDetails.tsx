import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Bed,
  Home,
  Star,
  ArrowLeft,
  Check,
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  Bath,
  MapPin,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import { Room, Amenity } from '@/types';
import { paths } from '@/config/paths';
import { getRoomImages, getImageProps } from '@/utils/images';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

// Icon mapping for amenities
const amenityIconMap: { [key: string]: React.ReactNode } = {
  'wifi': <Wifi className="w-5 h-5" />,
  'parking': <Car className="w-5 h-5" />,
  'coffee': <Coffee className="w-5 h-5" />,
  'tv': <Tv className="w-5 h-5" />,
  'ac': <Wind className="w-5 h-5" />,
  'bathroom': <Bath className="w-5 h-5" />,
  'default': <Check className="w-5 h-5" />
};

// Default theme colors for room details
const roomTheme = {
  colors: {
    primary: '#3b82f6',    // blue-500
    secondary: '#2563eb',  // blue-600
  }
};

const RoomDetails: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [roomAmenities, setRoomAmenities] = useState<Amenity[]>([]);
  const [villaInfo, setVillaInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);

  // Get room images - prioritize database images over structured folder images
  const getDynamicRoomImages = (): string[] => {
    if (!room) return [];

    const images: string[] = [];

    // Add images from database (room.images field)
    if (room.images && Array.isArray(room.images)) {
      images.push(...room.images.filter(img => img && img.trim() !== ''));
    }

    // Add primary image from database
    if (room.image_url && room.image_url.trim() !== '') {
      // Only add if not already included
      if (!images.includes(room.image_url)) {
        images.unshift(room.image_url); // Add as first image
      }
    }

    // Fallback to structured images if no database images
    if (images.length === 0) {
      const roomImages = getRoomImages(room.id);
      if (roomImages) {
        images.push(roomImages.main, ...roomImages.gallery);
      }
    }

    // Filter out empty/invalid URLs
    return images.filter(img => img && img.trim() !== '');
  };

  const allImages = getDynamicRoomImages();

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails(roomId);
      fetchRoomAmenities(roomId);
      fetchVillaInfo();
    }
  }, [roomId]);

  const fetchRoomDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(paths.buildApiUrl(`rooms/${id}`));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setRoom(result.data);
      } else {
        throw new Error('Room not found');
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
      setError('Failed to load room details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomAmenities = async (roomId: string) => {
    try {
      const response = await fetch(paths.buildApiUrl(`rooms/${roomId}/amenities`));

      if (!response.ok) {
        console.warn('Could not fetch room amenities');
        return;
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setRoomAmenities(result.data);
      }
    } catch (err) {
      console.warn('Error fetching room amenities:', err);
      // Non-critical error, don't show to user
    }
  };

  const fetchVillaInfo = async () => {
    try {
      const response = await fetch(paths.buildApiUrl('villa'));

      if (!response.ok) {
        console.warn('Could not fetch villa info');
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        setVillaInfo(result.data);
      }
    } catch (err) {
      console.warn('Error fetching villa info:', err);
      // Non-critical error, don't show to user
    }
  };

  const handleBookNow = () => {
    if (room) {
      navigate(`/book/${room.id}`);
    }
  };

  const handleBackToRooms = () => {
    navigate('/#rooms');
  };

  // Parse features from JSON string or array
  const parseFeatures = (featuresData: string | string[]): string[] => {
    try {
      if (!featuresData) return [];

      // If already an array, return it
      if (Array.isArray(featuresData)) {
        return featuresData;
      }

      // If string, try to parse JSON
      if (typeof featuresData === 'string') {
        // If it looks like JSON, parse it
        if (featuresData.startsWith('[') || featuresData.startsWith('{')) {
          return JSON.parse(featuresData);
        }
        // If it's a comma-separated string, split it
        if (featuresData.includes(',')) {
          return featuresData.split(',').map(f => f.trim()).filter(f => f.length > 0);
        }
        // Single feature
        return [featuresData];
      }

      return [];
    } catch (error) {
      console.warn('Error parsing features:', error, featuresData);
      return [];
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate('/')}
                className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                Rumah Daisy Cantik
              </button>
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate('/')}
                className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                Rumah Daisy Cantik
              </button>
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Room Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The room you are looking for could not be found.'}</p>
            <button
              onClick={handleBackToRooms}
              className="text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
              style={{ backgroundColor: roomTheme.colors.primary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = roomTheme.colors.secondary}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = roomTheme.colors.primary}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Rooms
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const features = parseFeatures(room.features);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shared Header Component */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <Header />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={handleBackToRooms}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to All Rooms
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                {allImages.length > 0 ? (
                  <>
                    <img
                      {...getImageProps(allImages[currentImageIndex], room.name)}
                      className="w-full h-96 object-cover cursor-pointer"
                      onClick={() => setShowFullGallery(true)}
                    />
                    {allImages.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                    <Home className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Image thumbnails */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative rounded overflow-hidden ${currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                        }`}
                    >
                      <img
                        {...getImageProps(image, room.name)}
                        className="w-full h-20 object-cover"
                      />
                      {index === 3 && allImages.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-medium">
                          +{allImages.length - 4}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Room Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${roomTheme.colors.primary}20`, color: roomTheme.colors.primary }}>
                    {room.type || 'Standard Room'}
                  </span>
                  {(room.available === undefined || room.available === 1 || room.available === true) && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      Available
                    </span>
                  )}
                  {room.available === 0 && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                      Unavailable
                    </span>
                  )}
                  {room.capacity && room.capacity > (villaInfo?.max_guests || 8) && (
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                      Large Group Friendly
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{room.name}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {room.description || `Experience comfort and luxury in our ${room.type || 'beautiful'} room. 
                  Perfect for ${room.capacity || room.occupancy || 2} guests, this room offers modern amenities 
                  and a peaceful atmosphere for your stay.`}
                </p>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Capacity</span>
                    <p className="font-semibold">{room.capacity || room.occupancy} guests</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Size</span>
                    <p className="font-semibold">{room.size || 'Contact us'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Bed className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Beds</span>
                    <p className="font-semibold">{room.beds || 'Standard bed'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Price</span>
                    <p className="font-semibold text-xl" style={{ color: roomTheme.colors.primary }}>
                      {villaInfo?.currency === 'IDR' ? 'Rp ' : '$'}
                      {room.price}/night
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking CTA */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {villaInfo?.currency === 'IDR' ? 'Rp ' : '$'}{room.price}
                    </p>
                    <p className="text-sm text-gray-500">per night</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{villaInfo?.rating || '4.8'}</span>
                    <span className="text-sm text-gray-500">
                      ({villaInfo?.reviews || '24'} reviews)
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleBookNow}
                  className="w-full text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: roomTheme.colors.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = roomTheme.colors.secondary}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = roomTheme.colors.primary}
                >
                  Book This Room
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Free cancellation • Instant confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Room Features */}
          <div className="lg:col-span-2 space-y-8">
            {features.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Amenities */}
            {roomAmenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roomAmenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {amenityIconMap[amenity.icon?.toLowerCase()] || amenityIconMap.default}
                      <span className="text-gray-700">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policies */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Policies</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Check-in / Check-out
                  </h3>
                  <p className="text-gray-600">
                    Check-in: {villaInfo?.checkInTime || villaInfo?.check_in_time || '3:00 PM'} |
                    Check-out: {villaInfo?.checkOutTime || villaInfo?.check_out_time || '11:00 AM'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h3>
                  <p className="text-gray-600">
                    {villaInfo?.cancellationPolicy || villaInfo?.cancellation_policy || 'Free cancellation up to 24 hours before check-in'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">House Rules</h3>
                  {(villaInfo?.houseRules || villaInfo?.house_rules) ? (
                    <div className="text-gray-600 whitespace-pre-line leading-relaxed">
                      {villaInfo?.houseRules || villaInfo?.house_rules}
                    </div>
                  ) : (
                    <ul className="text-gray-600 space-y-1">
                      <li>• No smoking inside the room</li>
                      <li>• No pets allowed</li>
                      <li>• Quiet hours: 10 PM - 8 AM</li>
                      <li>• Maximum guests: {room.capacity || room.occupancy}</li>
                    </ul>
                  )}
                </div>
                {/* Terms & Conditions - if available */}
                {(villaInfo?.termsConditions || villaInfo?.terms_conditions) && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                    <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
                      {villaInfo?.termsConditions || villaInfo?.terms_conditions}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Your Stay</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in / Check-out
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 cursor-pointer hover:border-blue-500 transition-colors">
                    <Calendar className="w-5 h-5 text-gray-400 mb-1" />
                    <p className="text-sm text-gray-500">Select dates</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 cursor-pointer hover:border-blue-500 transition-colors">
                    <Users className="w-5 h-5 text-gray-400 mb-1" />
                    <p className="text-sm text-gray-500">1 guest</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                className="w-full text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: roomTheme.colors.primary }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = roomTheme.colors.secondary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = roomTheme.colors.primary}
              >
                Reserve Now
              </button>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Price per night</span>
                  <span>{villaInfo?.currency === 'IDR' ? 'Rp ' : '$'}{room.price}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Service fee</span>
                  <span>Calculated at checkout</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{villaInfo?.currency === 'IDR' ? 'Rp ' : '$'}{room.price}</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                {villaInfo?.phone && (
                  <a
                    href={`tel:${villaInfo.phone}`}
                    className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{villaInfo.phone}</span>
                  </a>
                )}
                {villaInfo?.email && (
                  <a
                    href={`mailto:${villaInfo.email}`}
                    className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span>{villaInfo.email}</span>
                  </a>
                )}
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>
                    {villaInfo?.location ||
                      (villaInfo?.city && villaInfo?.state ?
                        `${villaInfo.city}, ${villaInfo.state}` :
                        (villaInfo?.address ? villaInfo.address : 'Colorado, United States'))}
                  </span>
                </div>
                {/* Fallback contact if no dynamic data */}
                {!villaInfo?.phone && !villaInfo?.email && (
                  <>
                    <a
                      href="tel:+1234567890"
                      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Contact phone not set</span>
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Contact email not set</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Gallery Modal */}
      {showFullGallery && allImages.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button
            onClick={() => setShowFullGallery(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              {...getImageProps(allImages[currentImageIndex], room.name)}
              className="max-w-full max-h-full object-contain"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                  className="absolute left-4 text-white hover:text-gray-300"
                >
                  <ArrowLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 text-white hover:text-gray-300"
                >
                  <ArrowLeft className="w-8 h-8 rotate-180" />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RoomDetails;