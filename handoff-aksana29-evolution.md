# Handoff: Aksana 29 v5 Implementation (Phase 1-2 + Phase 3 Complete)

## Summary

Semua 33 tasks Foundation + Data + Public + Auth + Image + Admin Dashboard selesai. Monorepo (pnpm + Turborepo) dengan apps/web (Next.js 14) + apps/api (Next.js route handlers) + packages/{shared,db}. Public site live dengan 279 students, 60 teachers, 4 sambutan, 47 sudut sekolah, 2 videos dari Supabase. Admin Dashboard lengkap dengan CRUD untuk semua entitas + whitelist management + image upload UI. Google OAuth + JWT verify + admin guard terpasang. Deployed ke Vercel, web dan API keduanya live.

Tersisa: Frontend publik components (Sambutan carousel, Sudut Sekolah carousel, Navbar, Footer) + Polish/Deploy (Tasks 35-41).

## Current State

### Git

- Branch: main
- 28 commits sejak start (commit terakhir: `5bde897`)
- Working tree: clean
- Remote: `origin` pointing to `github.com:kemal-faza/aksana-29-nextjs.git`

### Arsitektur Terbangun (update dari handoff sebelumnya)

```
aksana-29-nextjs/
├── apps/
│   ├── web/                              [Next.js 14 - LIVE di Vercel]
│   │   ├── app/(public)/                 [Semua halaman publik]
│   │   │   ├── layout.tsx                [SEO metadata - NEW]
│   │   │   ├── page.tsx                  [Hero + About + Birthday]
│   │   │   ├── guru/page.tsx + layout.tsx [SEO - NEW layout]
│   │   │   ├── pesdik/[kelas]/page.tsx + layout.tsx [Dynamic metadata - NEW]
│   │   │   └── galeri/page.tsx + layout.tsx [SEO - NEW layout]
│   │   ├── app/(admin)/                  [Protected routes]
│   │   │   ├── layout.tsx                [Sidebar + main layout - MODIFIED]
│   │   │   ├── login/page.tsx
│   │   │   └── dashboard/
│   │   │       ├── page.tsx              [Stats dashboard - MODIFIED]
│   │   │       ├── students/             [CRUD: list + create + edit - NEW]
│   │   │       ├── teachers/             [CRUD: list + create + edit - NEW]
│   │   │       ├── sambutan/             [CRUD: list + create + edit - NEW]
│   │   │       ├── sudut-sekolah/        [CRUD: list + create + edit - NEW]
│   │   │       ├── gallery/              [CRUD: list + create + edit - NEW]
│   │   │       └── admins/               [Whitelist management - NEW]
│   │   ├── components/
│   │   │   ├── public/                   [Hero, About, Cards, Modals, VideoEmbed, Birthday]
│   │   │   └── admin/                    [NEW]
│   │   │       ├── Sidebar.tsx, DataTable.tsx, ImageUpload.tsx
│   │   │       ├── StudentForm.tsx, TeacherForm.tsx, SambutanForm.tsx
│   │   │       ├── SudutSekolahForm.tsx, VideoForm.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                    [Fetch wrapper - MODIFIED: strip /api prefix]
│   │   │   ├── admin-api.ts              [NEW: auth-aware fetch with JWT]
│   │   │   ├── images.ts
│   │   │   └── supabase/
│   │   └── app/auth/callback/route.ts
│   └── api/                              [Next.js route handlers - LIVE di Vercel]
│       ├── app/public/                   [12 endpoint publik]
│       ├── app/admin/                    [NEW: semua CRUD endpoints]
│       │   ├── students/route.ts + [id]  [POST, GET, PATCH, DELETE]
│       │   ├── teachers/route.ts + [id]
│       │   ├── sambutan/route.ts + [id]
│       │   ├── sudut-sekolah/route.ts + [id]
│       │   ├── videos/route.ts + [id]
│       │   ├── admins/route.ts + [id]    [last-admin protection]
│       │   └── images/                   [sign-upload + process]
│       ├── app/auth/me/route.ts          [NEW: session verification]
│       └── app/utils/
│           ├── admin-guard.ts, auth.ts, supabase.ts, image-processor.ts
├── packages/
│   ├── shared/
│   │   └── src/schemas/                  [Zod: datetime() → string() - FIXED]
│   └── db/                               [Drizzle schema + seed scripts]
├── .github/workflows/ci.yml
├── turbo.json, pnpm-workspace.yaml
└── supabase/
```

