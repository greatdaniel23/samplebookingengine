import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Room } from '@/types';
import { packageService } from '@/services/packageService';
import { useVillaInfo } from '@/hooks/useVillaInfo';
import { API_BASE_URL } from '@/config/paths';
// @ts-ignore
import ApiService from '@/services/api.js';
import { 
  CheckCircle2, 
  Calendar, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Download,
  Share2,
  Home,
  Package as PackageIcon,
  Clock,
  CreditCard,
  User,
  Gift,
  Star,
  ArrowRight
} from 'lucide-react';
import BookingSkeleton from '@/components/BookingSkeleton';

interface BookingSummaryData {
  bookingId: string;
  reference: string;
  packageId?: string;
  roomId?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  pricing: {
    basePrice: number;
    serviceFee: number;
    totalPrice: number;
  };
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

const BookingSummary = () => {
  console.log('📄 [BookingSummary] Component loaded');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { villaInfo } = useVillaInfo();
  
  // Get URL parameters
  const bookingRef = searchParams.get('ref');
  const packageId = searchParams.get('package');
  const roomId = searchParams.get('room');
  
  console.log('📄 [BookingSummary] URL params:', {
    bookingRef,
    packageId,
    roomId,
    allParams: Object.fromEntries(searchParams.entries())
  });

  // Dynamic contact information helpers
  const getContactPhone = () => {
    return villaInfo?.phone || "+1 (555) 123-4567";
  };

  const getContactEmail = () => {
    return villaInfo?.email || "support@villa.com";
  };
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingSummaryData | null>(null);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);

