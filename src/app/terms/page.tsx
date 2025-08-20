"use client";

import LegalPageLayout from "@/components/LegalPageLayout";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <div className="space-y-8">
        <section>
          <p className="text-lg text-gray-700 mb-8">
            <strong>Effective Date:</strong> January 1, 2025
            <br />
            <strong>Last Updated:</strong> August 21, 2025
          </p>
          <p className="mb-6">
            Welcome to Dish Display! These Terms of Service ("Terms") govern
            your use of our website, platform, and services. By accessing or
            using our services, you agree to be bound by these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            1. Acceptance of Terms
          </h2>
          <p className="mb-4">
            By creating an account, accessing, or using Dish Display's services,
            you acknowledge that you have read, understood, and agree to be
            bound by these Terms and our Privacy Policy.
          </p>
          <p className="mb-6">
            If you do not agree to these Terms, you may not access or use our
            services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            2. Description of Service
          </h2>
          <p className="mb-4">
            Dish Display provides a visual menu platform that allows restaurants
            to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Create and manage digital menus with photos</li>
            <li>Generate QR codes for customer access</li>
            <li>Track analytics and customer engagement</li>
            <li>Participate in our customer review rewards program</li>
            <li>Access business insights and reporting tools</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            3. User Accounts
          </h2>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Account Registration
          </h3>
          <p className="mb-4">
            To use our services, you must create an account and provide
            accurate, complete, and current information. You are responsible
            for:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Maintaining the security of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
            <li>Keeping your account information up to date</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Account Eligibility
          </h3>
          <p className="mb-6">
            You must be at least 18 years old and have the legal authority to
            enter into this agreement on behalf of your business. You represent
            that all information provided is accurate and that you have the
            right to use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            4. Subscription and Payment
          </h2>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Subscription Plans
          </h3>
          <p className="mb-4">
            Our services are provided on a subscription basis. Current pricing
            and plan details are available on our website. We offer:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>14-day free trial for new accounts</li>
            <li>Monthly subscription plans</li>
            <li>Annual subscription plans with discounts</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Payment Terms
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Payments are processed through Stripe</li>
            <li>Subscriptions automatically renew unless cancelled</li>
            <li>All fees are non-refundable except as required by law</li>
            <li>We may change pricing with 30 days' notice</li>
            <li>Failed payments may result in service suspension</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Cancellation
          </h3>
          <p className="mb-6">
            You may cancel your subscription at any time through your account
            settings. Cancellation will take effect at the end of your current
            billing period.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            5. Content and Conduct
          </h2>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Your Content
          </h3>
          <p className="mb-4">
            You are solely responsible for all content you upload, including
            menu items, photos, descriptions, and other materials. You warrant
            that:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>You own or have the right to use all uploaded content</li>
            <li>Your content does not infringe on third-party rights</li>
            <li>Your content is accurate and not misleading</li>
            <li>Your content complies with applicable laws and regulations</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Prohibited Content
          </h3>
          <p className="mb-4">You may not upload or share content that:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Is illegal, harmful, or violates any laws</li>
            <li>Infringes on intellectual property rights</li>
            <li>Contains false or misleading information</li>
            <li>Is defamatory, threatening, or harassing</li>
            <li>Contains malware or malicious code</li>
            <li>Violates our community guidelines</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Prohibited Conduct
          </h3>
          <p className="mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Use our services for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt our services</li>
            <li>Create fake accounts or impersonate others</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Reverse engineer or copy our software</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            6. Review Rewards Program
          </h2>
          <p className="mb-4">
            Our review rewards program is subject to additional terms and
            conditions:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              Participation is voluntary and subject to eligibility requirements
            </li>
            <li>Rewards are determined at our sole discretion</li>
            <li>We reserve the right to modify or terminate the program</li>
            <li>Fraudulent activity will result in disqualification</li>
            <li>Reviews must be genuine and comply with platform guidelines</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            7. Intellectual Property
          </h2>
          <p className="mb-4">
            Our platform, including software, design, logos, and documentation,
            is protected by copyright, trademark, and other intellectual
            property laws. You may not:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Copy, modify, or distribute our proprietary materials</li>
            <li>Use our trademarks without permission</li>
            <li>Create derivative works based on our platform</li>
            <li>Remove or alter any proprietary notices</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            8. Privacy and Data Protection
          </h2>
          <p className="mb-6">
            Your privacy is important to us. Our collection and use of personal
            information is governed by our Privacy Policy, which is incorporated
            into these Terms by reference.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            9. Disclaimers and Limitations
          </h2>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Service Availability
          </h3>
          <p className="mb-4">
            We strive to provide reliable service but cannot guarantee 100%
            uptime. Our services are provided "as is" without warranties of any
            kind.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Limitation of Liability
          </h3>
          <p className="mb-6">
            To the fullest extent permitted by law, Dish Display shall not be
            liable for any indirect, incidental, special, or consequential
            damages, including lost profits, even if we have been advised of the
            possibility of such damages.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            10. Indemnification
          </h2>
          <p className="mb-6">
            You agree to indemnify and hold harmless Dish Display from any
            claims, damages, or expenses arising from your use of our services,
            violation of these Terms, or infringement of any third-party rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            11. Termination
          </h2>
          <p className="mb-4">
            We may terminate or suspend your account and access to our services
            at any time, with or without cause, and with or without notice, for
            conduct that we believe:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Violates these Terms or our policies</li>
            <li>Is harmful to other users or our business</li>
            <li>Exposes us to liability</li>
            <li>Is otherwise inappropriate</li>
          </ul>
          <p className="mb-6">
            Upon termination, your right to use our services will cease
            immediately, but you may export your data within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            12. Dispute Resolution
          </h2>
          <p className="mb-4">
            Any disputes arising from these Terms shall be resolved through:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Good faith negotiation between the parties</li>
            <li>Mediation if negotiation fails</li>
            <li>Binding arbitration as a last resort</li>
          </ul>
          <p className="mb-6">
            These Terms are governed by the laws of England and Wales.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            13. Changes to Terms
          </h2>
          <p className="mb-6">
            We may modify these Terms at any time by posting the updated version
            on our website. Material changes will be communicated via email or
            platform notification. Your continued use of our services after
            changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            14. Miscellaneous
          </h2>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Entire Agreement
          </h3>
          <p className="mb-4">
            These Terms, together with our Privacy Policy and Licensing
            Agreement, constitute the entire agreement between you and Dish
            Display.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Severability
          </h3>
          <p className="mb-4">
            If any provision of these Terms is found to be unenforceable, the
            remaining provisions will continue in full force and effect.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Assignment
          </h3>
          <p className="mb-6">
            You may not assign or transfer your rights under these Terms without
            our prior written consent. We may assign our rights and obligations
            under these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            15. Contact Information
          </h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="font-medium text-gray-900">Dish Display Ltd</p>
            <p className="text-gray-700">Email: support@dishdisplay.co.uk</p>
            <p className="text-gray-700">
              Address: 123 Restaurant Row, London, UK, SW1A 1AA
            </p>
            <p className="text-gray-700">Phone: +44 20 1234 5678</p>
          </div>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            By using Dish Display, you acknowledge that you have read and
            understood these Terms of Service and agree to be bound by them.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}
