import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // ⬇️ Add this: proxy backend to avoid CORS/preflight issues
  async rewrites() {
    return [
      { source: '/api/auth/:path*',            destination: 'http://localhost:4000/auth/:path*' },
      { source: '/api/courses/:path*',         destination: 'http://localhost:4002/courses/:path*' },
      { source: '/api/recommendations/:path*', destination: 'http://localhost:4001/recommendations/:path*' },
    ];
  },
};

export default nextConfig;

