# AKSANA 29 — Buku Tahunan Digital MAN Kapuas

Website buku tahunan digital untuk siswa kelas XII MAN Kapuas, angkatan ke-29 (tahun ajaran 2023/2024).

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, TypeScript
- **Backend:** Next.js Route Handlers (Vercel Serverless), TypeScript
- **Database:** Supabase (Postgres)
- **Auth:** Google OAuth via Supabase Auth
- **ORM:** Drizzle ORM
- **Validation:** Zod (shared schemas)
- **Image Processing:** Sharp (4 WebP variants)
- **Carousel:** Swiper
- **Monitoring:** Sentry

## Structure

```
aksana-29-nextjs/
├── apps/
│   ├── web/           — Next.js 14 public site + admin dashboard
│   └── api/           — API route handlers (deployed separately on Vercel)
├── packages/
│   ├── shared/        — Zod schemas, constants, types (shared FE+BE)
│   └── db/            — Drizzle schema, migrations, seed scripts
├── supabase/          — Supabase configuration
└── .github/           — CI workflows
```

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 10.30.2
- Supabase CLI (for local DB)

### Setup

```bash
# Install dependencies
pnpm install

# Copy env files
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Fill in your Supabase credentials in both .env files
```

### Run Locally

```bash
# Start both web (port 3000) and api (port 3001)
pnpm dev
```

- **Web:** http://localhost:3000
- **API:** http://localhost:3001/public/health

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all apps |
| `pnpm type-check` | TypeScript type checking |

### Testing

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @aksana/shared test
pnpm --filter @aksana/web test
pnpm --filter @aksana/api test
```

Total tests: 57 (22 shared + 4 web + 31 api)

## Architecture

### Public Site Routes

| Route | Content |
|-------|---------|
| `/` | Hero, About, Sambutan carousel, Sudut Sekolah carousel, Birthday popup/card |
| `/guru` | Teacher listing grouped by position, search + modal |
| `/pesdik/:kelas` | Students per class (8 classes), search + modal |
| `/galeri` | Video gallery (Google Drive embeds) |

### Admin Dashboard

All routes under `/dashboard/*` require Google OAuth login + whitelisted email.

| Route | Purpose |
|-------|---------|
| `/dashboard` | Overview stats |
| `/dashboard/students` | CRUD students |
| `/dashboard/teachers` | CRUD teachers |
| `/dashboard/sambutan` | CRUD sambutan |
| `/dashboard/sudut-sekolah` | CRUD sudut sekolah photos |
| `/dashboard/gallery` | CRUD videos |
| `/dashboard/admins` | Admin whitelist management |

## Deployment

- **Web:** `apps/web` deployed to Vercel as `aksana-29-nextjs-web`
- **API:** `apps/api` deployed to Vercel as `aksana-29-nextjs-api`
- **Database:** Supabase (cloud, single project)
- **Storage:** Supabase Storage (image bucket)

Auto-deploy on push to `main` branch.

## Environment Variables

### apps/web

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_API_URL` | API base URL |

### apps/api

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `BOOTSTRAP_ADMIN_EMAIL` | Initial admin email for seed |

## Data Model

6 tables: `students` (279), `teachers` (60), `sambutan` (4), `sudut_sekolah` (47), `videos` (2), `allowed_admins`.

## License

Internal project — MAN Kapuas Angkatan 29.
