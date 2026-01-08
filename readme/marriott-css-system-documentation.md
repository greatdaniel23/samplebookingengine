# Marriott CSS Design System Documentation

## Overview
This document provides a comprehensive analysis of Marriott's CSS architecture based on their actual production stylesheets. The system demonstrates enterprise-level CSS organization with brand-specific theming, component modularity, and scalable design tokens.

## 1. CSS Architecture Structure

### Core System Files
- `marriot.global.css` - Foundation styles, variables, typography, icons
- `brand-config.MV.css` - Marriott Vacation brand-specific overrides
- `37e634708fe09f7f.css` - Component-specific styles (DayPicker)
- `clientlib-static-component.min.css` - Minified component library
- `21b11f25d54af39b.css` - Additional component styles

### Architecture Pattern
```
Global Foundation (marriot.global.css)
├── CSS Custom Properties (:root)
├── Font Definitions (@font-face)
├── Base Reset & Typography
├── Icon System
└── Utility Classes

Brand Layer (brand-config.MV.css)
├── Brand-specific Color Schemes
├── Typography Overrides
├── Component Theming
└── Layout Configurations

Component Layer
├── Specific Component Styles
├── Interactive States
└── Responsive Behavior
```

## 2. CSS Custom Properties System

### Design Token Structure
Marriott uses a comprehensive CSS custom properties system with semantic naming:

```css
:root {
  /* Typography Tokens */
  --t-font-family: BaskervilleBT;
  --t-title-font-family: BaskervilleBT;
  
  /* Size Tokens */
  --t-title-l-font-size-viewport-xs: 2.125rem;
  --t-title-m-font-size-viewport-xs: 1.875rem;
  --t-title-s-font-size-viewport-xs: 1.5625rem;
  
  /* Color Tokens */
  --t-button-primary-bg-color: #078276;
  --t-button-primary-fg-color: #ffffff;
  --t-accent-color: #078276;
  
  /* Layout Tokens */
  --t-cards-border-radius: 14px;
  --t-button-border-radius: 52px;
  --t-images-border-radius: 14px;
}
```

### Token Categories

#### Typography Tokens
- **Font Families**: `--t-font-family`, `--t-title-font-family`
- **Font Sizes**: Viewport-specific sizing (`-viewport-xs`, `-viewport-m`, `-viewport-l`)
- **Font Weights**: `--t-title-l-font-weight: 300`
- **Text Transforms**: `--t-title-l-text-transform: uppercase`
- **Letter Spacing**: `--t-title-l-letter-space: normal`

#### Color System Tokens
- **Primary Actions**: `--t-button-primary-*` series
- **Secondary Actions**: `--t-button-secondary-*` series
- **Accent Colors**: `--t-accent-color`, `--t-interactive-accent-color`
- **Brand Colors**: `--t-brand-bg-color`, `--t-brand-fg-color`
- **Form Colors**: `--t-input-fields-*`, `--t-form-*`

#### Layout & Spacing Tokens
- **Border Radius**: Cards, buttons, images have consistent radius tokens
- **Logo Sizing**: `--t-logo-size-s/m/l` for consistent brand sizing

## 3. Multi-Brand Theming System

### Color Scheme Architecture
Marriott implements a sophisticated multi-brand system using color scheme classes:

```css
/* Base Theme */
:root { /* default values */ }

/* Light Scheme */
.color-scheme1 { /* standard light theme */ }

/* Dark Scheme */
.color-scheme2 { /* dark/inverse theme */ }

/* Alternative Schemes */
.color-scheme3 { /* light alternative */ }
.color-scheme4 { /* dark alternative */ }
.color-scheme5 { /* cream/beige theme */ }
.color-scheme6 { /* white theme */ }
.color-scheme7 { /* dark alternative */ }
```

### Brand-Specific Values
Each color scheme overrides the same set of tokens:

```css
.color-scheme1 {
  --t-button-primary-bg-color: #078276;
  --t-brand-bg-color: #ffffff;
  --t-brand-fg-color: #1c1c1c;
}

.color-scheme2 {
  --t-button-primary-bg-color: #c9e9e6;
  --t-brand-bg-color: #1c1c1c;
  --t-brand-fg-color: #ffffff;
}
```

## 4. Typography System

### Font Loading Strategy
Marriott loads multiple font families for international support:

```css
/* Primary Brand Fonts */
@font-face {
  font-family: 'BaskervilleBT';
  src: url('...');
}

/* International Fonts */
@font-face {
  font-family: 'NotoSans-Regular';
  src: url('...');
}

/* Language-Specific Fonts */
@font-face {
  font-family: 'NotoSansCJK-Regular';
  src: url('...');
}
```

### Language-Specific Typography
The system includes language-specific font configurations:

```css
:lang(pl-PL), :lang(vi), :lang(id), :lang(da), :lang(nl) {
  /* Specific font settings */
}

:lang(ar-AE), :lang(ar) {
  /* Arabic font settings */
}

:lang(zh-CN), :lang(zh-TW) {
  /* Chinese font settings */
}
```

### Typography Scale System
Marriott uses a responsive typography scale:

