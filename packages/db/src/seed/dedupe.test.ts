import { describe, it, expect } from 'vitest';
import {
  scoreRow,
  pickBest,
  groupByKey,
  buildDeletePlan,
  buildDeletePlanGeneric,
  teacherSpec,
  sambutanSpec,
  type StudentRow,
  type TeacherRow,
  type SambutanRow,
} from './dedupe';

const baseRow: StudentRow = {
  id: 'a',
  nama: 'Ahmad',
  kelas: 'XII IPA 1',
  imagePath: null,
  kesan: null,
  pesan: null,
  ttl: null,
  createdAt: new Date('2026-01-01'),
};

describe('scoreRow', () => {
  it('returns 0 when no optional fields are filled', () => {
    expect(scoreRow(baseRow)).toBe(0);
  });

  it('returns 1 when only imagePath is set', () => {
    expect(scoreRow({ ...baseRow, imagePath: 'images/x.webp' })).toBe(1);
  });

  it('returns 1 when only kesan is set', () => {
    expect(scoreRow({ ...baseRow, kesan: 'Kenangan indah' })).toBe(1);
  });

  it('returns 1 when only pesan is set', () => {
    expect(scoreRow({ ...baseRow, pesan: 'Tetap semangat' })).toBe(1);
  });

  it('returns 1 when only ttl is set', () => {
    expect(scoreRow({ ...baseRow, ttl: '2006-08-15' })).toBe(1);
  });

  it('returns 4 when all optional fields are set', () => {
    expect(
      scoreRow({
        ...baseRow,
        imagePath: 'images/x.webp',
        kesan: 'Kenangan indah',
        pesan: 'Tetap semangat',
        ttl: '2006-08-15',
      })
    ).toBe(4);
  });

  it('treats empty string as not filled (does not count toward score)', () => {
    // Defensive: seed data should never have empty strings, but if it does, don't reward it
    expect(
      scoreRow({
        ...baseRow,
        imagePath: '',
        kesan: '',
        pesan: '',
        ttl: null,
      })
    ).toBe(0);
  });
});

describe('pickBest', () => {
  it('throws on empty input', () => {
    expect(() => pickBest([])).toThrow();
  });

  it('returns the single row when only one is in the group', () => {
    const row = { ...baseRow, id: 'only' };
    expect(pickBest([row])).toBe(row);
  });

  it('picks the row with the highest score', () => {
    const empty = { ...baseRow, id: 'empty', createdAt: new Date('2026-01-01') };
    const partial = {
      ...baseRow,
      id: 'partial',
      imagePath: 'a.webp',
      createdAt: new Date('2026-01-01'),
    };
    const full = {
      ...baseRow,
      id: 'full',
      imagePath: 'a.webp',
      kesan: 'k',
      pesan: 'p',
      ttl: '2006-01-01',
      createdAt: new Date('2026-01-01'),
    };
    expect(pickBest([empty, partial, full])).toBe(full);
  });

  it('tie-breaks on latest createdAt when scores are equal', () => {
    const older = {
      ...baseRow,
      id: 'older',
      imagePath: 'a.webp',
      createdAt: new Date('2026-01-01'),
    };
    const newer = {
      ...baseRow,
      id: 'newer',
      imagePath: 'a.webp',
      createdAt: new Date('2026-02-01'),
    };
    expect(pickBest([older, newer])).toBe(newer);
  });

  it('does not mutate the input array', () => {
    const a = { ...baseRow, id: 'a' };
    const b = { ...baseRow, id: 'b' };
    const input = [a, b];
    pickBest(input);
    expect(input).toEqual([a, b]);
  });
});

describe('groupByKey', () => {
  it('returns empty map for empty input', () => {
    const result = groupByKey([]);
    expect(result.size).toBe(0);
  });

  it('puts rows with same (nama, kelas) in one group', () => {
    const a = { ...baseRow, id: 'a', nama: 'Ahmad', kelas: 'XII IPA 1' };
    const b = { ...baseRow, id: 'b', nama: 'Ahmad', kelas: 'XII IPA 1' };
    const result = groupByKey([a, b]);
    expect(result.size).toBe(1);
    expect(result.get('Ahmad|XII IPA 1')).toEqual([a, b]);
  });

  it('separates rows with different kelas', () => {
    const a = { ...baseRow, id: 'a', nama: 'Ahmad', kelas: 'XII IPA 1' };
    const b = { ...baseRow, id: 'b', nama: 'Ahmad', kelas: 'XII IPA 2' };
    const result = groupByKey([a, b]);
    expect(result.size).toBe(2);
  });

  it('separates rows with different nama (homonyms across classes are NOT duplicates)', () => {
    const a = { ...baseRow, id: 'a', nama: 'Ahmad', kelas: 'XII IPA 1' };
    const b = { ...baseRow, id: 'b', nama: 'Budi', kelas: 'XII IPA 1' };
    const result = groupByKey([a, b]);
    expect(result.size).toBe(2);
  });

  it('produces the expected number of groups for mixed data', () => {
    const rows: StudentRow[] = [
      { ...baseRow, id: '1', nama: 'A', kelas: 'X' },
      { ...baseRow, id: '2', nama: 'A', kelas: 'X' },
      { ...baseRow, id: '3', nama: 'A', kelas: 'X' },
      { ...baseRow, id: '4', nama: 'A', kelas: 'Y' },
      { ...baseRow, id: '5', nama: 'B', kelas: 'X' },
    ];
    const result = groupByKey(rows);
    expect(result.size).toBe(3); // A|X, A|Y, B|X
    expect(result.get('A|X')?.length).toBe(3);
    expect(result.get('A|Y')?.length).toBe(1);
    expect(result.get('B|X')?.length).toBe(1);
  });

  it('treats (nama, kelas) as case-sensitive', () => {
    const a = { ...baseRow, id: 'a', nama: 'Ahmad', kelas: 'XII IPA 1' };
    const b = { ...baseRow, id: 'b', nama: 'ahmad', kelas: 'XII IPA 1' };
    const result = groupByKey([a, b]);
    expect(result.size).toBe(2); // Different groups
  });
});

