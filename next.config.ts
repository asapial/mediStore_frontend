import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co.com",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.backendBaseUrl}/api/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${process.env.backendBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;