## Purpose
Provide concise, actionable guidance for AI coding agents working on this Expo + React Native codebase.

## Big picture
- This is an Expo app using Expo Router (file-based routing). Main entry: `package.json` -> `expo-router/entry`.
- App routes live under the `app/` folder. Tabs are grouped in `app/(tabs)/` and the root layout references `(tabs)` in [app/_layout.tsx](app/_layout.tsx).
- Auth and redirect logic is centralized in `app/index.tsx` and `contexts/AuthContext.tsx` (use `useAuth()` to access `user`, `loading`, `getRedirectUrl()`).
- Firebase is used both client-side (`src/firebase.js`) and server-side Cloud Functions (`functions/index.js`). FCM tokens are stored on user docs as `fcmTokens`.
- Notification flows: the app initializes `src/NotificationService.ts` from [app/_layout.tsx](app/_layout.tsx); server triggers send payloads containing `type`, `chatId`, `senderId`, and `messageId` (see [functions/index.js](functions/index.js)).

## Key files and patterns (examples)
- Routing and layout: [app/_layout.tsx](app/_layout.tsx), [app/index.tsx](app/index.tsx), `app/(tabs)/home-feed.tsx`.
- Auth context: [contexts/AuthContext.tsx](contexts/AuthContext.tsx). Use `useAuth()` for auth-driven redirects.
- Notifications: [src/NotificationService.ts](src/NotificationService.ts) and cloud trigger [functions/index.js](functions/index.js).
- Firebase client init: [src/firebase.js](src/firebase.js) — do not overwrite credentials without checking env or secrets.
- Reusable UI components under `components/ui/` follow small, prop-driven patterns (e.g., `button.tsx`, `product-card.tsx`).

## Developer workflows & useful commands
- Run app (Expo): `npm start` (aliases: `npm run ios`, `npm run android`, `npm run web`). See `package.json`.
- Reset helper: `npm run reset-project` (runs `scripts/reset-project.js`). Use before major env changes.
- Linting: `npm run lint`.
- Cloud Functions: functions live in `functions/` and use `firebase-admin`. Use the Firebase CLI locally to emulate or deploy (not included here). Inspect `functions/package.json` for function-specific deps.

## Project-specific conventions
- Path alias `@/` is used throughout imports (e.g., `@/src/NotificationService`). Respect existing paths rather than converting to relative imports.
- Mixed JS/TS: some core modules are JavaScript (`src/firebase.js`, `functions/index.js`). Prefer minimal changes when editing to avoid adding stray type-only imports.
- File-based routing with Expo Router: group related screens under folders like `app/(tabs)/edit-product/[id].tsx`. Use nested folders to create route groups.
- Theme and color helpers: central theme files live under `src/theme.js` and `constants/theme.ts`; use `hooks/use-color-scheme.ts` for color-aware components.

## Integration notes & caution points
- FCM tokens: cloud function expects user docs to contain `fcmTokens` arrays. Removing or renaming this field will break notifications.
- Notification payload shape used by the client: `{ type: 'NEW_MESSAGE', chatId, senderId, messageId }`. Keep server and client payloads in sync.
- Do not remove or reinitialize `admin.initializeApp()` in `functions/index.js` without coordinating Cloud Functions deployment.
- Secrets and keys: `src/firebase.js` currently contains firebase config values; avoid committing new secret changes here—consult repo owners for env/secrets.

## How to make safe edits
- For routing changes, add files under `app/` rather than altering router bootstrap code.
- For auth changes, update `contexts/AuthContext.tsx` and follow existing `getRedirectUrl()` / `clearRedirectUrl()` usage.
- When touching notifications, update both `src/NotificationService.ts` and `functions/index.js` payload handling together.

## When uncertain, inspect these files first
- [package.json](package.json)
- [app/_layout.tsx](app/_layout.tsx)
- [app/index.tsx](app/index.tsx)
- [contexts/AuthContext.tsx](contexts/AuthContext.tsx)
- [src/NotificationService.ts](src/NotificationService.ts)
- [src/firebase.js](src/firebase.js)
- [functions/index.js](functions/index.js)

---
If any section is unclear or you want more detail (tests, CI, or deploy steps), tell me which area to expand and I'll update this file.