describe('buildDeletePlan', () => {
  it('returns empty plan for empty input', () => {
    const plan = buildDeletePlan([]);
    expect(plan.toDelete).toEqual([]);
    expect(plan.toKeep).toEqual([]);
    expect(plan.totalGroups).toBe(0);
    expect(plan.totalRows).toBe(0);
  });

  it('keeps every row when there are no duplicates', () => {
    const a = { ...baseRow, id: 'a', nama: 'A', kelas: 'X' };
    const b = { ...baseRow, id: 'b', nama: 'B', kelas: 'X' };
    const c = { ...baseRow, id: 'c', nama: 'A', kelas: 'Y' };
    const plan = buildDeletePlan([a, b, c]);
    expect(plan.toDelete.length).toBe(0);
    expect(plan.toKeep.length).toBe(3);
    expect(plan.totalGroups).toBe(3);
    expect(plan.totalRows).toBe(3);
  });

  it('marks duplicates for deletion, keeps the best from each group', () => {
    const r1 = { ...baseRow, id: '1', nama: 'A', kelas: 'X', createdAt: new Date('2026-01-01') };
    const r2 = {
      ...baseRow,
      id: '2',
      nama: 'A',
      kelas: 'X',
      imagePath: 'pic.webp',
      createdAt: new Date('2026-02-01'),
    };
    const r3 = { ...baseRow, id: '3', nama: 'A', kelas: 'X', createdAt: new Date('2026-03-01') };
    const r4 = { ...baseRow, id: '4', nama: 'B', kelas: 'X', createdAt: new Date('2026-01-01') };
    const plan = buildDeletePlan([r1, r2, r3, r4]);
    expect(plan.toDelete.map((r) => r.id).sort()).toEqual(['1', '3']);
    expect(plan.toKeep.map((r) => r.id).sort()).toEqual(['2', '4']);
    expect(plan.totalGroups).toBe(2);
    expect(plan.totalRows).toBe(4);
  });

  it('handles a realistic seed scenario: 4 duplicates + 1 unique', () => {
    const t = (id: string, createdAt: string) => ({
      ...baseRow,
      id,
      nama: 'Ahmad',
      kelas: 'XII IPA 1',
      imagePath: `images/${id}.webp`,
      createdAt: new Date(createdAt),
    });
    const rows = [t('1', '2026-01-01'), t('2', '2026-01-02'), t('3', '2026-01-03'), t('4', '2026-01-04')];
    const unique = { ...baseRow, id: 'u', nama: 'Budi', kelas: 'XII IPA 1' };
    const plan = buildDeletePlan([...rows, unique]);
    expect(plan.toDelete.length).toBe(3); // 3 of the 4 duplicates deleted
    expect(plan.toKeep.length).toBe(2); // best of the 4 + unique
    expect(plan.toKeep.map((r) => r.id)).toContain('u');
    // Tie-breaks on latest createdAt since all have same score
    expect(plan.toKeep.find((r) => r.nama === 'Ahmad')?.id).toBe('4');
  });

  it('keeps the more-complete row even if it is older', () => {
    const oldEmpty = { ...baseRow, id: 'old', createdAt: new Date('2026-03-01') };
    const newPartial = {
      ...baseRow,
      id: 'new',
      imagePath: 'pic.webp',
      kesan: 'k',
      pesan: 'p',
      ttl: '2006-01-01',
      createdAt: new Date('2026-01-01'),
    };
    const plan = buildDeletePlan([oldEmpty, newPartial]);
    expect(plan.toKeep[0].id).toBe('new');
    expect(plan.toDelete[0].id).toBe('old');
  });
});

// ─── Generic API + entity specs ─────────────────────────────────

const teacherBase: TeacherRow = {
  id: 't1',
  nama: 'Budi Santoso',
  jabatan: 'Guru Matematika',
  imagePath: null,
  ekstra: null,
  mapel: null,
  createdAt: new Date('2026-01-01'),
};

