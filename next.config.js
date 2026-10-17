/** @type {import('next').NextConfig} */

// Traccar server the dashboard reads from (REST API and WebSocket under /api)
const traccarUrl = process.env.TRACCAR_URL || 'http://localhost:8082';

const nextConfig = {
  // react-leaflet 4 cannot handle React 19's strict-mode double mount ("Map container is already initialized")
  reactStrictMode: false,
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    // Same-origin proxy so the Traccar session cookie belongs to the dashboard
    return [
      {
        source: '/api/:path*',
        destination: `${traccarUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
