# Personal Data OS: Current State (Through Phase 7)

## Product Scope Covered
- Phase 1: Core platform foundations
  - auth, vault/folder/document CRUD, upload/download
- Phase 2: AI intelligence foundations
  - document processing endpoint, extracted text, expiry inference
- Phase 3: Secure sharing
  - expiring share links, access logs, permission modes
- Phase 4: Reminders
  - reminder creation, listing, dismiss flow
- Phase 5: AI assistant
  - question-answer endpoint using processed documents
- Phase 6: Integrations
  - provider token storage and management (Google Drive/Dropbox)
- Phase 7: Mobile app
  - Android RN CLI app with bottom navigation, gestures, scanner/upload, biometrics

## Monorepo Structure
- `apps/api`: Fastify backend
- `apps/web`: Next.js web shell
- `apps/mobile`: React Native CLI Android client
- `packages/db`: Prisma schema/client
- `packages/config`: shared env/config
- `packages/types`: shared TS response/request interfaces

## Backend Architecture (apps/api)
- Server bootstrap: `apps/api/src/server.ts`
  - global error handler
  - rate limiting
  - multipart upload support
  - CORS
- Auth
  - `POST /auth/signup`
  - `POST /auth/login`
  - `POST /auth/refresh`
- Core data
  - vaults, folders, documents, tags, profile
- Intelligence and lifecycle
  - search, reminders, AI processing/chat
- Sharing and integrations
  - share link create/list/revoke/public access
  - integration save/list/delete

## Data Model Highlights (Prisma)
- `User`, `Vault`, `Folder`, `Document`
- `Tag` + `DocumentTag`
- `ShareLink` + `AccessLog`
- `Reminder`
- `Integration`
- Security fields
  - encrypted file metadata (`encryptionIv`, `encryptionTag`, algo)
  - refresh token support at API boundary

## Mobile Architecture (apps/mobile)
- `App.tsx`
  - providers + theme + root navigator
- `src/context/AuthContext.tsx`
  - login/signup/logout
  - app lock on background if biometrics available
  - biometric quick login via saved credentials
- `src/api/httpClient.ts`
  - typed request wrapper
  - automatic refresh-token retry on `401`
- `src/navigation`
  - auth stack
  - bottom tabs
  - nested vault stack
- `src/screens`
  - Auth: sign in/sign up/lock
  - Dashboard, Vaults, Folders, Documents, Document Details
  - Search + AI assistant
  - Reminders
  - Profile + integrations

## UX Implementation Notes
- Material 3 components (`react-native-paper`)
- Swipe gestures for reminder/document/folder actions
- Bottom navigation for top-level task switching
- Immediate visual feedback:
  - loading states
  - pull-to-refresh
  - snackbars for success/error outcomes

## Security Notes
- Backend stores encrypted files in object storage.
- JWT + refresh-token flow implemented in API.
- Mobile persists session and credentials with AsyncStorage/Keychain abstractions.
- Biometric prompt gates quick unlock/login experience.

## Known Gaps / Next Improvements
- Workspace dependency install can fail under OneDrive junction state; stabilize local install path.
- Mobile scanning is camera capture; advanced edge-detection scanner UI is not yet implemented.
- Mobile share/access-log management UI can be expanded (currently focuses on link creation visibility).
- End-to-end automated integration tests are still limited; add API contract and mobile e2e test suites.

## Recommended Verification Flow
1. Start infra + API (`apps/api`).
2. Run Android app and complete:
   - signup/login
   - vault/folder creation
   - file upload + camera scan
   - search + AI chat
   - reminder create/dismiss
   - integration connect/disconnect
3. Validate token refresh by forcing access-token expiry scenario.

