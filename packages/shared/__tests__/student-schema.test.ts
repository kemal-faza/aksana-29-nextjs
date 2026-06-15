import { describe, it, expect } from 'vitest';
import { StudentPublicSchema, StudentBirthdaySchema } from '../src/schemas/student';

describe('StudentPublicSchema', () => {
  it('omits ttl field', () => {
    const input = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      nama: 'Ahmad Fikri',
      kelas: 'XII IPA 1',
      jabatan: 'Ketua Kelas',
      image_path: 'images/students/abc/1080.webp',
      kesan: 'mantap',
      pesan: 'semoga sukses',
      ttl: '2006-08-15',
      ekstra: 'OSIS',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    const result = StudentPublicSchema.parse(input);
    expect(result).not.toHaveProperty('ttl');
    expect(result.nama).toBe('Ahmad Fikri');
  });
});

describe('StudentBirthdaySchema', () => {
  it('includes only birthday fields with formatted date', () => {
    const result = StudentBirthdaySchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nama: 'Ahmad Fikri',
      kelas: 'XII IPA 1',
      image_path: 'images/students/abc/1080.webp',
      tanggal: '15 Agustus',
    });
    expect(result.tanggal).toBe('15 Agustus');
  });
});
