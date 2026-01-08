UI Design System Analysis: Marriott Booking Interface

1. Typography System (t- Classes)

The interface uses a utility-based typography system, likely mapped to a global CSS scale.

Font Family: Primary font is likely Swiss 721 (Marriott's brand font) or Noto Sans for localized support (Indonesian), as hinted by the generic sans-serif structure and brand guidelines.

Font Weights:

t-font-weight-m: Used for labels like "3 Jenis Kamar Tersedia" (3 Room Types Available). This denotes a Medium (500) weight, used to create hierarchy without the harshness of a full Bold.

t-title-s / t-subtitle-m (Inferred): Section headers typically use these utility classes to define size (S, M, L, XL).

Text Hierarchy:

Primary Headings: Large, high-contrast (e.g., Hotel Name).

Secondary Labels: Medium weight, often uppercase or slightly tracked out (e.g., "MEMBER RATE").

Body Text: Standard weight (400) for descriptions and disclaimer text.

Micro-copy: Small text for taxes and fees, often in a lighter grey.

2. Spacing & Layout System

The layout relies heavily on Adobe Experience Manager (AEM) grid structures and utility classes.

The Grid (aem-Grid)

12-Column Fluid Grid: The class aem-Grid--12 establishes a standard 12-column layout.

Responsive Behavior: Classes like aem-GridColumn--default--12 indicate that on mobile/default views, components take up the full width (12/12 columns), stacking vertically.

Flexbox Utilities (d-flex)

Alignment: d-flex align-items-center justify-content-between is frequently used (e.g., in the "Tax and Currency" bar). This creates a "Space Between" layout where the label is on the far left and the content on the far right.

Direction: flex-column is used within cards and modals to stack content vertically.

Whitespace (Inferred)

Card Padding: The room cards (sc-6b67e84f-0) appear to use internal padding of approximately 16px - 24px (1rem - 1.5rem).

Section Gaps: There is significant whitespace between the "Alerts" section and the "Room List," likely 32px+ to separate distinct logical areas.

3. Component Architecture

The code reveals a modular, component-based architecture (likely React or similar, indicated by sc- styled-component hashes).

Cards (o-book-ratecard)

Structure:

Header: Image Carousel (glide--slider) + Room Title.

Body: Amenities list (Icons + Text).

Footer: Price comparison (Standard vs. Member) + CTA Button.

Visual Style:

Borders: Likely a 1px solid light grey (#E0E0E0) border.

Shadows: Subtle drop-shadow on hover to indicate interactivity.

Background: White (#FFFFFF) against a light grey page background.

Alerts & Messaging (m-book-MessageCard)

Classes: sc-b6b2b2ed-0, accessibility-alert.

Design:

Iconography: Uses icon-accessibility on the left.

Color: Typically uses a light blue or light yellow background for information/warnings.

Layout: Horizontal layout (Icon + Text).

Modals (m-book-ModalUI)

Behavior: Used for "Rate Details" and "Session Timeout".

Overlay: A dark, semi-transparent backdrop (rgba(0,0,0,0.5)) focuses attention.

Flyouts: The code showNRPRlmFlyoutModal suggests slide-out panels for specific actions, offering a modern, app-like feel on mobile.

4. Color System (Inferred)

Primary Action: Marriott Pink/Red (Brand Color) for "Select" buttons.

Secondary/Text: Dark Grey/Black (#1C1C1C) for primary text.

Success: Green (indicated by icon-success and sc-e263d13c-0 fJWIvz standard class context) for "Room Selected" states.

UI Chrome: Light Grey (#F4F4F4) for backgrounds and dividers.

5. Iconography

Font Icons: The system uses a font-based icon set (icon-success, icon-clear, icon-accessibility).

Usage: Icons are strictly functional—used to denote status (checkmarks), amenities (bed, coffee), or actions (close 'X').