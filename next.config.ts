import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure webpack is used for production builds (not Turbopack)
  // Turbopack is causing build errors on Vercel
};

export default nextConfig;
