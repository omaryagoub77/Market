# Responsive Tab Navigation System

This document explains how the responsive tab navigation system works in the application.

## Overview

The tab navigation system automatically adapts to different screen sizes:
- On small screens (width < 400px): Shows 4 primary tabs + a "More" tab
- On larger screens: Shows all tabs in the bottom navigation bar

## How It Works

### 1. Screen Size Detection

The system uses React Native's `Dimensions` API to track screen width:

```typescript
const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

useEffect(() => {
  const onChange = ({ window }: { window: { width: number; height: number } }) => {
    setScreenWidth(window.width);
  };

  const subscription = Dimensions.addEventListener('change', onChange);
  return () => subscription?.remove();
}, []);
```

### 2. Conditional Tab Rendering

Based on screen width, the system determines which tabs to show:

```typescript
const shouldCondenseTabs = screenWidth < 400;
const primaryTabs = shouldCondenseTabs ? ALL_TABS.slice(0, 4) : ALL_TABS;
const showMoreTab = shouldCondenseTabs;
```

### 3. Tab Definitions

All tabs are defined in a centralized array for easy maintenance:

```typescript
const ALL_TABS = [
  {
    name: 'home-feed',
    title: 'Home',
    icon: 'house.fill',
  },
  {
    name: 'post-item',
    title: 'Post',
    icon: 'plus.circle.fill',
  },
  {
    name: 'chat-list',
    title: 'Messages',
    icon: 'message.fill',
  },
  {
    name: 'my-products',
    title: 'My Products',
    icon: 'basket.fill',
  },
  {
    name: 'favourite',
    title: 'Favorites',
    icon: 'heart.fill',
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: 'person.fill',
  },
];
```

## Adding New Tabs

To add a new tab to the system:

1. Add the tab definition to the `ALL_TABS` array in `_layout.tsx`
2. Create the corresponding screen file in the `(tabs)` directory
3. If it's a secondary tab that should appear in "More" on small screens, add it to the `MORE_TABS` array in `more.tsx`

## Scalability

The system is designed to be scalable:
- Easy to add/remove tabs by modifying the `ALL_TABS` array
- Automatically adjusts to screen size changes
- Secondary tabs are accessible through the "More" screen on small devices
- Consistent styling across all tabs

## Performance Considerations

1. **Efficient Rendering**: Only renders the necessary tabs based on screen size
2. **Event Listener Cleanup**: Properly removes dimension change listeners to prevent memory leaks
3. **Centralized Configuration**: All tab definitions in one place for easy maintenance

## User Experience

1. **Consistency**: Same tabs available regardless of screen size
2. **Accessibility**: Secondary tabs easily accessible through the "More" option
3. **Responsive Design**: Automatically adapts to device orientation changes
4. **Visual Feedback**: Uses the same styling and icons across all views

## Testing

The system can be tested by:
1. Running on devices with different screen sizes
2. Rotating devices to test orientation changes
3. Verifying all tabs are accessible
4. Confirming navigation works correctly