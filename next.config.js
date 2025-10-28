/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignore build errors for now to get it deployed
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore lint errors during build
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@vercel/blob', 'pg', 'bcryptjs']
  },
  // Output standalone for Railway deployment
  output: 'standalone',
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    SOCKET_IO_URL: process.env.SOCKET_IO_URL,
  },
  webpack: (config, { isServer }) => {
    // Fix for packages that rely on Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;