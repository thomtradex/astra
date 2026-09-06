import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  reactStrictMode: true,
  transpilePackages: ['@astra/shared'],
  poweredByHeader: false,
  headers: async () =>
    await Promise.resolve([
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]),
};

export default nextConfig;
