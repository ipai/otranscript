/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/data/:path*',
        destination: '/api/static/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
