# Aksana 29 v5 — Design Document

**Date:** 2026-06-15
**Status:** Draft — pending user review
**Author:** Brainstorming session between user (Muhamad Kemal Faza) and assistant

---

## 1. Overview

### 1.1 Purpose

Project evolusi baru yang menggabungkan:
- **Konten** dari versi original (vanilla HTML/CSS/JS, deployed)
- **UI** dari V3 (Vite+React+Firebase, deployed)
- **Dasbor admin** dari V4 (Next.js+Firebase, incomplete)

Project ini bertujuan untuk:
1. Menggantikan V3 sebagai situs publik buku tahunan digital MAN Kapuas angkatan ke-29
2. Menyediakan dasbor admin untuk komite mengelola konten (guru, siswa, sambutan, sudut sekolah, video)
3. Mempertahankan fitur original yang hilang di V3: birthday popup, sambutan carousel, sudut sekolah carousel
4. Mempermudah handover ke komite berikutnya melalui dokumentasi yang jelas

### 1.2 Goals

- Full CRUD untuk semua entitas (siswa, guru, sambutan, sudut sekolah, video)
- Autentikasi admin via Google OAuth + whitelist
- Gambar dioptimasi otomatis (4 WebP variants) saat upload
- Privasi TTL: hanya backend yang tahu tahun lahir lengkap
- SEO-friendly (SSR/ISR)
- Performance: LCP < 2.5s, CLS < 0.1
- $0/bulan biaya hosting (dengan GitHub Student Pack benefits)
- "Industry standard" architecture: FE/BE terpisah, REST API + OpenAPI, JWT auth

### 1.3 Non-Goals (v1.0)

- Mobile app (web only untuk v1.0)
- Multi-tahun / multi-angkatan (hanya XII 2024)
- Self-service untuk siswa/guru
- Real-time features (chat, push notifications)
- Alumni directory / registration
- Multi-language (i18n) — Indonesian only
- E-commerce / merchandise
- Comments / social features
- Search analytics / recommendations

---

## 2. High-Level Architecture

### 2.1 System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  BROWSER (User)                                             │
│  - Public visitor → reads public site                       │
│  - Admin → login via Google → manage content                │
└──────────────┬───────────────────────────┬──────────────────┘
               │ HTTPS                     │ HTTPS
               │ (page loads)              │ (REST API calls)
               ▼                           ▼
       ┌──────────────────┐        ┌──────────────────────┐
       │  apps/web        │        │  apps/api            │
       │  Next.js 14      │◄──────►│  NestJS (Vercel)     │
       │  (Vercel)        │  REST  │  Serverless          │
       │                  │  /api  │                      │
       │  - Public pages  │        │  - Public endpoints  │
       │  - /dashboard    │        │  - Admin endpoints   │
       │  - Google OAuth  │        │  - Image processing  │
       │    (Supabase)    │        │                      │
       └────────┬─────────┘        └────────┬─────────────┘
                │                              │
                │ (OAuth only)                 │ (service_role)
                ▼                              ▼
       ┌──────────────────────────────────────────────┐
       │  Supabase (single project)                    │
       │  - Auth (Google OAuth provider)               │
       │  - Postgres (data)                            │
       │  - Storage (images, with CDN)                 │
       └──────────────────────────────────────────────┘
