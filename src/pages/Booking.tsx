"use client";

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { differenceInDays, format } from "date-fns";
import { showError, showSuccess } from "@/utils/toast";
import { ArrowLeft, Ruler, BedDouble, Users, CheckCircle2 } from "lucide-react";
import NotFound from "./NotFound";
import { Room } from "@/types";
import { supabase } from "@/lib/supabase";
import BookingSkeleton from "@/components/BookingSkeleton";

const fetchRoomData = async (roomId: string): Promise<Room> => {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error) {
    console.error(`Error fetching room ${roomId}:`, error);
    throw new Error(error.message);
  }
  if (!data) throw new Error("Room not found");

  return data;
};

const BookingPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{ id: number | null }>({ id: null });

  const { data: room, isLoading, isError } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => fetchRoomData(roomId!),
    enabled: !!roomId,
  });

  const { mutate: confirmBooking, isPending: isBooking } = useMutation({
    mutationFn: async () => {
      if (!dateRange?.from || !dateRange?.to || !room) {
        throw new Error("Missing booking information.");
      }
      const { data, error } = await supabase.from("bookings").insert({
        room_id: room.id,
        start_date: format(dateRange.from, "yyyy-MM-dd"),
        end_date: format(dateRange.to, "yyyy-MM-dd"),
        guests: guests,
        total_price: totalPrice,
      }).select().single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      return data;
    },
    onSuccess: (data) => {
      showSuccess("Booking confirmed!");
      setBookingDetails({ id: data.id });
      setIsConfirmed(true);
      window.scrollTo(0, 0);
    },
    onError: (error) => {
      showError(`Booking failed: ${error.message}`);
    },
  });

  if (isLoading) {
    return <BookingSkeleton />;
  }

  if (isError || !room) {
    return <NotFound />;
  }

  const pricePerNight = room.price;
  const numberOfNights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 0;
  const basePrice = numberOfNights * pricePerNight;
  const serviceFee = basePrice * 0.1;
  const totalPrice = basePrice + serviceFee;

  const handleConfirmBooking = () => {
    if (!dateRange?.from || !dateRange?.to) {
      showError("Please select your check-in and check-out dates.");
      return;
    }
    if (guests <= 0) {
      showError("Please enter at least one guest.");
      return;
    }
    if (guests > room.occupancy) {
      showError(`This room can only accommodate up to ${room.occupancy} guests.`);
      return;
    }
    confirmBooking();
  };

  if (isConfirmed) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold tracking-tight text-green-600 mb-4">Booking Confirmed!</h1>
          <p className="text-lg text-muted-foreground mb-8">Thank you for booking with us. We've sent a confirmation to your email.</p>
          <Card>
            <CardHeader>
              <CardTitle>Your Reservation</CardTitle>
              <CardDescription>Booking ID: BK-{bookingDetails.id}</CardDescription>
            </CardHeader>
            <CardContent className="text-left space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Room:</span>
                <span>{room.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Check-in:</span>
                <span>{dateRange?.from ? format(dateRange.from, "MMMM d, yyyy") : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Check-out:</span>
                <span>{dateRange?.to ? format(dateRange.to, "MMMM d, yyyy") : ''}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>Total Paid:</span>
                <span>${totalPrice.toFixed(2)}</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
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

        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-2xl">Book your stay</CardTitle>
              <CardDescription>Select your dates to see the price.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  className="rounded-md border"
                  numberOfMonths={1}
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                />
                <div>
                  <Label htmlFor="guests" className="text-base">Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max={room.occupancy}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
              </div>

              {numberOfNights > 0 ? (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold">Price Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>${pricePerNight.toFixed(2)} x {numberOfNights} nights</span>
                      <span>${basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Service fee</span>
                      <span>${serviceFee.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <Button onClick={handleConfirmBooking} className="w-full mt-4" size="lg" disabled={isBooking}>
                    {isBooking ? "Booking..." : "Confirm and Book"}
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground pt-8">
                  <p>Select dates to see price</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;