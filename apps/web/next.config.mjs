/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@aksana/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
