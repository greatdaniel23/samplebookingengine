"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { format, differenceInDays } from "date-fns";
import { showSuccess, showError } from "@/utils/toast";
import { ArrowLeft, Ruler, BedDouble, Users, CheckCircle2 } from "lucide-react";
import NotFound from "./NotFound";
import { useBookings } from "@/context/BookingContext";
import { Booking } from "@/types";
import { BookingSteps } from "@/components/BookingSteps";
import { paths } from '@/config/paths';
import { saveOfflineBooking, trySyncOfflineBookings, getOfflineCount } from '@/lib/offlineBookings';
import { Room, Package } from "@/types";
import BookingSkeleton from "@/components/BookingSkeleton";
import { packageService } from "@/services/packageService";
// @ts-ignore
import ApiService from "@/services/api.js";

const BookingPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get('package');
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addBooking, getBookingsForRoom } = useBookings();
  const [bookingDetails, setBookingDetails] = useState<{ id: number | null; reference?: string }>({ id: null });
  const [isBooking, setIsBooking] = useState(false);
  const [apiReachable, setApiReachable] = useState<boolean | null>(null); // null = unchecked

  // Get the image URL from either images array or image_url field  
  const getPackageImageUrl = (pkg: Package) => {
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
    
    return typeImageMap[pkg.type] || '/images/ui/placeholder.svg';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If roomId is provided, fetch room data
        if (roomId) {
          const roomData = await ApiService.getRoom(roomId);
          setRoom(roomData);
        }
        
        // If packageId is provided, fetch package data
        if (packageId) {
          const packageResponse = await packageService.getPackageById(packageId);
          setSelectedPackage(packageResponse.data);
        }
        
        // If neither roomId nor packageId, show error
        if (!roomId && !packageId) {
          setError("No room or package specified for booking.");
        }
        
      } catch (err) {
        setError(roomId ? "Failed to fetch room details." : "Failed to fetch package details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [roomId, packageId]);

  // Attempt sync of any offline bookings on mount
  useEffect(() => {
    // Connectivity probe
    (async () => {
      
      
      
      
      try {
        const ping = await fetch(paths.api.bookings, { method: 'GET' });
        setApiReachable(ping.ok);
        
      } catch (e) {
        setApiReachable(false);
        
      }
    })();

    // Attempt to sync any offline bookings after initial connectivity check
    (async () => {
      const offlineTotal = getOfflineCount();
      if (offlineTotal === 0) return;
      try {
        const { synced, failed } = await trySyncOfflineBookings(paths.api.bookings);
        if (synced.length > 0) {
          showSuccess(`Synced ${synced.length} pending booking(s) to database.`);
        }
        if (failed.length > 0) {
          showError(`Failed to sync ${failed.length} booking(s). Will retry later.`);
        }
      } catch (e) {
        
      }
    })();
  }, []);

  // Build disabled dates from existing bookings for this room
  const existingBookings = getBookingsForRoom(roomId || "");
  const isDateBooked = (date: Date) => {
    return existingBookings.some((b) => {
      const from = new Date(b.from);
      const to = new Date(b.to);
      // Treat booking as occupying nights from 'from' up to but excluding 'to' departure day
      return date >= from && date < to;
    });
  };

  if (loading) {
    return <BookingSkeleton />;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!room && !selectedPackage) {
    return <NotFound />;
  }

  // Check if selected package is inactive
  if (selectedPackage && !selectedPackage.available) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Package Not Available</h2>
            <p className="text-muted-foreground mb-4">
              This package is currently not available for booking.
            </p>
            <Button onClick={() => navigate('/packages')}>
              View Available Packages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBookingComplete = async (bookingData: {
    dateRange: DateRange;
    guests: number;
    guestInfo: any;
    totalPrice: number;
  }) => {
    setIsBooking(true);
    
    // Generate booking details first
    const bookingId = Math.floor(Math.random() * 10000);
    const reference = `BK-${bookingId}`;

    try {
      // Package to Room mapping - packages need to be assigned to specific rooms
      const packageRoomMapping: Record<string, string> = {
        '1': 'deluxe-suite',    // Romantic Getaway → Deluxe Suite
        '2': 'master-suite',    // Adventure Explorer → Master Suite  
        '3': 'standard-room',   // Wellness Retreat → Standard Room
        '4': 'family-room',     // Cultural Heritage → Family Room
        '5': 'family-room'      // Family Fun → Family Room
      };

      // Determine the correct room_id and package_id
      let roomId: string;
      let packageId: number | undefined;

      if (room) {
        // Direct room booking
        roomId = room.id;
        packageId = undefined;
      } else if (selectedPackage) {
        // Package booking - map package to appropriate room
        roomId = packageRoomMapping[selectedPackage.id] || 'standard-room';
        packageId = parseInt(selectedPackage.id);
      } else {
        throw new Error('No room or package selected for booking');
      }

      // Validate room_id exists in database
      const validRoomIds = ['deluxe-suite', 'economy-room', 'family-room', 'master-suite', 'standard-room'];
      if (!validRoomIds.includes(roomId)) {
        throw new Error(`Invalid room_id: ${roomId}. Must be one of: ${validRoomIds.join(', ')}`);
      }

      // Ensure total_price is always provided and valid
      if (!bookingData.totalPrice || bookingData.totalPrice <= 0) {
        throw new Error('Invalid total_price: must be a positive number');
      }

      // Prepare booking data for API
      const apiBookingData = {
        room_id: roomId,
        package_id: packageId,
        first_name: bookingData.guestInfo.firstName,
        last_name: bookingData.guestInfo.lastName,
        email: bookingData.guestInfo.email,
        phone: bookingData.guestInfo.phone || '',
        check_in: bookingData.dateRange.from!.toISOString().split('T')[0], // Format as YYYY-MM-DD
        check_out: bookingData.dateRange.to!.toISOString().split('T')[0],
        guests: bookingData.guests,
        total_price: bookingData.totalPrice,
        special_requests: bookingData.guestInfo.specialRequests || '',
        status: 'confirmed'
      };

      // Try to save to database via API
      
      
      
      
      
      
      
      const response = await fetch(paths.api.bookings, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiBookingData)
      });
      
      
      
      
      
      
      const contentType = response.headers.get('Content-Type');
      

      let rawBody: any = null;
      try {
        rawBody = await response.text();
        
      } catch (e) {
        console.error('❌ [Booking] Failed reading raw body:', e);
        throw new Error('Failed to read response body');
      }

      let parsed: any = null;
      try {
        parsed = rawBody ? JSON.parse(rawBody) : null;
        
      } catch (e) {
        console.error('❌ [Booking] JSON parse failed:', e);
        
        throw new Error('Invalid JSON response from API');
      }

      if (!response.ok) {
        console.error('❌ [Booking] HTTP error status:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${rawBody}`);
      }

      // Flexible success detection (avoid false offline fallbacks)
      
      const bookingNode = parsed?.data?.booking || parsed?.booking || parsed?.data;
      const dbBookingIdFlexible = bookingNode?.id || bookingNode?.bookingId || parsed?.id || parsed?.bookingId;
      const dbReferenceFlexible = bookingNode?.reference || parsed?.reference;
      const topLevelSuccess = parsed?.success === true;
      const nestedSuccess = parsed?.data?.success === true || bookingNode?.success === true;
      const hasId = !!dbBookingIdFlexible;
      const structureSummary = { topLevelSuccess, nestedSuccess, hasId, derivedId: dbBookingIdFlexible, derivedReference: dbReferenceFlexible };
      

      const successSatisfied = (topLevelSuccess || nestedSuccess) && hasId;
      if (!successSatisfied) {
        
        throw new Error('Unrecognized success structure');
      }

      const dbBookingId = Number(dbBookingIdFlexible);
      const dbReference = dbReferenceFlexible || `BK-${dbBookingId}`;
      
      
      
      

      // Send email notification
      try {
        
        const notificationResponse = await fetch(paths.buildApiUrl('notify.php'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...apiBookingData,
            id: dbBookingId,
            reference: dbReference
          })
        });
        
        const notificationResult = await notificationResponse.json();
        if (notificationResult.success) {
          
        } else {
          
        }
      } catch (emailError) {
        
        // Don't fail the booking if email fails
      }

      setBookingDetails({ id: dbBookingId, reference: dbReference });
      setIsBooking(false);
      showSuccess('Booking confirmed and saved to database!');
      
      // Redirect to summary page with booking details
      const nights = differenceInDays(bookingData.dateRange.to!, bookingData.dateRange.from!);
      const basePrice = nights * parseFloat(selectedPackage?.price || selectedPackage?.base_price || room?.price || '0');
      const serviceFee = basePrice * 0.1; // 10% of base price, not total price
      
      const summaryParams = new URLSearchParams({
        ref: dbReference,
        checkIn: bookingData.dateRange.from!.toISOString().split('T')[0],
        checkOut: bookingData.dateRange.to!.toISOString().split('T')[0],
        guests: bookingData.guests.toString(),
        nights: nights.toString(),
        firstName: bookingData.guestInfo.firstName,
        lastName: bookingData.guestInfo.lastName,
        email: bookingData.guestInfo.email,
        phone: bookingData.guestInfo.phone,
        basePrice: basePrice.toString(),
        serviceFee: serviceFee.toString(),
        totalPrice: bookingData.totalPrice.toString()
      });

      if (selectedPackage) {
        summaryParams.append('package', selectedPackage.id);
      }
      if (room) {
        summaryParams.append('room', room.id);
      }
      if (bookingData.guestInfo.specialRequests) {
        summaryParams.append('requests', bookingData.guestInfo.specialRequests);
      }

      // Navigate immediately to summary page
      
      
      navigate(`/summary?${summaryParams.toString()}`);

      const localBooking: Booking = {
        id: dbBookingId,
        reference: dbReference,
        roomId: room?.id || selectedPackage?.id || '',
        from: bookingData.dateRange.from!.toISOString(),
        to: bookingData.dateRange.to!.toISOString(),
        guests: bookingData.guests,
        user: bookingData.guestInfo,
        total: bookingData.totalPrice,
        createdAt: new Date().toISOString(),
      };
      addBooking(localBooking);
    } catch (error: any) {
      console.error('❌ [Booking] Database save failed, initiating offline fallback:', error);
      const reason = error?.message || 'Unknown error';
      
      
      if (apiReachable === false) {
        showError('API unreachable. Booking saved offline.');
      }
      // Build local booking copy
      const localBooking: Booking = {
        id: bookingId,
        reference,
        roomId: room?.id || selectedPackage?.id || '',
        from: bookingData.dateRange.from!.toISOString(),
        to: bookingData.dateRange.to!.toISOString(),
        guests: bookingData.guests,
        user: bookingData.guestInfo,
        total: bookingData.totalPrice,
        createdAt: new Date().toISOString(),
      };
      // Persist for later sync
      saveOfflineBooking({ ...localBooking, pendingSync: true });
      addBooking(localBooking);
      
      // Try to send email notification even if database failed
      try {
        
        const emailBookingData = {
          room_id: room?.id || selectedPackage?.id || '',
          first_name: bookingData.guestInfo.firstName,
          last_name: bookingData.guestInfo.lastName,
          email: bookingData.guestInfo.email,
          phone: bookingData.guestInfo.phone || '',
          check_in: bookingData.dateRange.from!.toISOString().split('T')[0],
          check_out: bookingData.dateRange.to!.toISOString().split('T')[0],
          guests: bookingData.guests,
          total_price: bookingData.totalPrice,
          special_requests: bookingData.guestInfo.specialRequests || '',
          status: 'confirmed',
          id: bookingId,
          reference: reference
        };
        
        const notificationResponse = await fetch(paths.buildApiUrl('notify.php'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailBookingData)
        });
        
        const notificationResult = await notificationResponse.json();
        if (notificationResult.success) {
          
        }
      } catch (emailError) {
        
      }
      
      setBookingDetails({ id: bookingId, reference });
      setIsBooking(false);
      showSuccess(`Booking stored offline. It will sync automatically when connection is restored. (${reason})`);
      
      // Redirect to summary page with booking details
      const nights = differenceInDays(bookingData.dateRange.to!, bookingData.dateRange.from!);
      const basePrice = nights * parseFloat(selectedPackage?.price || selectedPackage?.base_price || room?.price || '0');
      const serviceFee = basePrice * 0.1; // 10% of base price, not total price
      
      const summaryParams = new URLSearchParams({
        ref: reference,
        checkIn: bookingData.dateRange.from!.toISOString().split('T')[0],
        checkOut: bookingData.dateRange.to!.toISOString().split('T')[0],
        guests: bookingData.guests.toString(),
        nights: nights.toString(),
        firstName: bookingData.guestInfo.firstName,
        lastName: bookingData.guestInfo.lastName,
        email: bookingData.guestInfo.email,
        phone: bookingData.guestInfo.phone,
        basePrice: basePrice.toString(),
        serviceFee: serviceFee.toString(),
        totalPrice: bookingData.totalPrice.toString()
      });

      if (selectedPackage) {
        summaryParams.append('package', selectedPackage.id);
      }
      if (room) {
        summaryParams.append('room', room.id);
      }
      if (bookingData.guestInfo.specialRequests) {
        summaryParams.append('requests', bookingData.guestInfo.specialRequests);
      }

      // Navigate immediately to summary page
      
      
      navigate(`/summary?${summaryParams.toString()}`);
    }
  };



  return (
    <div className="bg-gradient-to-br from-white to-hotel-cream min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-hotel-bronze hover:text-hotel-gold">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Villa
        </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Details Section - Room or Package */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="p-0">
              <img 
                src={selectedPackage ? getPackageImageUrl(selectedPackage) : room?.image_url} 
                alt={selectedPackage ? selectedPackage.name : room?.name} 
                className="w-full h-[400px] object-cover rounded-t-lg" 
              />
            </CardHeader>
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold mb-2">
                {selectedPackage ? selectedPackage.name : room?.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {selectedPackage ? selectedPackage.description : room?.description}
              </p>
              
              <div className="border-t pt-6">
                {selectedPackage ? (
                  // Package Details
                  <>
                    <h2 className="text-2xl font-semibold mb-4">Package Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-muted-foreground mb-6">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-primary" />
                        <span>Up to {selectedPackage.max_guests} guests</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <BedDouble className="w-5 h-5 text-primary" />
                        <span>{selectedPackage.min_nights}-{selectedPackage.max_nights} nights</span>
                      </div>
                    </div>
                    
                    {selectedPackage.includes && selectedPackage.includes.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-3">Package Includes</h3>
                        <ul className="space-y-2">
                          {parseInclusions(selectedPackage.includes || selectedPackage.inclusions).map((item, index) => (
                            <li key={index} className="flex items-center space-x-3">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedPackage.room_options && selectedPackage.room_options.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Available Rooms</h3>
                        <div className="space-y-2">
                          {selectedPackage.room_options.map((roomOption, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium">{roomOption.name}</span>
                              <span className="text-green-600">${roomOption.price_override}/night</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Room Details
                  <>
                    <h2 className="text-2xl font-semibold mb-4">Room Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-muted-foreground">
                      <div className="flex items-center space-x-3">
                        <Ruler className="w-5 h-5 text-primary" />
                        <span>{room?.size}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <BedDouble className="w-5 h-5 text-primary" />
                        <span>{room?.beds}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-primary" />
                        <span>Up to {room?.occupancy} guests</span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-3">Key Features</h3>
                      <ul className="space-y-2">
                        {JSON.parse(room?.features || '[]').map((feature: string) => (
                          <li key={feature} className="flex items-center space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3-Step Booking Section */}
        <div className="lg:col-span-1">
          <BookingSteps
            room={room}
            package={selectedPackage}
            disabledDates={isDateBooked}
            onBookingComplete={handleBookingComplete}
            isBooking={isBooking}
          />
        </div>
      </div>
    </div>
    </div>
  );
};

export default BookingPage;
