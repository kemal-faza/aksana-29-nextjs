import { describe, it, expect } from 'vitest';
import { TeacherPublicSchema } from '../src/schemas/teacher';

describe('TeacherPublicSchema', () => {
  it('omits created_at and updated_at fields', () => {
    const input = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      nama: 'Ahmad Mulyadi',
      jabatan: 'Kepala Madrasah',
      mapel: ['Bahasa Indonesia'],
      image_path: 'images/teachers/abc/1080.webp',
      ekstra: 'Pramuka',
      urutan: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    const result = TeacherPublicSchema.parse(input);
    expect(result).not.toHaveProperty('created_at');
    expect(result).not.toHaveProperty('updated_at');
    expect(result.nama).toBe('Ahmad Mulyadi');
    expect(result.jabatan).toBe('Kepala Madrasah');
    expect(result.mapel).toEqual(['Bahasa Indonesia']);
    expect(result.urutan).toBe(1);
  });
});
