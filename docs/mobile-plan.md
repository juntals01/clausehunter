# Clause Hunter Mobile App — Expo Plan

## Overview

React Native mobile app built with Expo, connecting to the existing NestJS API at `api.expirationreminderai.com`. The app covers the core user-facing features: authentication, contract upload/management, notifications, billing, and settings. Admin features are excluded (admin stays web-only).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 52+ (managed workflow) |
| Navigation | Expo Router (file-based routing) |
| State | Zustand (auth/global state) + TanStack Query (server state) |
| HTTP Client | Axios (shared instance with JWT interceptor) |
| UI Components | NativeWind (Tailwind for RN) + custom components |
| Forms | React Hook Form + Zod |
| File Picker | expo-document-picker |
| Camera | expo-camera (optional: scan contracts) |
| Notifications | expo-notifications (push) |
| Secure Storage | expo-secure-store (JWT tokens) |
| Icons | lucide-react-native |
| Animations | react-native-reanimated |

## Project Structure

```
apps/mobile/
  app/
    (auth)/
      sign-in.tsx
      sign-up.tsx
      forgot-password.tsx
    (tabs)/
      _layout.tsx              # Tab navigator
      index.tsx                # Dashboard (home tab)
      contracts/
        index.tsx              # Contracts list
        [id].tsx               # Contract detail
      upload.tsx               # Upload contract
      notifications.tsx        # Notifications list
      settings/
        index.tsx              # Settings hub
        account.tsx            # Profile & security
        billing.tsx            # Plan & subscription
        help.tsx               # FAQ & feedback
    _layout.tsx                # Root layout (auth guard)
    onboarding.tsx             # Welcome/onboarding screens
  components/
    ui/                        # Reusable primitives (Button, Input, Card, Badge, etc.)
    contracts/
      contract-card.tsx        # Contract list item
      urgency-badge.tsx        # Safe/Warning/Urgent badge
      extraction-section.tsx   # Clauses, dates, summary display
    layout/
      tab-bar.tsx              # Custom bottom tab bar
      header.tsx               # Screen headers
    upload/
      file-picker.tsx          # Document picker + camera
      upload-progress.tsx      # Processing status
  lib/
    api.ts                     # Axios instance + interceptors
    auth-store.ts              # Zustand auth state + secure storage
    hooks/
      use-contracts.ts         # TanStack Query hooks (reuse patterns from web)
      use-notifications.ts
      use-billing.ts
      use-feedback.ts
      use-profile.ts
    utils.ts                   # Formatters, date helpers
    types.ts                   # Shared types (import from @expirationreminderai/shared)
  assets/
    images/                    # App icons, splash, illustrations
  app.json                     # Expo config
  tailwind.config.js           # NativeWind config
  tsconfig.json
  package.json
```

## Screens & Features

### Phase 1: Core (MVP)

#### 1. Authentication

| Screen | Description |
|---|---|
| Sign In | Email/password form + "Continue with Google" button |
| Sign Up | Name, email, password form + Google OAuth |
| Forgot Password | Email input, sends reset link |

**Google OAuth on mobile:** Use `expo-auth-session` with `useAuthRequest` for Google OAuth, exchanging the auth code with the API backend. Store JWT in `expo-secure-store`.

**Auth guard:** Root layout checks auth state. Unauthenticated users see auth screens; authenticated users see tabs.

#### 2. Dashboard (Home Tab)

- **Metrics row:** Total Contracts, Urgent, Next Expiry (horizontal scroll cards)
- **Urgent Renewals list:** Contracts needing attention, sorted by days left
- **Recent Uploads:** Last 3 contracts with status
- Pull-to-refresh

#### 3. Contracts List

- FlatList of contracts with urgency badges
- Filter chips: All, Safe, Warning, Urgent, Review
- Search bar (filter by vendor name)
- Tap to navigate to detail
- FAB or header button to upload

#### 4. Contract Detail

- Editable fields: Vendor, End Date (date picker), Notice Period, Auto-renews (switch)
- Cancel By date (computed)
- Status banner (Processing/Failed/Ready)
- Expandable sections: Summary, Key Dates, Renewal Clauses, Penalty Clauses
- Actions: View File (open in-app or external), Re-analyze, Delete
- Auto-refresh while processing (5s polling)

#### 5. Upload Contract

- Document picker: PDF, DOCX
- Optional: Camera capture (take photo of paper contract)
- Upload progress indicator
- Processing status with animated steps
- Navigate to contract detail on completion

#### 6. Notifications

- List of notifications with unread indicator
- Mark as read on tap
- "Mark all read" button
- Tap contract-related notification to navigate to contract detail
- Badge count on tab icon

#### 7. Settings

- **Profile:** Edit name, view email, avatar
- **Security:** Change password
- **Billing:** Current plan, usage meter, upgrade button (opens LemonSqueezy checkout in WebBrowser)
- **Help:** FAQ accordion, submit feedback form, view tickets
- **Sign Out**

### Phase 2: Enhancements

| Feature | Description |
|---|---|
| Push Notifications | Register device token with API, receive push for contract deadlines and status updates |
| Biometric Auth | Face ID / fingerprint unlock via `expo-local-authentication` |
| Offline Support | Cache contract list with TanStack Query `persistQueryClient` + AsyncStorage |
| Document Scanner | Use camera to scan paper contracts, auto-crop, upload as image |
| Widget | iOS/Android home screen widget showing next expiring contract |
| Deep Links | `clausehunter://contracts/:id` for email notification links |
| Haptic Feedback | Haptics on actions (upload complete, delete confirm) |
| Dark Mode | System-aware theme switching with NativeWind |

### Phase 3: Nice-to-Have

