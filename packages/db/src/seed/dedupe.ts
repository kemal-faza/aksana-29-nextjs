/**
 * Pure dedup logic — generic over row type via DedupSpec.
 *
 * Strategy: "most complete wins"
 *   When multiple rows share the same key (per spec), keep the one with the
 *   highest score (per spec). Tie-break on latest `getCreatedAt()`. Rationale:
 *   preserves any manual edits a user made to the most-complete record, and
 *   falls back to "newest insert" when both are equally complete.
 *
 * Files structure:
 *   - Generic API: `buildDeletePlanGeneric`, `pickBestGeneric`, `groupByKeyGeneric`
 *   - Student-specific wrappers: `scoreRow`, `pickBest`, `groupByKey`, `buildDeletePlan`
 *     (kept for backward compat with the original 23 tests)
 *   - Entity specs: `studentSpec`, `teacherSpec`, `sambutanSpec`
 *   - Row types: `StudentRow`, `TeacherRow`, `SambutanRow`
 *
 * No DB calls here — keep this file side-effect-free so it's fully testable.
 * The orchestration scripts (dedupe-*.ts) handle DB I/O and CLI flags.
 */

// ─── Helpers ──────────────────────────────────────────────

/** Returns true if the field counts as "filled" for scoring purposes. */
export function isFilled(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

// ─── Student-specific row + spec ──────────────────────────

/** Minimal row shape needed for student dedup decisions. */
export interface StudentRow {
  id: string;
  nama: string;
  kelas: string;
  imagePath: string | null;
  kesan: string | null;
  pesan: string | null;
  ttl: string | null; // ISO date string, e.g. "2006-08-15"
  createdAt: Date;
}

/**
 * Score a student's completeness. Higher = more complete.
 * Each of imagePath, kesan, pesan, ttl is worth 1 point. Max = 4.
 */
export function scoreRow(row: StudentRow): number {
  let score = 0;
  if (isFilled(row.imagePath)) score++;
  if (isFilled(row.kesan)) score++;
  if (isFilled(row.pesan)) score++;
  if (isFilled(row.ttl)) score++;
  return score;
}

export const studentSpec: DedupSpec<StudentRow> = {
  getKey: (r) => `${r.nama}|${r.kelas}`,
  getScore: scoreRow,
  getCreatedAt: (r) => r.createdAt,
};

// ─── Teacher-specific row + spec ──────────────────────────

export interface TeacherRow {
  id: string;
  nama: string;
  jabatan: string;
  imagePath: string | null;
  ekstra: string | null;
  /** Subject(s) taught. Array can be null or empty. */
  mapel: string[] | null;
  createdAt: Date;
}

/**
 * Score a teacher's completeness. Max = 3.
 * - imagePath: 1pt
 * - ekstra: 1pt
 * - mapel non-empty: 1pt
 *
 * Group key: `nama` only. If same person was promoted (jabatan changed) and
 * re-seeded, they would still be treated as duplicates. To prevent losing
 * any promotion metadata, the kept row's `jabatan` will be the most-recently
 * inserted one (since we tie-break on createdAt).
 */
export const teacherSpec: DedupSpec<TeacherRow> = {
  getKey: (r) => r.nama,
  getScore: (r) => {
    let score = 0;
    if (isFilled(r.imagePath)) score++;
    if (isFilled(r.ekstra)) score++;
    if (r.mapel !== null && r.mapel.length > 0) score++;
    return score;
  },
  getCreatedAt: (r) => r.createdAt,
};

// ─── Sambutan-specific row + spec ─────────────────────────

export interface SambutanRow {
  id: string;
  nama: string;
  jabatan: string;
  imagePath: string | null;
  /** Message body. Required (NOT NULL) but could be empty string. */
  isi: string;
  urutan: number;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Score a sambutan's completeness. Max = 2.
 * - imagePath: 1pt
 * - isi (non-empty): 1pt
 *
 * Group key: `nama` only. Sambutan table has only 4 unique officials in
 * production, so name-based dedup is safe.
 */
export const sambutanSpec: DedupSpec<SambutanRow> = {
  getKey: (r) => r.nama,
  getScore: (r) => {
    let score = 0;
    if (isFilled(r.imagePath)) score++;
    if (isFilled(r.isi)) score++;
    return score;
  },
  getCreatedAt: (r) => r.createdAt,
};

// ─── Generic API ──────────────────────────────────────────

/**
 * Spec describing how to dedup a particular entity. T is the row type.
 * - `getKey`: rows with the same key are considered duplicates
 * - `getScore`: higher score = more complete = preferred to keep
 * - `getCreatedAt`: tie-breaker (latest wins)
 */
export interface DedupSpec<T> {
  getKey: (row: T) => string;
  getScore: (row: T) => number;
  getCreatedAt: (row: T) => Date;
}

/** Result of `buildDeletePlan*` — what to keep, what to delete, summary stats. */
export interface DeletePlan<T = StudentRow> {
  toKeep: T[];
  toDelete: T[];
  totalGroups: number;
  totalRows: number;
}

/**
 * Group rows by their spec key. Two rows are "duplicates" iff they produce
 * the same key. Does not mutate the input.
 */
export function groupByKeyGeneric<T>(rows: T[], getKey: (row: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const k = getKey(row);
    const existing = groups.get(k);
    if (existing) {
      existing.push(row);
    } else {
      groups.set(k, [row]);
    }
  }
  return groups;
}

/**
 * Pick the best row from a group of duplicates using the spec.
 * Throws on empty input.
 */
export function pickBestGeneric<T>(rows: T[], spec: DedupSpec<T>): T {
  if (rows.length === 0) {
    throw new Error('pickBestGeneric: cannot pick from empty group');
  }
  if (rows.length === 1) return rows[0];

  let best = rows[0];
  for (let i = 1; i < rows.length; i++) {
    const candidate = rows[i];
    const candidateScore = spec.getScore(candidate);
    const bestScore = spec.getScore(best);
    if (
      candidateScore > bestScore ||
      (candidateScore === bestScore && spec.getCreatedAt(candidate) > spec.getCreatedAt(best))
    ) {
      best = candidate;
    }
  }
  return best;
}

/**
 * Build a complete dedup plan from all input rows using the spec.
 *
 * For each key group:
 *   - Pick the best row (per `pickBestGeneric`) → goes to `toKeep`
 *   - All others in the group → go to `toDelete`
 */
export function buildDeletePlanGeneric<T>(rows: T[], spec: DedupSpec<T>): DeletePlan<T> {
  const groups = groupByKeyGeneric(rows, spec.getKey);
  const toKeep: T[] = [];
  const toDelete: T[] = [];

  for (const groupRows of groups.values()) {
    const best = pickBestGeneric(groupRows, spec);
    toKeep.push(best);
    for (const row of groupRows) {
      if (row !== best) {
        toDelete.push(row);
      }
    }
  }

  return {
    toKeep,
    toDelete,
    totalGroups: groups.size,
    totalRows: rows.length,
  };
}

// ─── Student-specific wrappers (backward compat) ─────────

/** @deprecated Use `studentSpec` + `groupByKeyGeneric` instead. */
export function groupByKey(rows: StudentRow[]): Map<string, StudentRow[]> {
  return groupByKeyGeneric(rows, studentSpec.getKey);
}

/** @deprecated Use `studentSpec` + `pickBestGeneric` instead. */
export function pickBest(rows: StudentRow[]): StudentRow {
  return pickBestGeneric(rows, studentSpec);
}

/** @deprecated Use `studentSpec` + `buildDeletePlanGeneric` instead. */
export function buildDeletePlan(rows: StudentRow[]): DeletePlan<StudentRow> {
  return buildDeletePlanGeneric(rows, studentSpec);
}