```

### 2.2 Monorepo Structure

```
aksana-29/                              <- root (Turborepo + pnpm)
├── apps/
│   ├── web/                           <- Next.js 14
│   │   ├── app/
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx           <- home
│   │   │   │   ├── guru/page.tsx
│   │   │   │   ├── pesdik/[kelas]/page.tsx
│   │   │   │   ├── galeri/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (admin)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── teachers/
│   │   │   │   │   ├── students/
│   │   │   │   │   ├── gallery/
│   │   │   │   │   ├── sudut-sekolah/
│   │   │   │   │   └── admins/
│   │   │   │   └── layout.tsx
│   │   │   └── api/auth/              <- Supabase OAuth callback
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   └── api/                           <- NestJS (Vercel Serverless)
│       ├── app/
│       │   ├── public/
│       │   │   ├── students/
│       │   │   ├── teachers/
│       │   │   ├── sambutan/
│       │   │   ├── sudut-sekolah/
│       │   │   ├── videos/
│       │   │   └── health/
│       │   ├── admin/
│       │   │   ├── students/
│       │   │   ├── teachers/
│       │   │   ├── sambutan/
│       │   │   ├── sudut-sekolah/
│       │   │   ├── videos/
│       │   │   ├── images/
│       │   │   └── admins/
│       │   ├── auth/
│       │   ├── utils/                 <- shared: db, supabase, schemas
│       │   └── main.ts
│       ├── vercel.json
│       └── package.json
├── packages/
│   ├── shared/                        <- shared types & Zod schemas
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── schemas/               <- Student, Teacher, etc.
│   │   │   ├── constants/             <- kelas list, jabatan hierarchy
│   │   │   └── index.ts
│   │   └── package.json
│   └── ui/                            <- shared React components (future)
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── .gitignore
├── .env.example
├── README.md
└── CONTEXT.md
```

### 2.3 Why Monorepo + Split FE/BE

User explicitly requested "scalable + learn industry standard" with separated frontend and backend. Monorepo with apps/web and apps/api provides:

- **Code sharing**: shared Zod schemas dan TypeScript types di `packages/shared` — single source of truth
- **Atomic commits**: FE + BE changes bisa di-commit bareng
- **Single CI**: satu workflow untuk lint, test, type-check
- **Type safety end-to-end**: backend return type otomatis tersedia di frontend

Code is organized as monorepo, tapi **deployment tetap terpisah** (Vercel hosts both as separate projects). Ini berbeda dengan "monolith" yang deploy sebagai satu unit.

---

## 3. Data Model

### 3.1 Database Schema (Postgres / Supabase)

```sql
-- Students (279 rows expected)
CREATE TABLE students (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        TEXT NOT NULL,
  kelas       TEXT NOT NULL,                   -- "XII IPA 1" dst
  jabatan     TEXT,                            -- Ketua/Wakil/Sekretaris/Bendahara/Anggota
  image_path  TEXT,                            -- "images/students/{id}/1080.webp"
  kesan       TEXT,
  pesan       TEXT,
  ttl         DATE,                            -- 2006-08-15, untuk birthday detection
  ekstra      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  UUID REFERENCES allowed_admins(id),
  updated_by  UUID REFERENCES allowed_admins(id)
);
CREATE INDEX idx_students_kelas ON students(kelas);
CREATE INDEX idx_students_ttl_month ON students(EXTRACT(MONTH FROM ttl));

-- Teachers (60 rows expected)
CREATE TABLE teachers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        TEXT NOT NULL,
  jabatan     TEXT NOT NULL,                   -- "Kepala Madrasah", "Wali Kelas XII IPA 1", dll
  mapel       TEXT[],                          -- array: ["Fiqih", "Matematika"]
  image_path  TEXT,
  ekstra      TEXT,
  urutan      INTEGER NOT NULL DEFAULT 0,      -- custom sort order (optional override)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_teachers_jabatan ON teachers(jabatan);

