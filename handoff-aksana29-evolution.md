# Handoff: Aksana 29 v5 Implementation (Phase 1-2 Complete)

## Summary

18 dari 41 tasks selesai. Monorepo (pnpm + Turborepo) dengan apps/web (Next.js 14) + apps/api (Next.js route handlers) + packages/shared/shared (Drizzle ORM + Zod). Semua data public site sudah live (279 students, 60 teachers, 4 sambutan, 47 sudut sekolah, 2 videos) terkoneksi Supabase. Google OAuth + JWT verify + admin guard sudah terpasang. Yang tersisa: Admin Dashboard CRUD (Tasks 26-33) dan Polish/Deploy (Tasks 34-41), plus redeploy Vercel untuk env vars.

## Current State

### Git

- Branch: main
- 26 commits sejak start
- Working tree: clean (kecuali memory/2026-06-16.md untracked)
- Remote: `origin` pointing to `github.com:kemal-faza/aksana-29-nextjs.git`

### Arsitektur Terbangun

```
aksana-29-nextjs/
├── apps/
│   ├── web/                              [Next.js 14 - LIVE di Vercel]
│   │   ├── app/(public)/                 [Semua halaman publik]
│   │   │   ├── page.tsx                  [Hero + About + Birthday]
│   │   │   ├── guru/page.tsx             [Daftar guru + search + modal]
│   │   │   ├── pesdik/[kelas]/page.tsx   [8 kelas routes]
│   │   │   └── galeri/page.tsx           [Video embed Google Drive]
│   │   ├── app/(admin)/                  [Protected routes]
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx            [Google OAuth button]
│   │   │   └── dashboard/page.tsx        [Placeholder]
│   │   ├── app/auth/callback/route.ts    [OAuth exchange]
│   │   ├── middleware.ts                 [Route protection]
│   │   ├── lib/
│   │   │   ├── api.ts                    [Fetch wrapper + ISR]
│   │   │   ├── images.ts                 [getImageUrl + getImageSrcSet]
│   │   │   └── supabase/                 [client.ts, server.ts, middleware.ts]
│   │   └── components/public/
│   │       ├── Hero.tsx, About.tsx
│   │       ├── StudentCard.tsx, StudentModal.tsx
│   │       ├── TeacherCard.tsx, TeacherModal.tsx
│   │       ├── VideoEmbed.tsx
│   │       ├── BirthdayPopup.tsx, BirthdayCard.tsx
│   │       └── [Admin components: BELUM]
│   └── api/                              [Next.js route handlers - Vercel]
│       ├── app/public/                   [12 endpoint publik]
│       │   ├── health/route.ts
│       │   ├── students/route.ts         [GET list + filter + pagination]
│       │   ├── students/[id]/route.ts
│       │   ├── students/birthdays/route.ts
│       │   ├── teachers/route.ts
│       │   ├── teachers/[id]/route.ts
│       │   ├── sambutan/route.ts
│       │   ├── sambutan/[id]/route.ts
│       │   ├── sudut-sekolah/route.ts
│       │   ├── sudut-sekolah/[id]/route.ts
│       │   ├── videos/route.ts
│       │   └── videos/[id]/route.ts
│       ├── app/admin/images/             [Upload pipeline]
│       │   ├── sign-upload/route.ts      [Signed URL generation]
│       │   └── process/route.ts          [Sharp WebP variants]
│       └── app/utils/
│           ├── supabase.ts               [Admin client singleton]
│           ├── auth.ts                    [JWT verify via jose]
│           ├── admin-guard.ts            [JWT + whitelist check]
│           └── image-processor.ts        [Sharp: 4 WebP variants]
├── packages/
│   ├── shared/                           [@aksana/shared]
│   │   └── src/
│   │       ├── schemas/                  [Zod: student, teacher, sambutan, sudut, video]
│   │       └── constants/                [kelas, jabatan, image-variants]
│   └── db/                               [@aksana/db]
│       ├── drizzle/                      [Migration files]
│       └── src/
│           ├── schema/                   [Drizzle: 6 tables]
│           ├── seed/                     [bootstrap-admin.ts, from-original.ts]
│           └── client.ts
├── .github/workflows/ci.yml              [Lint + type-check + test + build]
├── turbo.json, pnpm-workspace.yaml
└── supabase/                             [Initialized, linked to cloud]
```

### Vercel Deployments

- **aksana-29-web** (Next.js): LIVE — Hero, About, student count visible. **Env vars Supabase BELUM di-redeploy**.
- **aksana-29-api** (Next.js route handlers): LIVE — `/public/health` works. **Env vars Supabase BELUM di-redeploy**.

### Supabase (cloud, connected)

- Tables: `allowed_admins`, `students`, `teachers`, `sambutan`, `sudut_sekolah`, `videos`
- Bucket: `images` (public)
- Auth: Google OAuth configured (Client ID + Client Secret set)
- Data seeded: 279 students, 60 teachers, 4 sambutan, 47 sudut-sekolah, 2 videos

## Key Decisions

