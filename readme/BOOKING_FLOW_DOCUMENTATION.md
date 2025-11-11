# Frontend Booking Engine - Page Flow Documentation

## 📋 Application Overview
A modern React-based booking engine for hotels/villas with a clean, intuitive user interface built with TypeScript, Tailwind CSS, and Shadcn/ui components.

Now extended with dynamic user-driven data: persistent bookings, user information capture, availability-aware calendar, and an admin bookings dashboard.

## 🗺️ Navigation Structure

```
/ (Index Page)
├── /book/:roomId (Booking Page)
│   └── Booking Confirmation (same page, different state)
└── /* (404 Not Found Page)
```

---

## 📄 Page Breakdown

### 1. **Index Page** (`/`)
**File:** `src/pages/Index.tsx`

#### Purpose
Main landing page showcasing the villa/hotel with room selection capabilities.

#### Components Used
- `PhotoGallery` – Static 5-tile responsive image grid (hidden on mobile)
- `Amenities` – Icon + label grid mapped via `iconMap`
- `RoomCard` – Card with image, description, price, navigates via `useNavigate` to `/book/:roomId`

#### Page Sections
1. **Header Section**
   - Villa name: "Serene Mountain Retreat"
   - Rating display (4.9 ⭐ with 128 reviews)
   - Location link: "Aspen, Colorado"

2. **Photo Gallery Section**
   - Image carousel showcasing villa exterior/interior
   - Multiple high-quality images from Unsplash

3. **Room Selection Section**
   - Title: "Select Your Room"
   - Subtitle: "Choose from our selection of luxurious rooms and suites"
   - Grid layout (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)
   - Room cards with:
     - Room image
     - Room name
     - Description
     - Price per night
     - "Book Now" button

4. **About Section**
   - Villa description (left column)
   - Amenities list (right column)

#### Available Rooms
1. **The Aspen Master Suite** - $450/night
2. **Twin Peaks Room** - $320/night  
3. **Garden View Loft** - $280/night

#### User Actions
- View villa photos
- Browse available rooms
- Click "Book Now" → Navigate to `/book/:roomId`

---

### 2. **Booking Page** (`/book/:roomId`)
**File:** `src/pages/Booking.tsx`

#### Purpose
Complete booking flow for a selected room with date selection, guest count, and payment summary.

#### Page States
1. **Initial Booking Form** – user enters stay dates + guest info
2. **Booking Pricing Visible** – dates selected, nights + fees computed
3. **Booking Pending** – submission in progress (loading state)
4. **Booking Confirmation** – success summary rendered

---

#### **State 1: Booking Form**

##### Left Column - Room Details
- **Back Navigation**
  - Ghost variant `Button` with label "Back to Villa" (navigates back using `navigate(-1)`)
  
- **Room Information**
  - Room image
  - Room name
  - Room description
  - Room specifications:
    - Size (sqft)
    - Bed configuration
    - Maximum occupancy
    - Feature list

##### Right Column - Booking Form
- **Date Selection**
  - Single `Calendar` component (`mode="range"`, `numberOfMonths={1}`)
  - Past dates (before yesterday) disabled via `disabled` prop
  - Conditional rendering: if no valid range yet, displays "Select dates to see price"

- **Guest Count**
  - Number input for guest count
  - Validation against room occupancy limit

- **Price Breakdown**
  - Base price calculation (nights × room rate)
  - Service fee (10% of base price)
  - Total price display

- **Booking Button**
  - Primary `Button` text changes: "Confirm and Book" → "Booking..." when `isBooking` true
  - Disabled while booking simulation in progress (1.5s timeout)

##### Validation Rules & Feedback
- Date range (`from` & `to`) required; nights computed with `differenceInDays(to, from)`
- Guest count must be ≥ 1 and ≤ `room.occupancy`
- Service fee = `basePrice * 0.1` (10%)
- User info form (first name, last name, email, optional phone) validated with `zod` + `react-hook-form`
- Dates disabled: past days + any day already booked for that room
- Errors surfaced through Sonner toasts: `showError`, success via `showSuccess`
- Booking success scrolls window to top and persists booking
- Invalid room id immediately renders `NotFound`

