/**
 * Image Migration Script
 *
 * Migrates images from the original project to Supabase Storage.
 * For each entity record with an image:
 *   1. Reads the original file from disk
 *   2. Processes with Sharp into 4 WebP variants (320, 640, 960, 1080)
 *   3. Uploads to Supabase Storage at images/{entity}/{uuid}/{variant}.webp
 *   4. Updates the DB record's image_path to canonical path
 *
 * Usage:
 *   export SUPABASE_URL=...
 *   export SUPABASE_SERVICE_ROLE_KEY=...
 *   export SUPABASE_DB_URL=...
 *   pnpm tsx src/seed/migrate-images.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { db } from '../client';
import { students } from '../schema/students';
import { teachers } from '../schema/teachers';
import { sambutan } from '../schema/sambutan';
import { sudutSekolah } from '../schema/sudut-sekolah';
import { sql } from 'drizzle-orm';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const ORIGINAL_PROJECT_DIR =
  process.env.ORIGINAL_PROJECT_DIR ||
  '/mnt/DATA/Documents/Code/buku-tahunan-aksana-29-man-kapuas-tahun-2024';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = 'images';

const SIZES = [320, 640, 960, 1080] as const;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─── Helpers ────────────────────────────────────────

function resolveStudentDiskPath(dbPath: string | null): string | null {
  if (!dbPath) return null;
  const p = join(ORIGINAL_PROJECT_DIR, 'img', 'pesdik', dbPath);
  return existsSync(p) ? p : null;
}

function resolveTeacherDiskPath(dbPath: string | null): string | null {
  if (!dbPath) return null;
  const p = join(ORIGINAL_PROJECT_DIR, 'img', 'guru', dbPath);
  return existsSync(p) ? p : null;
}

function resolveSudutDiskPath(dbPath: string | null): string | null {
  if (!dbPath) return null;
  const p = join(ORIGINAL_PROJECT_DIR, dbPath);
  return existsSync(p) ? p : null;
}

const SAMBUTAN_MAP: Record<string, string> = {
  'KH. Parhani': join(ORIGINAL_PROJECT_DIR, 'img', 'homepage', 'sambutan', 'Guru Parhani.JPG'),
};

// ─── Core Pipeline ──────────────────────────────────

async function uploadVariants(
  entity: string,
  recordId: string,
  diskPath: string,
): Promise<string | null> {
  console.log(`  -> ${basename(diskPath)}`);

  let buffer: Buffer;
  try {
    buffer = readFileSync(diskPath);
  } catch {
    console.error('  FAILED: cannot read file');
    return null;
  }

  if (buffer.length > 5 * 1024 * 1024) {
    console.warn(`  SKIP: file too large (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);
    return null;
  }

  for (const size of SIZES) {
    const dest = `images/${entity}/${recordId}/${size}.webp`;
    try {
      const webp = await sharp(buffer)
        .resize(size, undefined, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(dest, webp, { contentType: 'image/webp', upsert: true });

      if (error) {
        console.error(`  FAILED: upload ${size}.webp — ${error.message}`);
        return null;
      }
    } catch (err) {
      console.error(`  FAILED: process ${size}.webp —`, err);
      return null;
    }
  }

  const canonical = `images/${entity}/${recordId}/1080.webp`;
  console.log(`  OK: 320, 640, 960, 1080.webp`);
  return canonical;
}

// ─── Entity Migrators ───────────────────────────────

async function migrateStudents() {
  console.log('\n=== STUDENTS ===');
  const rows = await db.select({ id: students.id, imagePath: students.imagePath })
    .from(students)
    .where(sql`image_path IS NOT NULL AND image_path != ''`);
  console.log(`Records with image_path: ${rows.length}`);

  let ok = 0, fail = 0;
  for (const row of rows) {
    const diskPath = resolveStudentDiskPath(row.imagePath);
    if (!diskPath) { fail++; continue; }
    const canonical = await uploadVariants('students', row.id, diskPath);
    if (!canonical) { fail++; continue; }
    await db.update(students)
      .set({ imagePath: canonical } as any)
      .where(sql`id = ${row.id}`);
    ok++;
  }
  console.log(`Done: ${ok} migrated, ${fail} skipped/failed`);
}

async function migrateTeachers() {
  console.log('\n=== TEACHERS ===');
  const rows = await db.select({ id: teachers.id, imagePath: teachers.imagePath })
    .from(teachers)
    .where(sql`image_path IS NOT NULL AND image_path != ''`);
  console.log(`Records with image_path: ${rows.length}`);

  let ok = 0, fail = 0;
  for (const row of rows) {
    const diskPath = resolveTeacherDiskPath(row.imagePath);
    if (!diskPath) { fail++; continue; }
    const canonical = await uploadVariants('teachers', row.id, diskPath);
    if (!canonical) { fail++; continue; }
    await db.update(teachers)
      .set({ imagePath: canonical } as any)
      .where(sql`id = ${row.id}`);
    ok++;
  }
  console.log(`Done: ${ok} migrated, ${fail} skipped/failed`);
}

async function migrateSambutan() {
  console.log('\n=== SAMBUTAN ===');
  const rows = await db.select({ id: sambutan.id, nama: sambutan.nama }).from(sambutan);
  console.log(`Total records: ${rows.length}`);

  let ok = 0;
  for (const row of rows) {
    const diskPath = SAMBUTAN_MAP[row.nama];
    if (!diskPath) { console.log(`  ${row.nama}: no photo mapped`); continue; }
    console.log(`  ${row.nama}`);
    const canonical = await uploadVariants('sambutan', row.id, diskPath);
    if (!canonical) continue;
    await db.update(sambutan)
      .set({ imagePath: canonical } as any)
      .where(sql`id = ${row.id}`);
    ok++;
  }
  console.log(`Done: ${ok} migrated`);
}

async function migrateSudutSekolah() {
  console.log('\n=== SUDUT_SEKOLAH ===');
  const rows = await db.select({ id: sudutSekolah.id, imagePath: sudutSekolah.imagePath })
    .from(sudutSekolah)
    .where(sql`image_path IS NOT NULL AND image_path != ''`);
  console.log(`Records with image_path: ${rows.length}`);

  let ok = 0, fail = 0;
  for (const row of rows) {
    const diskPath = resolveSudutDiskPath(row.imagePath);
    if (!diskPath) { fail++; continue; }
    const canonical = await uploadVariants('sudut-sekolah', row.id, diskPath);
    if (!canonical) { fail++; continue; }
    await db.update(sudutSekolah)
      .set({ imagePath: canonical } as any)
      .where(sql`id = ${row.id}`);
    ok++;
  }
  console.log(`Done: ${ok} migrated, ${fail} skipped/failed`);
}

// ─── Main ───────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('Image Migration Script');
  console.log(`Original project: ${ORIGINAL_PROJECT_DIR}`);
  console.log(`Supabase bucket: ${BUCKET}`);
  console.log('');

  const start = Date.now();

  await migrateStudents();
  await migrateTeachers();
  await migrateSambutan();
  await migrateSudutSekolah();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nTotal time: ${elapsed}s`);
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
