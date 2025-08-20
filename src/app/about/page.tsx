"use client";

import LegalPageLayout from "@/components/LegalPageLayout";

export default function AboutPage() {
  return (
    <LegalPageLayout title="About Dish Display">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Our Mission
          </h2>
          <p className="mb-4">
            At Dish Display, we believe that every meal should be a delightful
            experience. Our mission is to bridge the gap between restaurants and
            their customers by providing a visual menu platform that helps
            diners make confident food choices while helping restaurants
            showcase their culinary artistry.
          </p>
          <p>
            We're transforming the dining experience by bringing menus to life
            with high-quality photos, making it easier for customers to discover
            and order dishes they'll love.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            What We Do
          </h2>
          <p className="mb-4">
            Dish Display is a comprehensive visual menu platform that allows
            restaurants to create stunning, photo-rich menus accessible via QR
            codes. Our platform combines beautiful presentation with powerful
            analytics to help restaurants understand their customers better.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Visual menu creation with high-quality food photography</li>
            <li>QR code generation for seamless customer access</li>
            <li>Advanced analytics to track menu performance</li>
            <li>Customer reward system to encourage reviews</li>
            <li>Mobile-optimized viewing experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Our Story
          </h2>
          <p className="mb-4">
            Founded in 2024, Dish Display was born from the simple observation
            that customers often struggle to visualize menu items, leading to
            hesitation and sometimes disappointment with their orders. We saw an
            opportunity to solve this problem while helping restaurants showcase
            their best dishes.
          </p>
          <p>
            Today, we serve hundreds of restaurants across the UK, helping them
            increase customer satisfaction, boost orders, and build stronger
            relationships with their diners through our innovative visual menu
            platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Why Choose Dish Display?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                For Restaurants
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Increase order confidence and sales</li>
                <li>• Reduce order confusion and returns</li>
                <li>• Gain valuable customer insights</li>
                <li>• Enhance your online presence</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                For Customers
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• See exactly what you're ordering</li>
                <li>• Discover new dishes with confidence</li>
                <li>• Earn rewards for reviews</li>
                <li>• Enjoy better dining experiences</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Our Values
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Innovation
              </h3>
              <p className="text-gray-700">
                We continuously improve our platform with cutting-edge features
                that benefit both restaurants and diners.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quality</h3>
              <p className="text-gray-700">
                We're committed to providing high-quality visual experiences
                that accurately represent each restaurant's unique offerings.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Support</h3>
              <p className="text-gray-700">
                We provide exceptional customer service to ensure every
                restaurant succeeds on our platform.
              </p>
            </div>
          </div>
        </section>

        <section className="text-center bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Ready to Get Started?
          </h2>
          <p className="mb-6 text-gray-700">
            Join hundreds of restaurants already using Dish Display to showcase
            their menus and delight their customers.
          </p>
          <a
            href="/profile"
            className="bg-[#5F7161] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#4C5B4F] transition-colors inline-block"
          >
            Start Your Free Trial
          </a>
        </section>
      </div>
    </LegalPageLayout>
  );
}
