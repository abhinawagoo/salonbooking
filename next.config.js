/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
    ],
    unoptimized: true, // allows external URLs (e.g. R2) without listing each hostname
  },
}

module.exports = nextConfig
