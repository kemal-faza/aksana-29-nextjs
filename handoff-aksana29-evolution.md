# Handoff: Aksana 29 v5 — Session 4 (CORS Fix + DB Dedup)

## Summary

Session 4: dua fix penting. **(1) CORS bug** yang ngeblok dashboard dari fetch API — di-fix dengan Next.js middleware + extracted helper (commit `e278935`, BELUM di-push). **(2) DB duplicates** (1114 students, 240 teachers, 8 sambutan — semua 4x lipat) — di-fix dengan script dedup TDD'd (`packages/db/src/seed/dedupe-*.ts`) + refactor generic API. Students sudah di-apply (279), teachers + sambutan siap di-apply.

## Current State

### Git

- Branch: main
- 36 commits sejak start (commit terakhir: `e278935 fix(api): add CORS middleware for production deployment`)
- **CORS fix BELUM di-push** — ini blocker untuk dashboard live
- Working tree (uncommitted, related to session 4):
  - Modified: `packages/db/package.json` (added vitest + 2 new dedupe scripts), `packages/db/src/seed/dedupe.ts` (refactored generic), `packages/db/src/seed/dedupe-students.ts` (uses generic now)
  - Untracked: `packages/db/src/seed/dedupe-teachers.ts`, `packages/db/src/seed/dedupe-sambutan.ts`, `packages/db/src/seed/dedupe.test.ts`
  - Untracked: `MEMORY.md` (cross-session memory), `memory/2026-06-16.md` (daily notes)

### Arsitektur (delta session 4)

```
packages/db/src/seed/
├── dedupe.ts                       [REFACTORED: generic + 3 entity specs]
├── dedupe.test.ts                  [NEW: 38 unit tests, TDD'd]
├── dedupe-students.ts              [Works via wrapper, still functional]
├── dedupe-teachers.ts              [NEW: uses teacherSpec]
└── dedupe-sambutan.ts              [NEW: uses sambutanSpec]

apps/api/
├── middleware.ts                   [NEW: CORS Next.js middleware]
└── app/utils/cors.ts               [NEW: testable CORS helper, 14 tests]
```

### Database Status (LIVE, after students dedup applied)

| Table | Total | Expected unique | Action |
|-------|-------|-----------------|--------|
| students | **279** | 279 | DONE (applied) |
| teachers | 240 | 60 | Ready (script tested, dry-run OK) |
| sambutan | 8 | 4 | Ready (script tested, dry-run OK) |
| sudut_sekolah | 47 | 47 | No dedup needed (per handoff) |
| videos | 2 | 2 | No dedup needed (per handoff) |

### Vercel Deployments (unchanged from session 2)

| Project | URL | Status |
|---------|-----|--------|
| **aksana-29-nextjs-web** | https://aksana-29-nextjs-web.vercel.app | LIVE — CORS fix will make dashboard populated |
| **aksana-29-nextjs-api** | https://aksana-29-nextjs-api-silk.vercel.app | LIVE — middleware added but needs push + redeploy |

**CORS_ORIGIN env var**: Set to `https://aksana-29-nextjs-web.vercel.app,*.vercel.app` on API project per user. But middleware isn't in production yet (not pushed), so CORS still failing.

## Key Decisions (session 4)

### CORS Fix

1. **Root cause**: `app.enableCors()` di `apps/api/app/main.ts` HANYA untuk local NestJS dev server. Production Vercel pakai `next build` → Next.js route handlers, TIDAK inherit CORS config itu. Confirmed via curl: OPTIONS preflight return 204 dengan NO `Access-Control-Allow-Origin`.

2. **CORS logic extracted** ke `apps/api/app/utils/cors.ts` (testable pure functions: `parseAllowedOrigins`, `matchOrigin` dengan `*.vercel.app` wildcard, `applyCors`, `handlePreflight`). Middleware cuma thin wrapper yang call helper.

3. **Wildcard `*.vercel.app`** untuk preview deployments. Trade-off: less strict matching, tapi worth it untuk DX preview.

### DB Dedup

4. **"Most complete wins" strategy** — score = jumlah non-empty fields (imagePath, kesan, pesan, ttl untuk students; imagePath+ekstra+mapel untuk teachers; imagePath+isi untuk sambutan). Tie-break on latest `createdAt`. Rationale: preserves manual edits admin mungkin udah edit, falls back ke "newest" kalau sama-sama lengkap.

5. **Generic dedup API** — `buildDeletePlanGeneric<T>(rows, spec)` + `DedupSpec<T>` interface (`getKey`, `getScore`, `getCreatedAt`). Entity specs (`studentSpec`, `teacherSpec`, `sambutanSpec`) adalah thin objects. Reusable untuk entity lain.

6. **TDD vertical slices** — pisah jadi 4 functions (score, pick, group, build) bukan 1 monolithic. 38 unit tests total. Logic 100% testable tanpa DB.

7. **Backward compat preserved** — student-specific `scoreRow`, `pickBest`, `groupByKey`, `buildDeletePlan` masih ada (marked `@deprecated`) supaya existing 23 student tests tidak perlu diubah.

