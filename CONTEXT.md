# CONTEXT.md — Aksana 29 v5

Domain language glossary untuk project **Aksana 29 v5** (buku tahunan digital MAN Kapuas angkatan ke-29, tahun 2024). Konten file ini HANYA glossary — tidak ada implementation details, spec, atau status project.

---

## Project & Product

### Aksana 29
Nama project buku tahunan digital untuk siswa kelas XII MAN Kapuas, angkatan ke-29 (tahun ajaran 2023/2024).
_Avoid_: "website angkatan", "buku kenangan", "alumni site" — gunakan "Aksana 29" atau "buku tahunan".

### v5
Internal version identifier untuk iterasi ke-5 (setelah: vanilla HTML → Vite SPA → Vite route version → Next.js incomplete → v5 = current).
_Avoid_: Sebut versi di public-facing docs atau marketing. Untuk user, project ini adalah "Aksana 29" saja.

### Buku Tahunan
Sinonim long-form untuk "Aksana 29". Boleh dipakai di section tentang, footer, atau deskripsi panjang.
_Avoid_: "yearbook" (Inggris) di copy publik — gunakan "buku tahunan" untuk konsistensi dengan audiens.

### Angkatan
Kelompok siswa yang lulus di tahun yang sama. Untuk v5: "Angkatan ke-29" atau "XII 2024".
_Avoid_: "generasi", "alumni" (kecuali untuk alumni yang sudah lulus > 1 tahun).

### MAN Kapuas
Madrasah Aliyah Negeri Kapuas — sekolah. Selalu tulis lengkap di copy publik, boleh disingkat "MAN Kapuas" setelahnya.
_Avoid_: "sekolah" saja, "man kap" (terlalu informal).

---

## Site Architecture

### Situs Publik
Semua halaman yang bisa diakses tanpa login: beranda, guru, pesdik, galeri, sudut sekolah, sambutan.
_Avoid_: "public site" (campur bahasa) di dokumentasi internal — pakai "situs publik".

### Dasbor Admin
Halaman `/dashboard/*` yang membutuhkan Google OAuth + whitelist. Tempat admin mengelola konten.
_Avoid_: "admin panel" (terlalu umum), "CMS" (kecuali konteks teknis), "backend UI" (membingungkan karena backend = API).

### Halaman Beranda
Landing page di `/`. Berisi: hero, about, birthday popup, section ulang tahun, sambutan carousel, sudut sekolah carousel.
_Avoid_: "homepage", "home" (kecuali untuk route `/`).

### Halaman Guru
Halaman `/guru`. Menampilkan daftar guru dikelompokkan per jabatan, dengan search + modal detail.
_Avoid_: "halaman tenaga pendidik" (terlalu formal).

### Halaman Pesdik
Halaman `/pesdik/:kelas`. Menampilkan daftar siswa per kelas (XII IPA 1-4, XII IPS 1-3, XII PAI), dengan search + modal detail.
_Avoid_: "halaman peserta didik" (boleh di copy, tapi URL pakai "pesdik" sesuai original).

### Halaman Galeri
Halaman `/galeri`. Menampilkan video angkatan (Google Drive embed).
_Avoid_: "gallery" (Inggris), "halaman video".

### Sudut Sekolah
49 foto sudut sekolah (kelas, lorong, lapangan, mushola) yang ditampilkan sebagai carousel coverflow di beranda.
_Avoid_: "gallery photos" (membingungkan dengan halaman Galeri), "foto sekolah" (terlalu umum).

### Sambutan
Pesan/ucapan dari pejabat sekolah (4 tokoh: KH. Parhani, Ahmad Mulyadi, Hj. Jumirah, H. Paidi) yang ditampilkan sebagai carousel di beranda.
_Avoid_: "sambutan pejabat" (terlalu panjang), "greeting" (Inggris).

### Popup Ulang Tahun
SweetAlert2 popup yang muncul di beranda jika ada siswa yang berulang tahun hari itu.
_Avoid_: "birthday alert" (Inggris), "notifikasi ulang tahun" (terlalu luas).

### Kartu Ulang Tahun
Section card di beranda yang menampilkan daftar siswa yang akan berulang tahun di bulan ini.
_Avoid_: "birthday card", "upcoming birthdays" (Inggris).

