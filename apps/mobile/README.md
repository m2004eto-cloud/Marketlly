# Marketly Mobile (Expo)

Separate **iOS** and **Android** UI trees share `@marketly/core` (listings, auth, CMS).

```
src/platforms/ios/       # HIG screens — do not import android/
src/platforms/android/   # Material screens — do not import ios/
src/shared/              # hooks that call @marketly/core
```

## Run

From repo root:

```bash
npm run mobile
# or
npm --prefix apps/mobile install
npm --prefix apps/mobile start
```

Then press `i` (iOS simulator) or `a` (Android emulator).

Web Admin live-edit writes CMS into `marketly_cms_v1`; mobile reads the same shape via `cmsApi` (AsyncStorage after hydrate). Export/import CMS JSON from Admin → Elements for device sync in this mock phase.