1. **V5 = monorepo dengan FE/BE split** — `apps/web` (Next.js 14 RSC), `apps/api` (Next.js route handlers), `packages/{shared,db}`. Bukan NestJS murni (route handlers pakai Next.js format biar Vercel-compatible).
2. **Supabase instead of Firebase** — Postgres via Drizzle ORM, Storage untuk images, Auth untuk Google OAuth. Migration ke cloud selesai.
3. **Route handlers tanpa NestJS** — Awalnya pake NestJS `@Controller`, tapi Vercel gak kompatibel. Diganti ke `NextResponse`/`NextRequest` dari `next/server`. NestJS `main.ts` hanya untuk local dev via `vercel dev`.
4. **Sharp offline untuk image processing** — Bukan di middleware. Endpoint `/admin/images/process` yang dipanggil setelah upload selesai, generates 4 WebP variants.
5. **Data di-seed dari original JSON** — 279 siswa + 60 guru dari JSON, 4 sambutan dari HTML, 47 sudut sekolah dari JS, 2 video dari HTML galeri. Image migration via Sharp pipeline belum dijalankan.

## Next Steps (20 tasks remaining)

### Immediate: Admin Dashboard (Tasks 26-33)

1. **Task 26**: Admin layout + Sidebar component (`apps/web/components/admin/Sidebar.tsx`)
2. **Task 27**: Admin CRUD Students — table + form page (`dashboard/students/`)
3. **Tasks 28-31**: Admin CRUD Teachers, Sambutan, Sudut Sekolah, Videos — copy pattern dari Task 27
4. **Task 32**: Whitelist management page (`dashboard/admins/`)
5. **Task 33**: Admin image upload UI — drag-drop + progress bar + preview

### Setup: Vercel Redeploy

6. **Redeploy both projects** setelah env vars Supabase diisi. Biar data dari Supabase tampil di web.

### Polish & Deploy (Tasks 34-41)

7. **Task 34**: SEO meta tags per page (title, description, OG image)
8. **Task 35**: Performance — ISR (`revalidate`), lazy loading, srcSet di semua image
9. **Task 36**: Sentry integration
10. **Task 37**: Testing — backend (Jest, already 17 tests), frontend (Vitest), E2E (Playwright)
11. **Task 38**: Documentation — README, runbook, env setup
12. **Task 39**: Domain configuration (Namecheap via GitHub Student Pack)
13. **Task 40-41**: V3 archive + monitoring

## Key Credentials (redacted in handoff)

- Supabase: project `rgaaltkrfjjutvgycibu`, URL/keys stored in local `.env` files (gitignored)
- Vercel: `aksana-29-web` + `aksana-29-api` under kemal-faza GitHub
- Google OAuth: configured in Supabase Auth providers
- Admin email: `kemalfaza26@gmail.com` (bootstrap admin seeded)

## Open Questions

- **Domain name?** Plan mentions Namecheap via GitHub Student Pack — belum dibeli/configured
- **V3 archive?** Task 40 mentions archiving V3 project (`aksana-29-route-version/`). Belum ada instruksi spesifik
- **Image migration?** 400+ images from original project belum di-upload ke Supabase Storage (Task 25 partial — hanya text data)
- **Sambutan/Sudut Sekolah official photos?** Image paths di JSON masih referensi lokal (`img/homepage/...`), belum di-upload ke Supabase Storage

## Suggested Skills

- `subagent-driven-development` — Admin CRUD pages (Tasks 26-33) highly parallelizable; each entity can be built independently
- `dispatching-parallel-agents` — Tasks 27-31 (5 CRUD pages) independent + can run after Task 26 layout is ready
- `test-driven-development` — For CRUD operations; write test for API endpoints before implementing
- `search-first` — To find existing component patterns (StudentCard, TeacherCard) to match admin table/forms
- `finishing-a-development-branch` — After all tasks complete, to verify tests + present merge/PR options

## Risks / Gotchas

- **Admin routes use middleware protection** — middleware.ts protects `/dashboard/*`. Admin CRUD pages must be under `app/(admin)/dashboard/` (route group) not `app/dashboard/`
- **API route handlers use NextResponse** — Bukan Express/NestJS. Response helper functions should use `NextResponse.json()` from `next/server`
- **Vercel API deployment berbeda** — Api project pakai Next.js preset, build pake `next build`, output ke `.next/`. File `vercel.json` yang lama (`buildCommand: "tsc"`, `outputDirectory: "dist"`) SUDAH DIHAPUS — jangan recreate
- **Drizzle client di seed** — `db.query.X.findFirst()` tidak bekerja tanpa schema registry. Seed scripts harus pake `db.select().from(X).where(...)` langsung
- **Supabase client type inference** — `.select('col1, col2')` dengan kolom spesifik return `never` type. Harus di-cast via `as unknown as Interface[]`
- **All tests passing** — 17 API tests, 22 shared tests, semua pass. Jangan break
- **Env files local** — `apps/web/.env.local`, `apps/api/.env`, `packages/db/.env` semua gitignored. Backup sebelum cleanup
- **pnpm version** — Wajib `pnpm@10.30.2` (sesuai packageManager di root package.json)