8. **Teacher grouping by `nama` only** (not `nama+jabatan`) — handles promotion case (Guru → Wakamad). Trade-off: kalau ada同名 guru beda orang, akan di-merge. Acceptable risk karena guru biasanya unik by nama.

9. **No UNIQUE constraint added yet** — current dedup is reactive (script-based). Untuk prevent re-duplication di future, perlu:
   ```sql
   ALTER TABLE students ADD CONSTRAINT students_nama_kelas_unique UNIQUE (nama, kelas);
   ALTER TABLE teachers ADD CONSTRAINT teachers_nama_unique UNIQUE (nama);
   ALTER TABLE sambutan ADD CONSTRAINT sambutan_nama_unique UNIQUE (nama);
   ```
   Plus update seed script: `onConflictDoNothing({ target: [students.nama, students.kelas] })`.

## Files Changed (session 4)

### CORS Fix (committed, NOT pushed):
- `apps/api/middleware.ts` — 32 baris, Next.js middleware entry
- `apps/api/app/utils/cors.ts` — 153 baris, testable CORS helper
- `apps/api/__tests__/cors.test.ts` — 154 baris, 14 test cases
- `.env.example` — Added CORS_ORIGIN documentation

### DB Dedup (NOT committed):
- `packages/db/src/seed/dedupe.ts` — REFACTORED ke generic (~230 baris)
- `packages/db/src/seed/dedupe.test.ts` — NEW, 38 tests (~380 baris)
- `packages/db/src/seed/dedupe-students.ts` — modified to use generic internally
- `packages/db/src/seed/dedupe-teachers.ts` — NEW (~130 baris)
- `packages/db/src/seed/dedupe-sambutan.ts` — NEW (~130 baris)
- `packages/db/package.json` — Added vitest devDep, 2 new dedupe scripts, test script
- `packages/db/src/seed/migrate-images.ts` — pre-existing modification (not mine)

### Memory/Docs (NOT committed):
- `MEMORY.md` — Long-term cross-session memory
- `memory/2026-06-16.md` — Daily notes
- `handoff-aksana29-evolution.md` — This file

## Next Steps

### Immediate (CRITICAL — block dashboard data):

1. **Push commit `e278935` ke remote**:
   ```bash
   git push origin main
   ```
   Vercel akan auto-deploy API dengan middleware. Tunggu ~1-2 menit.

2. **Verify CORS live**:
   ```bash
   curl -sI -X OPTIONS https://aksana-29-nextjs-api-silk.vercel.app/admin/students \
     -H "Origin: https://aksana-29-nextjs-web.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: authorization,content-type"
   ```
   Harus return `access-control-allow-origin: https://aksana-29-nextjs-web.vercel.app`.

3. **Refresh dashboard siswa** di browser — console CORS error hilang, tabel populated dengan 279 rows (bukan 1114).

4. **Apply teachers + sambutan dedup**:
   ```bash
   cd packages/db
   set -a && . ./.env && set +a
   pnpm --filter @aksana/db dedupe:teachers -- --apply
   pnpm --filter @aksana/db dedupe:sambutan -- --apply
   ```
   Backup files akan auto-generated di `packages/db/src/seed/backup-{entity}-{timestamp}.json`.

5. **Verify counts**:
   - `curl "https://.../public/teachers?limit=1" | jq '.total'` → should be 60
   - `curl "https://.../public/sambutan?limit=1" | jq '.total'` → should be 4
   - `curl "https://.../public/students?limit=1" | jq '.total'` → should be 279

### After fix verified:

6. **Add UNIQUE constraints di Supabase** (prevent re-duplication):
   - Via Supabase Dashboard SQL Editor, atau
   - Create migration file: `packages/db/drizzle/000X_add_unique_constraints.sql`

7. **Fix seed scripts** di `packages/db/src/seed/from-original.ts`:
   ```ts
   // Was: .onConflictDoNothing() — broken for UUID PK
   // Now: .onConflictDoNothing({ target: [students.nama, students.kelas] })
   await db.insert(students).values(item).onConflictDoNothing({
     target: [students.nama, students.kelas],
   });
   ```
   Same for teachers (target: `teachers.nama`) dan sambutan (target: `sambutan.nama`).

8. **Commit all session 4 work** (CORS + dedup + memory files). Recommend two commits:
   - `fix(api): add CORS middleware` (already exists as e278935, will be included in push)
   - `feat(db): add dedup scripts with generic API` (the new uncommitted work)

9. **Consider commit pre-existing modifications**:
   - `handoff-aksana29-evolution.md` (this file)
   - `packages/db/src/seed/migrate-images.ts`
   - `memory/2026-06-16.md` (my daily notes)
   - `MEMORY.md` (long-term memory)

## Open Questions

