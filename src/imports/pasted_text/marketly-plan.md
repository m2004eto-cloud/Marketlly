Marketly — Improvement Plan
1. Architecture & Foundation
Add URL routing (react-router) — current page state lives in App.tsx useState. No deep links, no back/forward, no shareable URLs. Replace with routes: /, /browse/:category?, /listing/:id, /post, /auth, /admin/*, /profile/:id.
Split AppContext — AppContext mixes auth, theme, favorites, language. Break into AuthContext, ThemeContext, FavoritesContext for cleaner re-renders.
Type the page registry properly — register accepts arbitrary strings; introduce a typed ElementId union or auto-generated map so missing/typo'd ids fail at compile time.
Move seed data out of components — seedUsers, seedReports, LISTINGS should live in src/app/data/ and ship a "seeded store" hook so AdminPanel, Profile, and Browse share one source of truth.
2. State Management & Persistence
Wire a single store — favorites, drafts, post-ad progress, search history, saved searches all live in component state today. Use Zustand or a thin context+reducer pattern with localStorage adapters.
Server-side persistence — currently everything is localStorage. Migrate to Supabase: users, listings, reports, banners, element_overrides, media, audit_log. Keep localStorage as offline cache.
Real auth — Auth.tsx accepts any email/password. Wire Supabase Auth with email + OAuth (Google/Apple), session refresh, RLS policies.
3. Data & Domain Model
Add make/model to Listing — Browse Make filter doesn't actually filter results. Add to schema, backfill seed data, hook into the query.
Listing status workflow — extend beyond pending/approved/rejected: draft, live, sold, expired, flagged, boosted. Add expiry dates and auto-archival.
Geo data — replace location strings with { emirate, area, lat, lng }. Enables map view, "near me", distance sorting.
Pricing model — store currency, original price, negotiable flag, finance options on the record, not just the page.
4. Search & Discovery
Server-side search — current filtering is client-only over LISTINGS array. Will not scale. Use Postgres full-text or Algolia/Typesense.
Saved searches + alerts — let users save filter combos and email/push when new matches appear.
Recently viewed + recommendations — track per-user, surface on Landing.
Browse URL state — sync all filters to query params so back/forward works and links are shareable.
5. UX & Frontend Quality
Loading and empty states — most pages render content immediately; once API-backed, every list needs skeletons, error retry, and meaningful empty states.
Form validation — PostAd and Auth use ad-hoc toast.error. Move to react-hook-form + zod for typed schemas, field-level errors, and consistent UX.
Image pipeline — ImageWithFallback plus raw URLs is fragile. Add lazy loading, blur-up placeholders, responsive srcSet, WebP, and an upload flow (Supabase Storage) for PostAd.
Accessibility audit — color-only state on tabs, missing aria-label on icon buttons, focus traps absent on modals, dropdowns close on outside click but not on Esc.
Mobile polish — sticky filter sidebar becomes a bottom sheet, header collapses, gallery uses swipe gestures, post-ad becomes a stepper.
RTL fixes — most places use logical properties but a few left/right/ml-* slipped in; sweep with grep.
6. Admin Panel
Real listing moderation queue — bulk approve/reject, reason templates, message to seller on rejection.
User audit log — every admin action (verify, ban, delete) writes to audit_log with actor + reason.
Permissions — single admin role today. Add moderator, support, superadmin with capability checks.
Server-driven analytics — the Ninja dashboard is deterministic mock data. Replace with real event tracking (PostHog/Plausible or Supabase events table) and aggregate via SQL views.
CSV/PDF export for listings, users, reports.
7. Elements / CMS
Versioning — history is a flat list. Add snapshots: "Publish vNNN" to roll the whole site forward/back atomically.
Multi-language overrides — today overrides apply to the active language only. Tie each override to a locale.
Image upload — Media tab takes URLs only. Add drag-drop + Supabase Storage with CDN.
Banner scheduling — startAt / endAt and audience targeting (role, location, locale).
Preview-as — admin button to "view site as anonymous / customer / dealer" for QA.
8. Performance
Bundle audit — MUI + AntD + Radix + lucide-react + sonner is a lot. Pick one component library; lucide is fine for icons but consider tree-shaking unused MUI.
Code splitting — React.lazy for AdminPanel and PostAd (heavy + admin-only).
Memoize Browse filtering — useMemo exists but registry/listings re-render on every Elements edit because of context fan-out. Split ElementsContext into stable + volatile slices.
Virtualize long lists — listings grid, users table, history log should use react-virtual.
9. Testing & Quality
No tests today. Add at minimum:
Vitest for utils (rnd, useMulti, findReplace).
React Testing Library for Auth flow, PostAd validation, Browse filter combinations.
Playwright smoke: landing → search → detail → favorite → login → post ad.
TypeScript strict mode — turn on noUncheckedIndexedAccess and exactOptionalPropertyTypes; several runtime nullables (e.g. seedUsers[i]) only just got fixed.
CI — typecheck + lint + tests on every PR; preview deploys per branch.
10. Security & Compliance
RLS policies in Supabase: users can only edit their own listings; admins gated by role claim.
Input sanitization — banner titles/subtitles render unescaped today; safe in React but if you ever dangerouslySetInnerHTML, audit first.
Rate limiting on auth, post-ad, report endpoints.
Dealer KYC — store trade license number + uploaded license image, mark dealer "Verified" only after admin review (the toggle exists but the document is not stored anywhere).
GDPR/PDPL — data export, delete account, cookie consent banner, audit trail for personal data access.
11. Observability
Error tracking — Sentry or similar; today errors only surface as toast or silent.
Product analytics — PostHog events for funnel (landing → search → detail → contact → conversion).
Health dashboard — uptime, error rate, slow queries; the Ninja dashboard shows fake page health today.
12. Internationalization & Localization
Currency formatting — hardcoded AED ${n} everywhere. Use Intl.NumberFormat with locale.
Date formatting — same; use Intl.DateTimeFormat.
Pluralization — i18next supports it; many strings hardcode "results"/"ad"/"ads" branches.
Arabic copy review — most strings translated but proofread with a native speaker.