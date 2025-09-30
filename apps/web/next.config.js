/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  // Optimize images and performance
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
};

module.exports = nextConfig;