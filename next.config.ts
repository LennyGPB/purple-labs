import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

// @serwist/next s'appuie sur webpack : le build de production utilise `next build --webpack`.
// Hors production (dev Turbopack), le service worker est désactivé.
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withSerwist(nextConfig);
