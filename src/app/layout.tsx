import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import StoreProvider from "@/components/redux/StoreProvider";
import AppToaster from "@/components/common/AppToaster";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/config/site";
import "./styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Urban Nursery | Premium Plants Delivered Alive Across India",
    template: "%s | Urban Nursery India",
  },
  description:
    "India's certified multi-vendor live plant marketplace. Shop 1,200+ botanist-verified indoor & outdoor plants, ceramic pots, and organic gardening essentials delivered with eco-packaging across 150+ cities.",
  keywords: [
    "buy plants online india",
    "indoor plants online",
    "live plants delivery",
    "urban nursery",
    "air purifying plants",
    "ceramic pots planters",
    "nursery partner program",
    "corporate plant gifting",
  ],
  authors: [{ name: "Urban Nursery India" }],
  creator: "Urban Nursery",
  publisher: "Urban Nursery",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Urban Nursery",
    title: "Urban Nursery | Premium Plants Delivered Alive Across India",
    description:
      "India's first certified multi-vendor plant marketplace. 1,200+ botanist-verified plants from local nurseries delivered safely across 150+ Indian cities.",
    images: [
      {
        url: "/images/logo-new.png",
        width: 1200,
        height: 630,
        alt: "Urban Nursery India - Live Plant Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Urban Nursery | Premium Plants Delivered Alive",
    description:
      "1,200+ botanist-verified plants from trusted local nurseries delivered with custom transit packaging across India.",
    images: ["/images/logo-new.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        {/* ⚡ PERF: Warm CDN / API origins before LCP image & product fetches */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://planto-backend-mpdo.onrender.com" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-brand-primary/20">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <StoreProvider>{children}</StoreProvider>
        <AppToaster />
      </body>
    </html>
  );
}