---

#### **State 2: Booking Confirmation**

##### Success Display
- **Header**
  - "Booking Confirmed!" title (styled green) – no checkmark icon currently
  - Thank you message paragraph

- **Booking Summary Card**
  - Generated booking ID (BK-XXXX format)
  - Room name
  - Check-in date (formatted)
  - Check-out date (formatted)
  - Total amount paid

- **Action Button**
  - "Return to Home" button → Navigate back to `/`

---

### 3. **404 Not Found Page** (`/*`)
**File:** `src/pages/NotFound.tsx`

#### Purpose
Fallback page for invalid routes.

#### Content
- Error message for non-existent pages
- Navigation back to home page

---

## 🎯 User Journey Flow

### **Step 1: Villa Discovery**
1. User visits homepage (`/`)
2. Views villa photos in gallery
3. Reads villa description and amenities
4. Browses available rooms

### **Step 2: Room Selection**
1. User reviews room options in grid layout
2. Compares prices, features, and occupancy
3. Clicks "Book Now" on desired room
4. Navigates to booking page (`/book/:roomId`)

### **Step 3: Booking Details**
1. User reviews selected room details
2. Selects check-in and check-out dates
3. Enters number of guests
4. Reviews price breakdown
5. Validates form inputs

### **Step 4: Booking Submission**
1. User clicks "Confirm Booking"
2. System validates all inputs
3. Shows loading state (1.5 second simulation)
4. Generates booking ID
5. Displays success confirmation

### **Step 5: Booking Confirmation**
1. User sees booking confirmation details
2. Can review booking summary
3. Returns to homepage via "Return to Home" button

---

## 🔧 Technical Implementation

### **State Management**
- Local component state in `BookingPage`:
  - `dateRange: DateRange | undefined`
  - `guests: number`
  - `isConfirmed: boolean` (toggles confirmation state rendering)
  - `bookingDetails: { id: number | null; reference?: string }`
  - `isBooking: boolean` (loading state for simulated network request)
- React Router `useParams` for room id; `useNavigate` for back navigation
- No global state (React Query included but not yet used for remote data on booking page)

### **Data Flow**
1. **Static Data:** Imported from `src/data/dummy.ts`
2. **Route Parameters:** Room ID passed via URL params
3. **Form State:** Local state in booking component
4. **Navigation:** React Router for page transitions

### **Validation & Error Handling**
- Guard rails before booking: missing dates, guests ≤ 0, guests > occupancy
- Conditional pricing only when `numberOfNights > 0`
- Toast helpers (`showSuccess`, `showError`) wrap Sonner `toast`
- `NotFound` page logs attempted path to console via `useEffect`
- Disabled past date selection + booked dates prevents invalid selections

### **Responsive Design**
- Mobile-first utility classes (Tailwind)
- Gallery hidden on small screens (`hidden md:grid`)
- Booking summary card uses `sticky top-8` to remain visible during scroll on large displays
- Adaptive room grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## 📊 Data Structure

### **Villa Data Schema**
```typescript
interface Villa {
  id: number;
  name: string;
  location: string;
  description: string;
  rating: number;
  reviews: number;
  images: string[];
  amenities: Amenity[];
  rooms: Room[];
}
```

### **Room Data Schema**
```typescript
interface Room {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  size: string;
  beds: string;
  occupancy: number;
  features: string[];
}
```

---

## 🎨 UI Components Used

### **Core Components**
- `Card` – Layout & content sections (image header, details, booking form)
- `Button` – Navigation & submission actions
- `Calendar` – Date range selection (single month)
- `Input` – Guest count numeric input
- `Label` – Form labeling for accessibility
- `Toaster` / `Sonner` – Toast portals + notifications
- `Form`, `FormField`, `FormItem`, etc. – Custom form primitives wrapping `react-hook-form`

### **Layout / Utility Classes**
- Tailwind `container`, `grid`, `flex` utility classes instead of abstracted components
- Sticky positioning for booking form card

### **Feedback Components**
- Toast notifications (Sonner)
- Muted conditional message when dates not yet selected
- Lucide icons for room attributes & amenities
- (Skeleton components present in repo but not currently used on these pages)

