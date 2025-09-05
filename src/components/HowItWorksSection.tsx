import React from "react";

export default function HowItWorksSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-semibold text-center mb-16">
          How Dish Display Works
        </h2>
        <div className="flex justify-center">
          <div className="max-w-2xl space-y-12">
            <div className="flex items-start space-x-4">
              <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Create Your Account
                </h3>
                <p className="text-gray-600 font-medium">
                  Sign up for Dish Display and create your restaurant&apos;s
                  profile. Upload your menu items with high-quality photos.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Get Your QR Code</h3>
                <p className="text-gray-600 font-medium">
                  We&apos;ll provide you with a unique QR code that links
                  directly to your restaurant&apos;s menu on Dish Display.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Print on Your Menu
                </h3>
                <p className="text-gray-600 font-medium">
                  Add the QR code to your physical menu. Customers can scan it
                  to instantly view your dishes with photos.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Delight Your Customers
                </h3>
                <p className="text-gray-600 font-medium">
                  Watch as your customers make more confident ordering decisions
                  with visual menu items and have a better dining experience.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium">5</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Customers Join Rewards Program
                </h3>
                <p className="text-gray-600 font-medium">
                  After their meal, customers can join our diner rewards program
                  to track their dining experiences and earn points for
                  restaurant visits.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium">6</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Grow Your Online Presence
                </h3>
                <p className="text-gray-600 font-medium">
                  Engaged customers naturally share their dining experiences,
                  creating authentic word-of-mouth marketing that attracts new
                  diners to your restaurant.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
