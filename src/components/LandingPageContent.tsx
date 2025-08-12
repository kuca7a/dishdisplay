"use client";

import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "@/components/Navbar";
import Carousel from "@/components/Carousel";
import { CheckIcon } from "@heroicons/react/20/solid";
import { SpeedInsights } from "@vercel/speed-insights/next";

const includedFeatures = [
  "Unlimited QR code scans",
  "Up to 100 menu items with images",
  "Custom restaurant page with your branding",
  "Update your menu anytime",
  "Free support",
];

export default function LandingPageContent() {
  const { loginWithRedirect } = useAuth0();

  const handleGetStarted = () => {
    loginWithRedirect({ screen_hint: "signup" });
  };

  return (
    <div className="min-h-screen">
      <SpeedInsights />
      <Navbar />
      {/* Hero Section */}
      <section className="bg-[#FFF8F0] text-black py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-6xl font-['Fjalla_One'] mb-6">
                Bring Your Menu to Life with Beautiful Photos
              </h1>
              <p className="text-xl mb-8 font-['Fjalla_One']">
                Help customers make confident dining decisions with high-quality
                photos of every dish on your menu.
              </p>
              <button
                onClick={handleGetStarted}
                className="bg-[#5F7161] hover:bg-[#4C5B4F] text-white px-8 py-4 rounded-lg font-['Fjalla_One'] hover:cursor-pointer transition-colors text-lg w-full"
              >
                Get Started Free
              </button>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <Carousel />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#FFF8F0] py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-['Fjalla_One'] text-center mb-16">
            How Dish Display Works
          </h2>
          <div className="flex justify-center">
            <div className="max-w-2xl space-y-12">
              <div className="flex items-start space-x-4">
                <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-['Fjalla_One']">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-['Fjalla_One'] mb-2">
                    Create Your Account
                  </h3>
                  <p className="text-gray-600 font-['Fjalla_One']">
                    Sign up for Dish Display and create your restaurant&apos;s
                    profile. Upload your menu items with high-quality photos.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-['Fjalla_One']">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-['Fjalla_One'] mb-2">
                    Get Your QR Code
                  </h3>
                  <p className="text-gray-600 font-['Fjalla_One']">
                    We&apos;ll provide you with a unique QR code that links
                    directly to your restaurant&apos;s menu on Dish Display.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-['Fjalla_One']">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-['Fjalla_One'] mb-2">
                    Print on Your Menu
                  </h3>
                  <p className="text-gray-600 font-['Fjalla_One']">
                    Add the QR code to your physical menu. Customers can scan it
                    to instantly view your dishes with photos.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-['Fjalla_One']">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-['Fjalla_One'] mb-2">
                    Delight Your Customers
                  </h3>
                  <p className="text-gray-600 font-['Fjalla_One']">
                    Watch as your customers make more confident ordering
                    decisions with visual menu items. Customers will be prompted
                    to review the restaurant on Google and Tripadvisor. Win win.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-[#FFF8F0] py-24 sm:py-32 font-['Fjalla_One']">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-['Fjalla_One'] text-center mb-16">
              Simple no-tricks pricing
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-gray-500 sm:text-xl">
              Help customers make confident dining decisions with high-quality
              photos of every dish on your menu.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl bg-white shadow-2xl sm:mt-20 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <h3 className="text-3xl font-semibold tracking-tight text-gray-900">
                Lifetime membership
              </h3>
              <p className="mt-6 text-base text-gray-600">
                Enjoy unlimited access to all features and updates with a simple
                monthly subscription.
              </p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold text-[#5F7161]">
                  What's included
                </h4>
                <div className="h-px flex-auto bg-gray-100" />
              </div>
              <ul
                role="list"
                className="mt-8 grid grid-cols-1 gap-4 text-sm text-gray-600 sm:grid-cols-2 sm:gap-6"
              >
                {includedFeatures.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      aria-hidden="true"
                      className="h-6 w-5 flex-none text-[#5F7161]"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-2 lg:mt-0 lg:w-full lg:max-w-md lg:shrink-0">
              <div className="rounded-2xl bg-white py-10 text-center ring-2 ring-[#5F7161] shadow-2xl lg:flex lg:flex-col lg:justify-center lg:py-16">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base text-gray-600">
                    No contracts. No setup fees.
                  </p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl tracking-tight text-gray-900">
                      £19.99
                    </span>
                    <span className="text-sm  tracking-wide text-gray-600">
                      / month
                    </span>
                  </p>
                  <a
                    href="/profile/subscription"
                    className="mt-10 block w-full rounded-md bg-[#5F7161] hover:bg-[#4C5B4F]  px-3 py-2 text-center text-sm text-white shadow-sm "
                  >
                    Start 14-day free trial
                  </a>
                  <p className="mt-6 text-xs text-gray-600">
                    14-day free trial • Cancel anytime • No setup fees
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-[#FFF8F0] py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-['Fjalla_One'] text-center mb-16">
            Why Restaurant Owners Choose Us
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-['Fjalla_One'] mb-4">
                Increased Orders
              </h3>
              <p className="text-gray-600 font-['Fjalla_One']">
                Customers are more likely to order when they can see what
                they&apos;re getting.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-['Fjalla_One'] mb-4">
                Easy Management
              </h3>
              <p className="text-gray-600 font-['Fjalla_One']">
                Update your menu photos instantly through our simple dashboard.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-['Fjalla_One'] mb-4">
                Customer Satisfaction
              </h3>
              <p className="text-gray-600 font-['Fjalla_One']">
                Reduce order confusion and improve dining experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-['Fjalla_One'] mb-8">
            Ready to Transform Your Menu?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto font-['Fjalla_One']">
            Join hundreds of restaurants already using our platform to showcase
            their dishes and delight their customers.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-black px-8 py-4 rounded-lg font-['Fjalla_One'] hover:cursor-pointer hover:bg-gray-100 transition-colors text-lg"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-8 md:mb-0">
              <h3 className="text-3xl font-['Notable'] mb-2">Dish Display</h3>
              <p className="text-gray-400 font-['Fjalla_One'] text-lg">
                Bringing menus to life
              </p>
            </div>
            <div className="flex space-x-8">
              <a
                href="/about"
                className="hover:text-gray-300 font-['Fjalla_One'] text-lg"
              >
                About
              </a>
              <a
                href="/contact"
                className="hover:text-gray-300 font-['Fjalla_One'] text-lg"
              >
                Contact
              </a>
              <a
                href="/privacy"
                className="hover:text-gray-300 font-['Fjalla_One'] text-lg"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="hover:text-gray-300 font-['Fjalla_One'] text-lg"
              >
                T&Cs
              </a>
              <a
                href="/licensing"
                className="hover:text-gray-300 font-['Fjalla_One'] text-lg"
              >
                Licensing
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
