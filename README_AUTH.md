# Authentication Flow Documentation

## Overview
This document explains the authentication implementation in the app, including how users can login, signup, and access protected routes.

## Authentication Flow

### 1. Entry Point
- When the app starts, it checks if the user is authenticated
- If authenticated: redirects to `/home-feed`
- If not authenticated: redirects to `/auth/login`

### 2. Login Screen (`/auth/login`)
- Users can login with email and password
- Options for Google/Facebook login (placeholders)
- "Forgot Password" link
- "Sign Up" link to navigate to registration

### 3. Registration Screen (`/auth/register`)
- Users can create a new account with name, email, and password
- Password confirmation validation
- Options for Google/Facebook registration (placeholders)
- "Sign In" link to navigate to login

### 4. Protected Routes
- The following screens require authentication:
  - Post Item (`/post-item`)
  - Chat List (`/chat-list`)
  - Chat Room (`/chat-room`)
- Unauthenticated users are automatically redirected to the login screen

### 5. Logout
- Available in the Profile screen
- Clears user session and redirects to login screen

## Implementation Details

### Auth Context
The app uses a React Context (`AuthContext`) to manage authentication state globally:
- Provides `user` object (null if not authenticated)
- Provides `loading` state during authentication checks
- Automatically handles Firebase auth state changes

### Protected Route Component
The `ProtectedRoute` component wraps screens that require authentication:
- Shows loading spinner while checking auth state
- Redirects unauthenticated users to login screen
- Allows authenticated users to access the wrapped content

### Navigation
Navigation is handled using Expo Router:
- Automatic redirects based on auth state
- Programmatic navigation between auth screens
- Protected tab navigation for authenticated users only

## File Structure
```
/app
  /auth
    login.tsx          # Login screen
    register.tsx       # Registration screen
    forgot-password.tsx # Password reset (existing)
  /(tabs)
    _layout.tsx        # Tab navigation with auth protection
    post-item.tsx      # Protected screen
    chat-list.tsx      # Protected screen
    chat-room.tsx      # Protected screen
    profile.tsx        # Protected screen with logout
  _layout.tsx          # Root layout with AuthProvider
  index.tsx            # Entry point with auth redirect
/contexts
  AuthContext.tsx      # Authentication context provider
/components
  ProtectedRoute.tsx   # Protected route wrapper component
/src
  auth.js             # Logout function
```

## Usage

### Adding Authentication to New Screens
1. Wrap the screen content with `<ProtectedRoute>`
2. The component will automatically handle authentication checks

### Accessing Auth State
1. Import the hook: `import { useAuth } from '@/contexts/AuthContext'`
2. Use in component: `const { user, loading } = useAuth()`

## Security Notes
- Passwords are handled securely by Firebase Authentication
- User sessions persist across app restarts
- All protected routes are inaccessible without valid authentication