import React from "react";
import Link from "next/link";
import { CheckIcon } from "@heroicons/react/20/solid";

const includedFeatures = [
  "Unlimited QR code scans",
  "Up to 100 menu items with images",
  "Custom restaurant page with your branding",
  "Update your menu anytime",
  "Free support",
];

export default function PricingSection() {
  return (
    <section className="bg-[#ffffff] py-16 font-medium">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-semibold text-center mb-16">
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
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl tracking-tight text-gray-900">
                    £29
                  </span>
                  <span className="text-sm  tracking-wide text-gray-600">
                    / month
                  </span>
                </p>
                <p className="mt-2 text-center text-sm text-gray-600">
                  or £299/year (Save 14%)
                </p>
                <Link
                  href="/login"
                  className="mt-10 block w-full rounded-md bg-[#5F7161] hover:bg-[#4C5B4F]  px-3 py-2 text-center text-sm text-white shadow-sm "
                >
                  Start 14-day free trial
                </Link>
                <p className="mt-6 text-xs text-gray-600">
                  14-day free trial • Cancel anytime • No setup fees
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