  const loadSummaryData = useCallback(async () => {
    console.log('📄 [BookingSummary] loadSummaryData started');
    try {
      setLoading(true);
      setError(null);

      // Check if we have required parameters
      if (!bookingRef) {
        throw new Error('Booking reference is required');
      }

      // Fetch actual booking data from API
      let bookingApiData = null;
      let isUsingFallbackData = false;
      
      try {
        const response = await fetch(`${API_BASE_URL}/bookings.php?reference=${bookingRef}`);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error(result.message || 'No booking data found');
        }
        
        bookingApiData = result.data;
        console.log('📄 [BookingSummary] Successfully loaded booking from API:', bookingApiData);
        
      } catch (apiError) {
        console.error('📄 [BookingSummary] Failed to load booking from API:', apiError);
        
        // Check if we have minimum required URL parameters to proceed
        const hasMinimumParams = searchParams.get('checkIn') && 
                                searchParams.get('checkOut') && 
                                searchParams.get('totalPrice');
        
        if (!hasMinimumParams) {
          throw new Error(`Unable to load booking data: ${apiError instanceof Error ? apiError.message : 'API failed'} and insufficient URL parameters provided`);
        }
        
        isUsingFallbackData = true;
        console.warn('📄 [BookingSummary] Using URL parameters as fallback data');
      }

      // Get dates from API or URL parameters
      const checkInDate = bookingApiData?.check_in || searchParams.get('checkIn');
      const checkOutDate = bookingApiData?.check_out || searchParams.get('checkOut');
      
      if (!checkInDate || !checkOutDate) {
        throw new Error('Check-in and check-out dates are required');
      }

      // Calculate nights from actual dates
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      if (nights <= 0) {
        throw new Error('Invalid date range: check-out must be after check-in');
      }

      // Create booking data from API response or URL parameters
      const bookingData: BookingSummaryData = {
        bookingId: bookingApiData?.id?.toString() || searchParams.get('bookingId') || 'UNKNOWN',
        reference: bookingRef,
        packageId: packageId || bookingApiData?.package_id || undefined,
        roomId: roomId || bookingApiData?.room_id || undefined,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: parseInt(searchParams.get('guests') || bookingApiData?.guests?.toString() || '2'),
        nights: nights,
        guestInfo: {
          firstName: searchParams.get('firstName') || bookingApiData?.guest_name?.split(' ')[0] || 'Guest',
          lastName: searchParams.get('lastName') || bookingApiData?.guest_name?.split(' ').slice(1).join(' ') || 'User',
          email: searchParams.get('email') || bookingApiData?.guest_email || 'guest@example.com',
          phone: searchParams.get('phone') || bookingApiData?.guest_phone || '+1234567890',
          specialRequests: searchParams.get('requests') || bookingApiData?.special_requests || undefined
        },
        pricing: {
          basePrice: parseFloat(searchParams.get('basePrice') || bookingApiData?.base_price || '300'),
          serviceFee: parseFloat(searchParams.get('serviceFee') || bookingApiData?.service_fee || '30'),
          totalPrice: parseFloat(searchParams.get('totalPrice') || bookingApiData?.total_price || '330')
        },
        status: bookingApiData?.status || 'confirmed',
        createdAt: bookingApiData?.created_at || new Date().toISOString()
      };

      console.log('📄 [BookingSummary] Setting booking data:', bookingData);
      setBookingData(bookingData);
      setIsUsingFallbackData(isUsingFallbackData);

      // Load package or room data using the ACTUAL booking data, not URL parameters
      const actualPackageId = bookingData.packageId;  // From authoritative booking data
      const actualRoomId = bookingData.roomId;        // From authoritative booking data

      if (actualPackageId) {
        try {
          const pkgResponse = await packageService.getPackageById(actualPackageId);
          setPackageData(pkgResponse.data);
          console.log('📄 [BookingSummary] Loaded package data:', pkgResponse.data);
        } catch (pkgError) {
          console.error('📄 [BookingSummary] Failed to load package data:', pkgError);
          // Don't fail the entire component if package data fails
        }
      }

      if (actualRoomId) {
        try {
          const roomResponse = await ApiService.getRoom(actualRoomId);
          setRoomData(roomResponse);
          console.log('📄 [BookingSummary] Loaded room data:', roomResponse);
        } catch (roomError) {
          console.error('📄 [BookingSummary] Failed to load room data:', roomError);
          // Don't fail the entire component if room data fails
        }
      }

    } catch (err) {
      console.error('Error loading summary data:', err);
      setError('Failed to load booking summary');
    } finally {
      console.log('📄 [BookingSummary] loadSummaryData completed, setting loading to false');
      setLoading(false);
    }
  }, [bookingRef, packageId, roomId, searchParams]);

  useEffect(() => {
    loadSummaryData();
  }, [loadSummaryData]);

  const handleDownloadConfirmation = () => {
    // Mock download functionality
    const element = document.createElement('a');
    const fileContent = `
Booking Confirmation
Reference: ${bookingData?.reference}
Guest: ${bookingData?.guestInfo.firstName} ${bookingData?.guestInfo.lastName}
Check-in: ${bookingData?.checkIn}
Check-out: ${bookingData?.checkOut}
Guests: ${bookingData?.guests}
Total: $${bookingData?.pricing.totalPrice}
    `;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `booking-${bookingData?.reference}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Booking Confirmation',
      text: `My booking confirmation for ${packageData?.name || roomData?.name || 'accommodation'}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    console.log('📄 [BookingSummary] Rendering loading state');
    return <BookingSkeleton />;
  }

  if (error || !bookingData) {
    console.log('📄 [BookingSummary] Rendering error state - error:', error, 'bookingData:', bookingData);
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Booking Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find your booking summary. Please check your booking reference or try again.
          </p>
          <Button onClick={() => navigate('/')}>
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  console.log('📄 [BookingSummary] Rendering main content');
  return (
    <div className="bg-gradient-to-br from-white to-hotel-cream min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Alert for Fallback Data */}
        {isUsingFallbackData && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertDescription className="text-yellow-800">
              ⚠️ <strong>Data Warning:</strong> Unable to load latest booking information from server. 
              Displaying basic booking details. Please contact support if you need updated information.
            </AlertDescription>
          </Alert>
        )}

        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-hotel-sage-light rounded-full mb-4">
            <CheckCircle2 className="h-8 w-8 text-hotel-sage" />
          </div>
          <h1 className="text-4xl font-bold text-hotel-sage mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-hotel-bronze mb-4">
            Thank you for your reservation. Your booking has been successfully confirmed.
          </p>
          <div className="inline-flex items-center gradient-hotel-success px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-hotel-navy">
              Confirmation #: {bookingData.reference}
            </span>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Package/Room Info */}
              {packageData && (
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <img 
                    src={packageData.image_url} 
                    alt={packageData.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-purple-100 text-purple-700">
                        <PackageIcon className="h-3 w-3 mr-1" />
                        Package
                      </Badge>
                      {parseFloat(packageData.discount_percentage) > 0 && (
                        <Badge className="bg-green-100 text-green-700">
                          {packageData.discount_percentage}% OFF
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{packageData.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {packageData.description}
                    </p>
                  </div>
                </div>
              )}

              {roomData && !packageData && (
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <img 
                    src={roomData.image_url} 
                    alt={roomData.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <Badge className="bg-blue-100 text-blue-700 mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      Room
                    </Badge>
                    <h3 className="font-semibold text-lg">{roomData.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {roomData.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Stay Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm font-medium">Check-in</span>
                    </div>
                    <span className="font-semibold">
                      {new Date(bookingData.checkIn).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm font-medium">Check-out</span>
                    </div>
                    <span className="font-semibold">
                      {new Date(bookingData.checkOut).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm font-medium">Duration</span>
                    </div>
                    <span className="font-semibold">{bookingData.nights} nights</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm font-medium">Guests</span>
                    </div>
                    <span className="font-semibold">{bookingData.guests} guests</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Guest Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Primary Guest</label>
                    <p className="font-semibold">
                      {bookingData.guestInfo.firstName} {bookingData.guestInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-semibold">{bookingData.guestInfo.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="font-semibold">{bookingData.guestInfo.phone}</p>
                  </div>
                  {bookingData.guestInfo.specialRequests && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Special Requests</label>
                      <p className="text-sm">{bookingData.guestInfo.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Includes (if package booking) */}
          {packageData && packageData.includes && Array.isArray(packageData.includes) && packageData.includes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  Your Package Includes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packageData.includes.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    {packageData ? 'Package Rate' : 'Room Rate'} × {bookingData.nights} nights
                  </span>
                  <span className="font-medium">${bookingData.pricing.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Service Fee</span>
                  <span className="font-medium">${bookingData.pricing.serviceFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-lg text-green-600">
                    ${bookingData.pricing.totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-center pt-2">
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Booking Confirmed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleDownloadConfirmation}
                  variant="outline" 
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Confirmation
                </Button>
                <Button 
                  onClick={handleShare}
                  variant="outline" 
                  className="w-full"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Booking
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-3">
                    For any questions about your booking, please contact us:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{getContactPhone()}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{getContactEmail()}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full" size="sm">
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Confirmation email sent to {bookingData.guestInfo.email}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span>Check-in starts at 3:00 PM on your arrival date</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Star className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <span>We'll contact you 24 hours before arrival</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default BookingSummary;