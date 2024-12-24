/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    // Handle source maps
    config.module.rules.push({
      test: /\.(ico|png|jpg|jpeg|gif|svg)$/,
      type: 'asset/resource',
    })

    // Disable source maps in production
    if (!config.dev) {
      config.devtool = false;
    }

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