---

## User Roles

### Pengunjung
User yang mengakses situs publik tanpa login. Bisa browse semua halaman, tidak bisa edit.
_Avoid_: "visitor" (Inggris), "user" (terlalu umum).

### Admin
User yang email Google-nya masuk whitelist `allowed_admins`. Bisa login ke dasbor admin dan melakukan CRUD.
_Avoid_: "administrator" (terlalu panjang), "pengelola" (terlalu umum).

### Panitia
Subset dari admin — biasanya anggota kepanitiaan buku tahunan. Sama permissionsnya dengan admin (no role tiers di v5).
_Avoid_: Disebut sebagai role terpisah — di v5 semua admin punya akses yang sama.

---

## Data Entities

### Siswa / Peserta Didik / Pesdik
Siswa angkatan ke-29 yang didokumentasikan (279 records). Schema: `id`, `nama`, `kelas`, `jabatan`, `image_path`, `kesan`, `pesan`, `ttl`, `ekstra`.
_Avoid_: "student" (Inggris) di copy publik.

### Guru
Tenaga pendidik MAN Kapuas (60 records). Schema: `id`, `nama`, `jabatan`, `mapel[]`, `image_path`, `ekstra`, `urutan`.
_Avoid_: "teacher" (Inggris), "tenaga pendidik" (terlalu formal di UI).

### Sambutan
Record ucapan dari pejabat (4 records: Parhani, Mulyadi, Jumirah, Paidi). Schema: `id`, `nama`, `jabatan`, `image_path`, `isi`, `urutan`, `is_active`.
_Avoid_: "greeting" (Inggris).

### Sudut Sekolah
Foto sudut sekolah untuk carousel (49 records). Schema: `id`, `image_path`, `caption`, `urutan`, `is_active`.
_Avoid_: "school photo" (membingungkan dengan foto random), "gallery item".

### Video
Video angkatan/perpisahan dari Google Drive (2 records). Schema: `id`, `judul`, `drive_id`, `deskripsi`, `urutan`, `is_active`.
_Avoid_: "video gallery" (terlalu luas).

### TTL / Tanggal Lahir
Date of birth siswa. Field sensitif — hanya untuk birthday detection, tidak ditampilkan penuh di public API.
_Avoid_: "DOB" (singkatan), "birthday" (kurang presisi — birthday bisa merujuk ke tanggal perayaan saja).

### Jabatan
Posisi/peran: "Ketua Kelas", "Wakil Ketua", "Sekretaris", "Bendahara", "Anggota" (untuk siswa); atau "Kepala Madrasah", "Wakamad", "Wali Kelas", dll (untuk guru).
_Avoid_: "position" (Inggris), "role" (terlalu tech).

### Kelas
Kelas siswa: "XII IPA 1", "XII IPA 2", ..., "XII IPS 1", ..., "XII PAI". Total 8 kelas.
_Avoid_: "class" (Inggris + bentrok dengan OOP), "grade" (terlalu umum).

---

## Auth & Access

### Google OAuth
Authentication mechanism untuk admin. Pakai Supabase Auth dengan Google provider.
_Avoid_: "Google login" (kurang presisi), "Sign in with Google" (terjemahan literal branding Google).

### JWT
JSON Web Token — format token yang dipakai Supabase untuk session. Frontend simpan di httpOnly cookie, kirim ke backend via Authorization header.
_Avoid_: "access token" saja (terlalu umum), "bearer token" (terlalu low-level).

### Whitelist
Daftar email Google yang diizinkan login ke dasbor admin. Disimpan di tabel `allowed_admins` dengan field `is_active`.
_Avoid_: "allowlist" (boleh juga, tapi "whitelist" lebih familiar di konteks Indonesia), "admin list".

### JWKS
JSON Web Key Set — endpoint Supabase untuk verifikasi JWT. Backend pakai untuk verify token tanpa hardcode secret.
_Avoid_: "public keys" (terlalu low-level).

### Last-Admin Protection
Logic yang mencegah admin menghapus admin terakhir (akan tinggal 0 admin). Backend return 409 Conflict.
_Avoid_: "admin protection" (terlalu luas).

---

