const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Strip /api prefix because API routes are served at root (/public/*, /admin/*)
function resolvePath(path: string): string {
  return path.replace(/^\/api/, '');
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_URL}${resolvePath(path)}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
