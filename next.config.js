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
  api: {
    bodyParser: {
      sizeLimit: '50mb' // Increase the size limit to 50MB
    },
  },
};

module.exports = nextConfig;