---

## 🚀 Future Enhancement Opportunities

### **Functionality**
- [ ] Real backend API integration (replace dummy data with fetch + React Query cache)
- [ ] Payment processing (Stripe or other provider)
- [ ] User authentication / profile management
- [ ] Booking management dashboard (CRUD operations)
- [ ] Email / SMS confirmations & reminders
- [ ] iCal / external calendar sync
- [ ] Admin authentication & role-based access

### **Features**
- [ ] Multiple villa inventory / multi-property routing
- [ ] Availability calendar integration (block out booked dates)
- [ ] Booking history per user
- [ ] Cancellation & modification flows
- [ ] Reviews & ratings (persisted + average computation)
- [ ] Export bookings (CSV / Excel)
- [ ] Per-room occupancy heatmap

### **UX Improvements**
- [ ] Progressive Web App (PWA) enhancements
- [ ] Offline read-only viewing of existing bookings
- [ ] Motion/animation (Framer Motion) for transitions
- [ ] Internationalization (i18n) & currency formatting
- [ ] Accessibility audit (ARIA roles, focus management for modals/toasts)
- [ ] Mobile photo gallery variant (currently hidden on small screens)
- [ ] Inline calendar loading skeleton when fetching remote availability

---

## 🗃️ Dynamic Data Layer
### Storage Strategy
Bookings persist to `localStorage` under key `bookings` for offline-friendly prototyping (to be replaced by API later).

### Booking Object Shape (`Booking`)
```
{
  id: number,
  reference: string,        // BK-XXXX
  roomId: string,
  from: ISODateString,
  to: ISODateString,
  guests: number,
  user: { firstName, lastName, email, phone? },
  total: number,
  createdAt: ISODateString
}
```

### Generation Logic
- `id` random 0–9999; `reference = 'BK-' + id` (collision risk acceptable for demo)
- Dates stored as ISO strings for serialization

### Availability Calculation
- A date is considered booked if: `date >= new Date(booking.from)` AND `date < new Date(booking.to)`
- Departure day (`to`) is not disabled allowing consecutive bookings starting same day.

### Context API (`BookingContext`)
- `bookings: Booking[]`
- `addBooking(booking)` – append & persist
- `getBookingsForRoom(roomId)` – filter by room
- `clearAllBookings()` – purge storage

### Admin Dashboard (`/admin`)
Displays searchable table (reference, room, guest, email, date range, nights, guests, total, created timestamp) with actions:
- Search by reference / room name / guest email
- Clear all bookings (destructive) – disabled when empty

---

## 🔐 Admin & Roles (Planned)
Currently open access. Future iteration should:
- Protect `/admin` route (JWT / session)
- Differentiate roles: admin vs guest
- Add audit logging (create/update/cancel)


---

## 🧪 Edge Cases & Scenarios
- Selecting identical `from` and `to` dates yields 0 nights → pricing section hidden until a valid range
- Attempting guest count > occupancy triggers toast error
- Negative or zero guests blocked by `min="1"` and validation
- Past dates disabled; user cannot select yesterday or earlier
- Invalid room id path (`/book/unknown`) renders `NotFound` immediately

## 🔁 Booking Flow (State Diagram - Textual)
1. Idle (no dates) → user selects range → Valid Range
2. Valid Range + guests input → Price Computed
3. User clicks Confirm → Booking Pending (`isBooking=true`)
4. After timeout → Confirmed (`isConfirmed=true`) → Confirmation Summary
5. User navigates home → Flow resets

## 🧮 Pricing Formula
```
numberOfNights = differenceInDays(to, from)
basePrice      = numberOfNights * room.price
serviceFee     = basePrice * 0.1
totalPrice     = basePrice + serviceFee
```
Renders only when `numberOfNights > 0`.

## 🔔 Toast Helpers
Defined in `src/utils/toast.ts` using Sonner:
- `showSuccess(message)`
- `showError(message)`
- `showLoading(message)` returns toast id
- `dismissToast(id)` dismisses loading toast


---

*Documentation generated on November 7, 2025*
*Project: Frontend Booking Engine*
*Repository: greatdaniel23/frontend-booking-engine*