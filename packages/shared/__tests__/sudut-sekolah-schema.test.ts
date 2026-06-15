import { describe, it, expect } from 'vitest';
import { SudutSekolahPublicSchema } from '../src/schemas/sudut-sekolah';

describe('SudutSekolahPublicSchema', () => {
  it('omits is_active, created_at, updated_at fields', () => {
    const input = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      image_path: 'images/sudut-sekolah/abc/1080.webp',
      caption: 'Lorong barat lantai 2',
      urutan: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    const result = SudutSekolahPublicSchema.parse(input);
    expect(result).not.toHaveProperty('is_active');
    expect(result).not.toHaveProperty('created_at');
    expect(result).not.toHaveProperty('updated_at');
    expect(result.image_path).toBe('images/sudut-sekolah/abc/1080.webp');
    expect(result.caption).toBe('Lorong barat lantai 2');
    expect(result.urutan).toBe(1);
  });
});
