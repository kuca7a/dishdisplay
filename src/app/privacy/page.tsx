"use client";

import LegalPageLayout from "@/components/LegalPageLayout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <div className="space-y-8">
        <section>
          <p className="text-lg text-gray-700 mb-8">
            <strong>Effective Date:</strong> January 1, 2025
            <br />
            <strong>Last Updated:</strong> August 21, 2025
          </p>
          <p className="mb-6">
            At Dish Display ("we," "our," or "us"), we are committed to
            protecting your privacy. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you use
            our website and services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Information We Collect
          </h2>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Personal Information
          </h3>
          <p className="mb-4">
            We may collect personal information that you voluntarily provide to
            us when you:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Register for an account</li>
            <li>Subscribe to our services</li>
            <li>Contact us for support</li>
            <li>Participate in our review rewards program</li>
            <li>Use our QR code scanning features</li>
          </ul>

          <p className="mb-4">This information may include:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Name and contact information</li>
            <li>Email address and phone number</li>
            <li>Restaurant details and business information</li>
            <li>Payment and billing information</li>
            <li>User-generated content (reviews, photos)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Automatically Collected Information
          </h3>
          <p className="mb-4">
            When you use our services, we may automatically collect:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Device information (IP address, browser type, device type)</li>
            <li>Usage data (pages visited, time spent, clicks)</li>
            <li>Location data (with your permission)</li>
            <li>Analytics and performance data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            How We Use Your Information
          </h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and maintain our services</li>
            <li>Process payments and manage subscriptions</li>
            <li>Send important updates and notifications</li>
            <li>Provide customer support</li>
            <li>Improve our platform and develop new features</li>
            <li>Administer our review rewards program</li>
            <li>Comply with legal obligations</li>
            <li>Protect against fraud and abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Information Sharing and Disclosure
          </h2>
          <p className="mb-4">
            We do not sell, trade, or rent your personal information to third
            parties. We may share your information in the following
            circumstances:
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Service Providers
          </h3>
          <p className="mb-4">
            We may share information with trusted third-party service providers
            who assist us in operating our platform, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Payment processors (Stripe)</li>
            <li>Cloud hosting providers</li>
            <li>Analytics services</li>
            <li>Customer support tools</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Legal Requirements
          </h3>
          <p className="mb-6">
            We may disclose your information if required by law or in response
            to valid legal processes.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Business Transfers
          </h3>
          <p className="mb-6">
            In the event of a merger, acquisition, or sale of assets, your
            information may be transferred as part of that transaction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Data Security
          </h2>
          <p className="mb-4">
            We implement appropriate technical and organizational security
            measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction. These measures
            include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication measures</li>
            <li>Employee training on data protection</li>
            <li>Secure data centers and hosting infrastructure</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Your Rights and Choices
          </h2>
          <p className="mb-4">
            Depending on your location, you may have the following rights
            regarding your personal information:
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Access and Portability
          </h3>
          <p className="mb-4">
            You can request a copy of the personal information we hold about
            you.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Correction
          </h3>
          <p className="mb-4">
            You can request that we correct inaccurate or incomplete
            information.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">Deletion</h3>
          <p className="mb-4">
            You can request that we delete your personal information, subject to
            certain exceptions.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Marketing Communications
          </h3>
          <p className="mb-6">
            You can opt out of marketing emails by using the unsubscribe link or
            contacting us directly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Cookies and Tracking
          </h2>
          <p className="mb-4">
            We use cookies and similar technologies to enhance your experience,
            analyze usage patterns, and provide personalized content. You can
            control cookie settings through your browser preferences.
          </p>
          <p className="mb-4">Types of cookies we use:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Essential cookies:</strong> Required for basic site
              functionality
            </li>
            <li>
              <strong>Analytics cookies:</strong> Help us understand how users
              interact with our site
            </li>
            <li>
              <strong>Functional cookies:</strong> Remember your preferences and
              settings
            </li>
            <li>
              <strong>Marketing cookies:</strong> Used to deliver relevant
              advertisements
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Children's Privacy
          </h2>
          <p>
            Our services are not intended for children under 13 years of age. We
            do not knowingly collect personal information from children under
            13. If we become aware that we have collected such information, we
            will take steps to delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            International Data Transfers
          </h2>
          <p>
            Your information may be transferred to and processed in countries
            other than your own. We ensure that such transfers comply with
            applicable data protection laws and that appropriate safeguards are
            in place.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Data Retention
          </h2>
          <p>
            We retain your personal information only as long as necessary to
            fulfill the purposes outlined in this Privacy Policy, comply with
            legal obligations, resolve disputes, and enforce our agreements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Changes to This Privacy Policy
          </h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify
            you of any material changes by posting the new Privacy Policy on
            this page and updating the "Last Updated" date.
          </p>
          <p>
            We encourage you to review this Privacy Policy periodically to stay
            informed about how we protect your information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Contact Us
          </h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy or our privacy
            practices, please contact us at:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="font-medium text-gray-900">Dish Display Ltd</p>
            <p className="text-gray-700">Email: support@dishdisplay.co.uk</p>
            <p className="text-gray-700">
              Address: 123 Restaurant Row, London, UK, SW1A 1AA
            </p>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
}
