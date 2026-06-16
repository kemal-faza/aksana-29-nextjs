import { NextRequest, NextResponse } from 'next/server';
import { applyCors, getAllowedOrigins, handlePreflight } from './app/utils/cors';

/**
 * CORS middleware for the API.
 *
 * Why this exists:
 * - apps/api/app/main.ts configures CORS for the LOCAL NestJS dev server, but
 *   the production deployment on Vercel uses Next.js route handlers directly
 *   (the `next build` output, not the NestJS Express server).
 * - Without this middleware, browsers block all cross-origin requests to the
 *   deployed API with "No 'Access-Control-Allow-Origin' header" errors.
 *
 * Configure allowed origins via the CORS_ORIGIN env var (comma-separated).
 * Supports `*.example.com` wildcards for Vercel preview deployments.
 */
export function middleware(request: NextRequest) {
  const allowedOrigins = getAllowedOrigins();

  // Handle preflight (OPTIONS) requests
  const preflight = handlePreflight(request, allowedOrigins);
  if (preflight) return preflight;

  // Pass-through: let the request continue, but inject CORS headers on the response
  const response = NextResponse.next();
  return applyCors(request, response, allowedOrigins);
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
