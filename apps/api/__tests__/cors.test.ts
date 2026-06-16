import { applyCors, handlePreflight, parseAllowedOrigins } from '../app/utils/cors';

describe('parseAllowedOrigins', () => {
  it('parses comma-separated origins into a list', () => {
    expect(parseAllowedOrigins('https://a.com,https://b.com')).toEqual([
      'https://a.com',
      'https://b.com',
    ]);
  });

  it('trims whitespace around each origin', () => {
    expect(parseAllowedOrigins('  https://a.com  ,  https://b.com  ')).toEqual([
      'https://a.com',
      'https://b.com',
    ]);
  });

  it('filters out empty entries', () => {
    expect(parseAllowedOrigins('https://a.com,,https://b.com,')).toEqual([
      'https://a.com',
      'https://b.com',
    ]);
  });

  it('returns empty list for empty/undefined input', () => {
    expect(parseAllowedOrigins('')).toEqual([]);
    expect(parseAllowedOrigins(undefined)).toEqual([]);
  });
});

describe('applyCors', () => {
  const allowedOrigins = [
    'https://aksana-29-nextjs-web.vercel.app',
    'http://localhost:3000',
  ];

  function makeRequest(origin: string | null, method = 'GET') {
    const headers: Record<string, string> = {};
    if (origin !== null) headers['origin'] = origin;
    return new Request('http://localhost:3001/admin/students', {
      method,
      headers,
    });
  }

  it('sets CORS headers for an allowed origin', () => {
    const req = makeRequest('https://aksana-29-nextjs-web.vercel.app');
    const res = new Response('ok', { status: 200 });
    const out = applyCors(req, res, allowedOrigins);
    expect(out.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://aksana-29-nextjs-web.vercel.app'
    );
    expect(out.headers.get('Access-Control-Allow-Credentials')).toBe('true');
  });

  it('does NOT set Access-Control-Allow-Origin for a disallowed origin', () => {
    const req = makeRequest('https://evil.com');
    const res = new Response('ok', { status: 200 });
    const out = applyCors(req, res, allowedOrigins);
    expect(out.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('does NOT set Access-Control-Allow-Origin when no Origin header is present', () => {
    const req = makeRequest(null);
    const res = new Response('ok', { status: 200 });
    const out = applyCors(req, res, allowedOrigins);
    expect(out.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('sets vary: Origin for allowed origin responses', () => {
    const req = makeRequest('https://aksana-29-nextjs-web.vercel.app');
    const res = new Response('ok', { status: 200 });
    const out = applyCors(req, res, allowedOrigins);
    // Should include "Origin" in the Vary header
    expect(out.headers.get('Vary')).toContain('Origin');
  });

  it('matches *.vercel.app wildcard subdomains', () => {
    const origins = ['*.vercel.app'];
    const req = makeRequest('https://aksana-29-nextjs-web-git-feature.vercel.app');
    const res = new Response('ok', { status: 200 });
    const out = applyCors(req, res, origins);
    expect(out.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://aksana-29-nextjs-web-git-feature.vercel.app'
    );
  });

  it('does NOT match vercel.app wildcard for non-vercel.app domains', () => {
    const origins = ['*.vercel.app'];
    const req = makeRequest('https://evil.com');
    const res = new Response('ok', { status: 200 });
    const out = applyCors(req, res, origins);
    expect(out.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});

describe('handlePreflight', () => {
  const allowedOrigins = [
    'https://aksana-29-nextjs-web.vercel.app',
    'http://localhost:3000',
  ];

  function makePreflight(origin: string, method = 'GET', headers = 'authorization,content-type') {
    return new Request('http://localhost:3001/admin/students', {
      method: 'OPTIONS',
      headers: {
        origin,
        'access-control-request-method': method,
        'access-control-request-headers': headers,
      },
    });
  }

  it('returns 204 for an allowed origin', () => {
    const req = makePreflight('https://aksana-29-nextjs-web.vercel.app');
    const res = handlePreflight(req, allowedOrigins);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(204);
  });

  it('returns 204 with proper CORS headers for preflight', () => {
    const req = makePreflight(
      'https://aksana-29-nextjs-web.vercel.app',
      'POST',
      'authorization,content-type'
    );
    const res = handlePreflight(req, allowedOrigins)!;
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://aksana-29-nextjs-web.vercel.app'
    );
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('DELETE');
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('PATCH');
    expect(res.headers.get('Access-Control-Allow-Headers')).toContain('authorization');
    expect(res.headers.get('Access-Control-Allow-Headers')).toContain('content-type');
    expect(res.headers.get('Access-Control-Max-Age')).toBe('86400');
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
  });

  it('returns 403 for a disallowed origin (so browser blocks the preflight)', () => {
    const req = makePreflight('https://evil.com');
    const res = handlePreflight(req, allowedOrigins);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it('returns null for non-OPTIONS requests (so they pass through to handlers)', () => {
    const req = new Request('http://localhost:3001/admin/students', { method: 'GET' });
    const res = handlePreflight(req, allowedOrigins);
    expect(res).toBeNull();
  });
});
