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

interface BookingWidgetProps {
  pricePerNight: number;
}

export const BookingWidget = ({ pricePerNight }: BookingWidgetProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);

  const numberOfNights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 0;

  const basePrice = numberOfNights * pricePerNight;
  const serviceFee = basePrice * 0.1; // 10% service fee
  const totalPrice = basePrice + serviceFee;

  const handleBooking = () => {
    if (!dateRange?.from || !dateRange?.to) {
      showError("Please select a check-in and check-out date.");
      return;
    }
    if (guests <= 0) {
      showError("Please enter a valid number of guests.");
      return;
    }
    showSuccess(
      `Booking for ${guests} guest(s) from ${format(dateRange.from, "PPP")} to ${format(dateRange.to, "PPP")} confirmed! Total: $${totalPrice.toFixed(2)}`
    );
  };

  return (
    <Card className="w-full max-w-md shadow-lg border rounded-xl">
      <CardHeader>
        <CardTitle>
          <span className="text-2xl font-bold">${pricePerNight}</span>
          <span className="text-base font-normal text-gray-600"> / night</span>
        </CardTitle>
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
            <Label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
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
          <Button onClick={handleBooking} className="w-full" size="lg">
            Reserve
          </Button>
          {numberOfNights > 0 && (
            <div className="space-y-2 text-sm mt-4">
              <p className="text-center text-gray-500 mb-2">You won't be charged yet</p>
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
      </CardContent>
    </Card>
  );
};