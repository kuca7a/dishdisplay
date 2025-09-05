import React from "react";
import Link from "next/link";

export default function AnalyticsSection() {
  return (
    <section className="bg-gray-50 text-black py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold mb-6">
            The Only Menu Platform with Advanced Analytics
          </h2>
          <p className="text-xl font-medium max-w-3xl mx-auto text-gray-600">
            Don't just show your menu - understand your customers. Dish Display
            provides restaurant owners with unprecedented insights into customer
            behavior and menu performance.
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
            <h3 className="text-xl font-semibold mb-4">
              Menu Performance Analytics
            </h3>
            <p className="font-medium text-gray-600">
              Track which dishes are viewed most, conversion rates, and customer
              preferences in real-time.
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
            <h3 className="text-xl font-semibold mb-4">Revenue Optimization</h3>
            <p className="font-medium text-gray-600">
              Identify your highest-performing dishes and optimize pricing based
              on customer engagement data.
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
            <h3 className="text-xl font-semibold mb-4">
              Customer Behavior Insights
            </h3>
            <p className="font-medium text-gray-600">
              Understand peak viewing times, popular combinations, and seasonal
              trends to make data-driven decisions.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/login"
            className="bg-[#5F7161] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#4C5B4F] transition-colors text-lg"
          >
            Get Started - Choose Your Path
          </Link>
        </div>
      </div>
    </section>
  );
}
