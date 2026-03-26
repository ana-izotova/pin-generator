import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  ...(process.env.GITHUB_ACTIONS && { basePath: "/pin-generator" }),
};

export default nextConfig;
