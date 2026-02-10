import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.backendBaseUrl}/api/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_backendBaseUrl}/api/:path*`,
      },
    ];
  },

};

export default nextConfig;