### Vercel Deployments

| Project | URL | Status |
|---------|-----|--------|
| **aksana-29-nextjs-web** | https://aksana-29-nextjs-web.vercel.app | LIVE - semua halaman publik + admin |
| **aksana-29-nextjs-api** | https://aksana-29-nextjs-api-silk.vercel.app | LIVE - API routes di /public/* dan /admin/* |

**Catatan penting:** API routes serve di root path (`/public/health`, `/admin/students`), BUKAN di `/api/public/health`. Helper fungsi (`api.ts`, `admin-api.ts`) sudah otomatis strip prefix `/api` dari path.

### Supabase (cloud, connected)

- Tables: `allowed_admins`, `students`, `teachers`, `sambutan`, `sudut_sekolah`, `videos`
- Bucket: `images` (public)
- Auth: Google OAuth configured
- Data seeded: 279 students, 60 teachers, 4 sambutan, 47 sudut-sekolah, 2 videos

### Testing

- **Shared (packages/shared)**: 22 tests pass (Vitest)
- **API (apps/api)**: 31 tests pass (Jest)
- **TypeScript**: Zero errors di shared, web, dan api

## Key Decisions (added in this session)

1. **Admin API routes menggunakan Next.js route handlers pattern** — sama dengan public routes. Setiap entitas punya `route.ts` (GET list + POST create) dan `[id]/route.ts` (GET single + PATCH update + DELETE). Semua diproteksi via `getAdminSession()` dari `admin-guard.ts`.

2. **API path tanpa `/api` prefix** — Karena API project root adalah `apps/api/`, route files di `apps/api/app/public/health/route.ts` serve di `/public/health`, bukan `/api/public/health`. Frontend helper strips `/api` prefix otomatis.

3. **Zod `datetime()` diganti `string()`** — Supabase mengembalikan timestamp dalam format `2026-06-15T18:10:46.412346+00:00` yang tidak lolos validasi Zod `datetime()` (hanya terima format `Z` suffix). Semua schema di `packages/shared/src/schemas/` sudah diganti.

4. **TypeScript `@ts-expect-error` untuk Supabase insert/update** — Tanpa generated types, Supabase JS client v2 meng-infer tipe sebagai `never` untuk `.insert()` dan `.update()`. Digunakan `@ts-expect-error` di setiap admin route yang memanggil operasi tersebut.

5. **Admin UI pages menggunakan client components** — Semua halaman admin adalah `'use client'` karena perlu akses ke Supabase Auth session untuk JWT token. `admin-api.ts` menggunakan dynamic import `@/lib/supabase/client` untuk mendapatkan token.

6. **Sidebar navigation menggunakan SVG icons inline** — Tidak perlu dependency icon library. 7 menu items + logout button, active state detection via `usePathname()`.

## Files Changed (this session)

### New files (~40 files):
- `apps/api/app/admin/*` — 14 files (CRUD routes untuk 6 entities + auth/me)
- `apps/web/components/admin/*` — 8 files (Sidebar, DataTable, 5 Forms, ImageUpload)
- `apps/web/app/(admin)/dashboard/*` — ~20 files (admin CRUD pages per entity)
- `apps/web/app/(public)/*/layout.tsx` — 3 files (SEO metadata)
- `apps/web/lib/admin-api.ts` — authenticated API helper

### Modified files (~5 files):
- `apps/web/lib/api.ts` — strip /api prefix
- `apps/web/app/(admin)/layout.tsx` — sidebar integration
- `apps/web/app/(admin)/dashboard/page.tsx` — stats dashboard
- `packages/shared/src/schemas/*.ts` — datetime() → string()

## Next Steps

### Immediate: Public Frontend Components (~2 tasks)

1. **Sambutan carousel di halaman beranda** — DB schema + API route sudah ada. Butuh komponen carousel (Swiper atau CSS) yang fetch dari `/public/sambutan` dan render di home page (`apps/web/app/page.tsx`). Lihat design spec di `docs/superpowers/specs/2026-06-15-aksana-29-design.md` section 7.1.

