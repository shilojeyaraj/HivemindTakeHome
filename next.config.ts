import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The event data is read from disk at request time. Make sure Vercel's
  // serverless bundle includes it.
  outputFileTracingIncludes: {
    "/": ["./data/**/*.json"],
    "/api/steer": ["./data/**/*.json"],
  },
};

export default nextConfig;
