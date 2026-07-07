# PickMe Frontend — Build Stages

Tracking file for the React Native (Expo SDK 57) frontend. Stage order mirrors
`instructions/FRONTEND-ARCHITECTURE.md §8`. Status: ✅ done · 🟡 in progress · ⬜ todo.

**Stack:** Expo Router · NativeWind v4 · TanStack Query v5 · Zustand · Clerk
(`@clerk/clerk-expo`) · phosphor-react-native · hand-written typed REST client
(swaps to generated `openapi-fetch` when the backend schema lands). Design =
Uber "Base": monochrome canvas, color-as-signal, first-class light + dark.

---

## Stage 0 — Scaffold ✅
- ✅ Expo SDK 57 app, Expo Router routes under `src/app/`, `@/*` → `src/*`
- ✅ NativeWind v4 wired (`metro.config.js`, `babel.config.js`, `tailwind.config.js`, `nativewind-env.d.ts`)
- ✅ Uber Base design tokens in `global.css` (`:root` + `.dark:root`) + TS mirror `src/lib/theme.ts`
- ✅ Inter font family (`@expo-google-fonts/inter`) loaded in root layout
- ✅ Providers: ClerkProvider (+ secure-store token cache) · QueryClientProvider · SafeAreaProvider · GestureHandler
- ✅ REST client `src/lib/api-client.ts` (bearer injection, error-envelope → `ApiError`)
- ✅ Query keys `src/lib/query-client.ts` · WS helper `src/lib/ws.ts` (built, consumed later)
- ✅ Status color law `src/lib/status.ts`
- ✅ iOS bundle compiles clean; `tsc --noEmit` clean

## Stage 1 — Reusable component library ✅
- ✅ `components/ui/`: Text (type scale), Button, Card, Badge, Avatar, Input, Switch, Skeleton, Separator, Dialog/AlertDialog
- ✅ `components/shared/`: Screen, StatusBadge, EmptyState, ErrorState
- ✅ `components/today/`: ChildPickupCard, DismissalCountdown
- ⬜ Component gallery route for a light/dark eyeball audit (optional, temporary)

## Stage 2 — Auth + onboarding ✅
- ✅ `(auth)/sign-in` — Clerk **social SSO** (Google / Apple, `useSSO`); `sign-up` redirects to it
- ⚠️ Requires enabling Google/Apple social connections in the Clerk dashboard to work at runtime
- ✅ Auth gate `src/app/index.tsx` (signed-out → sign-in; no family → onboarding; else tabs)
- ✅ `(onboarding)/create-family`, `add-children` (color-tag + optional school), `add-school`
- ✅ Tab bar `(tabs)/_layout.tsx` (Phosphor icons, active=fill)

## Stage 3 — Today ✅
- ✅ `(tabs)/index.tsx` wired to `GET /pickup-events/?date=` — cards, countdown, pull-to-refresh, skeleton/empty/error
- ✅ Settings tab: theme preference (System/Light/Dark) + sign out (dark-mode toggle is live here)
- ✅ Family tab: children list (partial; full hub is Stage 4)
- ✅ Stub tabs (Carpool, Chat) + stub routes `trip/[tripId]`, `swap/[requestId]`

---

## Stage 4 — Family hub + child/activities CRUD ⬜
- ⬜ Members + roles, invite by email (`/families/{id}/members/invite`)
- ⬜ Child detail + activities CRUD, avatar upload (Cloudinary — `src/lib/cloudinary.ts`)
- ⬜ School detail + calendar exceptions

## Stage 5 — Carpool ⬜
- ⬜ Groups list + join-by-code · group detail rotation calendar (RotationDayCard)
- ⬜ Rotation rule editor (RotationOrderEditor, drag + weights) · generate
- ⬜ Swap request + respond (`swap/[requestId]`)

## Stage 6 — Trip (live tracking) ⬜
- ⬜ Parent view: TripMap (react-native-maps, desaturated style) + TripBottomSheet + `useTripSocket`
- ⬜ Driver mode: start/end, per-stop status, tracking-mode toggle, background location (`useDriverLocation`)
- ⬜ Polling fallback when WS unavailable

## Stage 7 — Chat ⬜
- ⬜ Threads list · Conversation (`useInfiniteQuery` history + `useChatSocket`) · MessageBubble, MessageInput
- ⬜ Optimistic send, read receipts, image attachments

## Stage 8 — Notifications ⬜
- ⬜ Push registration (`expo-notifications` → `POST /device-tokens/`), deep-link tap routing
- ⬜ Notifications center · per-type preference toggles · `useNotificationSocket` (blocked on `/me` UUID — see DECISIONS.md)

## Stage 9 — SOS + polish ⬜
- ⬜ SOSButton (AlertDialog confirm) + full-screen SOSBanner takeover (trip WS `sos_alert` + push)
- ⬜ Haptics (expo-haptics), Reanimated marker interpolation, light/dark parity audit

---

## Notable open items (see DECISIONS.md)
- Backend has **no `/me` endpoint** yet → notification socket + chat "mine vs theirs" deferred.
- **Enable Google/Apple social connections in the Clerk dashboard** — the OAuth buttons need them on.
- Backend URL points at an **ngrok tunnel**; update `.env` when the backend is deployed for alpha/beta.
- API contract verified against ngrok (`/health/` 200, error-envelope shape); authed endpoints validate on first sign-in.
