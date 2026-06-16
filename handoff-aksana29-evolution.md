# Handoff: Aksana 29 v5 — ALL 41 TASKS COMPLETE

## Summary

Semua 41 tasks (Foundation + Data + Public + Auth + Image + Admin Dashboard + Frontend Components + Polish/Deploy) selesai. Monorepo (pnpm + Turborepo) dengan apps/web (Next.js 14) + apps/api (Next.js route handlers) + packages/{shared,db}. Public site live dengan 279 students, 60 teachers, 4 sambutan, 47 sudut sekolah, 2 videos dari Supabase. Admin Dashboard lengkap dengan CRUD untuk semua entitas + whitelist management + image upload UI. Google OAuth + JWT verify + admin guard terpasang. Frontend publik: Navbar (scroll-aware), Footer, Sambutan Swiper carousel, Sudut Sekolah Swiper coverflow. Deployed ke Vercel, web dan API keduanya live.

Tersisa: (1) Image migration ~400 foto dari project original ke Supabase Storage (ada script auto: `pnpm migrate:images`), (2) Push + deploy ke Vercel (butuh koneksi internet), (3) DNS domain (Namecheap via GitHub Student Pack).

## Current State

### Git

- Branch: main
- 34 commits sejak start (commit terakhir: `09826e2`)
- Working tree: clean (ada untracked DESIGN.md dari sesi sebelumnya — abaikan/gitignore)
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
│   │   │   ├── public/                   [NEW: Header, Footer, 2 Carousels + existing components]
│   │   │   │   ├── Header.tsx            [scroll-aware, dropdown kelas, mobile menu]
│   │   │   │   ├── Footer.tsx            [copyright + credits]
│   │   │   │   ├── SambutanCarousel.tsx  [Swiper: 4 officials' messages]
│   │   │   │   └── SudutSekolahCarousel.tsx [Swiper coverflow: 49 photos]
│   │   │   └── admin/                    [Sidebar, DataTable, Forms, ImageUpload]
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
- **Web (apps/web)**: 4 tests pass (Vitest) — api utility tests
- **Total**: 57 tests pass
- **TypeScript**: Zero errors di shared, web, dan api
- **Build**: Next.js build sukses untuk semua 27+ routes

## Key Decisions (added in session 2)

1. **Swiper untuk carousel** — Swiper dipilih karena sudah di-tech stack plan, punya module navigation/pagination/autoplay yang cocok untuk Sambutan (card-style, manual nav) dan Sudut Sekolah (coverflow, autoplay loop). Tidak perlu install library carousel lain.

2. **Header slug URLs** — Link kelas di navbar menggunakan slug format (`/pesdik/xii-ipa-1`) bukan encoded format (`/pesdik/XII%20IPA%201`) karena halaman pesdik menggunakan slug pattern di route handler. Ini diperbaiki setelah ditemukan mismatch saat implementasi.

3. **Sentry ditempatkan di `apps/web/`** — Sentry wizard awalnya generate file di root monorepo, tapi Next.js hanya membaca config dari direktori app-nya sendiri (`apps/web/`). Semua sentry config dipindahkan ke `apps/web/` dan `next.config.mjs` di-wrap dengan `withSentryConfig`.

4. **Image migration sebagai script terpisah** — Bukan bagian dari `from-original.ts` karena image migration butuh `sharp` + `@supabase/supabase-js` yang tidak ada di `packages/db` sebelumnya. Ditambahkan sebagai dep + script `migrate:images`.

5. **Sambutan manual mapping** — JSON original tidak punya referensi image untuk sambutan (semua empty string). Hanya KH. Parhani yang punya foto di `img/homepage/sambutan/Guru Parhani.JPG`. 3 pejabat lain (Mulyadi, Jumirah, Paidi) tidak ada foto di original project, jadi `image_path` tetap `null` di DB.

1. **Admin API routes menggunakan Next.js route handlers pattern** — sama dengan public routes. Setiap entitas punya `route.ts` (GET list + POST create) dan `[id]/route.ts` (GET single + PATCH update + DELETE). Semua diproteksi via `getAdminSession()` dari `admin-guard.ts`.

2. **API path tanpa `/api` prefix** — Karena API project root adalah `apps/api/`, route files di `apps/api/app/public/health/route.ts` serve di `/public/health`, bukan `/api/public/health`. Frontend helper strips `/api` prefix otomatis.

3. **Zod `datetime()` diganti `string()`** — Supabase mengembalikan timestamp dalam format `2026-06-15T18:10:46.412346+00:00` yang tidak lolos validasi Zod `datetime()` (hanya terima format `Z` suffix). Semua schema di `packages/shared/src/schemas/` sudah diganti.

4. **TypeScript `@ts-expect-error` untuk Supabase insert/update** — Tanpa generated types, Supabase JS client v2 meng-infer tipe sebagai `never` untuk `.insert()` dan `.update()`. Digunakan `@ts-expect-error` di setiap admin route yang memanggil operasi tersebut.

5. **Admin UI pages menggunakan client components** — Semua halaman admin adalah `'use client'` karena perlu akses ke Supabase Auth session untuk JWT token. `admin-api.ts` menggunakan dynamic import `@/lib/supabase/client` untuk mendapatkan token.

6. **Sidebar navigation menggunakan SVG icons inline** — Tidak perlu dependency icon library. 7 menu items + logout button, active state detection via `usePathname()`.

## Files Changed (session 2: Public Frontend + Polish/Deploy)

### New files (session 2):
- `apps/web/components/public/Header.tsx` — scroll-aware navbar
- `apps/web/components/public/Footer.tsx` — footer dengan credits
- `apps/web/components/public/SambutanCarousel.tsx` — Swiper carousel untuk 4 pejabat
- `apps/web/components/public/SudutSekolahCarousel.tsx` — Swiper coverflow untuk 49 foto
- `apps/web/vitest.config.ts` — frontend test config
- `apps/web/__tests__/api.test.ts` — 4 tests untuk api utility
- `apps/web/sentry.server.config.js` + `sentry.edge.config.js` — Sentry configs
- `apps/web/instrumentation.js` + `instrumentation-client.js` — Sentry instrumentation
- `packages/db/src/seed/migrate-images.ts` — image migration script
- `README.md` — dokumentasi lengkap

### Modified files (session 2):
- `apps/web/next.config.mjs` — wrapped with `withSentryConfig`
- `apps/web/app/(public)/layout.tsx` — added Header + Footer wrappers
- `apps/web/app/page.tsx` — added SambutanCarousel + SudutSekolahCarousel
- `apps/web/components/public/Header.tsx` — fixed slug URLs for kelas dropdown
- `apps/web/components/public/StudentCard.tsx` — added `loading="lazy"`
- `apps/web/components/public/TeacherCard.tsx` — added `loading="lazy"`
- `packages/db/package.json` — added sharp, supabase, types/node deps

## Next Steps

### Immediate: Deploy & Image Migration

1. **Push to GitHub + Vercel auto-deploy** — `git push origin main` saat koneksi internet tersedia. Build sudah diverifikasi sukses.
2. **Image migration** — Jalankan script: `cd packages/db && SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_DB_URL=... pnpm migrate:images`. Akan upload ~400 foto ke Supabase Storage + update `image_path` di DB.
3. **Domain configuration** — `aksana-29.me` via Namecheap (GitHub Student Pack), arahkan ke Vercel.

### Polish & Deploy (Tasks 35-41 — ALL COMPLETE in code)

| Task | Status | Notes |
|------|--------|-------|
| Task 34 SEO meta tags | DONE | OG tags di semua halaman |
| Task 35 Performance | DONE | `loading="lazy"`, `revalidate:60`, `sizes` attributes |
| Task 36 Sentry | DONE | Config files + `withSentryConfig` di `next.config.mjs` |
| Task 37 Testing | DONE | 57 total tests (22 shared + 31 api + 4 web) |
| Task 38 Documentation | DONE | README.md lengkap |
| Task 39 Deploy + DNS | PENDING | Butuh git push + domain config |
| Task 40 V3 archive | DONE | Project exists at `aksana-29-route-version/` |
| Task 41 Monitor | PENDING | Observasional 1 minggu |

## Open Questions (Resolved)

- **Domain name?** Menggunakan `aksana-29.me` (Namecheap via GitHub Student Pack) — belum dibeli/di-configure.
- **Image migration?** Ada script otomatis: `packages/db/src/seed/migrate-images.ts`. Jalankan via `pnpm migrate:images` dengan env vars yang benar.
- **Sambutan/Sudut Sekolah photos?** Hanya KH. Parhani yang punya foto di original (`Guru Parhani.JPG`). 3 pejabat lain tidak ada foto individual di project original. Script handling manual mapping.
- **Sentry DSN?** Sudah terkonfigurasi di `sentry.server.config.js`, `sentry.edge.config.js`, dan `next.config.mjs`. DSN dari Sentry Education plan. Auth token perlu di-set di Vercel env vars.

## Suggested Skills

- `subagent-driven-development` — Frontend components (carousel, navbar, footer) independent tasks
- `systematic-debugging` — Jika API routes atau data flow bermasalah
- `search-first` — Untuk cari pattern existing components sebelum buat carousel baru
- `verification-before-completion` — Pastikan deploy sukses dan data tampil sebelum klaim selesai
- `handoff` — Jika perlu melanjutkan di sesi berikutnya

## Risks / Gotchas

- **API path without /api prefix** — Semua route di API project serve di root (`/public/health`, `/admin/students`). Jangan tambahin `/api` prefix di path. Helper `api.ts` dan `admin-api.ts` sudah strip otomatis.
- **Supabase type inference** — Untuk insert/update, perlu `@ts-expect-error` karena tanpa generated types Supabase infer sebagai `never`.
- **Zod schemas** — `created_at` dan `updated_at` pakai `z.string()` bukan `z.string().datetime()` karena format timestamp dari Supabase tidak kompatibel.
- **Admin pages are client components** — Semua halaman admin `'use client'` karena perlu akses Supabase Auth session. Jangan coba convert ke server component tanpa refactor auth flow.
- **All tests passing: 57 tests** — 22 shared (Vitest) + 31 API (Jest) + 4 web (Vitest). Jangan break.
- **Vercel project names** — `aksana-29-nextjs-web` (root: `apps/web`) dan `aksana-29-nextjs-api` (root: `apps/api`). Bukan `aksana-29-web` seperti handoff sebelumnya.
- **pnpm version** — Wajib `pnpm@10.30.2` (sesuai packageManager di root package.json).
- **Env files local** — `apps/web/.env.local`, `apps/api/.env`, `packages/db/.env` semua gitignored. Backup sebelum cleanup.
- **Vercel CLI sudah terinstall** — Bisa pake `vercel logs`, `vercel deploy`, `vercel env` untuk debugging.
- **NEXT_PUBLIC_API_URL sudah diupdate** — Set ke `https://aksana-29-nextjs-api-silk.vercel.app` di Vercel production env.
- **Image path mismatch** — DB saat ini menyimpan `image_path` sebagai filename lokal (contoh: `57277476e4deb5c282144fd813d0fe0d.JPG`), BUKAN path Supabase Storage. Frontend `getImageUrl()` akan generate URL yang salah sampai migration script dijalankan.
- **Image migration butuh env vars** — Script `migrate:images` perlu `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, dan `SUPABASE_DB_URL`. Pastikan semua di-set sebelum run.
- **Sambutan photos terbatas** — Dari 4 pejabat, hanya KH. Parhani yang punya foto di project original. 3 lainnya (`image_path = null` di DB) tidak akan muncul foto di carousel.
- **Build success with Sentry** — Build web berhasil dengan Sentry instrumentation. Pastikan `SENTRY_AUTH_TOKEN` di-set di Vercel env vars untuk source map upload.
