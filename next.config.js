/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.(ico|png|jpg|jpeg|gif|svg)$/,
      type: 'asset/resource',
    })
    return config
  },
  // Explicitly set the asset prefix to ensure correct paths in production
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
  // Add this to ensure static files are served correctly
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

