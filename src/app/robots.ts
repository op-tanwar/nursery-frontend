import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/favicon.ico",
          "/icon-48x48.png",
          "/icon-96x96.png",
          "/icon-192x192.png",
          "/apple-touch-icon.png",
        ],
        disallow: [
          "/admin/",
          "/nursery/",
          "/api/",
          "/account/",
          "/checkout/",
          "/orders/",
          "/cart",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: [
          "/",
          "/favicon.ico",
          "/icon-*.png",
          "/apple-touch-icon.png",
          "/images/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
