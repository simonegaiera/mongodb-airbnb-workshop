/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    output: 'export',
    basePath: process.env.WORKSHOP_USER || '',
    env: {
        BASE_URL: process.env.BACKEND_URL || '',
        BASE_PATH: process.env.WORKSHOP_USER || '',
    },
    reactStrictMode: false
  };
    
  export default nextConfig;