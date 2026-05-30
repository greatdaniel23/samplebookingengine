"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess, showError } from "@/utils/toast";
import { CheckCircle2, Users, BedDouble, ChevronDown, ChevronUp } from "lucide-react";
import { Package } from "@/types";
import { packageService } from "@/services/packageService";
import { paths } from '@/config/paths';
import Header from "@/components/Header";
import BookingSkeleton from "@/components/BookingSkeleton";

const BookingPage = () => {
  // Theme configuration - must be at top for error/loading states
  const bookingTheme = {
    colors: {
      primary: '#E6A500', // hotel-gold
      secondary: '#2F3A4F', // hotel-navy
      accent: '#8B9A7A', // hotel-sage
      background: '#F5F2E8', // hotel-cream
      text: '#7A5C3F' // hotel-bronze
    }
  };

  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract booking parameters from URL
  const packageId = searchParams.get('package');
  const roomParam = searchParams.get('room');
  const checkIn = searchParams.get('checkin');
  const checkOut = searchParams.get('checkout');
  const guests = parseInt(searchParams.get('guests') || '2');

  // Extract pricing parameters from URL
  const basePrice = parseFloat(searchParams.get('basePrice') || '0');
  const finalPricePerNight = parseFloat(searchParams.get('finalPrice') || '0');
  const roomAdjustment = parseFloat(searchParams.get('roomAdjustment') || '0');
  const adjustmentType = searchParams.get('adjustmentType') || 'fixed';
  const taxPercentage = parseFloat(searchParams.get('taxPercentage') || '11');
  const serviceFeePercentage = parseFloat(searchParams.get('serviceFeePercentage') || '10');

  // State
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [showSummaryDetails, setShowSummaryDetails] = useState(false);

  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

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

  // Load package and room data on component mount
  useEffect(() => {
    const loadBookingData = async () => {
      if (!packageId) {
        setError("Missing package information");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Load packages data
        const response = await packageService.getPackages();
        if (!response.success || !response.data) {
          throw new Error("Failed to load packages");
        }

        // Find the selected package
        const pkg = response.data.find((p: Package) => p.id.toString() === packageId);
        if (!pkg) {
          throw new Error("Package not found");
        }
        setSelectedPackage(pkg);

        // Debug: Log package structure
        console.log("Package data:", pkg);
        console.log("Package rooms:", (pkg as any).rooms);
        console.log("Package room_options:", pkg.room_options);

        // Find the selected room — first check package's embedded rooms,
        // then fetch from /api/packages/{id}/rooms if not found
        let room = null;

        // Check embedded rooms in package object
        const embeddedRooms = (pkg as any).rooms || pkg.room_options || [];
        if (roomParam && embeddedRooms.length > 0) {
          room = embeddedRooms.find((r: any) =>
            r.id?.toString() === roomParam || r.room_id?.toString() === roomParam
          );
        }
        if (!room && embeddedRooms.length > 0) {
          room = embeddedRooms[0];
        }

        // If still not found, fetch rooms from the dedicated endpoint
        if (!room && packageId) {
          try {
            const roomsRes = await fetch(paths.buildApiUrl(`packages/${packageId}/rooms`));
            if (roomsRes.ok) {
              const roomsData = await roomsRes.json();
              const roomsArray = Array.isArray(roomsData) ? roomsData : (roomsData.data || roomsData.rooms || []);
              if (roomParam) {
                room = roomsArray.find((r: any) =>
                  r.id?.toString() === roomParam || r.room_id?.toString() === roomParam
                );
              }
              if (!room && roomsArray.length > 0) {
                room = roomsArray[0];
              }
            }
          } catch (e) {
            console.warn("Could not fetch rooms from API:", e);
          }
        }

        // Last resort fallback
        if (!room) {
          const baseRoomId = roomParam || pkg.base_room_id || pkg.room_id || null;
          if (!baseRoomId) {
            throw new Error("Package has no associated room. Please contact support.");
          }
          room = {
            id: baseRoomId,
            room_id: baseRoomId,
            name: 'Standard Room',
            price: pkg.price || pkg.base_price || 0,
            max_guests: pkg.max_guests || 2,
            size: '25',
            beds: 'Queen Bed'
          };
        }

        console.log("Final selectedRoom:", room);
        setSelectedRoom(room);

        // Track book page view & begin_checkout
        import('@/utils/ga4Analytics').then(({ trackBookPage, trackBeginCheckout }) => {
          trackBookPage({
            package_id: packageId || undefined,
            package_name: pkg?.name,
            room_id: room?.id || room?.room_id,
            room_name: room?.name,
            check_in: checkIn || undefined,
            check_out: checkOut || undefined,
            guests: guests,
            price: finalPricePerNight || pkg?.price || pkg?.base_price,
          });

          trackBeginCheckout({
            value: Number(finalPricePerNight || pkg?.price || pkg?.base_price || 0),
            currency: 'IDR',
            item_name: pkg?.name || room?.name,
            item_id: packageId || pkg?.id,
            item_category: pkg?.type || 'Package',
          });
        });

      } catch (err) {
        console.error("Error loading booking data:", err);
        setError(err instanceof Error ? err.message : "Failed to load booking data");
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, [packageId, roomParam]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGuestForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitBooking = async () => {
    // Debug logging to identify which value is missing
    console.log('handleSubmitBooking called');
    console.log('selectedPackage:', selectedPackage);
    console.log('selectedRoom:', selectedRoom);
    console.log('checkIn:', checkIn);
    console.log('checkOut:', checkOut);
    console.log('roomParam from URL:', roomParam);

    if (!selectedPackage) {
      showError("Missing package information. Please select a package first.");
      return;
    }
    if (!checkIn || !checkOut) {
      showError("Missing dates. Please select check-in and check-out dates.");
      return;
    }
    if (!selectedRoom) {
      showError("Missing room selection. Please select a room.");
      return;
    }

    // Room data can use different key names depending on source
    // Also check roomParam from URL as fallback
    const roomId = selectedRoom.id || selectedRoom.room_id || selectedRoom.roomId || roomParam;
    console.log('Resolved roomId:', roomId);

    if (!roomId) {
      showError("Missing room information. Please go back and select a room.");
      return;
    }

    const { firstName, lastName, email, phone } = guestForm;
    if (!firstName || !lastName || !email || !phone) {
      showError("Please fill in all required fields");
      return;
    }

    try {
      setBooking(true);

      // Generate a unique booking reference
      const bookingReference = `BK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const bookingData = {
        booking_reference: bookingReference,
        package_id: selectedPackage.id,
        room_id: roomId,
        check_in: checkIn,
        check_out: checkOut,
        guests: guests,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        total_price: totalPrice, // Use calculated total: (package base + room adjustment) * nights
        special_requests: guestForm.specialRequests || ''
      };

      console.log('selectedRoom:', selectedRoom);
      console.log('Sending booking data:', bookingData);

      // Use /bookings/create endpoint
      const response = await fetch(paths.buildApiUrl('bookings/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('API response:', result);

      if (result.success) {
        showSuccess("Booking confirmed successfully!");
        const bookingRef = result.data?.booking_reference || bookingReference;

        // Pass all display data as URL params so confirmation page has a reliable fallback
        const confirmParams = new URLSearchParams();
        confirmParams.set('package_id', selectedPackage.id.toString());
        confirmParams.set('room_id', roomId?.toString() || '');
        confirmParams.set('package_name', selectedPackage.name || '');
        confirmParams.set('room_name', selectedRoom?.name || selectedRoom?.room_name || '');
        confirmParams.set('check_in', checkIn || '');
        confirmParams.set('check_out', checkOut || '');
        confirmParams.set('guests', guests.toString());
        confirmParams.set('nights', nights.toString());
        confirmParams.set('total_price', totalPrice.toString());
        confirmParams.set('tax_pct', taxPercentage.toString());
        confirmParams.set('svc_pct', serviceFeePercentage.toString());
        confirmParams.set('price_per_night', pricePerNight.toString());
        navigate(`/confirmation/${bookingRef}?${confirmParams.toString()}`);
      } else {
        throw new Error(result.message || result.error || "Booking failed");
      }
    } catch (err) {
      console.error("Booking error:", err);
      showError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <BookingSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen py-8" style={{ background: bookingTheme.colors.background }}>
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="font-display text-2xl font-medium text-gray-900 mb-4">Booking Error</h2>
              <p className="text-base text-gray-600 mb-6">{error}</p>
              <Link to="/">
                <Button style={{ backgroundColor: bookingTheme.colors.primary, color: 'white' }}>Return to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!selectedPackage || !selectedRoom) {
    return (
      <div className="min-h-screen py-8" style={{ background: bookingTheme.colors.background }}>
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="font-display text-2xl font-medium text-gray-900 mb-4">Booking Not Found</h2>
              <p className="text-base text-gray-600 mb-6">The requested booking information could not be found.</p>
              <Link to="/">
                <Button style={{ backgroundColor: bookingTheme.colors.primary, color: 'white' }}>Return to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const nights = checkIn && checkOut ?
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Calculate total using final price per night (package base + room adjustment) * nights
  const pricePerNight = finalPricePerNight > 0 ? finalPricePerNight : (selectedPackage?.base_price || 0);
  const subtotal = pricePerNight * (nights || 1);
  const serviceFeeAmount = Math.round(subtotal * (serviceFeePercentage / 100));
  const taxAmount = Math.round((subtotal + serviceFeeAmount) * (taxPercentage / 100));
  const totalPrice = subtotal + serviceFeeAmount + taxAmount;


  return (
    <div
      className="min-h-screen"
      style={{ background: bookingTheme.colors.background }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="max-w-5xl mx-auto mt-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Booking Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <CheckCircle2 className="h-5 w-5" style={{ color: bookingTheme.colors.accent }} />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">

                {/* Always visible: compact snapshot */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedPackage.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <BedDouble className="h-3 w-3" style={{ color: bookingTheme.colors.accent }} />
                        {selectedRoom.name || selectedRoom.room_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{checkIn} → {checkOut}</span>
                    <span className="text-gray-500">{nights} night{nights !== 1 ? 's' : ''} · {guests} guest{Number(guests) !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t">
                    <span className="text-sm font-medium text-gray-700">Total</span>
                    <span className="text-lg font-bold" style={{ color: bookingTheme.colors.primary }}>
                      Rp {totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Toggle button */}
                <button
                  onClick={() => setShowSummaryDetails(!showSummaryDetails)}
                  className="w-full flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  {showSummaryDetails ? (
                    <><ChevronUp className="h-3.5 w-3.5" /> Hide details</>
                  ) : (
                    <><ChevronDown className="h-3.5 w-3.5" /> Show details</>
                  )}
                </button>

                {/* Collapsible details */}
                {showSummaryDetails && (
                  <div className="space-y-4 pt-1 border-t">

                    {/* Package description & inclusions */}
                    <div>
                      <p className="text-sm text-gray-500 mb-3">{selectedPackage.description}</p>
                      {parseInclusions(selectedPackage.inclusions).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Includes:</h4>
                          <ul className="text-sm space-y-1 text-gray-500">
                            {parseInclusions(selectedPackage.inclusions).map((inclusion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: bookingTheme.colors.accent }} />
                                {inclusion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Room details */}
                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 mb-1">
                        <BedDouble className="h-4 w-4" style={{ color: bookingTheme.colors.accent }} />
                        <span className="text-sm font-semibold text-gray-900">{selectedRoom.name || selectedRoom.room_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>Max {selectedRoom.max_guests} guests</span>
                      </div>
                      <div className="text-sm text-gray-500">Size: {selectedRoom.size}m² · {selectedRoom.beds}</div>
                    </div>

                    {/* Dates */}
                    <div className="border-t pt-3 space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">{checkIn}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium">{checkOut}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Nights:</span>
                        <span className="font-medium">{nights}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Guests:</span>
                        <span className="font-medium">{guests}</span>
                      </div>
                    </div>

                    {/* Price breakdown */}
                    <div className="border-t pt-3 space-y-1">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Price/night:</span>
                        <span>Rp {pricePerNight.toLocaleString('id-ID')}</span>
                      </div>
                      {roomAdjustment !== 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Room Adjustment:</span>
                          <span>
                            {adjustmentType === 'percentage'
                              ? `${roomAdjustment > 0 ? '+' : ''}${roomAdjustment}%`
                              : `${roomAdjustment > 0 ? '+' : ''}Rp ${Math.abs(roomAdjustment).toLocaleString('id-ID')}`
                            }
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-medium text-gray-700">
                        <span>Subtotal ({nights} night{nights !== 1 ? 's' : ''}):</span>
                        <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                      </div>
                      {serviceFeePercentage > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Service Fee ({serviceFeePercentage}%):</span>
                          <span>Rp {serviceFeeAmount.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {taxPercentage > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Tax ({taxPercentage}%):</span>
                          <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </CardContent>
            </Card>

            {/* Guest Information Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Guest Information</CardTitle>
                <CardDescription style={{ color: bookingTheme.colors.text }}>
                  Please provide your details to complete the booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={guestForm.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={guestForm.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={guestForm.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={guestForm.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={guestForm.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Any special requests or requirements..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSubmitBooking}
                  disabled={booking}
                  className="w-full"
                  size="lg"
                  style={{
                    backgroundColor: bookingTheme.colors.primary,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bookingTheme.colors.secondary}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bookingTheme.colors.primary}
                >
                  {booking ? "Processing..." : "Confirm Booking"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
