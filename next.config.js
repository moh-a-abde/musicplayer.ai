/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  // Configure webpack to handle jsmediatags as a client-only module
  webpack: (config, { isServer }) => {
    // If on the server side, add jsmediatags to the list of client-only modules
    if (isServer) {
      config.externals = [...config.externals, 'jsmediatags'];
    }
    
    return config;
  },
}

module.exports = nextConfig
