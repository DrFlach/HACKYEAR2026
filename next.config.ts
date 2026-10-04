import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js dev blocks cross-origin requests to its dev resources (JS
  // chunks, HMR) from any host other than localhost. Opening the app via
  // the machine's network IP (e.g. on a projector/second device at the
  // hackathon) then silently breaks hydration: pages stay on "Loading…"
  // and the New check form never calls /api/verify. Allow the LAN IP.
  // Add more hosts here if the network IP changes.
  allowedDevOrigins: ["10.250.192.149"],
};

export default nextConfig;
