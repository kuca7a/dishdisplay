import React from "react";
import Link from "next/link";

export default function WhyChooseUsSection() {
  return (
    <>
      {/* Benefits Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-16">
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
              <h3 className="text-xl font-semibold mb-4">Increased Orders</h3>
              <p className="text-gray-600 font-medium">
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
              <h3 className="text-xl font-semibold mb-4">Easy Management</h3>
              <p className="text-gray-600 font-medium">
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
              <h3 className="text-xl font-semibold mb-4">
                Customer Satisfaction
              </h3>
              <p className="text-gray-600 font-medium">
                Reduce order confusion and improve dining experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#ffffff] text-black">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-8">
            Ready to Transform Your Menu?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto font-medium">
            Join hundreds of restaurants already using our platform to showcase
            their dishes and delight their customers.
          </p>
          <Link
            href="/login"
            className="bg-[#5F7161] text-white px-8 py-4 rounded-lg font-medium hover:cursor-pointer hover:bg-[#4C5B4F] transition-colors text-lg"
          >
            Get Started - Choose Your Path
          </Link>
        </div>
      </section>
    </>
  );
}
