import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { differenceInDays, format } from 'date-fns';
import { showError } from '@/utils/toast';
import { Check, Users, Calendar as CalendarIcon, CreditCard } from 'lucide-react';
import { Room } from '@/types';

// Guest Information Schema
const guestSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  specialRequests: z.string().optional()
});

type GuestFormData = z.infer<typeof guestSchema>;

interface BookingStepsProps {
  room: Room;
  disabledDates?: (date: Date) => boolean;
  onBookingComplete: (bookingData: {
    dateRange: DateRange;
    guests: number;
    guestInfo: GuestFormData;
    totalPrice: number;
  }) => void;
  isBooking?: boolean;
}

export function BookingSteps({ room, disabledDates, onBookingComplete, isBooking = false }: BookingStepsProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guestCount, setGuestCount] = useState(1);

  // FIXED: Use simple state instead of React Hook Form to prevent input issues
  const [formData, setFormData] = useState<GuestFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof GuestFormData, string>>>({});

  // Validate form data
  const validateForm = () => {
    const errors: Partial<Record<keyof GuestFormData, string>> = {};
    
    if (!formData.firstName || formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    if (!formData.lastName || formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone || formData.phone.trim().length < 10) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof GuestFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormComplete = () => {
    return formData.firstName.trim().length >= 2 &&
           formData.lastName.trim().length >= 2 &&
           formData.email.trim().length > 0 &&
           formData.phone.trim().length >= 10;
  };

  const onGuestInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      setCurrentStep(3);
    }
  };

  // No auto-advance - user must click button to proceed
  // Removed auto-progression useEffect

  // Calculate pricing
  const nights = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from) 
    : 0;
  const basePrice = nights * room.price;
  const serviceFee = basePrice * 0.1;
  const totalPrice = basePrice + serviceFee;

  // Step 1: Date Selection Component
  const DateSelectionStep = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-medium mb-4 block">Select Your Dates</Label>
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={1}
          disabled={(date) => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return date < yesterday || (disabledDates && disabledDates(date));
          }}
          className="rounded-md border mx-auto"
        />
      </div>
      
      <div>
        <Label htmlFor="guests" className="text-lg font-medium">Number of Guests</Label>
        <div className="flex items-center space-x-3 mt-2">
          <Input
            id="guests"
            type="number"
            min={1}
            max={room.occupancy}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-500">
            (Maximum {room.occupancy} guests)
          </span>
        </div>
      </div>

      {dateRange?.from && dateRange?.to && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-medium">
              Perfect! {nights} night{nights !== 1 ? 's' : ''} selected
            </p>
          </div>
          <p className="text-green-600 text-sm mt-1">
            {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
          </p>
        </div>
      )}

      <Button 
        onClick={() => {
          if (!dateRange?.from || !dateRange?.to) {
            showError('Please select your check-in and check-out dates');
            return;
          }
          if (nights === 0) {
            showError('Please select valid dates');
            return;
          }
          if (guestCount > room.occupancy) {
            showError(`This room can only accommodate up to ${room.occupancy} guests`);
            return;
          }
          setCurrentStep(2);
        }}
        disabled={!dateRange?.from || !dateRange?.to || nights === 0}
        className="w-full"
        size="lg"
      >
        Continue to Guest Information
      </Button>
    </div>
  );

  // Step 2: COMPLETELY FIXED Guest Information Component with controlled inputs
  const GuestInfoStep = () => (
    <form onSubmit={onGuestInfoSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Enter Your Details</h3>
        <p className="text-sm text-gray-500">Please fill out all required information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={formErrors.firstName ? 'border-red-500' : ''}
            placeholder="Enter your first name"
            autoComplete="given-name"
          />
          {formErrors.firstName && (
            <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={formErrors.lastName ? 'border-red-500' : ''}
            placeholder="Enter your last name"
            autoComplete="family-name"
          />
          {formErrors.lastName && (
            <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={formErrors.email ? 'border-red-500' : ''}
          placeholder="Enter your email address"
          autoComplete="email"
        />
        {formErrors.email && (
          <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className={formErrors.phone ? 'border-red-500' : ''}
          placeholder="Enter your phone number"
          autoComplete="tel"
        />
        {formErrors.phone && (
          <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
        )}
      </div>

      <div>
        <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
        <Textarea
          id="specialRequests"
          value={formData.specialRequests || ''}
          onChange={(e) => handleInputChange('specialRequests', e.target.value)}
          placeholder="Any special accommodations, dietary requirements, accessibility needs, or other requests..."
          className="min-h-[100px] resize-y"
          rows={4}
        />
        <p className="text-sm text-gray-500 mt-1">
          Please describe any special needs or preferences for your stay
        </p>
      </div>

      {/* Progress indicator */}
      {isFormComplete() && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-medium">
              All information complete! Ready to proceed.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
          className="flex-1"
        >
          ← Back to Dates
        </Button>
        
        <Button 
          type="submit"
          disabled={!isFormComplete()}
          className="flex-1"
        >
          Continue to Review →
        </Button>
      </div>
    </form>
  );

  // Step 3: Review & Final Price Component
  const ReviewStep = () => {
    const guestInfo = formData;
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Review Your Booking</h3>
          <p className="text-sm text-gray-500">Please review all details before confirming</p>
        </div>

        {/* Booking Summary */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold mb-3 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Booking Summary
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Room:</span>
              <span className="font-medium">{room.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Dates:</span>
              <span>{dateRange?.from && format(dateRange.from, 'MMM d')} - {dateRange?.to && format(dateRange.to, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span>Guests:</span>
              <span>{guestCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Nights:</span>
              <span>{nights}</span>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Guest Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Name:</span>
              <span>{guestInfo.firstName} {guestInfo.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span>{guestInfo.email}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{guestInfo.phone}</span>
            </div>
            {guestInfo.specialRequests && (
              <div className="mt-2 pt-2 border-t">
                <span className="font-medium">Special Requests:</span>
                <p className="text-gray-600 mt-1">{guestInfo.specialRequests}</p>
              </div>
            )}
          </div>
        </div>

        {/* Final Price Breakdown */}
        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
          <h4 className="font-semibold mb-3 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Price Breakdown
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>${room.price} × {nights} nights</span>
              <span>${basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Service fee (10%)</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <hr className="border-green-300" />
            <div className="flex justify-between font-bold text-lg text-green-800">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(2)}
            className="flex-1"
          >
            Edit Guest Info
          </Button>
          
          <Button 
            onClick={() => {
              if (dateRange?.from && dateRange?.to) {
                onBookingComplete({
                  dateRange: { from: dateRange.from, to: dateRange.to },
                  guests: guestCount,
                  guestInfo,
                  totalPrice
                });
              }
            }}
            disabled={isBooking}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isBooking ? 'Saving to Database...' : 'Confirm & Book Now'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="flex justify-between items-center">
        {[
          { num: 1, label: 'Select Dates', icon: CalendarIcon },
          { num: 2, label: 'Guest Details', icon: Users },
          { num: 3, label: 'Review & Pay', icon: CreditCard }
        ].map((step, index) => (
          <React.Fragment key={step.num}>
            <div className={`flex items-center ${
              step.num <= currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step.num < currentStep 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : step.num === currentStep
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white border-gray-300'
              }`}>
                {step.num < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <span className="text-sm font-medium block">{step.label}</span>
                <span className="text-xs text-gray-500">
                  {step.num === 1 && 'Choose dates & guests'}
                  {step.num === 2 && 'Enter your information'}
                  {step.num === 3 && 'Confirm booking'}
                </span>
              </div>
            </div>
            
            {index < 2 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                step.num < currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {currentStep === 1 && (
              <>
                <CalendarIcon className="w-5 h-5 mr-2" />
                Step 1: Select Your Dates & Guests
              </>
            )}
            {currentStep === 2 && (
              <>
                <Users className="w-5 h-5 mr-2" />
                Step 2: Enter Guest Information
              </>
            )}
            {currentStep === 3 && (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Step 3: Review & Confirm Booking
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && <DateSelectionStep />}
          {currentStep === 2 && <GuestInfoStep />}
          {currentStep === 3 && <ReviewStep />}
        </CardContent>
      </Card>
    </div>
  );
}