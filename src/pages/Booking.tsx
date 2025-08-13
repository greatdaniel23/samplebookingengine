"use client";

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { differenceInDays, format } from "date-fns";
import { showError, showSuccess } from "@/utils/toast";
import { ArrowLeft } from "lucide-react";
import NotFound from "./NotFound";

// In a real app, this data would come from a global state or an API call
const villaData = {
  rooms: [
    {
      id: "standard",
      name: "Standard Room",
      price: 450,
      image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2670&auto=format&fit=crop",
      description: "A cozy room with all the essentials for a comfortable stay, perfect for solo travelers or couples.",
    },
    {
      id: "deluxe",
      name: "Deluxe Suite",
      price: 650,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2670&auto=format&fit=crop",
      description: "A spacious suite with a private balcony and stunning mountain views. Ideal for a luxurious escape.",
    },
    {
      id: "penthouse",
      name: "The Penthouse",
      price: 950,
      image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2670&auto=format&fit=crop",
      description: "The ultimate luxury experience with panoramic views, a private jacuzzi, and exclusive amenities.",
    },
  ],
};

const BookingPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const room = villaData.rooms.find((r) => r.id === roomId);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!room) {
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
    setIsConfirmed(true);
    showSuccess("Booking confirmed!");
    window.scrollTo(0, 0);
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
              <CardDescription>Booking ID: BK-{Math.floor(1000 + Math.random() * 9000)}</CardDescription>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Complete your booking</CardTitle>
              <CardDescription>Select your dates and number of guests to finalize your reservation.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                className="rounded-md border justify-center"
                numberOfMonths={2}
                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
              />
              <div>
                <Label htmlFor="guests" className="text-base">Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="mt-2 max-w-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader className="flex-row gap-4 items-start">
              <img src={room.image} alt={room.name} className="w-24 h-24 object-cover rounded-lg" />
              <div>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription className="line-clamp-2">{room.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {numberOfNights > 0 ? (
                <div className="space-y-4">
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
                  <div className="flex justify-between font-bold text-lg border-t pt-4">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <Button onClick={handleConfirmBooking} className="w-full" size="lg">
                    Confirm and Book
                  </Button>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Select dates to see price</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;