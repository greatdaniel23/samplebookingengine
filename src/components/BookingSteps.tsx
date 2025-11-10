import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { differenceInDays, format } from 'date-fns';
import { showError } from '@/utils/toast';
import { Check, Users, Calendar as CalendarIcon, CreditCard, DollarSign } from 'lucide-react';
import { Room, Package } from '@/types';

interface GuestFormData { firstName: string; lastName: string; email: string; phone: string; specialRequests?: string }

interface BookingStepsProps { room?: Room; package?: Package; disabledDates?: (date: Date) => boolean; onBookingComplete: (b:{dateRange:DateRange;guests:number;guestInfo:GuestFormData;totalPrice:number})=>void; isBooking?: boolean }

// Child component props
interface DateStepProps { dateRange: DateRange|undefined; setDateRange: (r:DateRange|undefined)=>void; guestCount:number; setGuestCount:(n:number)=>void; room?:Room; package?:Package; nights:number; disabledDates?: (d:Date)=>boolean; onNext:()=>void }
interface GuestStepProps { data:GuestFormData; errors:Partial<Record<keyof GuestFormData,string>>; handleField:(f:keyof GuestFormData)=>(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>void; submitGuest:(e:React.FormEvent)=>void; canProceedGuest:boolean; setStep:(n:number)=>void }
interface ReviewStepProps { room?:Room; package?:Package; guestCount:number; dateRange:DateRange|undefined; nights:number; basePrice:number; serviceFee:number; totalPrice:number; data:GuestFormData; isBooking:boolean; onConfirm:()=>void; onEdit:()=>void }

// Date selection step component
const DateStep: React.FC<DateStepProps> = ({ dateRange, setDateRange, guestCount, setGuestCount, room, package: pkg, nights, disabledDates, onNext }) => {
  const maxGuests = room?.occupancy || pkg?.max_guests || 2;
  const maxNights = pkg?.max_nights;
  const minNights = pkg?.min_nights || 1;
  
  return (
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
        <Input id="guests" type="number" min={1} max={maxGuests} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="w-24" />
        <span className="text-sm text-gray-500">(Maximum {maxGuests} guests)</span>
      </div>
    </div>
    {dateRange?.from && dateRange?.to && (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-700 font-medium">{nights} night{nights !== 1 ? 's' : ''} selected</p>
        </div>
        <p className="text-green-600 text-sm">{format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}</p>
      </div>
    )}
    <Button
      onClick={onNext}
      disabled={!dateRange?.from || !dateRange?.to || nights === 0}
      className="w-full btn-hotel-primary" size="lg"
    >
      Continue to Guest Information
    </Button>
  </div>
  );
};

// Guest info step component
const GuestStep: React.FC<GuestStepProps> = ({ data, errors, handleField, submitGuest, canProceedGuest, setStep }) => (
  <form onSubmit={submitGuest} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="firstName">First Name *</Label>
        <Input id="firstName" value={data.firstName} onChange={handleField('firstName')} placeholder="First name" autoComplete="given-name" className={errors.firstName ? 'border-red-500' : ''} />
        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
      </div>
      <div>
        <Label htmlFor="lastName">Last Name *</Label>
        <Input id="lastName" value={data.lastName} onChange={handleField('lastName')} placeholder="Last name" autoComplete="family-name" className={errors.lastName ? 'border-red-500' : ''} />
        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
      </div>
    </div>
    <div>
      <Label htmlFor="email">Email Address *</Label>
      <Input id="email" type="email" value={data.email} onChange={handleField('email')} placeholder="Email" autoComplete="email" className={errors.email ? 'border-red-500' : ''} />
      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
    </div>
    <div>
      <Label htmlFor="phone">Phone Number *</Label>
      <Input id="phone" type="tel" value={data.phone} onChange={handleField('phone')} placeholder="Phone" autoComplete="tel" className={errors.phone ? 'border-red-500' : ''} />
      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
    </div>
    <div>
      <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
      <Textarea id="specialRequests" value={data.specialRequests || ''} onChange={handleField('specialRequests')} placeholder="Special requests..." className="min-h-[90px] resize-y" rows={4} />
    </div>
    {canProceedGuest && (
      <div className="p-3 bg-green-50 border border-green-200 rounded flex items-center space-x-2">
        <Check className="w-5 h-5 text-green-600" />
        <p className="text-green-700 text-xs">All info complete</p>
      </div>
    )}
    <div className="flex flex-col sm:flex-row gap-3 pt-4">
      <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">← Back</Button>
      <Button type="submit" disabled={!canProceedGuest} className="flex-1">Continue →</Button>
    </div>
  </form>
);

// Review step component
const ReviewStep: React.FC<ReviewStepProps> = ({ room, package: pkg, guestCount, dateRange, nights, basePrice, serviceFee, totalPrice, data, isBooking, onConfirm, onEdit }) => (
  <div className="space-y-6">
    <div className="border rounded-lg p-4 bg-gray-50">
      <h4 className="font-semibold mb-3 flex items-center"><CalendarIcon className="w-4 h-4 mr-2" />Booking Summary</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>{pkg ? 'Package:' : 'Room:'}</span>
          <span className="font-medium">{pkg ? pkg.name : room?.name}</span>
        </div>
        <div className="flex justify-between"><span>Dates:</span><span>{dateRange?.from && format(dateRange.from, 'MMM d')} - {dateRange?.to && format(dateRange.to, 'MMM d, yyyy')}</span></div>
        <div className="flex justify-between"><span>Guests:</span><span>{guestCount}</span></div>
        <div className="flex justify-between"><span>Nights:</span><span>{nights}</span></div>
      </div>
    </div>
    <div className="border rounded-lg p-4">
      <h4 className="font-semibold mb-3 flex items-center"><Users className="w-4 h-4 mr-2" />Guest Info</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span>Name:</span><span>{data.firstName} {data.lastName}</span></div>
        <div className="flex justify-between"><span>Email:</span><span>{data.email}</span></div>
        <div className="flex justify-between"><span>Phone:</span><span>{data.phone}</span></div>
        {data.specialRequests && <div className="mt-2 pt-2 border-t"><span className="font-medium">Special Requests:</span><p className="text-gray-600 mt-1">{data.specialRequests}</p></div>}
      </div>
    </div>
    <div className="border rounded-lg p-4 bg-green-50 border-green-200">
      <h4 className="font-semibold mb-3 flex items-center"><DollarSign className="w-4 h-4 mr-2" />Price</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>
            {pkg ? `Package: ${pkg.name}` : `${room?.name} × ${nights} nights`}
          </span>
          <span>${basePrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600"><span>Service fee 10%</span><span>${serviceFee.toFixed(2)}</span></div>
        <hr />
        <div className="flex justify-between font-bold text-green-800"><span>Total</span><span>${totalPrice.toFixed(2)}</span></div>
      </div>
    </div>
    <div className="flex gap-3 pt-2">
      <Button variant="outline" onClick={onEdit} className="flex-1">Edit Info</Button>
      <Button onClick={onConfirm} disabled={isBooking} className="flex-1 bg-green-600 hover:bg-green-700" size="lg">{isBooking ? 'Saving...' : 'Confirm & Book'}</Button>
    </div>
  </div>
);

export function BookingSteps({ room, package: pkg, disabledDates, onBookingComplete, isBooking = false }: BookingStepsProps) {
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [guestCount, setGuestCount] = useState(1);
  const [data, setData] = useState<GuestFormData>({ firstName: '', lastName: '', email: '', phone: '', specialRequests: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof GuestFormData, string>>>({});

  const nights = useMemo(() => (dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) : 0), [dateRange]);
  const basePrice = useMemo(() => {
    if (pkg) {
      return nights * parseFloat(pkg.base_price);
    }
    return nights * parseFloat(room?.price || '0');
  }, [nights, room?.price, pkg]);
  const serviceFee = useMemo(() => basePrice * 0.1, [basePrice]);
  const totalPrice = basePrice + serviceFee;

  const validate = (draft: GuestFormData) => {
    const e: typeof errors = {};
    if (draft.firstName.trim().length < 2) e.firstName = 'Min 2 chars';
    if (draft.lastName.trim().length < 2) e.lastName = 'Min 2 chars';
    if (!/\S+@\S+\.\S+/.test(draft.email)) e.email = 'Invalid email';
    if (draft.phone.trim().length < 10) e.phone = 'Min 10 digits';
    return e;
  };
  const canProceedGuest = useMemo(() => Object.keys(validate(data)).length === 0, [data]);
  const handleField = (field: keyof GuestFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const raw = e.target.value;
    const value = field === 'phone' ? raw.replace(/\D/g, '') : raw; // numeric-only for phone
    setData((d) => ({ ...d, [field]: value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };
  const submitGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(data);
    setErrors(v);
    if (Object.keys(v).length === 0) setStep(3);
  };

  const confirmBooking = () => {
    if (!dateRange?.from || !dateRange?.to) return;
    onBookingComplete({ dateRange: { from: dateRange.from, to: dateRange.to }, guests: guestCount, guestInfo: data, totalPrice });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        {[
          { num: 1, label: 'Select Dates', icon: CalendarIcon },
          { num: 2, label: 'Guest Details', icon: Users },
          { num: 3, label: 'Review & Confirm', icon: CreditCard }
        ].map((s, i) => (
          <React.Fragment key={s.num}>
            <div className={`flex items-center ${s.num <= step ? 'text-hotel-gold' : 'text-hotel-bronze'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${s.num <= step ? 'bg-hotel-gold text-white border-hotel-gold' : 'bg-white border-hotel-cream'}`}>
                {s.num < step ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <div className="ml-3 hidden sm:block">
                <span className="text-sm font-medium block">{s.label}</span>
                <span className="text-xs text-hotel-bronze">
                  {s.num === 1 && 'Choose dates & guests'}
                  {s.num === 2 && 'Enter your information'}
                  {s.num === 3 && 'Confirm booking'}
                </span>
              </div>
            </div>
            {i < 2 && <div className={`flex-1 h-0.5 mx-4 ${s.num < step ? 'bg-hotel-gold' : 'bg-hotel-cream'}`} />}
          </React.Fragment>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {step === 1 && (<><CalendarIcon className="w-5 h-5 mr-2" />Step 1</>)}
            {step === 2 && (<><Users className="w-5 h-5 mr-2" />Step 2</>)}
            {step === 3 && (<><CreditCard className="w-5 h-5 mr-2" />Step 3</>)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <DateStep dateRange={dateRange} setDateRange={setDateRange} guestCount={guestCount} setGuestCount={setGuestCount} room={room} package={pkg} nights={nights} disabledDates={disabledDates} onNext={() => {
              if (!dateRange?.from || !dateRange?.to || nights === 0) return showError('Select valid dates');
              const maxGuests = room?.occupancy || pkg?.max_guests || 2;
              if (guestCount > maxGuests) return showError(`Max ${maxGuests} guests`);
              if (pkg && (nights < pkg.min_nights || nights > pkg.max_nights)) {
                return showError(`Package requires ${pkg.min_nights}-${pkg.max_nights} nights`);
              }
              setStep(2);
            }} />
          )}
          {step === 2 && (
            <GuestStep data={data} errors={errors} handleField={handleField} submitGuest={submitGuest} canProceedGuest={canProceedGuest} setStep={setStep} />
          )}
          {step === 3 && (
            <ReviewStep room={room} package={pkg} guestCount={guestCount} dateRange={dateRange} nights={nights} basePrice={basePrice} serviceFee={serviceFee} totalPrice={totalPrice} data={data} isBooking={isBooking} onConfirm={confirmBooking} onEdit={() => setStep(2)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}