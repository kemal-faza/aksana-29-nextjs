/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@aksana/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // NestJS decorators in main.ts are excluded from Next.js build
    // route handlers in app/ are standard Next.js
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
