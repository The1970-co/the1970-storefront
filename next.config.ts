import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn0199.cdn4s.com' },
      { protocol: 'https', hostname: '**.cdn4s.com' },
      { protocol: 'https', hostname: 'sapo.dktcdn.net' }
    ],
    formats: ['image/avif', 'image/webp']
  }
};
export default nextConfig;
