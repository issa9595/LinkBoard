import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Fixe le warning de détection de workspace root
    root: __dirname,
  },
};

export default nextConfig;
