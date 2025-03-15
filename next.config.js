/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // This will completely disable ESLint during the build process
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors and warnings.
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build
  typescript: {
    // This setting ignores TypeScript type errors during the build process
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
