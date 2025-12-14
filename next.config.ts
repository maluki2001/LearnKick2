import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore ESLint and TypeScript errors during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['pg', 'bcrypt'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle pg on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        'pg-native': false,
      }
    }
    return config
  }
};

export default nextConfig;
