/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' to enable dynamic features
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
