# Phase 7 Mobile (React Native CLI, Android) Guide

## Scope Implemented
- React Native CLI app scaffold in `apps/mobile` (no Expo runtime).
- Android-first app flow with:
  - Auth (`Sign In`, `Sign Up`)
  - Biometric lock + biometric quick login
  - Bottom navigation (`Home`, `Vault`, `Search`, `Reminders`, `Profile`)
  - Vault hierarchy (`Vaults` -> `Folders` -> `Documents` -> `Document Details`)
  - Upload and scanner entry points (file picker + camera capture)
  - Search and AI assistant chat
  - Reminder listing with swipe-to-dismiss
  - Profile + integrations management

## App Architecture
- `apps/mobile/src/context/AuthContext.tsx`
  - Session bootstrap, auth actions, biometric lock/unlock.
- `apps/mobile/src/api/*`
  - Typed API modules for each backend domain.
- `apps/mobile/src/api/httpClient.ts`
  - Central request client with refresh-token retry on `401`.
- `apps/mobile/src/state/sessionStore.ts`
  - In-memory shared auth session store.
- `apps/mobile/src/storage/sessionStorage.ts`
  - AsyncStorage session persistence + Keychain credentials.
- `apps/mobile/src/navigation/*`
  - Auth stack, bottom tabs, vault stack, locked-state routing.
- `apps/mobile/src/screens/*`
  - Feature screens mapped to current backend modules (phase 0-7 coverage).

## UX + UI Decisions
- Material 3 surface system via `react-native-paper`.
- Minimal visual language:
  - neutral background, high-contrast text, restrained color accents.
  - rounded cards and clear content grouping.
- Intuitive navigation:
  - bottom tabs for top-level domains.
  - swipe gestures for destructive actions (delete/dismiss).
- Responsive feedback:
  - per-screen loading states, snackbars for action outcomes, pull-to-refresh on lists.

## Android Development Commands
From repo root:

1. Install dependencies:
```bash
pnpm install
```

2. Start Metro:
```bash
pnpm --filter com.personaldataos.mobile dev
```

3. Run app on emulator/device:
```bash
pnpm --filter com.personaldataos.mobile android
```

4. Start backend APIs:
```bash
pnpm --filter api dev
```

## Monorepo `pnpm dev` Behavior
- `pnpm dev` at root runs Turbo `dev` tasks for packages that define `dev`.
- For mobile, this starts Metro (`apps/mobile` `dev` script).
- Android binary install/run still requires:
```bash
pnpm --filter com.personaldataos.mobile android
```

## Test Checklist (Phase 7)
- Auth:
  - signup/login, invalid credentials handling, token refresh path.
- Biometric:
  - lock on background/foreground resume and unlock success/failure.
- Vault flow:
  - create/delete vault, create/delete folder.
- Document flow:
  - upload file, scan via camera, open detail, delete document.
- Reminder flow:
  - create reminder from document, dismiss from reminders tab via swipe.
- Search + AI:
  - keyword search, AI assistant question/answer.
- Profile:
  - update profile fields, connect/disconnect integrations.