| Feature | Description |
|---|---|
| Calendar Integration | Add contract deadlines to device calendar via `expo-calendar` |
| Share Contract | Share extraction summary via native share sheet |
| PDF Viewer | In-app PDF preview with `react-native-pdf` |
| Blog Reader | Read blog posts in-app (WebView or native rendering) |

## API Integration

The mobile app connects to the same NestJS REST API. No API changes needed for Phase 1.

### API Client Setup

```typescript
// apps/mobile/lib/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = __DEV__
  ? 'http://localhost:3001'
  : 'https://api.expirationreminderai.com';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('access_token');
      // Navigate to sign-in
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Key API Endpoints Used

| Feature | Method | Endpoint |
|---|---|---|
| Login | POST | `/auth/login` |
| Register | POST | `/auth/register` |
| Get Profile | GET | `/auth/me` |
| Update Profile | PATCH | `/auth/profile` |
| List Contracts | GET | `/contracts` |
| Get Contract | GET | `/contracts/:id` |
| Upload Contract | POST | `/contracts/upload` |
| Update Contract | PATCH | `/contracts/:id` |
| Delete Contract | DELETE | `/contracts/:id` |
| Get File URL | GET | `/contracts/:id/file` |
| Reprocess | POST | `/contracts/:id/reprocess` |
| Notifications | GET | `/notifications` |
| Mark Read | PATCH | `/notifications/:id/read` |
| Mark All Read | PATCH | `/notifications/read-all` |
| Subscription | GET | `/billing/subscription` |
| Checkout | POST | `/billing/checkout` |
| Submit Feedback | POST | `/feedback` |
| My Tickets | GET | `/feedback` |
| Change Password | POST | `/auth/reset-password` |

### API Changes Needed (Phase 2+)

| Change | Purpose |
|---|---|
| `POST /auth/device-token` | Register push notification device token |
| `DELETE /auth/device-token` | Unregister on logout |
| Push notification service | Send via Expo Push API or FCM/APNs |

## Navigation Architecture

```
Root _layout.tsx (AuthGuard)
├── (auth)/ — Unauthenticated screens
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   └── forgot-password.tsx
└── (tabs)/ — Authenticated screens
    ├── index.tsx (Dashboard)
    ├── contracts/
    │   ├── index.tsx (List)
    │   └── [id].tsx (Detail)
    ├── upload.tsx
    ├── notifications.tsx
    └── settings/
        ├── index.tsx
        ├── account.tsx
        ├── billing.tsx
        └── help.tsx
```

**Bottom Tab Bar:** 4 tabs

| Tab | Icon | Screen |
|---|---|---|
| Home | LayoutDashboard | Dashboard |
| Contracts | FileText | Contracts list |
| Upload | Upload (center, accent) | Upload contract |
| Notifications | Bell (with badge) | Notifications |
| Settings | Settings | Settings hub |

## Design Guidelines

Follow the existing web design language:

- **Primary accent:** `#EA580C` (warm orange)
- **Background:** `#FFFBF5` (off-white)
- **Headings font:** Space Grotesk (600-700 weight)
- **Body font:** Inter (400-500 weight)
- **Urgency colors:**
  - Safe: `#22C55E` (green)
  - Warning/Approaching: `#F59E0B` (amber)
  - Urgent/In-window: `#EF4444` (red)
  - Needs Review: `#6366F1` (indigo)
- **Card style:** White background, subtle border, rounded corners (16px)
- **Status badges:** Pill-shaped with colored backgrounds

## Monorepo Integration

Add the mobile app as a new workspace in the existing Turborepo:

```
apps/
  web/       # Next.js (existing)
  api/       # NestJS (existing)
  worker/    # NestJS worker (existing)
  mobile/    # Expo (new)
packages/
  shared/    # Shared types (reused by mobile)
  database/  # TypeORM entities (not used by mobile)
```

**package.json:**

```json
{
  "name": "@expirationreminderai/mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "dependencies": {
    "@expirationreminderai/shared": "*",
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-document-picker": "~13.0.0",
    "expo-notifications": "~0.29.0",
    "expo-auth-session": "~6.0.0",
    "expo-web-browser": "~14.0.0",
    "expo-local-authentication": "~15.0.0",
    "nativewind": "~4.0.0",
    "react-native-reanimated": "~3.16.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.7.0",
    "zustand": "^5.0.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "zod": "^3.0.0",
    "lucide-react-native": "^0.400.0",
    "react-native-svg": "~15.0.0"
  }
}
```

## Development Workflow

```bash
# Install dependencies
cd apps/mobile && npx expo install

# Start dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Build for production
eas build --platform all
```

## App Store Submission

| Item | Details |
|---|---|
| App Name | Clause Hunter |
| Bundle ID (iOS) | `com.clausehunter.app` |
| Package Name (Android) | `com.clausehunter.app` |
| App Icon | 1024x1024, orange FileSearch icon on white |
| Splash Screen | Logo centered, `#FFFBF5` background |
| Privacy Policy URL | `https://expirationreminderai.com/privacy` |
| Terms URL | `https://expirationreminderai.com/terms` |

## Milestones

| Milestone | Scope | Estimated Effort |
|---|---|---|
| M1: Scaffolding | Project setup, navigation, auth flow, API client | 2-3 days |
| M2: Dashboard & Contracts | Dashboard, contract list, contract detail | 3-4 days |
| M3: Upload & Processing | File picker, upload flow, processing status | 2-3 days |
| M4: Notifications & Settings | Notification list, settings screens, billing | 2-3 days |
| M5: Polish & Testing | Animations, error handling, edge cases, QA | 2-3 days |
| M6: App Store Submission | EAS Build, store assets, submission | 1-2 days |
| **Total MVP** | | **12-18 days** |
