import { GET as GET_LIST } from '../app/public/teachers/route';
import { GET as GET_SINGLE } from '../app/public/teachers/[id]/route';

const mockData = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    nama: 'Ahmad Mulyadi',
    jabatan: 'Kepala Madrasah',
    mapel: ['Bahasa Indonesia'],
    image_path: 'images/teachers/abc/1080.webp',
    ekstra: 'Pramuka',
    urutan: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockFilterBuilder = {
  eq: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: mockData[0], error: null }),
  then: jest
    .fn()
    .mockImplementation(
      (onFulfilled: (value: unknown) => unknown) =>
        Promise.resolve({ data: mockData, error: null, count: 1 }).then(onFulfilled),
    ),
};

jest.mock('../app/utils/supabase', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      select: jest.fn().mockReturnValue(mockFilterBuilder),
    }),
  }),
}));

describe('GET /api/public/teachers', () => {
  it('returns teachers list without created_at and updated_at', async () => {
    const request = new Request('http://localhost:3001/api/public/teachers');
    const response = await GET_LIST(request as any);
    const data = await response.json();

    expect(data.data).toHaveLength(1);
    expect(data.data[0]).not.toHaveProperty('created_at');
    expect(data.data[0]).not.toHaveProperty('updated_at');
    expect(data.data[0].nama).toBe('Ahmad Mulyadi');
    expect(data.total).toBe(1);
  });
});

describe('GET /api/public/teachers/[id]', () => {
  it('returns a single teacher without created_at and updated_at', async () => {
    const request = new Request(
      'http://localhost:3001/api/public/teachers/550e8400-e29b-41d4-a716-446655440000',
    );
    const response = await GET_SINGLE(request as any, {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });
    const data = await response.json();

    expect(data).not.toHaveProperty('created_at');
    expect(data).not.toHaveProperty('updated_at');
    expect(data.nama).toBe('Ahmad Mulyadi');
    expect(data.jabatan).toBe('Kepala Madrasah');
  });

  it('returns 404 when teacher not found', async () => {
    mockFilterBuilder.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found', code: 'PGRST116' },
    });

    const request = new Request('http://localhost:3001/api/public/teachers/nonexistent');
    const response = await GET_SINGLE(request as any, { params: { id: 'nonexistent' } });
    expect(response.status).toBe(404);
  });
});
