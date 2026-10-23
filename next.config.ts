import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚡ PERF: lucide-react / recharts are optimized by default in Next 16;
  // add framer-motion (admin/dashboard) for the same barrel-import treatment.
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  compiler: {
    // Strip console.* in production builds (keeps error/warn for ops)
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  images: {
    // ⚡ PERF: Cloudinary images are already optimized at source; serve modern formats
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Default vendor cover images use Unsplash
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Allow any other common CDN vendor avatars served via HTTP
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    // Covers mobile (375px), tablet (768px), desktop (1100px) breakpoints
    deviceSizes: [375, 640, 768, 1024, 1100, 1280, 1920],
    imageSizes: [64, 128, 256, 384],
    // Serve WebP/AVIF automatically when supported
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for 7 days at the CDN layer
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  compress: true,
  // ⚡ PERF & 🛡️ SECURITY: HTTP Security Headers and Long-lived cache headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  // 🔄 URL NORMALIZATION & DIRECT 301 REDIRECTS (Zero redirect chains)
  async redirects() {
    return [
      {
        source: "/vendors/:slug",
        destination: "/vendor/:slug",
        permanent: true,
      },
      {
        source: "/vendors",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/vendor",
        destination: "/shop",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
