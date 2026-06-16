import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock process.env
vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com');

// Import after stubbing env
const { apiGet } = await import('../lib/api');

describe('apiGet', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = mockFetch;
  });

  it('strips /api prefix from path', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], total: 0 }),
    });

    await apiGet('/api/public/students');

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl.toString()).toBe('https://api.example.com/public/students');
  });

  it('appends query parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], total: 0 }),
    });

    await apiGet('/public/teachers', { limit: '10', search: 'ahmad' });

    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('limit')).toBe('10');
    expect(calledUrl.searchParams.get('search')).toBe('ahmad');
  });

  it('skips empty query parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], total: 0 }),
    });

    await apiGet('/public/students', { kelas: '' });

    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.searchParams.has('kelas')).toBe(false);
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(apiGet('/public/health')).rejects.toThrow('API error: 500');
  });
});
