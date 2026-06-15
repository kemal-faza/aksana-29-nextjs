# Handoff: Aksana 29 Project Evolution Mapping

## Summary
Mapped and documented the complete evolution of the "Aksana 29 MAN Kapuas" website across 4 project directories in `/mnt/DATA/Documents/Code/`. The user asked for a comparison, and all 4 versions were analyzed in depth — from the original vanilla HTML/CSS/JS prototype through 3 progressive React/Next.js rewrites.

## Current State
No files were modified. This was a read-only analysis session.

| Project | Path | Status |
|---------|------|--------|
| Original (Vanilla) | `buku-tahunan-aksana-29-man-kapuas-tahun-2024/` | Complete, deployed |
| V2 (Vite+React) | `aksana-29/` | Complete, deployed |
| V3 (Route Version) | `aksana-29-route-version/` | Complete, deployed |
| V4 (Next.js) | `aksana29-mankapuas/` | Incomplete — dashboard scaffolded, client pages not built |

## Key Decisions

1. **V4 (Next.js) is the current target architecture** — TypeScript, App Router, Firebase, admin dashboard. But it's the least feature-complete: no home page gallery/sambutan/birthday, no gallery page, no student pages yet.

2. **Each version dropped non-essential features** from the original to simplify architecture:
   - Original had: birthday detection (SweetAlert), sambutan carousel (Swiper), school photo gallery (47 images), teacher detail modal
   - V3 restored gallery (2 videos) and added lazy loading + WebP optimization
   - V4 currently has only the teacher dashboard table — everything else is TBD

3. **Data source divergence** — Original and V2 use static JSON files; V3 and V4 use Firebase Firestore (same project: `aksana29-mankapuas`). Firebase config is duplicated in `aksana-29-route-version/src/assets/data/db.jsx` and `aksana29-mankapuas/src/lib/init.ts`.

4. **Image pipeline varies widely** — Original uses raw JPEG; V2 uses raw JPEG; V3 generates WebP variants via `sharp` (see `compress-image.js`); V4 relies on Next.js Image component but no image pipeline is configured.

## Next Steps

1. **Decide which version to continue** — V3 and V4 are the most maintainable. V4 (Next.js) is the long-term target but has least features. V3 is the most feature-complete React version.

2. **If continuing V4 (Next.js):**
   - Build home page (hero, about, gallery, sambutan sections)
   - Build gallery page (2 videos + photo gallery)
   - Build student pages per class (currently 8 empty routes needed)
   - Migrate birthday detection feature from original
   - Configure image optimization pipeline (sharp + WebP or Next/Image)
   - Set up Firebase Admin SDK properly (currently initialized but `firebase-admin` dependency exists)

3. **Reconcile data** — Firebase project `aksana29-mankapuas` has students/teachers collections, but schema differences between V3 and V4 need verification (V3 uses `db.jsx` functions, V4 uses server actions via `lib/utils.ts`).

## Open Questions

- **Which version should be the primary development target?** V3 (most features) or V4 (best architecture)? User has not indicated preference.
- **Should features lost in migration (birthday detection, sambutan carousel, gallery carousel) be re-added?** They exist only in the original vanilla version.
- **Is the Firebase project `aksana29-mankapuas` currently live/hosting?** If so, which version is deployed?
- **Who maintains this project?** Original author is Muhamad Kemal Faza (student). Is this still actively maintained?

## Suggested Skills
- `search-first` — before writing any code, search across all 4 versions to find the best implementation to port (e.g., birthday detection logic from original, gallery component from V3)
- `brainstorming` — need to decide which version to continue and what features to prioritize
- `writing-plans` — if continuing V4 (Next.js), multiple independent features need to be sequenced (home page, gallery, student pages, admin features)

## Risks / Gotchas
- Firebase config `apiKey` is exposed in source code in both V3 (`db.jsx`) and V4 (`init.ts`) — it's already public by Firebase design but should use restricted API keys in production
- V4 has a `firebase-adminsdk-*.json` service account file in the project root — **this must not be committed** (it's in `.gitignore` but verify)
- V4 layout (`src/app/layout.tsx`) shows a sidebar dashboard layout, suggesting it was started as admin-first. Client-facing pages need a different layout
- Data files (`guru.json`, `siswa.json`) from V2/original may not match the Firebase Firestore schema exactly — field names and structure may differ
- V3 uses `compress-image.js` but it's not integrated with the build pipeline — needs manual execution
