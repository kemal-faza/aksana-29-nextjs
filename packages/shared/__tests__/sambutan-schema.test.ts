import { describe, it, expect } from 'vitest';
import { SambutanPublicSchema } from '../src/schemas/sambutan';

describe('SambutanPublicSchema', () => {
  it('omits is_active, created_at, updated_at fields', () => {
    const input = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      nama: 'KH. Parhani',
      jabatan: 'Kepala Madrasah',
      image_path: 'images/sambutan/abc/1080.webp',
      isi: 'Selamat kepada angkatan ke-29...',
      urutan: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    const result = SambutanPublicSchema.parse(input);
    expect(result).not.toHaveProperty('is_active');
    expect(result).not.toHaveProperty('created_at');
    expect(result).not.toHaveProperty('updated_at');
    expect(result.nama).toBe('KH. Parhani');
    expect(result.jabatan).toBe('Kepala Madrasah');
    expect(result.isi).toBe('Selamat kepada angkatan ke-29...');
    expect(result.urutan).toBe(1);
  });
});
