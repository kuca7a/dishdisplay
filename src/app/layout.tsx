import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
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
      <body
        className={`${rubik.className}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
