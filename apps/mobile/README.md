## Personal Data OS Mobile (Android)

React Native CLI app for the Phase 7 mobile experience.

### Implemented UX
- Material 3 UI with `react-native-paper`
- Bottom tab navigation
- Swipe gestures for dismiss/delete actions
- Biometric app lock and biometric quick login
- Vault hierarchy (`Vaults -> Folders -> Documents`)
- File upload and camera-based document scan
- Search + AI assistant chat
- Reminders and profile/integration management

### Run From Repo Root
1. Install dependencies:
```bash
pnpm install
```

2. Start backend API:
```bash
pnpm --filter api dev
```

3. Start Metro:
```bash
pnpm --filter com.personaldataos.mobile dev
```

4. Run Android app:
```bash
pnpm --filter com.personaldataos.mobile android
```

### Commands
- `pnpm --filter com.personaldataos.mobile dev`
- `pnpm --filter com.personaldataos.mobile android`
- `pnpm --filter com.personaldataos.mobile android:clean`
- `pnpm --filter com.personaldataos.mobile typecheck`
- `pnpm --filter com.personaldataos.mobile test`

