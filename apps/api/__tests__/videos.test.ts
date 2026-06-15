import { GET as GET_LIST } from '../app/public/videos/route';
import { GET as GET_SINGLE } from '../app/public/videos/[id]/route';

const mockData = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    judul: 'Video Perpisahan',
    drive_id: '1abcXYZ123',
    deskripsi: 'Momen perpisahan angkatan 29',
    urutan: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockFilterBuilder = {
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({ data: mockData, error: null, count: 1 }),
  single: jest.fn().mockResolvedValue({ data: mockData[0], error: null }),
};

jest.mock('../app/utils/supabase', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      select: jest.fn().mockReturnValue(mockFilterBuilder),
    }),
  }),
}));

describe('GET /api/public/videos', () => {
  it('returns videos list ordered by urutan', async () => {
    const request = new Request('http://localhost:3001/api/public/videos');
    const response = await GET_LIST(request as any);
    const data = await response.json();

    expect(data.data).toHaveLength(1);
    expect(data.data[0].judul).toBe('Video Perpisahan');
    expect(data.data[0].drive_id).toBe('1abcXYZ123');
    expect(data.data[0].urutan).toBe(1);
  });

  it('omits is_active, created_at, updated_at from response', async () => {
    const request = new Request('http://localhost:3001/api/public/videos');
    const response = await GET_LIST(request as any);
    const data = await response.json();

    expect(data.data[0]).not.toHaveProperty('is_active');
    expect(data.data[0]).not.toHaveProperty('created_at');
    expect(data.data[0]).not.toHaveProperty('updated_at');
  });
});

describe('GET /api/public/videos/[id]', () => {
  it('returns a single video', async () => {
    const request = new Request('http://localhost:3001/api/public/videos/550e8400-e29b-41d4-a716-446655440000');
    const response = await GET_SINGLE(request as any, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(data.judul).toBe('Video Perpisahan');
    expect(data.drive_id).toBe('1abcXYZ123');
  });

  it('returns 404 when video not found', async () => {
    mockFilterBuilder.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found', code: 'PGRST116' } });

    const request = new Request('http://localhost:3001/api/public/videos/nonexistent');
    const response = await GET_SINGLE(request as any, { params: { id: 'nonexistent' } });
    expect(response.status).toBe(404);
  });
});
