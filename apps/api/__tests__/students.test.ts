import { GET as GET_LIST } from '../app/public/students/route';
import { GET as GET_SINGLE } from '../app/public/students/[id]/route';

const mockData = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    nama: 'Ahmad Fikri',
    kelas: 'XII IPA 1',
    jabatan: 'Ketua Kelas',
    image_path: 'images/students/abc/1080.webp',
    kesan: null,
    pesan: null,
    ttl: '2006-08-15',
    ekstra: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockFilterBuilder = {
  eq: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
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

describe('GET /api/public/students', () => {
  it('returns students list without ttl field', async () => {
    const request = new Request('http://localhost:3001/api/public/students');
    const response = await GET_LIST(request as any);
    const data = await response.json();

    expect(data.data).toHaveLength(1);
    expect(data.data[0]).not.toHaveProperty('ttl');
    expect(data.data[0].nama).toBe('Ahmad Fikri');
    expect(data.total).toBe(1);
  });
});

describe('GET /api/public/students/[id]', () => {
  it('returns a single student without ttl field', async () => {
    const request = new Request('http://localhost:3001/api/public/students/550e8400-e29b-41d4-a716-446655440000');
    const response = await GET_SINGLE(request as any, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(data).not.toHaveProperty('ttl');
    expect(data.nama).toBe('Ahmad Fikri');
    expect(data.kelas).toBe('XII IPA 1');
  });

  it('returns 404 when student not found', async () => {
    mockFilterBuilder.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found', code: 'PGRST116' } });

    const request = new Request('http://localhost:3001/api/public/students/nonexistent');
    const response = await GET_SINGLE(request as any, { params: { id: 'nonexistent' } });
    expect(response.status).toBe(404);
  });
});
