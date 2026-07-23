import type { NextConfig } from "next";

// Baseline hardening: drop the X-Powered-By fingerprint and set the security
// headers a public site is judged on. Deliberately minimal.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  redirects: () => [
    // Canonical host is dylan.merigaud.com; the apex and www redirect to it.
    {
      source: "/:path*",
      has: [{ type: "host", value: "merigaud.com" }],
      destination: "https://dylan.merigaud.com/:path*",
      permanent: true,
    },
    {
      source: "/:path*",
      has: [{ type: "host", value: "www.merigaud.com" }],
      destination: "https://dylan.merigaud.com/:path*",
      permanent: true,
    },
  ],
  headers: () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
};

export default nextConfig;
