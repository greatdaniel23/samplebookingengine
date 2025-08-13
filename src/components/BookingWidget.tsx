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

interface BookingWidgetProps {
  pricePerNight: number;
}

export const BookingWidget = ({ pricePerNight }: BookingWidgetProps) => {
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

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
      setStep(3);
    } else if (step === 3) {
      // Mock payment processing
      setStep(4);
      showSuccess("Booking confirmed!");
    }
  };
  
  const handleReset = () => {
    setStep(1);
    setDateRange(undefined);
    setGuests(1);
    setName("");
    setEmail("");
  }

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
            <Button onClick={handleNextStep} className="w-full" size="lg" disabled={!dateRange?.from || !dateRange?.to}>
              Request to Book
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
        );
      case 2:
        return (
          <div className="grid gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john.doe@example.com" />
              </div>
            </div>
            <Button onClick={handleNextStep} className="w-full" size="lg">
              Confirm and Continue
            </Button>
          </div>
        );
      case 3:
        return (
          <div className="grid gap-4">
            <p className="text-sm text-gray-500">Enter your payment information to complete the booking.</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="card">Card Number</Label>
                <Input id="card" placeholder="0000 0000 0000 0000" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" />
                </div>
              </div>
            </div>
            <Button onClick={handleNextStep} className="w-full" size="lg">
              Confirm Booking
            </Button>
          </div>
        );
      case 4:
        return (
          <div className="text-center grid gap-4">
            <h3 className="text-2xl font-bold text-green-600">Booking Confirmed!</h3>
            <p>Thank you, {name}! Your booking for the villa is complete.</p>
            <div className="text-left bg-gray-50 p-4 rounded-lg border">
              <p><strong>Dates:</strong> {dateRange?.from && format(dateRange.from, "PPP")} - {dateRange?.to && format(dateRange.to, "PPP")}</p>
              <p><strong>Guests:</strong> {guests}</p>
              <p className="font-bold mt-2"><strong>Total Paid:</strong> ${totalPrice.toFixed(2)}</p>
            </div>
            <Button onClick={handleReset} className="w-full" size="lg" variant="outline">
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
            <span className="text-base font-normal text-gray-600"> / night</span>
          </>
        );
      case 2:
        return "Review and Confirm";
      case 3:
        return "Complete Payment";
      case 4:
        return "Confirmation";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border rounded-xl">
      <CardHeader className="flex flex-row items-center gap-2">
        {step > 1 && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <CardTitle className="flex-grow text-xl">
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderStepContent()}
      </CardContent>
    </Card>
  );
};