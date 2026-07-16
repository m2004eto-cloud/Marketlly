# Marketly architecture

## Packages

| Path | Role |
|------|------|
| `.` (`@marketly/web`) | Vite web marketplace + Admin live-edit |
| `packages/core` (`@marketly/core`) | Shared mock API: listings, auth, CMS |
| `apps/mobile` (`@marketly/mobile`) | Expo app with **separate** iOS and Android UI |

## Web routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/auth` | Auth |
| `/browse` | Browse |
| `/listing/:id` | Detail |
| `/post` | Post ad (auth) |
| `/auctions`, `/auctions/:id` | Auctions |
| `/admin/*` | Admin (admin role) |
| `/preview/ios`, `/preview/android` | Thin device previews using shared API |

Page entrypoints live in `src/pages/*`. Shared UI stays in `src/app/components/*`.

## Mobile

```
apps/mobile/src/platforms/ios/       # HIG — do not import android/
apps/mobile/src/platforms/android/   # Material — do not import ios/
apps/mobile/src/shared/              # hooks → @marketly/core
```

## CMS parallel edit

Admin Elements / live-edit on web persists locally and mirrors into `cmsApi` (`marketly_cms_v1`). Mobile and web previews read the same CMS values.
