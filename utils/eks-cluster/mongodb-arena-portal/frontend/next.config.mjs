/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Note: rewrites don't work with static export, API calls should be handled client-side
}

export default nextConfig
