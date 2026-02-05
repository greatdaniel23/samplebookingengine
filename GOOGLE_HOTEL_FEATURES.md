# 🏨 Villa Booking Engine Features
*For Google Hotel Center & Google Hotel Ads Registration*

This document lists the technical and functional features of the Booking Engine to support registration and integration with Google Hotel.

## 1. Booking & Availability Engine
*   **Real-Time Availability**: The system queries the database in real-time to ensure 100% accurate room inventory and prevent overbooking.
*   **Direct Booking**: Commission-free direct booking capabilities hosted on the property's official domain.
*   **Multiple Rate Plans**: Support for various package types (e.g., "Standard Rate", "Breakfast Included", "Romance Package", "Long Stay") with distinct validity dates and pricing.
*   **Occupancy Management**: Accurate handling of guest counts (Adults, Children) per room.
*   **Instant Confirmation**: Guests receive an automated, branded email confirmation immediately upon booking completion.

## 2. Technical Performance (Google Best Practices)
*   **Mobile-First Design**: Fully responsive interface optimized for mobile devices (passing Google's Mobile-Friendly requirements).
*   **High Performance (Core Web Vitals)**: Built on **Cloudflare Workers** (Edge Computing) and **Vite**, ensuring lightning-fast load times (LCP) and minimal layout shift (CLS), which improves Quality Score for ads.
*   **High Availability**: Hosted on Cloudflare's global edge network, ensuring 100% uptime and low latency worldwide.
*   **SSL/HTTPS Security**: Full TLS encryption for all pages, protecting user data and meeting Google's security standards.

## 3. User Experience & Content
*   **Rich Media Gallery**: High-resolution image galleries stored in Cloudflare R2 for fast delivery.
*   **Detailed Amenities**: Structured display of room features (WiFi, Pool, AC, etc.) to match Google's amenity schema.
*   **Room & Package Descriptions**: Comprehensive descriptions helping users make informed decisions.
*   **Search & Filter**: Users can easily search by Check-in/Check-out dates and filter by package type.

## 4. Payment & Security
*   **Integrated Payment Gateway**: Secure integration with **DOKU** Payment Gateway.
*   **Secure Transactions**: PCI-DSS compliant processing (via DOKU) with HMAC-SHA256 signature verification for transaction integrity.
*   **Local Currency Support**: Native support for **IDR (Indonesian Rupiah)**.

## 5. Analytics & Tracking (Ad Ready)
*   **Google Analytics 4 (GA4)**: Native integration for tracking traffic and user behavior.
*   **Google Tag Manager (GTM)**: Built-in GTM container support allows for easy implementation of **Google Hotel Ads Conversion Tracking** and remarketing tags without code changes.

## 6. Registration Data Points
Use these details when filling out the "Official Site" or "Connectivity Partner" forms:
*   **Booking Engine URL**: `https://[your-domain]/packages` (or your specific landing page)
*   **Booking Path**: Landing Page -> Date Selection -> Room/Package Selection -> Guest Details -> Payment -> Confirmation.
*   **Supported Currencies**: IDR
*   **Supported Languages**: English
*   **Server Location**: Global (Edge/Cloudflare)

## 7. Recommended Updates for Full Compliance
To ensure fully automated integration with Google Hotel Ads (ARI), the following updates are recommended:

### A. Inventory Feed Endpoint (ARI)
*   **Current Status**: Manual API endpoints exist.
*   **Requirement**: Create a dedicated endpoint (e.g., `/api/feed/google`) to generate a dynamic **XML or CSV feed** listing all active packages, rates, and availability.
*   **Format**: Must follow Google's [Transaction (Property Data) Feed](https://developers.google.com/hotels/hotel-prices/xml-reference/transaction-messages) specifications.

### B. Structured Data (JSON-LD)
*   **Current Status**: Missing on package detail pages.
*   **Requirement**: Inject `Product` and `Hotel/LodgingBusiness` schema markup into the `<head>` of `PackageDetails.tsx`.
*   **Benefit**: Enables Google to parse price, availability, and ratings directly from the page source for "Free Booking Links".

### C. XML Sitemap
*   **Current Status**: Missing.
*   **Requirement**: Generate a dynamic `sitemap.xml` that lists all active package URLs.
*   **Benefit**: Ensures Googlebot discovers new packages immediately.

### D. Conversion Tracking Verification
*   **Current Status**: GTM is present.
*   **Requirement**: Verify that the `purchase` event in GA4/GTM sends the specific parameters required by Google Hotel Ads: `hvalue` (total value), `hcurrency` (IDR), and `oid` (booking reference).
