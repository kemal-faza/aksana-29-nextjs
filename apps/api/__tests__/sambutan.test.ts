import { GET as GET_LIST } from '../app/public/sambutan/route';
import { GET as GET_SINGLE } from '../app/public/sambutan/[id]/route';

const mockData = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    nama: 'KH. Parhani',
    jabatan: 'Kepala Madrasah',
    image_path: 'images/sambutan/abc/1080.webp',
    isi: 'Selamat kepada angkatan ke-29...',
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

describe('GET /api/public/sambutan', () => {
  it('returns sambutan list ordered by urutan', async () => {
    const request = new Request('http://localhost:3001/api/public/sambutan');
    const response = await GET_LIST(request as any);
    const data = await response.json();

    expect(data.data).toHaveLength(1);
    expect(data.data[0]).not.toHaveProperty('is_active');
    expect(data.data[0]).not.toHaveProperty('created_at');
    expect(data.data[0]).not.toHaveProperty('updated_at');
    expect(data.data[0].nama).toBe('KH. Parhani');
    expect(data.total).toBe(1);
  });
});

describe('GET /api/public/sambutan/[id]', () => {
  it('returns a single sambutan without admin fields', async () => {
    const request = new Request('http://localhost:3001/api/public/sambutan/550e8400-e29b-41d4-a716-446655440000');
    const response = await GET_SINGLE(request as any, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(data).not.toHaveProperty('is_active');
    expect(data).not.toHaveProperty('created_at');
    expect(data).not.toHaveProperty('updated_at');
    expect(data.nama).toBe('KH. Parhani');
    expect(data.jabatan).toBe('Kepala Madrasah');
  });

  it('returns 404 when sambutan not found', async () => {
    mockFilterBuilder.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found', code: 'PGRST116' } });

    const request = new Request('http://localhost:3001/api/public/sambutan/nonexistent');
    const response = await GET_SINGLE(request as any, { params: { id: 'nonexistent' } });
    expect(response.status).toBe(404);
  });
});