2. **Sudut Sekolah carousel di halaman beranda** — Sama seperti di atas, butuh coverflow carousel. 49 foto fetch dari `/public/sudut-sekolah`. Swiper library mungkin perlu diinstall (`pnpm add swiper`).

3. **Header/Navbar publik** — Navigasi antar halaman (Beranda, Guru, Pesdik, Galeri). Sticky/transparan di home, solid di halaman lain.

4. **Footer** — Copyright, credit, links.

### Polish & Deploy (Tasks 35-41)

5. **Task 35**: Performance — ISR (`revalidate`), lazy loading, srcSet di semua image (sudah partial di `api.ts`).
6. **Task 36**: Sentry integration (SENTRY_AUTH_TOKEN sudah ada di Vercel env vars).
7. **Task 37**: Testing — frontend (Vitest), E2E (Playwright).
8. **Task 38**: Documentation — README, runbook, env setup.
9. **Task 39**: Domain configuration (Namecheap via GitHub Student Pack).
10. **Task 40**: V3 archive (`aksana-29-route-version/`).
11. **Task 41**: Monitor + 1-week stabilization.

## Open Questions

- **Domain name?** Plan mentions Namecheap via GitHub Student Pack — belum dibeli/configured.
- **V3 archive?** Task 40 mentions archiving V3 project (`aksana-29-route-version/`). Belum ada instruksi spesifik.
- **Image migration?** 400+ images from original project belum di-upload ke Supabase Storage (Task 25 partial — hanya text data).
- **Sambutan/Sudut Sekolah official photos?** Image paths di JSON masih referensi lokal (`img/homepage/...`), belum di-upload ke Supabase Storage.
- **Sentry DSN?** SENTRY_AUTH_TOKEN ada di Vercel env vars tapi Sentry SDK belum diintegrasikan ke kode.

## Suggested Skills

- `subagent-driven-development` — Frontend components (carousel, navbar, footer) independent tasks
- `systematic-debugging` — Jika API routes atau data flow bermasalah
- `search-first` — Untuk cari pattern existing components sebelum buat carousel baru
- `verification-before-completion` — Pastikan deploy sukses dan data tampil sebelum klaim selesai
- `handoff` — Jika perlu melanjutkan di sesi berikutnya

## Risks / Gotchas

- **Swiper belum diinstall** — Untuk carousel sambutan dan sudut sekolah, perlu install `swiper` package via pnpm.
- **API path without /api prefix** — Semua route di API project serve di root (`/public/health`, `/admin/students`). Jangan tambahin `/api` prefix di path. Helper `api.ts` dan `admin-api.ts` sudah strip otomatis.
- **Supabase type inference** — Untuk insert/update, perlu `@ts-expect-error` karena tanpa generated types Supabase infer sebagai `never`.
- **Zod schemas** — `created_at` dan `updated_at` pakai `z.string()` bukan `z.string().datetime()` karena format timestamp dari Supabase tidak kompatibel.
- **Admin pages are client components** — Semua halaman admin `'use client'` karena perlu akses Supabase Auth session. Jangan coba convert ke server component tanpa refactor auth flow.
- **All tests passing: 53 tests** — 22 shared (Vitest) + 31 API (Jest). Jangan break.
- **Vercel project names** — `aksana-29-nextjs-web` (root: `apps/web`) dan `aksana-29-nextjs-api` (root: `apps/api`). Bukan `aksana-29-web` seperti handoff sebelumnya.
- **pnpm version** — Wajib `pnpm@10.30.2` (sesuai packageManager di root package.json).
- **Env files local** — `apps/web/.env.local`, `apps/api/.env`, `packages/db/.env` semua gitignored. Backup sebelum cleanup.
- **Vercel CLI sudah terinstall** — Bisa pake `vercel logs`, `vercel deploy`, `vercel env` untuk debugging.
- **NEXT_PUBLIC_API_URL sudah diupdate** — Set ke `https://aksana-29-nextjs-api-silk.vercel.app` di Vercel production env.
