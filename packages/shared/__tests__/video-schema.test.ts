import { describe, it, expect } from 'vitest';
import { VideoPublicSchema } from '../src/schemas/video';

describe('VideoPublicSchema', () => {
  it('omits is_active, created_at, updated_at', () => {
    const input = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      judul: 'Video Perpisahan',
      drive_id: '1abcXYZ123',
      deskripsi: 'Momen perpisahan angkatan 29',
      urutan: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    const result = VideoPublicSchema.parse(input);
    expect(result).not.toHaveProperty('is_active');
    expect(result).not.toHaveProperty('created_at');
    expect(result).not.toHaveProperty('updated_at');
    expect(result.judul).toBe('Video Perpisahan');
    expect(result.drive_id).toBe('1abcXYZ123');
  });
});
