import { GET as GET_LIST } from '../app/public/sudut-sekolah/route';
import { GET as GET_SINGLE } from '../app/public/sudut-sekolah/[id]/route';

const mockData = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    image_path: 'images/sudut-sekolah/abc/1080.webp',
    caption: 'Lorong barat lantai 2',
    urutan: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    image_path: 'images/sudut-sekolah/def/1080.webp',
    caption: 'Mushola',
    urutan: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockFilterBuilder = {
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
  single: jest.fn().mockResolvedValue({ data: mockData[0], error: null }),
};

jest.mock('../app/utils/supabase', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      select: jest.fn().mockReturnValue(mockFilterBuilder),
    }),
  }),
}));

describe('GET /api/public/sudut-sekolah', () => {
  it('returns active sudut sekolah list ordered by urutan', async () => {
    const request = new Request('http://localhost:3001/api/public/sudut-sekolah');
    const response = await GET_LIST(request as any);
    const data = await response.json();

    expect(data.data).toHaveLength(2);
    expect(data.data[0]).not.toHaveProperty('is_active');
    expect(data.data[0].caption).toBe('Lorong barat lantai 2');
    expect(data.data[1].caption).toBe('Mushola');
  });
});

describe('GET /api/public/sudut-sekolah/[id]', () => {
  it('returns a single sudut sekolah without is_active field', async () => {
    const request = new Request('http://localhost:3001/api/public/sudut-sekolah/550e8400-e29b-41d4-a716-446655440001');
    const response = await GET_SINGLE(request as any, { params: { id: '550e8400-e29b-41d4-a716-446655440001' } });
    const data = await response.json();

    expect(data).not.toHaveProperty('is_active');
    expect(data).not.toHaveProperty('created_at');
    expect(data).not.toHaveProperty('updated_at');
    expect(data.caption).toBe('Lorong barat lantai 2');
    expect(data.urutan).toBe(1);
  });

  it('returns 404 when sudut sekolah not found', async () => {
    mockFilterBuilder.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found', code: 'PGRST116' } });

    const request = new Request('http://localhost:3001/api/public/sudut-sekolah/nonexistent');
    const response = await GET_SINGLE(request as any, { params: { id: 'nonexistent' } });
    expect(response.status).toBe(404);
  });
});
