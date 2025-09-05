import { Metadata } from "next";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "restaurant" | "menu";
  restaurantName?: string;
  location?: string;
  price?: string;
  currency?: string;
  locale?: string;
}

export function generateSEO({
  title,
  description,
  keywords = [],
  image,
  url,
  type = "website",
  restaurantName,
  location,
  price,
  currency = "GBP",
  locale = "en_GB",
}: SEOProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dishdisplay.com";
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullTitle = title
    ? `${title} | DishDisplay`
    : "DishDisplay - Bring Your Menu to Life";
  const defaultDescription =
    "Help customers make confident dining decisions with high-quality photos of your menu items. Digital menu management for restaurants.";
  const metaDescription = description || defaultDescription;

  const defaultImage = `${baseUrl}/og-image.png`;
  const metaImage = image || defaultImage;

  // Base keywords
  const baseKeywords = [
    "digital menu",
    "restaurant menu",
    "QR code menu",
    "menu management",
    "restaurant technology",
    "food photos",
    "menu display",
    "restaurant reviews",
    "dining experience",
  ];

  const allKeywords = [...baseKeywords, ...keywords];

  const metadata: Metadata = {
    title: fullTitle,
    description: metaDescription,
    keywords: allKeywords.join(", "),
    authors: [{ name: "DishDisplay" }],
    creator: "DishDisplay",
    publisher: "DishDisplay",

    // Open Graph
    openGraph: {
      type:
        type === "restaurant"
          ? "website"
          : type === "menu"
          ? "website"
          : (type as "website" | "article"),
      title: fullTitle,
      description: metaDescription,
      url: fullUrl,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: title || "DishDisplay - Digital Menu Management",
        },
      ],
      locale,
      siteName: "DishDisplay",
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: metaDescription,
      images: [metaImage],
      creator: "@dishdisplay",
      site: "@dishdisplay",
    },

    // Additional meta tags
    other: {
      "theme-color": "#5F7161",
      "msapplication-TileColor": "#5F7161",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": "DishDisplay",
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Viewport
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
    },
  };

  // Add restaurant-specific structured data
  if (type === "restaurant" && restaurantName) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: restaurantName,
      description: metaDescription,
      url: fullUrl,
      image: metaImage,
      ...(location && { address: location }),
      ...(price && { priceRange: price }),
      servesCuisine: "Various",
      acceptsReservations: false,
      hasMenu: fullUrl,
    };

    metadata.other = {
      ...metadata.other,
      "structured-data": JSON.stringify(structuredData),
    };
  }

  // Add menu item structured data
  if (type === "menu") {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "MenuItem",
      name: title,
      description: metaDescription,
      image: metaImage,
      url: fullUrl,
      ...(price && {
        offers: {
          "@type": "Offer",
          price,
          priceCurrency: currency,
        },
      }),
    };

    metadata.other = {
      ...metadata.other,
      "structured-data-menu": JSON.stringify(structuredData),
    };
  }

  return metadata;
}

// Predefined SEO configurations for common pages
export const homeSEO = generateSEO({
  title: "Digital Menu Management for Restaurants",
  description:
    "Transform your restaurant with digital menus, QR codes, and customer reviews. Increase engagement and sales with DishDisplay's comprehensive restaurant management platform.",
  keywords: [
    "restaurant software",
    "digital transformation",
    "contactless dining",
    "restaurant analytics",
    "customer engagement",
  ],
});

export const loginSEO = generateSEO({
  title: "Sign In to DishDisplay",
  description:
    "Access your restaurant dashboard or explore menus as a diner. Join thousands of restaurants and food lovers on DishDisplay.",
  keywords: ["sign in", "login", "restaurant login", "diner login"],
});

export const pricingSEO = generateSEO({
  title: "Pricing Plans for Restaurants",
  description:
    "Affordable digital menu solutions for restaurants of all sizes. Start with a free trial and see how DishDisplay can transform your business.",
  keywords: [
    "pricing",
    "restaurant pricing",
    "menu software cost",
    "digital menu price",
  ],
});

export const aboutSEO = generateSEO({
  title: "About DishDisplay - Restaurant Technology Solutions",
  description:
    "Learn about DishDisplay's mission to help restaurants showcase their menus beautifully and connect with customers through technology.",
  keywords: [
    "about us",
    "restaurant technology",
    "company story",
    "digital menu solutions",
  ],
});

export function getRestaurantSEO(restaurant: {
  name: string;
  description?: string;
  location?: string;
  id: string;
}) {
  return generateSEO({
    title: `${restaurant.name} - Digital Menu`,
    description:
      restaurant.description ||
      `Explore the delicious menu at ${restaurant.name}. View photos, read reviews, and discover your next favorite dish.`,
    keywords: [
      restaurant.name.toLowerCase(),
      "menu",
      "restaurant",
      "food",
      "dining",
      ...(restaurant.location ? [restaurant.location.toLowerCase()] : []),
    ],
    type: "restaurant",
    restaurantName: restaurant.name,
    location: restaurant.location,
    url: `/menu/${restaurant.id}`,
  });
}

export function getMenuItemSEO(item: {
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  restaurant_name: string;
  restaurant_id: string;
  id: string;
}) {
  return generateSEO({
    title: `${item.name} at ${item.restaurant_name}`,
    description:
      item.description ||
      `Delicious ${item.name} available at ${item.restaurant_name}. View photos and details.`,
    keywords: [
      item.name.toLowerCase(),
      item.restaurant_name.toLowerCase(),
      "menu item",
      "food",
      "dish",
    ],
    type: "menu",
    image: item.image_url,
    price: item.price?.toString(),
    url: `/menu/${item.restaurant_id}/item/${item.id}`,
  });
}