- **DB unique constraints**: Add via Supabase dashboard atau Drizzle migration? Trend di project: prefer dashboard untuk one-off SQL, prefer migration untuk repeatable. Belum diputuskan.
- **Teacher grouping strictness**: Current = `nama` only. Kalau ada同名 guru beda orang (kemungkinan kecil), admin harus merge manual via dashboard. Acceptable untuk sekarang.
- **Sudut sekolah dedup needed?**: 47 records per handoff = no duplicates. Tidak perlu script. Tapi kalau seed dijalankan lagi di future, harus ada unique constraint di `sudut_sekolah.image_path` untuk prevent duplicates.
- **Orphan images di Supabase Storage**: 4x images per student (835 deleted rows × 4 variants × 4 sizes = ~13,360 orphan files). Storage cost naik. Optional cleanup: list + delete files yang tidak referenced lagi di DB. Out of scope untuk session 4.

## Suggested Skills

- **`test-driven-development`** — Pattern `extract pure logic + thin script wrapper` sangat reusable. Lihat `dedupe.ts` + `cors.ts` sebagai referensi. Setiap logic yang involve CLI flags, I/O, atau DB harus pisah jadi testable pure function.
- **`systematic-debugging`** — Kalau CORS masih error setelah push + redeploy, cek Vercel deployment logs (kalau ada), reproduksi dengan curl, cek apakah middleware.ts ada di build output.
- **`verification-before-completion`** — Jangan klaim "fixed" sampai: (1) test pass, (2) type-check clean, (3) curl ke production return expected headers/data, (4) browser verify.
- **`search-first`** — Sebelum bikin pattern baru, cek existing patterns di codebase. `apps/web/middleware.ts` (Supabase session) bisa jadi referensi.
- **`handoff`** — Untuk continue di session berikutnya (e.g. UNIQUE constraints, seed fix, commit, cleanup orphan images).

## Risks / Gotchas

### CORS-specific:

- **Vercel deploy from git, not working tree** — INI ROOT CAUSE kenapa user set env var + redeploy tapi CORS masih error di session sebelumnya. Files harus di-commit + push SEBELUM Vercel bisa include-nya.
- **CORS_ORIGIN TIDAK opsional untuk production** — Tanpa env var, middleware fallback ke `http://localhost:3000` saja. Production frontend akan ke-block.
- **Preflight cache 24 jam** — `Access-Control-Max-Age: 86400`. Kalau CORS rules berubah, user mungkin perlu hard refresh (Ctrl+Shift+R).
- **Edge runtime limits** — Middleware TIDAK bisa pakai Node.js APIs (fs, child_process). CORS logic saat ini pure, tapi kalau extend ke auth/rate-limit, perlu hati-hati.
- **CORS_ORIGIN value**: User set `https://aksana-29-nextjs-web.vercel.app,*.vercel.app`. Untuk custom domain (`aksana-29.me`), harus di-explicit add nanti.

### DB Dedup-specific:

- **Students already deduped (279)** — User applied --apply di session sebelumnya. 835 rows deleted, backup di `packages/db/src/seed/backup-students-{timestamp}.json`. Kalau perlu revert, restore dari backup.
- **Teacher/sambutan scripts NOT applied** — only dry-run tested. 180 teacher + 4 sambutan rows ready to delete setelah user run --apply.
- **Script idempotent**: Re-running setelah dedup selesai akan exit early ("No duplicates found"). Aman.
- **Backup files**: Akan di-generate di `packages/db/src/seed/` directory. Bisa di-gitignore atau dipindah ke `backups/` setelah selesai.
- **Pre-existing Drizzle type error** di `from-original.ts` (line 211) — UNRELATED to session 4 work, sudah ada sebelum session 4. Type-check packages/db akan fail karena ini. Bisa di-fix nanti atau pakai `@ts-expect-error`.

### Carry over dari session sebelumnya:

- **API path tanpa `/api` prefix** — Helper `api.ts` dan `admin-api.ts` strip otomatis.
- **Supabase type inference** — Insert/update butuh `@ts-expect-error`.
- **Zod schemas** — `created_at`/`updated_at` pakai `z.string()` bukan `z.string().datetime()`.
- **Admin pages client components** — Semua `'use client'`.
- **Tests: 109 pass** (was 57, +52 dari CORS + dedup).
- **Vercel projects** — `aksana-29-nextjs-web` (apps/web) + `aksana-29-nextjs-api-silk` (apps/api).
- **pnpm version** — Wajib `pnpm@10.30.2`.
- **Image paths sudah canonical** — `images/{entity}/{uuid}/1080.webp`.
- **1 foto siswa masih skip** — `241925fd1a205eb105b56fb4245d4a8d.JPG` (8.3MB) belum terupload.
- **Sentry auth token** — Perlu di-set `SENTRY_AUTH_TOKEN` di Vercel env vars.

### Key insight untuk Next.js hybrid (NestJS+Next.js) projects:

Kalau ada bug CORS di Next.js production tapi works di local, **cek dulu apakah CORS config ada di code yang bener jalan di production**. Pattern umum:
- `app.enableCors()` (NestJS) → cuma local dev
- `cors()` middleware (Express) → cuma local dev
- `headers()` di `next.config.mjs` → global, inflexible
- `middleware.ts` Next.js → **jalan di production** ← yang kita pakai

Untuk project yang sama-sama punya NestJS dev + Next.js route handlers, **WAJIB** setup CORS di kedua tempat atau switch ke Next.js-only runtime.
