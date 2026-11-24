import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingRoot: process.cwd(),
  serverExternalPackages: ['pdf-parse'],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
