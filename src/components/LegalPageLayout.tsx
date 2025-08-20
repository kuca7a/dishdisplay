"use client";

import React from "react";
import { Notable } from "next/font/google";
import Navbar from "@/components/Navbar";

const notable = Notable({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

interface LegalPageLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function LegalPageLayout({
  children,
  title,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main className="bg-white py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-semibold mb-12 text-center text-gray-900">
            {title}
          </h1>
          <div className="prose prose-lg mx-auto text-gray-700 font-medium">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-8 md:mb-0">
              <h3 className={`${notable.className} text-3xl mb-2`}>
                Dish Display
              </h3>
              <p className="text-gray-400 font-medium text-lg">
                Bringing menus to life
              </p>
            </div>
            <nav className="w-full max-w-sm md:w-auto">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:flex md:space-x-8 md:gap-0 justify-items-center md:justify-items-start">
                <a
                  href="/about"
                  className="hover:text-gray-300 font-medium text-lg transition-colors duration-200"
                >
                  About
                </a>
                <a
                  href="/contact"
                  className="hover:text-gray-300 font-medium text-lg transition-colors duration-200"
                >
                  Contact
                </a>
                <a
                  href="/privacy"
                  className="hover:text-gray-300 font-medium text-lg transition-colors duration-200"
                >
                  Privacy
                </a>
                <a
                  href="/licensing"
                  className="hover:text-gray-300 font-medium text-lg transition-colors duration-200"
                >
                  Licensing
                </a>
                <a
                  href="/terms"
                  className="hover:text-gray-300 font-medium text-lg transition-colors duration-200"
                >
                  Terms
                </a>
              </div>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
