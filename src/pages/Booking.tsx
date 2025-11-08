"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { showSuccess, showError } from "@/utils/toast";
import { ArrowLeft, Ruler, BedDouble, Users, CheckCircle2 } from "lucide-react";
import NotFound from "./NotFound";
import { useBookings } from "@/context/BookingContext";
import { Booking } from "@/types";
import { BookingSteps } from "@/components/BookingSteps";
import { paths } from '@/config/paths';
import { saveOfflineBooking, trySyncOfflineBookings, getOfflineCount } from '@/lib/offlineBookings';
import { Room } from "@/types";
import BookingSkeleton from "@/components/BookingSkeleton";
// @ts-ignore
import ApiService from "@/services/api.js";

const BookingPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addBooking, getBookingsForRoom } = useBookings();

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) return;
      try {
        setLoading(true);
        const roomData = await ApiService.getRoom(roomId);
        setRoom(roomData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch room details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{ id: number | null; reference?: string }>({ id: null });
  const [isBooking, setIsBooking] = useState(false);
  const [finalBookingData, setFinalBookingData] = useState<any>(null);
  const [apiReachable, setApiReachable] = useState<boolean | null>(null); // null = unchecked

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

  if (!room) {
    return <NotFound />;
  }

  // Attempt sync of any offline bookings on mount
  useEffect(() => {
    // Connectivity probe
    (async () => {
      console.log('🌐 [Booking] Connectivity Probe:');
      console.log('   Frontend Origin:', window.location.origin);
      console.log('   API Base:', paths.apiBase);
      console.log('   Bookings Endpoint:', paths.api.bookings);
      try {
        const ping = await fetch(paths.api.bookings, { method: 'GET' });
        setApiReachable(ping.ok);
        console.log('✅ [Booking] API reachability:', ping.ok);
      } catch (e) {
        setApiReachable(false);
        console.warn('❌ [Booking] API unreachable:', e);
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
        console.warn('Offline sync error:', e);
      }
    })();
  }, []);

  const handleBookingComplete = async (bookingData: {
    dateRange: DateRange;
    guests: number;
    guestInfo: any;
    totalPrice: number;
  }) => {
    setIsBooking(true);
    setFinalBookingData(bookingData);
    
    // Generate booking details first
    const bookingId = Math.floor(Math.random() * 10000);
    const reference = `BK-${bookingId}`;

    try {
      // Prepare booking data for API
      const apiBookingData = {
        roomId: room.id,
        from: bookingData.dateRange.from!.toISOString().split('T')[0], // Format as YYYY-MM-DD
        to: bookingData.dateRange.to!.toISOString().split('T')[0],
        guests: bookingData.guests,
        user: {
          firstName: bookingData.guestInfo.firstName,
          lastName: bookingData.guestInfo.lastName,
          email: bookingData.guestInfo.email,
          phone: bookingData.guestInfo.phone || ''
        },
        total: bookingData.totalPrice,
      };

      // Try to save to database via API
      console.log('🚀 [Booking] === STARTING API CALL ===');
      console.log('🌐 [Booking] Frontend origin:', window.location.origin);
      console.log('🎯 [Booking] Target API URL:', paths.api.bookings);
      console.log('📦 [Booking] POST data:', JSON.stringify(apiBookingData, null, 2));
      console.log('🔧 [Booking] buildApiUrl test:', paths.buildApiUrl('bookings'));
      
      console.log('📤 [Booking] Making fetch request...');
      const response = await fetch(paths.api.bookings, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiBookingData)
      });
      
      console.log('📥 [Booking] Response received!');
      console.log('📊 [Booking] Response status:', response.status, response.statusText);
      console.log('✅ [Booking] Response ok:', response.ok);
      console.log('📋 [Booking] Response headers:', [...response.headers.entries()]);
      
      const contentType = response.headers.get('Content-Type');
      console.log('📄 [Booking] Content-Type:', contentType);

      let rawBody: any = null;
      try {
        rawBody = await response.text();
        console.log('📝 [Booking] Raw response body:', rawBody);
      } catch (e) {
        console.error('❌ [Booking] Failed reading raw body:', e);
        throw new Error('Failed to read response body');
      }

      let parsed: any = null;
      try {
        parsed = rawBody ? JSON.parse(rawBody) : null;
        console.log('🔍 [Booking] Parsed JSON:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.error('❌ [Booking] JSON parse failed:', e);
        console.log('📝 [Booking] Raw body that failed to parse:', rawBody);
        throw new Error('Invalid JSON response from API');
      }

      if (!response.ok) {
        console.error('❌ [Booking] HTTP error status:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${rawBody}`);
      }

      // Flexible success detection (avoid false offline fallbacks)
      console.log('🔍 [Booking] === RESPONSE ANALYSIS (Flexible) ===');
      const bookingNode = parsed?.data?.booking || parsed?.booking || parsed?.data;
      const dbBookingIdFlexible = bookingNode?.id || bookingNode?.bookingId || parsed?.id || parsed?.bookingId;
      const dbReferenceFlexible = bookingNode?.reference || parsed?.reference;
      const topLevelSuccess = parsed?.success === true;
      const nestedSuccess = parsed?.data?.success === true || bookingNode?.success === true;
      const hasId = !!dbBookingIdFlexible;
      const structureSummary = { topLevelSuccess, nestedSuccess, hasId, derivedId: dbBookingIdFlexible, derivedReference: dbReferenceFlexible };
      console.log('🔍 [Booking] Success shape summary:', structureSummary);

      const successSatisfied = (topLevelSuccess || nestedSuccess) && hasId;
      if (!successSatisfied) {
        console.warn('⚠️ [Booking] Treating as failure due to missing success/id indicators. Parsed:', parsed);
        throw new Error('Unrecognized success structure');
      }

      const dbBookingId = Number(dbBookingIdFlexible);
      const dbReference = dbReferenceFlexible || `BK-${dbBookingId}`;
      
      console.log('🎉 [Booking] SUCCESS - Booking saved to database!');
      console.log('📝 [Booking] Booking ID:', dbBookingId);
      console.log('📝 [Booking] Booking Reference:', dbReference);

      setBookingDetails({ id: dbBookingId, reference: dbReference });
      setIsConfirmed(true);
      setIsBooking(false);
      showSuccess('Booking confirmed and saved to database!');
      window.scrollTo(0, 0);

      const localBooking: Booking = {
        id: dbBookingId,
        reference: dbReference,
        roomId: room.id,
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
      console.log('🛟 [Booking] Offline fallback reason:', reason);
      console.log('🛟 [Booking] API reachable state:', apiReachable);
      if (apiReachable === false) {
        showError('API unreachable. Booking saved offline.');
      }
      // Build local booking copy
      const localBooking: Booking = {
        id: bookingId,
        reference,
        roomId: room.id,
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
      setBookingDetails({ id: bookingId, reference });
      setIsConfirmed(true);
      setIsBooking(false);
      showSuccess(`Booking stored offline. It will sync automatically when connection is restored. (${reason})`);
      window.scrollTo(0, 0);
    }
  };

  if (isConfirmed && finalBookingData) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold tracking-tight text-green-600 mb-4">Booking Confirmed!</h1>
          <p className="text-lg text-muted-foreground mb-8">Thank you for booking with us. Your booking is now confirmed.</p>
          <Card>
            <CardHeader>
              <CardTitle>Your Reservation</CardTitle>
              <CardDescription>Booking ID: {bookingDetails.reference}</CardDescription>
            </CardHeader>
            <CardContent className="text-left space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Room:</span>
                <span>{room.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Guest:</span>
                <span>{finalBookingData.guestInfo.firstName} {finalBookingData.guestInfo.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{finalBookingData.guestInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Check-in:</span>
                <span>{finalBookingData.dateRange.from ? format(finalBookingData.dateRange.from, "MMMM d, yyyy") : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Check-out:</span>
                <span>{finalBookingData.dateRange.to ? format(finalBookingData.dateRange.to, "MMMM d, yyyy") : ''}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>Total Paid:</span>
                <span>${finalBookingData.totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
          <Button asChild size="lg" className="mt-8">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Villa
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Room Details Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="p-0">
              <img src={room.image} alt={room.name} className="w-full h-[400px] object-cover rounded-t-lg" />
            </CardHeader>
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
              <p className="text-lg text-muted-foreground mb-6">{room.description}</p>
              
              <div className="border-t pt-6">
                <h2 className="text-2xl font-semibold mb-4">Room Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-muted-foreground">
                  <div className="flex items-center space-x-3">
                    <Ruler className="w-5 h-5 text-primary" />
                    <span>{room.size}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BedDouble className="w-5 h-5 text-primary" />
                    <span>{room.beds}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Up to {room.occupancy} guests</span>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {room.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3-Step Booking Section */}
        <div className="lg:col-span-1">
          <BookingSteps
            room={room}
            disabledDates={isDateBooked}
            onBookingComplete={handleBookingComplete}
            isBooking={isBooking}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingPage;