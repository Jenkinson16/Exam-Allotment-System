import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint checks during production builds on Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
