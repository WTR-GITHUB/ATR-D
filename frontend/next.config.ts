// /frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from local network during development
  // This resolves the warning about cross-origin requests to /_next/* resources
  allowedDevOrigins: [
    '192.168.1.166', // Your local network IP
    'localhost',
    '127.0.0.1'
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
