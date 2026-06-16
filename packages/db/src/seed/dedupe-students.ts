/**
 * Dedupe Students Script
 *
 * Removes duplicate rows from the `students` table that resulted from the seed
 * script being run multiple times. For each (nama, kelas) group, keeps the most
 * complete record (highest score) and deletes the rest.
 *
 * Usage:
 *   # Dry-run (default) — print what would happen, do NOT delete
 *   pnpm tsx src/seed/dedupe-students.ts
 *
 *   # Actually delete
 *   pnpm tsx src/seed/dedupe-students.ts --apply
 *
 * Safety:
 *   - Dry-run is the default. Must pass --apply to mutate.
 *   - Before any delete, dumps the affected rows to a timestamped JSON file
 *     in this directory (e.g. `backup-students-2026-06-16T11-50-00.json`).
 *   - Dedup logic itself is in `dedupe.ts` (pure, fully unit-tested).
 *
 * Env (must be set):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_DB_URL   (Postgres connection string for Drizzle)
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { inArray, sql } from 'drizzle-orm';
import { db } from '../client';
import { students } from '../schema/students';
import { buildDeletePlan, scoreRow, type StudentRow } from './dedupe';

const APPLY = process.argv.includes('--apply');

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`ERROR: env var ${name} is not set.`);
    console.error('See script header for required env vars.');
    process.exit(1);
  }
  return value;
}

function toStudentRow(row: typeof students.$inferSelect): StudentRow {
  return {
    id: row.id,
    nama: row.nama,
    kelas: row.kelas,
    imagePath: row.imagePath,
    kesan: row.kesan,
    pesan: row.pesan,
    ttl: row.ttl,
    createdAt: row.createdAt,
  };
}

async function fetchAllStudents(): Promise<StudentRow[]> {
  const rows = await db.select().from(students);
  return rows.map(toStudentRow);
}

function printPlan(plan: ReturnType<typeof buildDeletePlan>) {
  console.log(`\nTotal rows:     ${plan.totalRows}`);
  console.log(`Unique groups:  ${plan.totalGroups}`);
  console.log(`To keep:        ${plan.toKeep.length}`);
  console.log(`To delete:      ${plan.toDelete.length}`);

  if (plan.toDelete.length === 0) {
    console.log('\nNo duplicates found — nothing to do.');
    return;
  }

  // Show a few examples of duplicate groups
  const sample = plan.toDelete.slice(0, 10);
  console.log(`\nSample of rows that would be deleted (first ${sample.length}):`);
  for (const row of sample) {
    const kept = plan.toKeep.find((k) => k.nama === row.nama && k.kelas === row.kelas);
    const keptScore = kept ? scoreRow(kept) : 0;
    console.log(
      `  DEL ${row.id.slice(0, 8)}  ${row.nama} (${row.kelas})  [score=${scoreRow(row)}]` +
        (kept ? `  KEEP ${kept.id.slice(0, 8)}  [score=${keptScore}]` : '')
    );
  }
  if (plan.toDelete.length > sample.length) {
    console.log(`  ... and ${plan.toDelete.length - sample.length} more`);
  }
}

async function run() {
  console.log('Mode:', APPLY ? 'APPLY (will delete)' : 'DRY-RUN (no changes)');
  requireEnv('SUPABASE_DB_URL');
  requireEnv('SUPABASE_URL');
  requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  console.log('\nFetching all student rows...');
  const allRows = await fetchAllStudents();
  console.log(`Fetched ${allRows.length} rows.`);

  console.log('\nBuilding dedup plan...');
  const plan = buildDeletePlan(allRows);

  printPlan(plan);

  if (!APPLY) {
    console.log('\n[DRY-RUN] No changes made. Re-run with --apply to delete duplicates.');
    return;
  }

  if (plan.toDelete.length === 0) {
    console.log('\nNothing to delete.');
    return;
  }

  // 1. Backup affected rows to JSON
  const backupPath = join(__dirname, `backup-students-${timestamp()}.json`);
  const backupData = {
    generatedAt: new Date().toISOString(),
    deletedCount: plan.toDelete.length,
    keptCount: plan.toKeep.length,
    rows: plan.toDelete,
  };
  writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`\nBackup written to: ${backupPath}`);
  console.log(`(Contains ${plan.toDelete.length} rows that will be deleted.)`);

  // 2. Delete in batches to avoid hitting query limits
  const ids = plan.toDelete.map((r) => r.id);
  const BATCH = 200;
  let deleted = 0;

  console.log('\nDeleting duplicates...');
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    const result = await db
      .delete(students)
      .where(inArray(students.id, batch))
      .returning({ id: students.id });
    deleted += result.length;
    process.stdout.write(`  Deleted ${deleted}/${ids.length}\r`);
  }
  console.log('');

  // 3. Verify
  const remaining = await db.execute<{ count: string }>(sql`SELECT COUNT(*) FROM students`);
  const remainingCount = Number(remaining[0]?.count ?? 0);
  console.log(`\nRemaining student rows: ${remainingCount}`);
  console.log(
    remainingCount === plan.toKeep.length
      ? 'OK: count matches expected kept count.'
      : `WARNING: expected ${plan.toKeep.length}, got ${remainingCount}. Investigate before next step.`
  );

  console.log('\nDone.');
}

run().catch((err) => {
  console.error('\nFAILED:', err);
  process.exit(1);
});