-- Sambutan (4 rows: Parhani, Mulyadi, Jumirah, Paidi)
CREATE TABLE sambutan (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        TEXT NOT NULL,
  jabatan     TEXT NOT NULL,
  image_path  TEXT,
  isi         TEXT NOT NULL,                   -- long text
  urutan      INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sudut Sekolah (49 rows)
CREATE TABLE sudut_sekolah (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_path  TEXT NOT NULL,
  caption     TEXT,
  urutan      INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Videos (2 rows initially: Video Angkatan + After Movie)
CREATE TABLE videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul       TEXT NOT NULL,
  drive_id    TEXT NOT NULL,                   -- Google Drive file ID
  deskripsi   TEXT,
  urutan      INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allowed Admins (whitelist)
CREATE TABLE allowed_admins (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT UNIQUE NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_by       UUID REFERENCES allowed_admins(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deactivated_at   TIMESTAMPTZ,
  deactivated_by   UUID REFERENCES allowed_admins(id)
);
CREATE INDEX idx_allowed_admins_email ON allowed_admins(email) WHERE is_active = true;
```

### 3.2 Schema Decisions

**Soft delete for `allowed_admins` only** (preserves audit trail). Other tables use hard DELETE.

**TTL privacy**: `ttl` field is filtered out from public API responses. Only the `/api/public/students/birthdays` endpoint exposes day+month (formatted Indonesian, e.g., "15 Agustus"), NOT full ISO date.

**Teacher `urutan` is optional override** — primary sort is by `jabatan_priority` (predefined hierarchy in `packages/shared/src/constants/jabatan.ts`), secondary is `urutan`, tertiary is `nama`. Admin does NOT need to manually assign `urutan` for every teacher.

### 3.3 Storage Structure (Supabase Storage)

```
Bucket: public-assets
  - Public read (anyone with URL)
  - Write HANYA via signed URL (issued by backend, expire 5 minutes)
  - Path pattern: images/{entity}/{id}/{variant}.webp
    - entity: students | teachers | sambutan | sudut-sekolah
    - id: UUID dari tabel
    - variant: 320 | 640 | 960 | 1080 | original
```

`image_path` di database selalu menyimpan **canonical path** (1080.webp). Variant lain di-derive di frontend dengan replace `1080` dengan size yang diminta.

### 3.4 Image Variants

```
Original (admin upload, max 5MB, JPG/PNG/WebP)
   ↓ sharp pipeline (server-side processing)
   ├── 320.webp   (~20KB)   — mobile, thumbnail
   ├── 640.webp   (~50KB)   — mobile retina, tablet
   ├── 960.webp   (~90KB)   — desktop small
   └── 1080.webp  (~150KB)  — desktop large (canonical)
```

Total storage estimate for 400 images × 4 variants: **~160MB** (within Supabase 1GB free tier).

---

## 4. API Design

### 4.1 Public Endpoints (no auth)

CORS allowlist: only configured frontend domain(s). Rate-limited at 100 req/min per IP.

| Method | Path | Query | Response |
|--------|------|-------|----------|
| GET | `/api/public/students` | `?kelas=&search=&page=&limit=` | `{ data: StudentPublic[], total, page, limit }` |
| GET | `/api/public/students/:id` | — | `StudentPublic` |
| GET | `/api/public/students/birthdays` | — | `{ today: StudentBirthday[], thisMonth: StudentBirthday[] }` |
| GET | `/api/public/teachers` | `?jabatan=&search=&page=&limit=` | `{ data: Teacher[], total, page, limit }` |
| GET | `/api/public/teachers/:id` | — | `Teacher` |
| GET | `/api/public/sambutan` | — | `Sambutan[]` (active only) |
| GET | `/api/public/sudut-sekolah` | — | `SudutSekolah[]` (active only) |
| GET | `/api/public/videos` | — | `Video[]` (active only) |
| GET | `/api/public/health` | — | `{ status: "ok" }` |

**Schema differences (privacy)**:
- `StudentPublic` = Student MINUS `ttl` field
- `StudentBirthday` = `{ id, nama, kelas, image_path, tanggal }` (only day+month in Indonesian format, e.g., "15 Agustus")
- Full Student schema (with `ttl`) only available in admin endpoints

### 4.2 Auth Endpoints

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/auth/me` | (Bearer JWT) | `{ id, email }` or 403 |

### 4.3 Admin Endpoints (require JWT + whitelist)

Standard REST CRUD pattern for each entity:

| Method | Path | Body |
|--------|------|------|
| POST | `/api/admin/students` | `CreateStudentDto` |
| GET | `/api/admin/students` | (same filters as public) |
| GET | `/api/admin/students/:id` | — |
| PATCH | `/api/admin/students/:id` | `UpdateStudentDto` |
| DELETE | `/api/admin/students/:id` | — |
| *(same pattern for teachers, sambutan, sudut-sekolah, videos)* | | |

Image upload endpoints:

| Method | Path | Body |
|--------|------|------|
| POST | `/api/admin/images/sign-upload` | `{ filename, contentType, size, entityType, entityId? }` |
| POST | `/api/admin/images/process` | `{ path, entityType, entityId }` |

Admin whitelist management:

| Method | Path | Body | Notes |
|--------|------|------|-------|
| GET | `/api/admin/admins` | — | List active admins |
| POST | `/api/admin/admins` | `{ email }` | Add to whitelist |
| DELETE | `/api/admin/admins/:id` | — | Soft delete (`is_active=false`) |

**Last-admin protection**: backend rejects admin removal that would leave 0 active admins (returns 409 Conflict).

**Self-removal protection**: UI disables remove button for own row.

### 4.4 Error Response Format

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    { "path": "nama", "message": "Nama wajib diisi" }
  ],
  "timestamp": "2026-06-15T10:00:00.000Z",
  "path": "/api/admin/students"
}
```

### 4.5 OpenAPI

- Generated automatically from NestJS decorators (`@ApiProperty`, `@ApiResponse`)
- Served at `/api/docs` (Swagger UI)
- Spec also available at `/api/docs.json` for codegen
- All DTOs have Zod schemas in `packages/shared` for runtime validation + TypeScript types

---

## 5. Authentication & Authorization

### 5.1 Flow Diagram

```
[Browser]                          [Next.js]              [Supabase]              [NestJS]
   │                                   │                       │                       │
   │ 1. Klik "Login with Google"       │                       │                       │
   │──────────────────────────────────►│                       │                       │
   │                                   │ 2. signInWithOAuth    │                       │
   │                                   │──────────────────────►│                       │
   │ 3. Redirect ke Google             │                       │                       │
   │◄──────────────────────────────────│                       │                       │
   │ 4. User pilih akun, authorize     │                       │                       │
   │────────────────────────────────────────────────────────────────────► Google OAuth │
   │ 5. Google redirect ke callback    │                       │                       │
   │   /api/auth/callback?code=xxx     │                       │                       │
   │──────────────────────────────────►│                       │                       │
   │                                   │ 6. Exchange code      │                       │
   │                                   │──────────────────────►│                       │
   │                                   │ 7. JWT + refresh      │                       │
   │                                   │◄──────────────────────│                       │
   │                                   │ 8. Set httpOnly cookies                       │
   │                                   │   sb-access-token, sb-refresh-token          │
   │ 9. Redirect ke /dashboard         │                       │                       │
   │◄──────────────────────────────────│                       │                       │
   │ 10. Fetch /api/admin/students     │                       │                       │
   │──────────────────────────────────►│ 11. Server-side fetch │                       │
   │                                   │   Authorization: Bearer JWT                   │
   │                                   │──────────────────────────────────────────────►│
   │                                   │                       │ 12. Verify via JWKS    │
   │                                   │                       │ 13. Check whitelist    │
   │                                   │ 14. Return data       │                       │
   │◄──────────────────────────────────│◄──────────────────────────────────────────────│
```

### 5.2 Key Properties

- **Stateless backend**: backend holds NO session state. JWT verified via Supabase JWKS (cached in memory).
- **HttpOnly cookies**: JWT stored in httpOnly cookies by Next.js, preventing XSS-based token theft.
- **Whitelist check**: 1 DB query per request (`SELECT FROM allowed_admins WHERE email = $1 AND is_active = true`).
- **2 defense layers**: CORS (browser-level) + JWT+whitelist (request-level).
- **No API key for public endpoints**: yearbook is meant to be browsable; rate limiting provides abuse protection.

---

## 6. Image Processing Pipeline

### 6.1 Upload Flow (Async with Signed URL)

```
[Admin Dashboard]                      [NestJS API]                    [Supabase Storage]
      │                                      │                                │
      │ 1. Pilih foto (drag-drop)             │                                │
      │    → preview client-side              │                                │
      │                                      │                                │
      │ 2. POST /api/admin/images/sign-upload │                                │
      │    body: { filename, contentType,     │                                │
      │            size, entityType }         │                                │
      │─────────────────────────────────────►│                                │
      │                                      │ 3. Validate (max 5MB,          │
      │                                      │    jpg/png/webp only)           │
      │                                      │ 4. Generate path:              │
      │                                      │    images/students/{uuid}/      │
      │                                      │    original.jpg                 │
      │                                      │ 5. Create signed upload URL     │
      │                                      │────────────────────────────────►│
      │                                      │                                │
      │ ◄──────────── { uploadUrl, path } ───│                                │
      │                                      │                                │
      │ 6. PUT file langsung ke uploadUrl    │                                │
      │    (bypass backend, hemat bandwidth)  │                                │
      │───────────────────────────────────────────────────────────────────────►│
      │                                      │                                │
      │ 7. POST /api/admin/images/process    │                                │
      │    body: { path, entityType,         │                                │
      │            entityId }                │                                │
      │─────────────────────────────────────►│                                │
      │                                      │ 8. Download original dari     │
      │                                      │    storage                     │
      │                                      │ 9. sharp().resize().webp()    │
      │                                      │    → 320, 640, 960, 1080       │
      │                                      │ 10. Upload 4 variants          │
      │                                      │────────────────────────────────►
      │                                      │                                │
      │ ◄── { canonicalPath: "images/.../1080.webp" } ──                       │
      │                                      │                                │
      │ 11. PATCH /api/admin/students/:id    │                                │
      │     body: { image_path: canonicalPath }                              │
      │─────────────────────────────────────►│                                │
      │                                      │ 12. UPDATE students SET ...    │
      │ ◄──────────── 200 OK ────────────────│                                │
```

### 6.2 Why Async Signed URL (not Sync Multipart)

- **Bandwidth**: backend tidak download file
- **Memory**: backend gak spike RAM saat upload besar
- **Timeout**: gak ada timeout risk di backend (browser→storage direct)
- **Scalability**: backend stateless, bisa scale horizontal

### 6.3 Vercel Serverless 10s Timeout Caveat

Sharp pipeline untuk 1 foto 1-2MB: **~2-4.5 detik**. Aman dalam 10s timeout Vercel Hobby.

**Mitigation for large files**:
- Client-side: batasi upload max 2MB di dashboard
- Client-side: compress image ke max 1920px width sebelum upload (bisa pakai browser canvas)
- Server-side: return 413 (Payload Too Large) jika file > 2MB

### 6.4 Frontend Serving (srcSet)

```ts
// apps/web/src/lib/images.ts
const SUPABASE_STORAGE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

export function getImageUrl(canonicalPath: string, size: 320 | 640 | 960 | 1080 = 1080) {
  return `${SUPABASE_STORAGE}/${canonicalPath.replace('/1080.webp', `/${size}.webp`)}`;
}

export function getImageSrcSet(canonicalPath: string) {
  return [320, 640, 960, 1080]
    .map(size => `${getImageUrl(canonicalPath, size as any)} ${size}w`)
    .join(', ');
}
```

Browser automatically picks the smallest variant that fits the displayed size, based on `srcSet` + `sizes` attribute + viewport + device pixel ratio.

```tsx
<Image
  src={getImageUrl(student.image_path, 1080)}
  srcSet={getImageSrcSet(student.image_path)}
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
  alt={student.nama}
  width={320}
  height={320}
  loading="lazy"
/>
```

---

## 7. Frontend Design

### 7.1 Public Site Routes

| Route | Purpose | Key Components |
|-------|---------|----------------|
| `/` | Home page | Hero, About, BirthdayPopup, BirthdayCard, SambutanCarousel, SudutSekolahCarousel |
| `/guru` | Teacher listing | SearchBar, CategoryGroup[], TeacherModal |
| `/pesdik/:kelas` | Student per class | SearchBar, StudentCardGrid, StudentModal |
| `/galeri` | Video gallery | VideoEmbed (Google Drive iframe) |

### 7.2 Admin Dashboard Routes

| Route | Purpose |
|-------|---------|
| `/login` | Google OAuth trigger (Supabase) |
| `/dashboard` | Overview (total counts, recent activity) |
| `/dashboard/students` | List + filter + add button |
| `/dashboard/students/new` | Create form |
| `/dashboard/students/:id/edit` | Edit form |
| `/dashboard/teachers` | Same pattern |
| `/dashboard/teachers/new` | Create form |
| `/dashboard/teachers/:id/edit` | Edit form |
| `/dashboard/sambutan` | Same pattern |
| `/dashboard/sudut-sekolah` | List + drag-to-reorder |
| `/dashboard/gallery` | Videos CRUD |
| `/dashboard/admins` | Whitelist management |

### 7.3 UI Library

- **shadcn/ui** (config exists in V4) for admin dashboard (typed, customizable)
- **Custom Tailwind components** for public site (matching V3 design)
- **Tailwind theme override** to use V3 colors: `primary: #065f46`, `secondary: #f5f5f5`, `tersier: #E5BA73`, `dark: #171717`
- **Fonts**: Bebas Neue (headings), Inter (body) — loaded via `next/font/google`

---

## 8. Backend Design

### 8.1 NestJS on Vercel Serverless

NestJS app di-adapt jadi Vercel route handlers (App Router style):

```
apps/api/
├── app/
│   ├── public/
│   │   ├── students/
│   │   │   ├── route.ts          # GET /api/public/students, POST /api/admin/students (no, this is public)
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET /api/public/students/:id
│   │   ├── teachers/
│   │   ├── ...
│   ├── admin/
│   │   ├── students/
│   │   │   ├── route.ts          # POST/GET/PATCH/DELETE
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── ...
│   ├── utils/
│   │   ├── db.ts                 # Drizzle client
│   │   ├── supabase.ts           # service_role client
│   │   ├── auth.ts               # JWT verify + whitelist check
│   │   └── schemas.ts            # Zod schemas (imported from @aksana/shared)
│   └── main.ts                   # entry
├── vercel.json
└── package.json
```

Each `route.ts` exports HTTP method handlers (GET, POST, etc.). NestJS modules/decorators still used for: dependency injection, validation pipes, OpenAPI generation.

### 8.2 Image Processing (sharp)

```ts
// apps/api/app/utils/image-processor.ts
import sharp from 'sharp';

const VARIANTS = [320, 640, 960, 1080] as const;

export async function processImage(originalBuffer: Buffer, entityId: string) {
  const results: Record<string, Buffer> = {};
  for (const size of VARIANTS) {
    results[`${size}`] = await sharp(originalBuffer)
      .resize(size, null, { fit: 'inside' })
      .webp({ quality: size === 1080 ? 85 : 80 })
      .toBuffer();
  }
  return results;
}
```

### 8.3 Auth Middleware (Vercel Edge Runtime compatible)

```ts
// apps/api/app/utils/auth.ts
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { supabaseAdmin } from './supabase';

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.SUPABASE_URL}/auth/v1/keys`)
);

