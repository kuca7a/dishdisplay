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
      <section className="bg-[#ffffff] text-black py-16">
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
      <section className="bg-gray-50 py-16">
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
                    decisions with visual menu items and have a better dining experience.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-['Fjalla_One']">5</span>
                </div>
                <div>
                  <h3 className="text-xl font-['Fjalla_One'] mb-2">
                    Customers Join Rewards Program
                  </h3>
                  <p className="text-gray-600 font-['Fjalla_One']">
                    After their meal, customers are invited to join our review rewards program and leave a Google Review with photos to earn points.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-['Fjalla_One']">6</span>
                </div>
                <div>
                  <h3 className="text-xl font-['Fjalla_One'] mb-2">
                    Grow Your Online Presence
                  </h3>
                  <p className="text-gray-600 font-['Fjalla_One']">
                    Customers compete for monthly rewards by reviewing restaurants, generating authentic Google Reviews with photos that attract new diners to your restaurant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-[#ffffff] py-16 font-['Fjalla_One']">
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

      {/* Analytics USP Section */}
      <section className="bg-gray-50 text-black py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-['Fjalla_One'] mb-6">
              The Only Menu Platform with Advanced Analytics
            </h2>
            <p className="text-xl font-['Fjalla_One'] max-w-3xl mx-auto text-gray-600">
              Don't just show your menu - understand your customers. Dish
              Display provides restaurant owners with unprecedented insights
              into customer behavior and menu performance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-[#5F7161]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-['Fjalla_One'] mb-4">
                Menu Performance Analytics
              </h3>
              <p className="font-['Fjalla_One'] text-gray-600">
                Track which dishes are viewed most, conversion rates, and
                customer preferences in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-[#5F7161]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-['Fjalla_One'] mb-4">
                Revenue Optimization
              </h3>
              <p className="font-['Fjalla_One'] text-gray-600">
                Identify your highest-performing dishes and optimize pricing
                based on customer engagement data.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-[#5F7161]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-['Fjalla_One'] mb-4">
                Customer Behavior Insights
              </h3>
              <p className="font-['Fjalla_One'] text-gray-600">
                Understand peak viewing times, popular combinations, and
                seasonal trends to make data-driven decisions.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-['Fjalla_One'] mb-2 text-[#5F7161]">
                  95%
                </div>
                <div className="font-['Fjalla_One'] text-gray-600">
                  Restaurants report increased orders with visual menus
                </div>
              </div>
              <div>
                <div className="text-3xl font-['Fjalla_One'] mb-2 text-[#5F7161]">
                  47%
                </div>
                <div className="font-['Fjalla_One'] text-gray-600">
                  Average increase in customer engagement
                </div>
              </div>
              <div>
                <div className="text-3xl font-['Fjalla_One'] mb-2 text-[#5F7161]">
                  23%
                </div>
                <div className="font-['Fjalla_One'] text-gray-600">
                  Boost in average order value
                </div>
              </div>
              <div>
                <div className="text-3xl font-['Fjalla_One'] mb-2 text-[#5F7161]">
                  24/7
                </div>
                <div className="font-['Fjalla_One'] text-gray-600">
                  Real-time analytics dashboard access
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-xl font-['Fjalla_One'] mb-6 text-gray-700">
              🚀 Advanced analytics dashboard coming soon - be among the first
              to access detailed insights!
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-[#5F7161] text-white px-8 py-4 rounded-lg font-['Fjalla_One'] hover:bg-[#4C5B4F] transition-colors text-lg"
            >
              Get Early Access to Analytics
            </button>
          </div>
        </div>
      </section>

      {/* Review Rewards System Section */}
      <section className="bg-[#ffffff] py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-['Fjalla_One'] mb-6">
              Turn Customers Into Review Champions
            </h2>
            <p className="text-xl font-['Fjalla_One'] max-w-3xl mx-auto text-gray-600">
              Our unique reward system motivates customers to leave more Google Reviews with photos, boosting your restaurant's online presence and attracting new diners.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* How It Works */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-['Fjalla_One'] mb-6 text-center">How The Reward System Works</h3>
              <div className="flex justify-center">
                <div className="max-w-2xl space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-['Fjalla_One']">1</span>
                    </div>
                    <div>
                      <h4 className="font-['Fjalla_One'] text-lg mb-2">Customer Creates Profile</h4>
                      <p className="text-gray-600 font-['Fjalla_One']">Diners sign up and track their reviews across all Dish Display restaurants.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-['Fjalla_One']">2</span>
                    </div>
                    <div>
                      <h4 className="font-['Fjalla_One'] text-lg mb-2">Reviews Earn Points</h4>
                      <p className="text-gray-600 font-['Fjalla_One']">Google Reviews with photos earn more points, encouraging quality feedback.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-['Fjalla_One']">3</span>
                    </div>
                    <div>
                      <h4 className="font-['Fjalla_One'] text-lg mb-2">Monthly Competition</h4>
                      <p className="text-gray-600 font-['Fjalla_One']">Top reviewers compete for discount vouchers from participating restaurants.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-['Fjalla_One']">4</span>
                    </div>
                    <div>
                      <h4 className="font-['Fjalla_One'] text-lg mb-2">Winners Get Rewards</h4>
                      <p className="text-gray-600 font-['Fjalla_One']">Monthly winners receive vouchers, driving repeat visits and new customer discovery.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant Benefits */}
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-['Fjalla_One'] mb-6">Restaurant Benefits</h3>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-[#5F7161] w-8 h-8 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="font-['Fjalla_One'] text-lg">More Google Reviews</h4>
                  </div>
                  <p className="text-gray-600 font-['Fjalla_One']">Customers actively seek out your restaurant to earn points, generating authentic reviews.</p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="font-['Fjalla_One'] text-lg">Photo Reviews</h4>
                  </div>
                  <p className="text-gray-600 font-['Fjalla_One']">Higher points for photo reviews mean more visual content showcasing your dishes.</p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-[#4C5B4F] w-8 h-8 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h4 className="font-['Fjalla_One'] text-lg">New Customer Discovery</h4>
                  </div>
                  <p className="text-gray-600 font-['Fjalla_One']">Winners share their experiences, bringing their network to discover your restaurant.</p>
                </div>
              </div>
              
              <div className="bg-[#5F7161] text-white rounded-lg p-6 text-center">
                <h4 className="font-['Fjalla_One'] text-xl mb-3">Marketing That Pays For Itself</h4>
                <p className="font-['Fjalla_One']">Sponsor monthly prizes for less than traditional advertising, while generating authentic customer content and reviews.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-16">
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
      <section className="py-16 bg-[#ffffff] text-black">
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
            className="bg-[#5F7161] text-white px-8 py-4 rounded-lg font-['Fjalla_One'] hover:cursor-pointer hover:bg-[#4C5B4F] transition-colors text-lg"
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