## Technical (Internal Only)

### Monorepo
Single repository dengan multiple apps (apps/web, apps/api) dan shared packages (packages/shared). Pakai pnpm workspaces + Turborepo.
_Avoid_: Disebut di copy publik — ini purely internal.

### Vercel Serverless
Deployment target untuk apps/api. Backend NestJS di-adapt jadi route handlers (bukan long-running server).
_Avoid_: "AWS Lambda" (teknologi beda), "serverless functions" (terlalu generik — bisa Vercel, AWS, Cloudflare, dll).

### Supabase
BaaS (Backend-as-a-Service) yang dipakai untuk Postgres + Auth + Storage. Single project untuk semua 3 service.
_Avoid_: "Firebase" (project beda), "PostgreSQL" (cuma DB engine, bukan service penuh).

### Drizzle ORM
TypeScript-first ORM untuk Postgres. Dipakai di backend untuk query ke Supabase.
_Avoid_: "Prisma" (project beda), "raw SQL" (terlalu low-level untuk kebanyakan case).

### Sharp
Library Node.js untuk image processing. Dipakai untuk generate 4 WebP variants saat upload.
_Avoid_: "ImageMagick" (CLI, bukan library JS), "canvas" (browser, beda konteks).

### Signed URL
Temporary URL yang diterbitkan backend untuk upload langsung ke Supabase Storage (expire 5 menit).
_Avoid_: "presigned URL" (istilah AWS S3, gak persis sama), "upload token" (terlalu generik).

### WebP Variant
Hasil resize gambar original ke ukuran tertentu (320, 640, 960, 1080) dalam format WebP. Disimpan di storage dengan path pattern `images/{entity}/{id}/{size}.webp`.
_Avoid_: "thumbnail" (terlalu spesifik untuk small size), "responsive image" (konsep lebih luas).

### srcSet
HTML attribute untuk responsive images — browser pilih variant terbaik berdasarkan viewport. Frontend generate otomatis dari canonical path.
_Avoid_: "srcset" (lowercase) di dokumentasi — pakai "srcSet" sesuai camelCase convention.

### OpenAPI
Spesifikasi API dalam format YAML/JSON. Generated otomatis dari NestJS decorators. Diserve di `/api/docs` (Swagger UI).
_Avoid_: "Swagger" (tools), "REST docs" (terlalu generik).

---

## Image Storage Path Convention

```
images/{entity}/{uuid}/{variant}.webp
```

Di mana:
- `entity` = `students` | `teachers` | `sambutan` | `sudut-sekolah`
- `uuid` = UUID v4 dari database row
- `variant` = `320` | `640` | `960` | `1080` (WebP width) atau `original` (file asli)

Database menyimpan `image_path` dalam format canonical (1080.webp). Variant lain di-derive di frontend.

_Avoid_: Simpan full URL di database (gampang break saat domain/storage berubah), simpan filename original (ada karakter aneh), pakai uppercase extension.

---

## File Naming Conventions

- **Kebab-case** untuk file dan folder: `student-card.tsx`, `add-teacher-form.tsx`
- **camelCase** untuk variable, function, dan JSON keys: `imagePath`, `getStudentsByKelas`
- **PascalCase** untuk React component, class, type: `StudentCard`, `StudentsService`
- **SCREAMING_SNAKE_CASE** untuk constants: `JABATAN_PRIORITY`, `MAX_UPLOAD_SIZE`
- **kebab-case** untuk URL paths: `/api/public/students`, `/dashboard/teachers`
- **lowercase** untuk DB table/column names: `students`, `image_path`, `allowed_admins`

---

## Bahasa

- **UI copy**: Bahasa Indonesia (formal, tidak terlalu kaku)
- **Code comments**: Bahasa Indonesia atau Inggris (campur boleh, konsisten per file)
- **Commit messages**: Inggris (standar open source)
- **Database schema**: Inggris (nama tabel, kolom — international standard)
- **Dokumentasi internal**: Campur (English untuk technical, Indonesia untuk product)

---

## Lihat Juga

- `docs/superpowers/specs/2026-06-15-aksana-29-design.md` — Design document lengkap
- `memory/2026-06-15.md` — Daily notes sesi brainstorming