export async function verifyAdmin(jwt: string) {
  const { payload } = await jwtVerify(jwt, JWKS, {
    issuer: `${process.env.SUPABASE_URL}/auth/v1`,
    audience: 'authenticated',
  });
  const email = payload.email as string;
  if (!email) throw new Error('No email in JWT');

  const { data: admin } = await supabaseAdmin
    .from('allowed_admins')
    .select('id, email')
    .eq('email', email)
    .eq('is_active', true)
    .single();

  if (!admin) throw new Error('Not whitelisted');
  return admin;
}
```

---

## 9. Deployment

### 9.1 Services

| Service | Tier | Cost | Purpose |
|---------|------|------|---------|
| Vercel | Free (Hobby) | $0/mo | Host apps/web + apps/api |
| Supabase | Free | $0/mo | Postgres + Auth + Storage |
| Namecheap | Free via Student Pack | $0/yr | Domain `aksana-29.me` |
| Sentry | Education via Student Pack | $0/mo | Error tracking |
| 1Password | Free 1yr via Student Pack | $0 | Secrets management |
| GitHub | Free via Student Pack | $0 | Repo + CI + Codespaces |
| **Total** | | **$0/mo** | |

### 9.2 Vercel Configuration

- `apps/web` deployed as Next.js project at `aksana-29.me` (and `www.aksana-29.me`)
- `apps/api` deployed as Vercel Functions at `api.aksana-29.me` (or `aksana-29.me/api/*`)
- Auto-deploy on push to `main` (zero-config GitHub integration)
- Preview deployments per PR (Vercel handles automatically)

### 9.3 Environment Variables

```bash
# apps/web (Vercel env vars)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://api.aksana-29.me

# apps/api (Vercel env vars)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # JANGAN expose ke frontend
BOOTSTRAP_ADMIN_EMAIL=kemal@...    # first admin
```

### 9.4 Cost Reality Check

Vercel Hobby free tier:
- 100GB bandwidth/month (cukup untuk yearbook)
- 1000 image optimization sources/month (kita pakai preprocessed, jadi gak count)
- 10s function timeout
- 100 deployments/day
- Community support

Supabase free tier:
- 500MB Postgres
- 1GB storage
- 5GB bandwidth
- 50,000 MAU
- Daily backup (7-day retention)

---

## 10. Local Development

```
┌─────────────────────────────────────────────────┐
│  Developer Machine (Fedora Linux)               │
│                                                 │
│  pnpm install (di monorepo root)                │
│  pnpm dev (Turborepo parallel)                  │
│    ├── apps/web → http://localhost:3000         │
│    ├── apps/api → http://localhost:3001         │
│    └── packages/shared (auto-rebuilt)           │
│                                                 │
│  Supabase Local (via supabase CLI)              │
│    supabase start                               │
│    → Postgres di localhost:54322                │
│    → Storage di localhost:54321                 │
│                                                 │
│  Migration & Seed                               │
│    pnpm --filter @aksana/db migrate             │
│    pnpm --filter @aksana/db seed:from-original  │
└─────────────────────────────────────────────────┘
```

### 10.1 Tooling

- **pnpm 10.30.2** — package manager
- **Turborepo** — build orchestration, caching
- **Supabase CLI** — local Supabase stack (need to install: `npm i -g supabase`)
- **Drizzle ORM** — TypeScript-first ORM
- **Zod** — runtime validation
- **ESLint + Prettier** — code quality
- **Husky + lint-staged** — pre-commit hooks (optional)
- **Jest + Supertest** — backend tests
- **Vitest + React Testing Library** — frontend tests

### 10.2 Drizzle ORM Rationale

Chosen over Prisma because:
- TypeScript-first end-to-end
- Cold start cepat (penting untuk Vercel Serverless)
- Bundle kecil (gak ngeganggu size limit 250MB)
- SQL-like query builder (good for learning)

---

## 11. Testing Strategy

### 11.1 Backend (NestJS)

| Layer | Tool | Coverage Target | What |
|-------|------|-----------------|------|
| Unit | Jest | 80%+ | Service functions, validators, helpers |
| Integration | Jest + Supertest | 70%+ | Endpoint hit end-to-end (real NestJS app, mock Supabase) |
| E2E smoke | Jest + Supertest | Critical paths | Health, public list, admin CRUD, auth flow |
| Schema | Custom script | All migrations | Migrations apply + rollback cleanly |

### 11.2 Frontend (Next.js)

| Layer | Tool | Coverage Target | What |
|-------|------|-----------------|------|
| Component | Vitest + RTL | 60%+ | Components with logic (search filter, modal, image picker) |
| Page smoke | Playwright (optional) | 5-10 pages | Load home, guru, search, login flow |
| Visual | Playwright screenshots (optional) | — | Compare render vs expected |

### 11.3 Shared (packages/shared)

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Schema validation | Vitest | 100% — Zod schemas tested with valid + invalid inputs |

### 11.4 Test Data

- `packages/db/seed/test-fixtures.ts` — small dataset (5 students, 3 teachers) for tests
- Bigger dataset (280 students, 60 teachers) for manual QA

### 11.5 Test Database

- Local dev: Supabase CLI spins up isolated Postgres
- CI: ephemeral Postgres via Docker service container
- Production: never run tests against prod

---

## 12. CI/CD

### 12.1 GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo lint type-check test
```

### 12.2 Deployment

- Vercel auto-deploys on push to `main` (both web and api)
- Preview deployments per PR (Vercel handles automatically)

---

## 13. MVP Scope (v1.0)

### 13.1 Public Site (in scope)

- [ ] Home (hero + about + birthday popup + section birthday card + sambutan carousel + sudut sekolah carousel)
- [ ] Halaman Guru (7 kategori + search + modal detail)
- [ ] Halaman Pesdik (8 kelas + search + modal detail)
- [ ] Halaman Galeri (2 video Google Drive embed)
- [ ] Footer + Navbar (transparent at home, solid elsewhere)
- [ ] SEO meta (title, description, OG tags)
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Performance: LCP < 2.5s, CLS < 0.1, FID < 100ms

### 13.2 Admin Dashboard (in scope)

- [ ] Login via Google OAuth
- [ ] Dashboard home (overview stats)
- [ ] CRUD Students (list + form + delete)
- [ ] CRUD Teachers (list + form + delete)
- [ ] CRUD Sambutan (list + form + delete)
- [ ] CRUD Sudut Sekolah (list + form + delete + drag-to-reorder)
- [ ] CRUD Videos (list + form + delete)
- [ ] CRUD Admins (list + add + remove whitelist)
- [ ] Image upload via signed URL + auto-processing
- [ ] Auth guard (whitelist check, last-admin protection)
- [ ] Audit trail (created_by, updated_by per record)

### 13.3 Backend API (in scope)

- [ ] All public endpoints (Section 4.1)
- [ ] All admin endpoints (Section 4.3)
- [ ] Auth flow (JWT verify + whitelist check)
- [ ] Image processing pipeline (sharp, 4 variants)
- [ ] Standardized error response
- [ ] OpenAPI spec at `/api/docs`
- [ ] CORS whitelist
- [ ] Rate limiting (basic, 100 req/min per IP)

### 13.4 Infrastructure (in scope)

- [ ] Monorepo setup (pnpm + Turborepo)
- [ ] Supabase project provisioned
- [ ] Vercel projects (web + api)
- [ ] Domain configured (aksana-29.me via Namecheap)
- [ ] Environment variables configured
- [ ] CI: GitHub Actions (lint + type-check + test + build)
- [ ] Seed script (migrate 400 images + data from original)
- [ ] Documentation: README, CONTRIBUTING, env setup

### 13.5 Out of Scope (v1.0)

- Mobile app
- Multi-tahun / multi-angkatan support
- Self-service for non-admin users
- Real-time features (chat, push notifications)
- Alumni directory
- Multi-language (i18n)
- E-commerce / merchandise
- Comments / social features
- Search analytics / recommendations
- Advanced image features (filters, cropping UI)
- Bulk import via CSV
- Export functionality (PDF yearbook, etc.)

---

## 14. Implementation Plan (High-Level)

### Phase 0: Setup (Week 1)
- Init monorepo (pnpm + Turborepo)
- Setup apps/web + apps/api + packages/shared
- Provision Supabase project
- Setup Vercel (web + api)
- CI pipeline green

### Phase 1: Backend + Data (Week 2-3)
- Implement DB schema + migrations (Drizzle)
- Implement public endpoints
- Implement admin endpoints
- Implement image processing pipeline
- Seed from original (280 siswa + 60 guru + 49 sudut + 9 sambutan + 2 video)
- OpenAPI spec validated

### Phase 2: Public Site (Week 3-4)
- Next.js app setup
- Home page (hero + about + birthday)
- Sambutan carousel
- Sudut sekolah carousel
- Guru page
- 8 Pesdik pages
- Galeri page
- SEO meta
- Performance optimization

### Phase 3: Admin Dashboard (Week 5-6)
- Login flow (Supabase Google OAuth)
- Layout + sidebar nav
- CRUD Students + Teachers
- CRUD Sambutan + Sudut Sekolah + Videos
- Image upload UI
- Admin whitelist management

### Phase 4: Hardening (Week 7)
- E2E smoke tests
- Load test
- Security review
- Backup verification
- Monitoring (Sentry)
- Documentation
- Seed audit

### Phase 5: Cutover (Week 8)
- Deploy v5 to production
- Smoke test production
- Update DNS
- Monitor 24h
- V3 archived (read-only, no longer updated)
- V4 (incomplete) deleted or archived

**Total estimate: 6-8 minggu (1.5-2 bulan) untuk 1 orang full-time.**

---

## 15. Open Questions & Resolved Decisions

All 10 open questions from brainstorming session resolved:

| # | Question | Resolution |
|---|----------|------------|
| 1 | Project name | `aksana-29` (drop "v5" internal naming) |
| 2 | Domain | `aksana-29.me` (Namecheap via Student Pack, 1 year free) |
| 3 | Tahun angkatan | Hardcode "ANGKATAN 29" for v1.0 |
| 4 | Sambutan list | Admin CRUD (replace existing + add new) |
| 5 | Video hosting | Tetap Google Drive embed (gak perlu upload ulang) |
| 6 | Analytics | Vercel Analytics (free, native) |
| 7 | Error tracking | Sentry Education (free via Student Pack) |
| 8 | Backup | Supabase daily backup (built-in, 7-day retention) |
| 9 | V4 (incomplete) project | Archive (rename + tarball, bukan hapus) |
| 10 | V3 saat cutover | Matikan setelah V5 stabil 1 minggu |

---

## 16. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Vercel Hobby 10s timeout for image processing | Image upload fails for large files | Client-side compression (max 2MB, 1920px), server returns 413 for larger |
| GitHub Student Pack expires (lulus) | Hosting becomes paid | Project expected to be mostly read-only after graduation; cost will be ~$25/mo if active |
| Vercel vendor lock-in | Hard to migrate | Backend can be re-deployed to Railway/Docker with minimal changes |
| 400 image seed script takes time | Slow first deploy | Run once, cache results; rerun only if data changes |
| Supabase free tier exhaustion | DB/storage full | Monitor usage; upgrade to Pro $25/mo if needed (hasn't happened in V3) |
| TTL data leak | Privacy violation | Strict DTO filtering, public schema omits `ttl` field |
| Last-admin lockout | Admin loses access | Bootstrap email + manual SQL recovery in Supabase dashboard |
| Image processing OOM on Vercel | Serverless function crashes | Limit file size client-side; sharp memory ~100-200MB per image, within 1024MB Vercel limit |

---

## 17. References

- `/mnt/DATA/Documents/Code/buku-tahunan-aksana-29-man-kapuas-tahun-2024/` — Original (vanilla HTML/CSS/JS, source of content)
- `/mnt/DATA/Documents/Code/aksana-29-route-version/` — V3 (Vite+React+Firebase, source of UI)
- `/mnt/DATA/Documents/Code/aksana29-mankapuas/` — V4 (Next.js+Firebase, source of admin dashboard structure)
- `/mnt/DATA/Documents/Code/aksana-29-nextjs/handoff-aksana29-evolution.md` — Evolution mapping handoff
- `CONTEXT.md` — Domain language glossary
- `memory/2026-06-15.md` — Daily notes sesi brainstorming

---

## 18. Approval

- [ ] Reviewed by user (Muhamad Kemal Faza)
- [ ] Approved for implementation planning

**Next step**: invoke `writing-plans` skill to create implementation plan.
