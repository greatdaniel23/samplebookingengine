"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { differenceInDays, format } from "date-fns";
import { showError, showSuccess } from "@/utils/toast";
import { Label } from "./ui/label";
import { ArrowLeft } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Room {
  id: string;
  name: string;
}

interface BookingWidgetProps {
  pricePerNight: number;
  rooms: Room[];
}

export const BookingWidget = ({ pricePerNight, rooms }: BookingWidgetProps) => {
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<string | undefined>(
    rooms?.[0]?.id
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);

  const numberOfNights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 0;

  const basePrice = numberOfNights * pricePerNight;
  const serviceFee = basePrice * 0.1; // 10% service fee
  const totalPrice = basePrice + serviceFee;

  const handleNextStep = () => {
    if (step === 1) {
      if (!dateRange?.from || !dateRange?.to) {
        showError("Please select a check-in and check-out date.");
        return;
      }
      if (guests <= 0) {
        showError("Please enter a valid number of guests.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!name || !email) {
        showError("Please enter your name and email.");
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        showError("Please enter a valid email address.");
        return;
      }
      // Mock booking creation
      const newBookingId = Math.floor(1000 + Math.random() * 9000).toString();
      setBookingId(newBookingId);
      setStep(3);
      showSuccess("Booking confirmed!");
    }
  };

  const handleReset = () => {
    setStep(1);
    setDateRange(undefined);
    setGuests(1);
    setSelectedRoom(rooms?.[0]?.id);
    setName("");
    setEmail("");
    setBookingId(null);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid gap-4">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              className="rounded-md border"
              numberOfMonths={1}
              disabled={(date) =>
                date < new Date(new Date().setDate(new Date().getDate() - 1))
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="guests"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Guests
                </Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  placeholder="Number of guests"
                />
              </div>
              <div>
                <Label
                  htmlFor="room"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Room Type
                </Label>
                <Select onValueChange={setSelectedRoom} defaultValue={selectedRoom}>
                  <SelectTrigger id="room">
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleNextStep}
              className="w-full"
              size="lg"
              disabled={!dateRange?.from || !dateRange?.to}
            >
              Request to Book
            </Button>
            {numberOfNights > 0 && (
              <div className="space-y-2 text-sm mt-4">
                <p className="text-center text-gray-500 mb-2">
                  You won't be charged yet
                </p>
                <div className="flex justify-between">
                  <span>
                    ${pricePerNight} x {numberOfNights} nights
                  </span>
                  <span>${basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="grid gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                />
              </div>
            </div>
            <Button onClick={handleNextStep} className="w-full" size="lg">
              Confirm and Book
            </Button>
          </div>
        );
      case 3:
        const roomName = rooms.find((r) => r.id === selectedRoom)?.name;
        return (
          <div className="text-center grid gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-green-600">
                Booking Confirmed!
              </h3>
              <p className="text-muted-foreground">
                Thank you, {name}! Your booking is complete.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="grid gap-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking</span>
                    <span className="font-medium">{bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room</span>
                    <span className="font-medium">{roomName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium">
                      {dateRange?.from
                        ? format(dateRange.from, "MMMM d, yyyy")
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium">
                      {dateRange?.to
                        ? format(dateRange.to, "MMMM d, yyyy")
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      Confirmed
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleReset}
              className="w-full"
              size="lg"
              variant="outline"
            >
              Book Another Stay
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
      case 1:
        return (
          <>
            <span className="text-2xl font-bold">${pricePerNight}</span>
            <span className="text-base font-normal text-gray-600">
              {" "}
              / night
            </span>
          </>
        );
      case 2:
        return "Review and Confirm";
      case 3:
        return "Confirmation";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border rounded-xl">
      <CardHeader className="flex flex-row items-center gap-2">
        {step > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <CardTitle className="flex-grow text-xl">{getTitle()}</CardTitle>
      </CardHeader>
      <CardContent>{renderStepContent()}</CardContent>
    </Card>
  );
};