const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Strip /api prefix because API routes are served at root (/admin/*)
function resolvePath(path: string): string {
  return path.replace(/^\/api/, '');
}

async function getAccessToken(): Promise<string | null> {
  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch {
    return null;
  }
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();
  const url = `${API_URL}${resolvePath(path)}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }

  return res.json();
}

export async function adminGet<T>(path: string): Promise<T> {
  return adminFetch<T>(path);
}

export async function adminPost<T>(path: string, body: unknown): Promise<T> {
  return adminFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function adminPatch<T>(path: string, body: unknown): Promise<T> {
  return adminFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function adminDelete(path: string): Promise<void> {
  await adminFetch(path, { method: 'DELETE' });
}
