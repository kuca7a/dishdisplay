import React from "react";

export default function ReviewRewardsSection() {
  return (
    <section className="bg-[#ffffff] py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold mb-6">
            Reward Customers for Authentic Reviews
          </h2>
          <p className="text-xl font-medium max-w-3xl mx-auto text-gray-600">
            Our unique reward system motivates customers to leave more reviews
            with photos, boosting your restaurant's online presence and
            attracting new diners.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* How It Works */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold mb-6 text-center">
              How The Reward System Works
            </h3>
            <div className="flex justify-center">
              <div className="max-w-2xl space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">
                      Customer Creates Profile
                    </h4>
                    <p className="text-gray-600 font-medium">
                      Diners sign up and track their reviews across all Dish
                      Display restaurants.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">
                      Reviews Earn Points
                    </h4>
                    <p className="text-gray-600 font-medium">
                      Highly detailed reviews with photos earn more points,
                      encouraging quality feedback.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">
                      Monthly Competition
                    </h4>
                    <p className="text-gray-600 font-medium">
                      Top reviewers compete for discount vouchers from
                      participating restaurants.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">
                      Winners Get Rewards
                    </h4>
                    <p className="text-gray-600 font-medium">
                      Monthly winners receive vouchers, driving repeat visits
                      and new customer discovery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Benefits */}
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-6">
                Restaurant Benefits
              </h3>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-[#5F7161] w-8 h-8 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
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
                  <h4 className="font-semibold text-lg">More Reviews</h4>
                </div>
                <p className="text-gray-600 font-medium">
                  Customers actively seek out your restaurant to earn points,
                  generating authentic reviews.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-lg">Photo Reviews</h4>
                </div>
                <p className="text-gray-600 font-medium">
                  Higher points for photo reviews mean more visual content
                  showcasing your dishes.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-[#4C5B4F] w-8 h-8 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-lg">
                    New Customer Discovery
                  </h4>
                </div>
                <p className="text-gray-600 font-medium">
                  Winners share their experiences, bringing their network to
                  discover your restaurant.
                </p>
              </div>
            </div>

            <div className="bg-[#5F7161] text-white rounded-lg p-6 text-center">
              <h4 className="font-semibold text-xl mb-3">
                Marketing That Pays For Itself
              </h4>
              <p className="font-medium">
                Sponsor monthly prizes for less than traditional advertising,
                while generating authentic customer content and reviews.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
