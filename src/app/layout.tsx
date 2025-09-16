import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dish Display - Bring Your Menu to Life",
  description:
    "Help customers make confident dining decisions with high-quality photos of your menu items.",
  keywords:
    "digital menu, restaurant menu, QR code menu, menu management, restaurant technology",
  authors: [{ name: "DishDisplay" }],
  creator: "DishDisplay",
  publisher: "DishDisplay",
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
  openGraph: {
    type: "website",
    title: "Dish Display - Bring Your Menu to Life",
    description:
      "Help customers make confident dining decisions with high-quality photos of your menu items.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://dishdisplay.com",
    siteName: "DishDisplay",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DishDisplay - Digital Menu Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dish Display - Bring Your Menu to Life",
    description:
      "Help customers make confident dining decisions with high-quality photos of your menu items.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap"
          as="style"
        />
        <link
          rel="preload"
          href="/mockupPhone.png"
          as="image"
          type="image/png"
        />
        <link
          rel="preload"
          href="/mockupLaptop.png"
          as="image"
          type="image/png"
        />
      </head>
      <body className={`${rubik.className}`}>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
