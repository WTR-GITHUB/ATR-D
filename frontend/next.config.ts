// /frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CHANGE: Optimized for hybrid development mode with Nginx proxy
  // Allow cross-origin requests from local network during development
  allowedDevOrigins: [
    '192.168.88.167', // Current server IP (corrected)
    '192.168.192.168', // Future server IP
    'localhost',
    '127.0.0.1'
  ],
  
  // CHANGE: Additional dev server configuration for WebSocket support
  experimental: {
    // Ensure WebSocket connections work through proxy
    serverComponentsExternalPackages: []
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/:path*`,
      },
    ];
  },
  
  // CHANGE: Additional configuration for development mode
  ...(process.env.NODE_ENV === 'development' && {
    // Enable WebSocket for HMR
    webpackDevMiddleware: (config: any) => {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      return config;
    },
  }),
};

export default nextConfig;