const sambutanBase: SambutanRow = {
  id: 's1',
  nama: 'KH. Parhani',
  jabatan: 'Kepala Madrasah',
  imagePath: null,
  isi: '',
  urutan: 1,
  isActive: true,
  createdAt: new Date('2026-01-01'),
};

describe('buildDeletePlanGeneric (teacher-like)', () => {
  it('dedupes by teacher spec (nama as key, imagePath+ekstra+mapel as score)', () => {
    const r1: TeacherRow = { ...teacherBase, id: 'r1' };
    const r2: TeacherRow = { ...teacherBase, id: 'r2', imagePath: 'pic.webp' }; // score=1
    const r3: TeacherRow = {
      ...teacherBase,
      id: 'r3',
      imagePath: 'pic.webp',
      ekstra: 'Hobi: Membaca',
      mapel: ['Matematika'],
    }; // score=3
    const r4: TeacherRow = { ...teacherBase, id: 'r4', nama: 'Different' };

    const plan = buildDeletePlanGeneric([r1, r2, r3, r4], teacherSpec);
    expect(plan.totalGroups).toBe(2);
    expect(plan.toDelete.length).toBe(2); // r1 and r2 (in same group as r3)
    expect(plan.toKeep.find((r) => r.id === 'r3')).toBeDefined();
    expect(plan.toKeep.find((r) => r.id === 'r4')).toBeDefined();
  });

  it('treats rows with different nama as different groups (no dedup across names)', () => {
    const a: TeacherRow = { ...teacherBase, id: 'a', nama: 'A' };
    const b: TeacherRow = { ...teacherBase, id: 'b', nama: 'B' };
    const plan = buildDeletePlanGeneric([a, b], teacherSpec);
    expect(plan.toDelete).toEqual([]);
    expect(plan.toKeep.length).toBe(2);
  });
});

describe('teacherSpec', () => {
  it('groups by nama only (different jabatan = same person, e.g. promoted)', () => {
    const a: TeacherRow = { ...teacherBase, id: 'a', nama: 'Budi', jabatan: 'Guru' };
    const b: TeacherRow = { ...teacherBase, id: 'b', nama: 'Budi', jabatan: 'Wakamad' };
    // Same key → duplicates
    expect(teacherSpec.getKey(a)).toBe(teacherSpec.getKey(b));
  });

  it('scores 0 for completely empty teacher', () => {
    expect(teacherSpec.getScore(teacherBase)).toBe(0);
  });

  it('scores 1 for imagePath only', () => {
    expect(teacherSpec.getScore({ ...teacherBase, imagePath: 'p' })).toBe(1);
  });

  it('scores 1 for ekstra only', () => {
    expect(teacherSpec.getScore({ ...teacherBase, ekstra: 'k' })).toBe(1);
  });

  it('scores 1 for non-empty mapel array', () => {
    expect(teacherSpec.getScore({ ...teacherBase, mapel: ['Matematika'] })).toBe(1);
  });

  it('scores 0 for empty mapel array', () => {
    expect(teacherSpec.getScore({ ...teacherBase, mapel: [] })).toBe(0);
  });

  it('scores 3 when all three fields are filled', () => {
    expect(
      teacherSpec.getScore({
        ...teacherBase,
        imagePath: 'p',
        ekstra: 'k',
        mapel: ['Matematika'],
      })
    ).toBe(3);
  });
});

describe('sambutanSpec', () => {
  it('groups by nama only (4 unique officials)', () => {
    const a: SambutanRow = { ...sambutanBase, id: 'a', nama: 'A' };
    const b: SambutanRow = { ...sambutanBase, id: 'b', nama: 'A' };
    const c: SambutanRow = { ...sambutanBase, id: 'c', nama: 'B' };
    expect(sambutanSpec.getKey(a)).toBe(sambutanSpec.getKey(b));
    expect(sambutanSpec.getKey(a)).not.toBe(sambutanSpec.getKey(c));
  });

  it('scores 0 when both imagePath and isi are empty', () => {
    expect(sambutanSpec.getScore(sambutanBase)).toBe(0);
  });

  it('scores 1 for imagePath only', () => {
    expect(sambutanSpec.getScore({ ...sambutanBase, imagePath: 'p' })).toBe(1);
  });

  it('scores 1 for isi only (when isi is non-empty string)', () => {
    expect(sambutanSpec.getScore({ ...sambutanBase, isi: 'Selamat...' })).toBe(1);
  });

  it('treats empty string isi as 0 (defensive against empty values)', () => {
    expect(sambutanSpec.getScore({ ...sambutanBase, isi: '' })).toBe(0);
  });

  it('scores 2 when both imagePath and isi are filled', () => {
    expect(
      sambutanSpec.getScore({ ...sambutanBase, imagePath: 'p', isi: 'Selamat...' })
    ).toBe(2);
  });
});
