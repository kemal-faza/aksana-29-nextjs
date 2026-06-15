import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { db } from '../client';
import { students } from '../schema/students';
import { teachers } from '../schema/teachers';
import { sambutan } from '../schema/sambutan';
import { sudutSekolah } from '../schema/sudut-sekolah';
import { videos } from '../schema/videos';

// --------------- Types ---------------

interface OriginalStudent {
  nama: string;
  kelas: string;
  jabatan?: string;
  image?: string;
  kesan?: string;
  pesan?: string;
  ttl?: string;
  ekstra?: string;
}

interface OriginalTeacher {
  nama: string;
  jabatan?: string;
  mapel?: string | string[];
  image?: string;
  ekstra?: string;
}

interface OriginalSambutan {
  nama: string;
  jabatan: string;
  image?: string;
  image_path?: string;
  isi: string;
  urutan?: number;
}

interface OriginalSudut {
  image?: string;
  image_path?: string;
  caption?: string;
  urutan?: number;
}

interface OriginalVideo {
  judul: string;
  drive_id: string;
  deskripsi?: string;
  urutan?: number;
}

// --------------- Helpers ---------------

function parseTTL(ttl: string | undefined | null): string | null {
  if (!ttl) return null;
  // Original format: "DD-MM-YYYY"
  const parts = ttl.split('-');
  if (
    parts.length === 3 &&
    parts[2].length === 4 &&
    parts[0] !== '00' &&
    parts[1] !== '00' &&
    parts[2] !== '0000'
  ) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  // Try YYYY-MM-DD format
  if (
    parts.length === 3 &&
    parts[0].length === 4 &&
    parts[0] !== '0000'
  ) {
    return ttl;
  }
  // Invalid date
  return null;
}

function normalizeMapel(mapel: string | string[] | undefined | null): string[] {
  if (!mapel) return [];
  if (Array.isArray(mapel)) return mapel.filter(Boolean);
  return [mapel];
}

function loadJSON<T>(filePath: string): T[] {
  if (!existsSync(filePath)) return [];
  const raw = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  if (Array.isArray(data)) return data;
  // Handle { data: [...] } or { records: [...] } wrappers
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.records && Array.isArray(data.records)) return data.records;
  console.warn(`Unexpected JSON structure in ${filePath}, treating as empty`);
  return [];
}

// --------------- Seed Functions ---------------

async function seedStudents(data: OriginalStudent[]) {
  if (data.length === 0) {
    console.log('No students to seed');
    return;
  }

  const mapped = data.map((s) => ({
    nama: s.nama,
    kelas: s.kelas,
    jabatan: s.jabatan || 'Anggota',
    imagePath: s.image || null,
    kesan: s.kesan || null,
    pesan: s.pesan || null,
    ttl: parseTTL(s.ttl),
    ekstra: s.ekstra || null,
  }));

  let inserted = 0;
  for (const item of mapped) {
    try {
      await db.insert(students).values(item).onConflictDoNothing();
      inserted++;
    } catch (err) {
      console.error(`Failed to insert student "${item.nama}":`, err);
    }
  }

  console.log(`Seeded ${inserted}/${mapped.length} students`);
}

async function seedTeachers(data: OriginalTeacher[]) {
  if (data.length === 0) {
    console.log('No teachers to seed');
    return;
  }

  // Validate required fields
  const valid = data.filter(
    (t) => t.nama && t.jabatan,
  );
  const skipped = data.length - valid.length;
  if (skipped > 0) {
    console.warn(`Skipped ${skipped} teachers missing nama or jabatan`);
  }

  const mapped = valid.map((t) => ({
    nama: t.nama,
    jabatan: t.jabatan!,
    mapel: normalizeMapel(t.mapel),
    imagePath: t.image || null,
    ekstra: t.ekstra || null,
  }));

  let inserted = 0;
  for (const item of mapped) {
    try {
      await db.insert(teachers).values(item).onConflictDoNothing();
      inserted++;
    } catch (err) {
      console.error(`Failed to insert teacher "${item.nama}":`, err);
    }
  }

  console.log(`Seeded ${inserted}/${mapped.length} teachers`);
}

async function seedSambutan(data: OriginalSambutan[]) {
  if (data.length === 0) {
    console.log('No sambutan to seed');
    return;
  }

  const mapped = data.map((s) => ({
    nama: s.nama,
    jabatan: s.jabatan,
    imagePath: s.image || s.image_path || null,
    isi: s.isi,
    urutan: s.urutan ?? 1,
    isActive: true,
  }));

  let inserted = 0;
  for (const item of mapped) {
    try {
      await db.insert(sambutan).values(item).onConflictDoNothing();
      inserted++;
    } catch (err) {
      console.error(`Failed to insert sambutan "${item.nama}":`, err);
    }
  }

  console.log(`Seeded ${inserted}/${mapped.length} sambutan`);
}

async function seedSudutSekolah(data: OriginalSudut[]) {
  if (data.length === 0) {
    console.log('No sudut sekolah photos to seed');
    return;
  }

  const mapped = data.map((s, idx) => ({
        imagePath: s.image || s.image_path || null,
        caption: s.caption || null,
        urutan: s.urutan || 1,
        isActive: true,
  }));

  let inserted = 0;
  for (const item of mapped) {
    try {
      await db.insert(sudutSekolah).values(item).onConflictDoNothing();
      inserted++;
    } catch (err) {
      console.error(`Failed to insert sudut sekolah photo:`, err);
    }
  }

  console.log(`Seeded ${inserted}/${mapped.length} sudut sekolah photos`);
}

async function seedVideos(data: OriginalVideo[]) {
  if (data.length === 0) {
    console.log('No videos to seed');
    return;
  }

  const mapped = data.map((v) => ({
    judul: v.judul,
    driveId: v.drive_id,
    deskripsi: v.deskripsi || null,
    urutan: v.urutan ?? 1,
    isActive: true,
  }));

  let inserted = 0;
  for (const item of mapped) {
    try {
      await db.insert(videos).values(item).onConflictDoNothing();
      inserted++;
    } catch (err) {
      console.error(`Failed to insert video "${item.judul}":`, err);
    }
  }

  console.log(`Seeded ${inserted}/${mapped.length} videos`);
}

// --------------- Main ---------------

async function main() {
  const dataDir =
    process.argv[2] ||
    '/mnt/DATA/Documents/Code/buku-tahunan-aksana-29-man-kapuas-tahun-2024/data';

  console.log(`Reading seed data from: ${dataDir}`);
  console.log('');

  // Files expected (only siswa.json and guru.json exist in original project)
  const files: Record<string, (data: any[]) => Promise<void>> = {
    'siswa.json': seedStudents,
    'guru.json': seedTeachers,
    'sambutan.json': seedSambutan,
    'sudut-sekolah.json': seedSudutSekolah,
    'video.json': seedVideos,
  };

  for (const [filename, seedFn] of Object.entries(files)) {
    const filePath = join(dataDir, filename);
    if (existsSync(filePath)) {
      console.log(`[${filename}] Loading...`);
      const data = loadJSON(filePath);
      console.log(`[${filename}] Found ${data.length} records`);
      await seedFn(data);
    } else {
      console.log(`[${filename}] File not found — skipping`);
    }
    console.log('');
  }

  console.log('Seed complete!');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
}).finally(() => process.exit(0));
