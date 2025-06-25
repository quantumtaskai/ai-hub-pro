import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  swcMinify: true,
  experimental: {
    turbo: {
      rules: {
        // Prevents importing CSS modules from node_modules
        "*.css": ["style-loader", "css-loader"],
      },
    },
  },
};

export default nextConfig;
