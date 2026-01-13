"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess, showError } from "@/utils/toast";
import { CheckCircle2, Users, BedDouble } from "lucide-react";
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

  // State
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

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

        // Find the selected room or use first available room
        let room = null;

        // Check multiple possible room fields
        const roomsArray = (pkg as any).rooms || pkg.room_options || [];

        if (roomParam && roomsArray.length > 0) {
          room = roomsArray.find((r: any) => r.id === roomParam || r.room_id === roomParam);
        }

        // If no room specified or room not found, use first available room
        if (!room && roomsArray.length > 0) {
          room = roomsArray[0];
        }

        // If still no room, create a default room from package's base_room_id or URL param
        if (!room) {
          const baseRoomId = roomParam || pkg.base_room_id || pkg.room_id || null;
          if (!baseRoomId) {
            throw new Error("Package has no associated room. Please contact support.");
          }
          room = {
            id: baseRoomId,
            room_id: baseRoomId,
            name: pkg.name || 'Standard Room',
            price: pkg.price || pkg.base_price || 0,
            max_guests: pkg.max_guests || 2,
            size: '25',
            beds: 'Queen Bed'
          };
          console.log("Using fallback room with ID from URL or package:", room);
        }

        console.log("Final selectedRoom:", room);
        setSelectedRoom(room);

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
        // Navigate using booking_reference (API returns this, not id)
        const bookingRef = result.data?.booking_reference || bookingReference;
        navigate(`/confirmation/${bookingRef}`);
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
              <h2 className="text-2xl font-bold mb-4" style={{ color: bookingTheme.colors.secondary }}>Booking Error</h2>
              <p className="mb-6" style={{ color: bookingTheme.colors.text }}>{error}</p>
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
              <h2 className="text-2xl font-bold mb-4" style={{ color: bookingTheme.colors.secondary }}>Booking Not Found</h2>
              <p className="mb-6" style={{ color: bookingTheme.colors.text }}>The requested booking information could not be found.</p>
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
  const totalPrice = pricePerNight * (nights || 1);


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
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: bookingTheme.colors.secondary }}>
                  <CheckCircle2 className="h-5 w-5" style={{ color: bookingTheme.colors.accent }} />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Package Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: bookingTheme.colors.secondary }}>{selectedPackage.name}</h3>
                  <p className="text-sm mb-3" style={{ color: bookingTheme.colors.text }}>{selectedPackage.description}</p>

                  {/* Inclusions */}
                  {parseInclusions(selectedPackage.inclusions).length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2" style={{ color: bookingTheme.colors.secondary }}>Includes:</h4>
                      <ul className="text-sm space-y-1" style={{ color: bookingTheme.colors.text }}>
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

                {/* Room Info */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BedDouble className="h-4 w-4" style={{ color: bookingTheme.colors.accent }} />
                    <span className="font-medium" style={{ color: bookingTheme.colors.secondary }}>{selectedRoom.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-2" style={{ color: bookingTheme.colors.text }}>
                    <Users className="h-4 w-4" />
                    <span>Max {selectedRoom.max_guests} guests</span>
                  </div>
                  <div className="text-sm" style={{ color: bookingTheme.colors.text }}>
                    Size: {selectedRoom.size}m² • {selectedRoom.beds}
                  </div>
                </div>

                {/* Dates & Pricing */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">{checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">{checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights:</span>
                    <span className="font-medium">{nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{guests}</span>
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Package Base Price:</span>
                      <span>${basePrice.toLocaleString()}/night</span>
                    </div>
                    {roomAdjustment !== 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Room Adjustment:</span>
                        <span>
                          {adjustmentType === 'percentage'
                            ? `${roomAdjustment > 0 ? '+' : ''}${roomAdjustment}%`
                            : `${roomAdjustment > 0 ? '+' : ''}$${Math.abs(roomAdjustment).toLocaleString()}`
                          }
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-medium text-gray-700 mt-1">
                      <span>Price per Night:</span>
                      <span>${pricePerNight.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span style={{ color: bookingTheme.colors.primary }}>${totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Information Form */}
            <Card>
              <CardHeader>
                <CardTitle style={{ color: bookingTheme.colors.secondary }}>Guest Information</CardTitle>
                <CardDescription style={{ color: bookingTheme.colors.text }}>
                  Please provide your details to complete the booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={guestForm.firstName}
                      onChange={handleInputChange}
                      required
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
