# Frontend Decisions

Running log of non-obvious choices made while building the PickMe frontend.
Where the planning docs are silent or the environment forced a decision, it's
recorded here.

## Tooling / environment
- **pnpm via corepack.** The repo uses pnpm (`pnpm-lock.yaml`) but pnpm wasn't on
  PATH; enabled through corepack. `pnpm-workspace.yaml` sets `allowBuilds: false`
  for `@clerk/shared`, `browser-tabs-lock`, `bufferutil`, `core-js`,
  `utf-8-validate` — native/postinstall build scripts a RN app doesn't need, so
  `pnpm install` exits 0 instead of erroring on unbuilt deps.
- **`react-native-css-interop` added as a direct dependency.** NativeWind v4's
  Babel `jsxImportSource` resolves to it; under pnpm's strict node_modules it
  wasn't hoisted, so Metro couldn't resolve `react-native-css-interop/jsx-runtime`.
  Installing it directly fixes resolution.
- **tailwindcss pinned to v3.** NativeWind v4 targets Tailwind v3's config/preset
  model; v4 is intentionally not used.

## Data layer
- **Hand-written typed REST client + types** (`src/lib/api-client.ts`,
  `src/lib/api-types.ts`) instead of `openapi-fetch`. The backend's
  `schema/openapi.yaml` isn't in this repo yet; types are transcribed from
  `PICKME_API_REFERENCE.md §4`. Structured to swap to a generated client later.
- **`ngrok-skip-browser-warning` header** is sent on every request so the ngrok
  free-tier interstitial never intercepts API calls. Harmless against a real backend.
- **Auth token bridge.** `registerTokenGetter()` receives Clerk's `getToken` once
  from `ApiAuthBridge` in the root layout, so the non-hook fetch client and all
  React Query hooks share one auth path (and the WS helper can reuse it).

## Auth
- **Clerk social SSO (Google / Apple)** via `useSSO` from `@clerk/clerk-expo`
  (`src/components/auth/OAuthButtons.tsx`). One SSO flow serves both sign-in and
  sign-up — Clerk creates the account on first use — so there's no password form
  and `sign-up` just redirects to `sign-in`. Apple button is iOS-only. Redirect
  URI from `AuthSession.makeRedirectUri()`; app `scheme` is `pickme` and the
  `expo-web-browser` config plugin is enabled.
  - **Dashboard config required to actually sign in:** in the Clerk dashboard,
    enable the Google (and Apple) social connections, and the OAuth redirect must
    be allowed. Until the providers are enabled, the buttons will error.
  - Replaced the earlier custom email/password screens (which also used Clerk,
    via `useSignIn`/`useSignUp`) at the user's request.
- **Single reactive auth gate** lives in the root layout (`useAuthGate` in
  `src/app/_layout.tsx`): a `useEffect` on `useAuth().isSignedIn` + `useSegments`
  moves signed-out users into `(auth)` and signed-in users out of it. The
  per-group `<Redirect>` guards were removed. This fixes the OAuth race where an
  imperative `router.replace` fired before Clerk's session propagated and left
  the user stranded on the sign-in screen after a successful Google sign-in.
- **Real publishable key** is in `.env` (`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`).
  The Clerk **secret key** was removed from the frontend `.env` — it's backend-only
  and was flagged for rotation. `.env` is gitignored; `.env.example` documents vars.

## API verification
- Tested against the ngrok backend: `GET /health/` → `200 {"status":"ok"}`
  (server: daphne/ASGI), and the **error envelope shape is confirmed real**
  (`{"error":{"code,message,details}}`) — matches `ApiError` parsing. Send
  `Accept: application/json` (the client does) or the backend 406s.
- Authenticated endpoints (families, pickup-events, …) require a live Clerk
  session JWT; they're exercised on first sign-in through the running app. Not
  smoke-tested with a minted token because the secret key was (correctly) off-limits.

## Known backend gaps affecting the frontend
- **No `GET /me/`** returning the local `User` UUID (`PICKME_API_REFERENCE.md §1/§11`).
  This blocks `ws/notifications/{userId}/` (path is the local UUID) and chat
  "mine vs theirs" rendering. Flag to backend; Stage 8's notification socket is
  deferred until it exists. Everything else works off already-scoped list endpoints.

## Theme
- **Theme preference is in-memory** (`stores/ui.ts`, default `system`). Persistence
  (secure-store) is deferred to the Settings stage — a manual override currently
  resets on reload.
- **Yellow (warning) badges keep dark text in both light and dark modes**, per the
  status color law — enforced in `StatusBadge`.
