import type { Metadata } from "next";
import { Poller_One, Fjalla_One, Notable } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const pollerOne = Poller_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const fjallaOne = Fjalla_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const notable = Notable({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dish Display - Bring Your Menu to Life",
  description:
    "Help customers make confident dining decisions with high-quality photos of your menu items.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${pollerOne.className} ${fjallaOne.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
