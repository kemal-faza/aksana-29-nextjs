/**
 * CORS helper for Next.js middleware.
 *
 * Production API (apps/api) is deployed as Next.js route handlers on Vercel.
 * The NestJS+Express CORS config in `app/main.ts` only applies to local dev,
 * so this helper provides the CORS logic that the Vercel serverless runtime needs.
 *
 * Reads allowed origins from the `CORS_ORIGIN` env var (comma-separated list).
 * Supports `*.example.com` wildcard suffix matching for preview deployments.
 */

export const CORS_HEADERS = {
  ALLOW_METHODS: 'GET,HEAD,POST,PATCH,DELETE,OPTIONS',
  ALLOW_HEADERS: 'authorization,content-type,x-requested-with',
  MAX_AGE: '86400', // 24 hours — let browser cache preflight result
  CREDENTIALS: 'true',
} as const;

/**
 * Parse the CORS_ORIGIN env var into a list of allowed origins.
 * - Splits on commas
 * - Trims whitespace
 * - Filters out empty entries
 */
export function parseAllowedOrigins(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
}

/**
 * Check if an origin matches the allowed list.
 * Supports `*.example.com` wildcards for subdomains.
 *
 * Returns the matched origin string (echoed back to the browser), or null.
 */
export function matchOrigin(origin: string, allowed: string[]): string | null {
  for (const pattern of allowed) {
    if (pattern === '*') {
      // Wildcard: echo back the request origin (browsers reject `*` with credentials)
      return origin;
    }
    if (pattern.startsWith('*.')) {
      // Wildcard subdomain: `*.vercel.app` matches `https://foo.vercel.app`
      const suffix = pattern.slice(1); // ".vercel.app"
      if (origin.endsWith(suffix)) {
        // Make sure it's actually a subdomain (not just domain match)
        const prefix = origin.slice(0, origin.length - suffix.length);
        // prefix must be empty or end with the protocol separator
        // e.g. for "https://foo.vercel.app" and ".vercel.app" -> prefix = "https://foo"
        // We need to ensure the part before suffix is a valid origin (has protocol + hostname)
        if (prefix.includes('://')) {
          return origin;
        }
      }
      continue;
    }
    // Exact match
    if (pattern === origin) {
      return origin;
    }
  }
  return null;
}

/**
 * Add CORS headers to a response if the request origin is allowed.
 * Mutates the response (returns the same response) for NextResponse compatibility.
 */
export function applyCors(
  request: Request,
  response: Response,
  allowedOrigins: string[]
): Response {
  const origin = request.headers.get('origin');
  if (!origin) {
    // No Origin header — not a CORS request (e.g. server-to-server)
    return response;
  }

  const matched = matchOrigin(origin, allowedOrigins);
  if (!matched) {
    // Origin not allowed — do NOT set Access-Control-Allow-Origin
    // Browser will block the response
    return response;
  }

  // Clone so we can mutate headers without mutating caller's response
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', matched);
  headers.set('Access-Control-Allow-Credentials', CORS_HEADERS.CREDENTIALS);
  // Vary is required so caches don't serve wrong CORS headers to other origins
  headers.append('Vary', 'Origin');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Handle a CORS preflight (OPTIONS) request.
 * Returns a 204 response with CORS headers if origin is allowed.
 * Returns a 403 response if origin is not allowed (so browser blocks the preflight).
 * Returns null for non-OPTIONS requests so the caller can pass them through.
 */
export function handlePreflight(
  request: Request,
  allowedOrigins: string[]
): Response | null {
  if (request.method !== 'OPTIONS') return null;

  const origin = request.headers.get('origin');
  if (!origin) {
    // No origin on OPTIONS — unusual but let it through as 204
    return new Response(null, { status: 204 });
  }

  const matched = matchOrigin(origin, allowedOrigins);
  if (!matched) {
    return new Response(JSON.stringify({ error: 'CORS origin not allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': matched,
      'Access-Control-Allow-Methods': CORS_HEADERS.ALLOW_METHODS,
      'Access-Control-Allow-Headers': CORS_HEADERS.ALLOW_HEADERS,
      'Access-Control-Max-Age': CORS_HEADERS.MAX_AGE,
      'Access-Control-Allow-Credentials': CORS_HEADERS.CREDENTIALS,
      Vary: 'Origin',
    },
  });
}

/**
 * Read allowed origins from the env (for use in middleware).
 * Falls back to localhost:3000 for local dev.
 */
export function getAllowedOrigins(): string[] {
  const env = process.env.CORS_ORIGIN;
  const parsed = parseAllowedOrigins(env);
  if (parsed.length > 0) return parsed;
  // Default for local dev — web app runs on :3000
  return ['http://localhost:3000'];
}
