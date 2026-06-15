import { describe, it, expect } from 'vitest';
import { KELAS_LIST, KELAS_REGEX } from '../src/constants/kelas';
import { JABATAN_PRIORITY, JABATAN_LIST, JABATAN_SISWA } from '../src/constants/jabatan';
import { IMAGE_VARIANTS, CANONICAL_VARIANT } from '../src/constants/image-variants';

describe('KELAS_LIST', () => {
  it('should have exactly 8 classes', () => {
    expect(KELAS_LIST).toHaveLength(8);
  });

  it.each([
    'XII IPA 1',
    'XII IPA 2',
    'XII IPA 3',
    'XII IPA 4',
    'XII IPS 1',
    'XII IPS 2',
    'XII IPS 3',
    'XII PAI',
  ])('should include %s', (kelas) => {
    expect(KELAS_LIST).toContain(kelas);
  });
});

describe('KELAS_REGEX', () => {
  it('should match valid class names', () => {
    const valid = ['XII IPA 1', 'XII IPS 3', 'XII PAI'];
    for (const v of valid) {
      expect(KELAS_REGEX.test(v)).toBe(true);
    }
  });

  it('should reject invalid class names', () => {
    const invalid = ['XI IPA 1', 'XII IPA', 'IPA 1', ''];
    for (const v of invalid) {
      expect(KELAS_REGEX.test(v)).toBe(false);
    }
  });
});

describe('JABATAN_PRIORITY', () => {
  it('should have Kepala Madrasah as priority 1', () => {
    const entry = JABATAN_PRIORITY.find(([, priority]) => priority === 1);
    expect(entry?.[0]).toBe('Kepala Madrasah');
  });

  it('should have priorities in ascending order', () => {
    for (let i = 1; i < JABATAN_PRIORITY.length; i++) {
      expect(JABATAN_PRIORITY[i][1]).toBeGreaterThan(JABATAN_PRIORITY[i - 1][1]);
    }
  });
});

describe('JABATAN_LIST', () => {
  it('should contain all jabatan from JABATAN_PRIORITY', () => {
    const fromPriority = JABATAN_PRIORITY.map(([j]) => j);
    expect(JABATAN_LIST.sort()).toEqual(fromPriority.sort());
  });
});

describe('IMAGE_VARIANTS', () => {
  it('should equal [320, 640, 960, 1080]', () => {
    expect(IMAGE_VARIANTS).toEqual([320, 640, 960, 1080]);
  });

  it('should have CANONICAL_VARIANT as 1080', () => {
    expect(CANONICAL_VARIANT).toBe(1080);
  });
});
