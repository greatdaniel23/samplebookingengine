# GA4 E-commerce Event Tracking Implementation

## Overview
This document outlines the GA4 e-commerce events for the hotel booking engine. Events are pushed to the `dataLayer` for Google Tag Manager (GTM) to process and send to GA4.

## Existing Infrastructure
- **GTMLoader.tsx**: Dynamically loads GTM containers from the API
- **ga4Analytics.ts**: Utility for pushing events to dataLayer

---

## Standard GA4 E-commerce Events

### 9. `button_click` - Button Interaction Tracking
**Trigger:** Click on key conversion buttons (Book Now, View Details, Select Room)

| Parameter | Type | Description |
|-----------|------|-------------|
| button_name | string | 'book_now', 'view_details', 'select_room' |
| package_name | string | Name of package context |
| package_id | string | ID of package |
| room_name | string | Name of room context |
| check_in | string | Selected check-in date |
| check_out | string | Selected check-out date |
| value | number | Price/Value associated with button |
| currency | string | Currency code |

**Implementation Location:** Package Cards, Package Details, Room Details

---

## Implementation Checklist

### Phase 1: Core Events
- [x] Add `view_item` tracking to `PackageDetails.tsx`
- [x] Add `view_item` tracking to `RoomDetails.tsx`
- [x] Add `select_item` tracking to `PackageCard.tsx`
- [x] Add `add_to_cart` tracking for room selection

### Phase 2: Checkout Flow
- [x] Add `view_cart` tracking to `BookingSummary.tsx`
- [x] Add `add_payment_info` tracking to payment flow
- [x] Verify `begin_checkout` is firing correctly
- [x] Verify `purchase` is firing on confirmation

### Phase 3: Additional Events
- [x] Add `search` event for date/guest searches
- [x] Add `view_item_list` for packages list page
- [x] Add `button_click` for detailed interaction tracking (New)

### Phase 4: Page Tracking
- [x] Add `trackPageView` utility
- [x] Add tracking to Homepage
- [x] Add tracking to Packages List
- [x] Add tracking to Book Page
- [x] Add tracking to Confirmation Page
- [x] Add tracking to Package Details Page
- [x] Add tracking to Room Details Page

---

## Function Signatures to Add

```typescript
// Button Click
export function trackButtonClick(params: {
    button_name: string;
    page_location?: string;
    package_name?: string;
    package_id?: string;
    room_name?: string;
    check_in?: string;
    check_out?: string;
    value?: number;
    currency?: string;
}) { ... }
```

```typescript
// View item (package or room)
export function trackViewItem(params: {
    item_id: string;
    item_name: string;
    item_category: string;
    price: number;
    currency?: string;
}) { ... }

// Select item from list
export function trackSelectItem(params: {
    item_id: string;
    item_name: string;
    item_list_name: string;
}) { ... }


// Add to cart (room selection)
export function trackAddToCart(params: {
    item_id: string;
    item_name: string;
    item_category: string;
    price: number;
    quantity: number;
    currency?: string;
}) { ... }

// View cart (booking summary)
export function trackViewCart(params: {
    value: number;
    currency?: string;
    items: Array<{
        item_id: string;
        item_name: string;
        price: number;
        quantity: number;
    }>;
}) { ... }

// Add payment info
export function trackAddPaymentInfo(params: {
    value: number;
    currency?: string;
    payment_type: string;
}) { ... }

// Search
export function trackSearch(params: {
    search_term: string;
    check_in?: string;
    check_out?: string;
    guests?: number;
}) { ... }

// Page View
export function trackPageView(params: {
    page_type: string;
    page_title: string;
    page_path?: string;
    page_data?: Record<string, any>;
}) { ... }
```

---

## GTM Configuration Notes

### 1. Create Data Layer Variables
For each parameter you want to track, create a **Data Layer Variable** in GTM:

**E-commerce Variables:**
| Variable Name | Data Layer Variable Name |
|---------------|-------------------------|
| `dlv - ecommerce.value` | `ecommerce.value` |
| `dlv - ecommerce.currency` | `ecommerce.currency` |
| `dlv - ecommerce.items` | `ecommerce.items` |
| `dlv - ecommerce.transaction_id` | `ecommerce.transaction_id` |

**Page Tracking Variables:**
| Variable Name | Data Layer Variable Name |
|---------------|-------------------------|
| `dlv - page_type` | `page_type` |
| `dlv - page_title` | `page_title` |
| `dlv - page_path` | `page_path` |
| `dlv - page_data` | `page_data` |
| `dlv - page_data.booking_reference` | `page_data.booking_reference` |
| `dlv - page_data.total_amount` | `page_data.total_amount` |
| `dlv - page_data.package_name` | `page_data.package_name` |

### 2. Configure GA4 Event Tags
In Google Tag Manager, create the following tags:

**E-commerce Tags (Purchase, Begin Checkout, etc.):**
- **Trigger:** Custom Event (`purchase`, `begin_checkout`, etc.)
- ✅ **Uncheck "Send Ecommerce data"** (IMPORTANT: to prevent 1,000,000x multiplier bug)
- **Event Parameters:** Manually map `value`, `currency`, `items` to the DLVs created above.

**Page View Tag:**
- **Trigger:** Custom Event `page_view`
- **Event Name:** `page_view` (or custom name if preferred)
- **Event Parameters:** Map `page_type`, `page_data` etc. to DLVs.

### 3. Data Layer Structure
The e-commerce events now use the correct GA4 structure:
```javascript
dataLayer.push({ ecommerce: null });  // Clear previous
dataLayer.push({
  event: "begin_checkout",
  booking_reference: "BK-123",
  customer_email: "user@example.com",
  ecommerce: {
    currency: "IDR",
    value: 450,
    items: [{
      item_id: "BK-123",
      item_name: "Business Elite",
      item_category: "Package",
      price: 450,
      quantity: 1
    }]
  }
});
```

---

## Testing

Use **GTM Preview Mode** and **GA4 DebugView** to verify:
1. Events fire at correct times
2. Parameters are populated correctly
3. E-commerce data appears in GA4 reports

