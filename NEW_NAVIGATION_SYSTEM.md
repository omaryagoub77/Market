# New Responsive Navigation System

## Overview

This document describes the new responsive navigation system implemented for the mobile app. The system provides a modern, accessible navigation bar that works well on all device sizes, from small phones to tablets.

## Features

### Responsive Design
- Automatically adapts to different screen sizes
- On small screens (under 400px): Shows up to 4 main navigation items plus a "More" button
- On larger screens: Shows all navigation items
- On very small screens (under 350px): Shows only 3 main items

### Accessibility
- Minimum 40x40px touch targets for all interactive elements
- Visual indication of active route
- Proper accessibility labels and states

### Modern UI
- Clean, contemporary design
- Smooth animations and transitions
- Light and dark mode support
- Consistent with the app's design system

## Components

### `ResponsiveNavbar` (`/components/responsive-navbar.tsx`)
The main navigation component that handles:
- Rendering navigation items based on screen size
- Active route highlighting
- Overflow menu for smaller screens
- Integration with Expo Router

### `NavWrapper` (`/components/nav-wrapper.tsx`)
A layout wrapper that:
- Positions the navbar at the bottom of the screen
- Ensures content doesn't overlap with the navbar
- Provides a consistent layout structure

## Navigation Items

The navigation bar includes the following items:

1. **Home** - Main feed (`/home-feed`)
2. **Post** - Create new items (`/post-item`)
3. **Messages** - Chat functionality (`/chat-list`)
4. **My Products** - User's products (`/my-products`)
5. **Favorites** - Saved items (`/favourite`)
6. **Profile** - User profile (`/profile`)
7. **Admin** - Admin panel (`/admin`)
8. **Reviews** - Reviews section (`/reviews`)

On small screens, items 5-8 are accessible through the "More" button which opens a modal menu.

## Implementation Details

### Screen Size Adaptation
- Uses `Dimensions` API to monitor screen width
- Dynamically adjusts number of visible items
- Switches between inline navigation and modal menu based on screen size

### Expo Router Integration
- Uses `useRouter()` and `usePathname()` hooks for navigation
- Supports both direct navigation and modal menus
- Maintains proper routing state

### Styling
- Uses the app's theme system (`src/theme.js`)
- Consistent spacing, colors, and typography
- Platform-specific shadows and effects

## Usage

To use the new navigation system in a screen:

1. Import the `NavWrapper` component:
```tsx
import NavWrapper from '@/components/nav-wrapper';
```

2. Wrap your screen content:
```tsx
return (
  <NavWrapper>
    {/* Your screen content */}
  </NavWrapper>
);
```

## Future Improvements

- Add swipe gestures for navigation
- Implement badge indicators for unread messages
- Add animation for active state transitions
- Support for custom icons and labels

## Files

- `/components/responsive-navbar.tsx` - Main navigation component
- `/components/nav-wrapper.tsx` - Layout wrapper
- `/NEW_NAVIGATION_SYSTEM.md` - This documentation