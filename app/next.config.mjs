/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    output: 'export',
    env: {
        BASE_URL: process.env.BASE_URL,
    },
  };
    
  export default nextConfig;