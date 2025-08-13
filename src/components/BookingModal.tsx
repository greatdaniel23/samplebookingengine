"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateRange } from "react-day-picker";
import { differenceInDays, format } from "date-fns";
import { showError, showSuccess } from "@/utils/toast";
import { Room } from "@/types";

interface BookingModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal = ({ room, isOpen, onClose }: BookingModalProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [step, setStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    // Reset state when the modal is closed or the room changes
    if (!isOpen) {
      setTimeout(() => {
        setDateRange(undefined);
        setGuests(1);
        setStep(1);
        setBookingDetails(null);
      }, 300); // Delay to allow for closing animation
    }
  }, [isOpen]);

  if (!room) return null;

  const pricePerNight = room.price;
  const numberOfNights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 0;
  const basePrice = numberOfNights * pricePerNight;
  const serviceFee = basePrice * 0.1;
  const totalPrice = basePrice + serviceFee;

  const handleBook = () => {
    if (!dateRange?.from || !dateRange?.to) {
      showError("Please select your check-in and check-out dates.");
      return;
    }
    if (guests <= 0) {
      showError("Please enter at least one guest.");
      return;
    }
    
    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingDetails({
      bookingId,
      roomName: room.name,
      checkIn: format(dateRange.from, "MMMM d, yyyy"),
      checkOut: format(dateRange.to, "MMMM d, yyyy"),
      totalPrice: totalPrice.toFixed(2),
    });
    setStep(2);
    showSuccess("Booking confirmed!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? `Book: ${room.name}` : "Booking Confirmed"}
          </DialogTitle>
          {step === 1 && (
            <DialogDescription>
              Select your dates and number of guests to complete your booking.
            </DialogDescription>
          )}
        </DialogHeader>
        {step === 1 ? (
          <div className="grid gap-4 py-4">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              className="rounded-md border"
              numberOfMonths={1}
              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
            />
            <div className="grid gap-2">
              <Label htmlFor="guests">Guests</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              />
            </div>
            {numberOfNights > 0 && (
              <div className="space-y-2 text-sm mt-2">
                <div className="flex justify-between">
                  <span>${pricePerNight} x {numberOfNights} nights</span>
                  <span>${basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
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
        ) : (
          <div className="py-4 text-sm">
            <p className="mb-4">Thank you! Your booking for <strong>{bookingDetails.roomName}</strong> is complete.</p>
            <div className="grid gap-2 p-4 border rounded-lg bg-slate-50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID</span>
                <span className="font-medium">{bookingDetails.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-in</span>
                <span className="font-medium">{bookingDetails.checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-out</span>
                <span className="font-medium">{bookingDetails.checkOut}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-medium">${bookingDetails.totalPrice}</span>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          {step === 1 ? (
            <Button onClick={handleBook} disabled={!dateRange?.from || !dateRange?.to}>
              Confirm Booking
            </Button>
          ) : (
            <Button onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};