# MEMORY.md

## Project Conventions

- **File naming**: kebab-case (files/folders), camelCase (variables/JSON), PascalCase (components/classes), SCREAMING_SNAKE_CASE (constants)
- **URL paths**: kebab-case (`/api/public/students`, `/dashboard/teachers`)
- **DB tables/columns**: lowercase (`students`, `image_path`, `allowed_admins`)
- **Commit messages**: English
- **UI copy**: Bahasa Indonesia (formal)
- **Code comments**: Boleh campur ID/EN, konsisten per file
- **Vercel projects**: 2 terpisah — `aksana-29-nextjs-web` (apps/web) + `aksana-29-nextjs-api-silk` (apps/api)
- **API deployment**: Framework Preset = Next.js, build = `next build`, output = `.next/`. JANGAN taruh `vercel.json` di root — akan override dashboard settings.

## Key Technical Decisions

- **API runtime**: Next.js route handlers (`NextResponse`/`NextRequest`), BUKAN NestJS controllers. Walau file `apps/api/app/main.ts` ada untuk local dev (`tsx watch`), production Vercel pakai `next build` route handlers.
- **CORS**: `app.enableCors()` di `main.ts` HANYA untuk local dev. Production butuh `apps/api/middleware.ts` yang baca `CORS_ORIGIN` env var.
- **Auth**: Google OAuth via Supabase Auth, JWT verify pakai JWKS (no hardcode secret), `getAdminSession()` di `utils/admin-guard.ts` cek whitelist `allowed_admins`
- **Image processing**: Sharp bikin 4 WebP variants (320/640/960/1080) + simpan original. Path: `images/{entity}/{uuid}/{variant}.webp`
- **Storage**: Supabase Storage (single bucket). Signed URL expire 5 menit untuk upload.
- **DB dedup strategy**: "Most complete wins" — score based on (imagePath, kesan, pesan, ttl) field completeness, tie-break on latest createdAt. Pure logic di `dedupe.ts`, script wrapper di `dedupe-students.ts`. Same pattern reusable untuk teachers/sambutan/sudut-sekolah kalau ada duplikat.

## Lessons Learned

- **CORS gotcha (CRITICAL)**: Kalau CORS works di local tapi error di production Vercel, root cause hampir pasti: `app.enableCors()` di main.ts cuma jalan di local dev server. Production route handlers TIDAK inherit config itu. Fix: Next.js middleware.ts.
- **CORS_ORIGIN env var**: Wajib di-set di Vercel untuk API project. Format: comma-separated, supports `*.vercel.app` wildcard untuk preview deployments. Default: `http://localhost:3000` (hanya untuk local dev).
- **TDD pattern untuk Next.js middleware**: Extract logic ke testable helper file (`utils/cors.ts`), middleware cuma thin wrapper. Helper bisa di-test dengan jest biasa tanpa harus setup Next.js test infrastructure (edge runtime complications).
- **TDD pattern untuk DB scripts**: Pisah jadi 4 pure functions (score, pick, group, build plan) bukan 1 monolithic function. Tiap function testable independently, script tinggal panggil urut. Lebih mudah di-reuse untuk entity lain.
- **Drizzle seed safety**: `onConflictDoNothing()` tanpa target argumen cuma detect conflict di primary key. Kalau PK adalah UUID random, conflict tidak akan pernah terjadi. Untuk safe re-run seed, HARUS specify target + add UNIQUE constraint di table.
- **Vercel deployment gotcha**: Vercel deploy dari git, bukan dari working directory. Kalau code baru di-create tapi belum di-commit/push, redeploy tidak akan include-nya. Selalu commit + push SEBELUM redeploy untuk trigger fix.
- **Vercel framework preset config**: `vercel.json` di root SELALU override dashboard settings. Kalau mau pake dashboard config, hapus `vercel.json`.
- **Supabase Auth Google OAuth**: Butuh BOTH Client ID + Client Secret, tidak cukup hanya Client ID.
- **`.env` loading**: `tsx` tidak auto-load `.env` — perlu explicit env vars passing (`set -a; . ./.env; set +a`) atau pakai dotenv.

## Environment & Tools

- **Stack**: pnpm 10.30.2 + Turborepo 2.9.18 + Next.js 14.2.35 + Tailwind + Supabase + Sharp + Drizzle ORM
- **Testing**: Jest (api), Vitest (web, shared, db) — `pnpm turbo run test` atau per-package `pnpm --filter @aksana/<pkg> test`
- **Type-check**: `pnpm turbo run type-check` (note: kalau 1 sub-package fail, exit code 1 dan cancel semua reports)
- **Local dev API**: `pnpm --filter @aksana/api dev` (NestJS+Express di port 3001) untuk test CORS lokal. Production behavior beda — pakai `pnpm --filter @aksana/api exec next dev` untuk replicate production middleware.
- **DB scripts**: `pnpm --filter @aksana/db dedupe:students` (dry-run default, `--apply` untuk eksekusi). Env vars di `packages/db/.env`. Load dengan `set -a; . ./.env; set +a` sebelum run.
- **MCP tersedia**: context7 (library docs via Smithery), websearch/web-search (web search), grep_app, github (on-demand)
