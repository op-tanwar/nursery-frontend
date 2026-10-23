import React from "react";
import { SITE_URL } from "@/config/site";

// ======================================================================
// 1. Organization Schema
// ======================================================================
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Urban Nursery",
    alternateName: ["Urban Nursery India", "Planto Urban Nursery"],
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo-new.png`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-1800-872-2675",
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Green Tech Corridor",
      addressLocality: "Indore",
      addressRegion: "Madhya Pradesh",
      postalCode: "452001",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.instagram.com/urbannursery.in",
      "https://www.facebook.com/urbannurseryindia",
      "https://twitter.com/urbannurseryin",
      "https://www.linkedin.com/company/urban-nursery-india",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ======================================================================
// 2. WebSite & SearchAction Schema (Google Sitelinks Searchbox)
// ======================================================================
export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Urban Nursery",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ======================================================================
// 3. E-Commerce Product & Verified Offer Schema
// ======================================================================
export interface ProductJsonLdProps {
  id: string;
  name: string;
  description: string;
  images: string[];
  sku?: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  stock?: number;
  vendorName: string;
  vendorSlug?: string;
  url: string;
  rating?: number;
  reviewCount?: number;
  verifiedReviews?: {
    author: string;
    rating: number;
    date: string;
    comment: string;
  }[];
}

export function ProductJsonLd({
  id,
  name,
  description,
  images,
  sku,
  category,
  price,
  originalPrice,
  stock = 1,
  vendorName,
  vendorSlug,
  url,
  rating = 0,
  reviewCount = 0,
  verifiedReviews = [],
}: ProductJsonLdProps) {
  const isOutOfStock = stock <= 0;
  const inrPrice = price.toFixed(2);
  const cleanImages = (images && images.length > 0 ? images : [`${SITE_URL}/images/logo-new.png`]).filter(
    (img) => typeof img === "string" && img.startsWith("http")
  );

  const offer: Record<string, any> = {
    "@type": "Offer",
    url,
    priceCurrency: "INR",
    price: inrPrice,
    priceValidUntil: "2027-12-31",
    availability: isOutOfStock
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: {
      "@type": "Organization",
      name: vendorName || "Urban Nursery Certified Partner",
      ...(vendorSlug ? { url: `${SITE_URL}/vendor/${vendorSlug}` } : {}),
    },
    // 24-hour Botanical Guarantee & Pan-India Courier Return Policy
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "IN",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 1,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
      refundType: "https://schema.org/ExchangeRefund",
      name: "24-Hour Botanical Transit Guarantee",
      description:
        "Free return or replacement for plants or ceramic pots damaged in transit when reported within 24 hours of delivery.",
    },
    // Pan-India Courier Fulfillment Details
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: "0.00",
        currency: "INR",
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "IN",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: 2,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 2,
          maxValue: 5,
          unitCode: "DAY",
        },
      },
    },
  };

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description ? description.slice(0, 300) : `${name} available at Urban Nursery India.`,
    image: cleanImages.length > 0 ? cleanImages : [`${SITE_URL}/images/logo-new.png`],
    sku: sku || id,
    mpn: id,
    category,
    brand: {
      "@type": "Brand",
      name: vendorName || "Urban Nursery",
    },
    offers: offer,
  };

  // 🛡️ REVIEWS COMPLIANCE: Emit AggregateRating and Review blocks ONLY when genuine verified reviews exist
  if (reviewCount > 0 && rating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.toFixed(1),
      reviewCount: Math.max(1, reviewCount),
      bestRating: "5",
      worstRating: "1",
    };
  }

  if (verifiedReviews && verifiedReviews.length > 0) {
    schema.review = verifiedReviews.slice(0, 5).map((rev) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: rev.author || "Verified Buyer",
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: rev.rating || 5,
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: rev.comment || "Great plant quality and safe packaging.",
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ======================================================================
// 4. LocalBusiness & Verified Nursery Schema
// ======================================================================
export interface LocalBusinessJsonLdProps {
  name: string;
  description?: string;
  slug: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  telephone?: string;
  avatar?: string;
}

export function LocalBusinessJsonLd({
  name,
  description,
  slug,
  city = "Indore",
  state = "Madhya Pradesh",
  postalCode = "452001",
  latitude,
  longitude,
  telephone = "+91-1800-872-2675",
  avatar,
}: LocalBusinessJsonLdProps) {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Florist", "GardenStore"],
    name,
    description:
      description ||
      `${name} is a certified plant nursery partner on Urban Nursery providing healthy live plants and garden supplies.`,
    url: `${SITE_URL}/vendor/${slug}`,
    telephone,
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressRegion: state,
      postalCode,
      addressCountry: "IN",
    },
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Credit Card, UPI, Net Banking",
    priceRange: "₹₹",
  };

  if (avatar && avatar.startsWith("http")) {
    schema.image = avatar;
  }

  if (latitude && longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude,
      longitude,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ======================================================================
// 5. BreadcrumbList Schema
// ======================================================================
export interface BreadcrumbNode {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbNode[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `${SITE_URL}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ======================================================================
// 6. FAQPage Schema
// ======================================================================
export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqPageJsonLd({ items }: { items: FaqItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
