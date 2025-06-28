/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during builds
    ignoreBuildErrors: true,
  },
  // Removed 'output: export' to enable API routes and server-side features
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig