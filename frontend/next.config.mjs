/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'media.api-sports.io',
      'logos.api-sports.io',
      'lh3.googleusercontent.com',
      'fbref.com'
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  },
  typescript: {
    // Temporarily ignore TypeScript errors during development
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore ESLint errors during development
    ignoreDuringBuilds: true,
  },
}

export default nextConfig 