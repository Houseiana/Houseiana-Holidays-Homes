/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // strict mode enabled
  },
  eslint: {
    // strict mode enabled
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: '**.imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'houseiana-property-photos.s3.us-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'houseiana-property-photos.s3.amazonaws.com',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    // Only external packages actually used by frontend
    // Note: pg, bcryptjs removed - database access is via Railway API only
    serverComponentsExternalPackages: ['@vercel/blob', 'nodemailer', 'twilio', '@sendgrid/mail', '@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000', 'houseiana.net', 'www.houseiana.net'],
    },
  },
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