```css
/* Title Large */
--t-title-l-font-size-viewport-xs: 2.125rem;    /* Mobile */
--t-title-l-font-size-viewport-m: 2.8125rem;    /* Tablet */
--t-title-l-font-size-viewport-l: 3.4375rem;    /* Desktop */

/* Title Medium */
--t-title-m-font-size-viewport-xs: 1.875rem;    /* Mobile */
--t-title-m-font-size-viewport-m: 2.1875rem;    /* Tablet */
--t-title-m-font-size-viewport-l: 2.5rem;       /* Desktop */
```

## 5. Icon System

### Icon Font Implementation
Marriott uses a custom icon font system:

```css
[class*="icon-"]::before {
  font-family: "MiIcons";
  font-style: normal;
  font-weight: normal;
  speak: never;
  display: inline-block;
  text-decoration: inherit;
  text-align: center;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
}
```

### Icon Categories
- **Portfolio Brand Icons**: Brand-specific iconography
- **Marriott Bonvoy Icons**: Loyalty program specific
- **Functional Icons**: UI interaction icons
- **Decorative Icons**: Visual enhancement icons

### Icon Color Classes
```css
.icon-alt::before { /* alternative color */ }
.icon-inverse::before { /* inverse color */ }
.icon-decorative::before { /* decorative color */ }
```

## 6. Component-Specific Architecture

### DayPicker Component (Date Selection)
Complete styling system for date picker functionality:

```css
.DayPicker {
  display: inline-block;
  font-size: 1rem;
}

.DayPicker-Month {
  display: table;
  margin: 1em 1em 0;
  border-spacing: 0;
  border-collapse: collapse;
}

.DayPicker-Day--selected {
  background-color: #4A90E2;
  color: #F0F8FF;
}
```

### Navigation Buttons
Custom navigation with embedded SVG icons:

```css
.DayPicker-NavButton--prev {
  background-image: url("data:image/png;base64,...");
}

.DayPicker-NavButton--next {
  background-image: url("data:image/png;base64,...");
}
```

## 7. Responsive Design Strategy

### Viewport-Based Scaling
Typography and layout scale across three main breakpoints:

```css
/* Mobile First */
--t-title-l-font-size-viewport-xs: 2.125rem;

/* Tablet */
--t-title-l-font-size-viewport-m: 2.8125rem;

/* Desktop */
--t-title-l-font-size-viewport-l: 3.4375rem;
```

### Component Responsiveness
Components adapt using the viewport token system:

```css
.component-title {
  font-size: var(--t-title-l-font-size-viewport-xs);
}

@media (min-width: 768px) {
  .component-title {
    font-size: var(--t-title-l-font-size-viewport-m);
  }
}

@media (min-width: 1200px) {
  .component-title {
    font-size: var(--t-title-l-font-size-viewport-l);
  }
}
```

## 8. Brand Color Psychology

### Marriott Vacation Brand Colors
- **Primary Teal**: `#078276` - Trust, luxury, nature
- **Light Teal**: `#c9e9e6` - Calm, relaxation, spa-like
- **Dark Text**: `#1c1c1c` - Sophistication, readability
- **Medium Gray**: `#5f5f5f` - Professional, modern
- **Error Red**: `#d0021b` - Clear error indication

### Color Scheme Applications
- **Scheme 1**: Standard light theme (white background)
- **Scheme 2**: Dark luxury theme (dark background, light text)
- **Scheme 3**: Light alternative (light gray background)
- **Scheme 5**: Warm cream theme (`#e8e5de` background)

## 9. Implementation Best Practices

### CSS Custom Properties Usage
```css
/* Component Level */
.room-card {
  background: var(--t-brand-bg-color);
  border-radius: var(--t-cards-border-radius);
  color: var(--t-brand-fg-color);
}

.primary-button {
  background: var(--t-button-primary-bg-color);
  color: var(--t-button-primary-fg-color);
  border-radius: var(--t-button-border-radius);
}
```

### Theming Implementation
```css
/* Apply theme via class */
<div class="color-scheme2">
  <button class="primary-button">Book Now</button>
</div>
```

### Typography Implementation
```css
.page-title {
  font-family: var(--t-title-font-family);
  font-size: var(--t-title-l-font-size-viewport-xs);
  font-weight: var(--t-title-l-font-weight);
  text-transform: var(--t-title-l-text-transform);
}
```

## 10. Performance Considerations

### Font Loading Optimization
- Multiple font formats for browser compatibility
- Language-specific font loading
- Font-display strategies for performance

### CSS Organization
- Modular CSS architecture
- Component-based loading
- Minification for production (`clientlib-static-component.min.css`)

### Custom Properties Benefits
- Runtime theming without CSS regeneration
- Reduced bundle size through token reuse
- Dynamic brand switching capability

## 11. Integration Guidelines

### For New Components
1. Use existing design tokens where possible
2. Follow the `--t-*` naming convention for new tokens
3. Implement responsive scaling with viewport tokens
4. Support all color schemes in component design

### For Brand Extensions
1. Create new color scheme class (`.color-scheme8`, etc.)
2. Override necessary tokens while maintaining structure
3. Test across all viewport sizes
4. Validate accessibility contrast ratios

### For Theme Implementation
```css
/* New theme example */
.color-scheme-custom {
  --t-button-primary-bg-color: #custom-color;
  --t-brand-bg-color: #custom-bg;
  --t-brand-fg-color: #custom-text;
  /* Override other necessary tokens */
}
```

This CSS system demonstrates enterprise-level design system architecture with scalable theming, comprehensive typography, and modular component organization suitable for large-scale hospitality applications.