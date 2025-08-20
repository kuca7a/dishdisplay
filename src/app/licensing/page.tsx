"use client";

import LegalPageLayout from "@/components/LegalPageLayout";

export default function LicensingPage() {
  return (
    <LegalPageLayout title="Licensing">
      <div className="space-y-8">
        <section>
          <p className="text-lg text-gray-700 mb-8">
            <strong>Effective Date:</strong> January 1, 2025
            <br />
            <strong>Last Updated:</strong> August 21, 2025
          </p>
          <p className="mb-6">
            This Licensing Agreement governs your use of the Dish Display
            platform, including our software, services, and any related
            materials. By using our services, you agree to be bound by the terms
            of this license.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Software License
          </h2>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Grant of License
          </h3>
          <p className="mb-4">
            Subject to your compliance with this Agreement, Dish Display grants
            you a limited, non-exclusive, non-transferable, revocable license to
            access and use our platform for your restaurant's business purposes.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            License Restrictions
          </h3>
          <p className="mb-4">You may not:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Copy, modify, or create derivative works of our software</li>
            <li>Reverse engineer, decompile, or disassemble our platform</li>
            <li>Rent, lease, or sublicense access to our services</li>
            <li>Use our platform for any illegal or unauthorized purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Remove or alter any proprietary notices or labels</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Content Licensing
          </h2>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Your Content
          </h3>
          <p className="mb-4">
            You retain ownership of all content you upload to our platform,
            including menu items, photos, descriptions, and other materials
            ("Your Content"). By uploading Your Content, you grant us a
            worldwide, non-exclusive, royalty-free license to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Display and distribute Your Content through our platform</li>
            <li>
              Make technical modifications necessary for platform operation
            </li>
            <li>Create backup copies for data protection purposes</li>
            <li>Use Your Content for platform analytics and improvements</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Our Content
          </h3>
          <p className="mb-4">
            All content provided by Dish Display, including software, design
            elements, logos, and documentation, remains our exclusive property
            and is protected by copyright and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Third-Party Licenses
          </h2>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Open Source Components
          </h3>
          <p className="mb-4">
            Our platform incorporates certain open source software components.
            These components are subject to their respective open source
            licenses, including but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>React.js (MIT License)</li>
            <li>Next.js (MIT License)</li>
            <li>Tailwind CSS (MIT License)</li>
            <li>Node.js (MIT License)</li>
            <li>Various npm packages and dependencies</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Third-Party Services
          </h3>
          <p className="mb-4">
            We integrate with various third-party services:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Stripe:</strong> Payment processing services
            </li>
            <li>
              <strong>Auth0:</strong> Authentication and user management
            </li>
            <li>
              <strong>Supabase:</strong> Database and backend services
            </li>
            <li>
              <strong>Vercel:</strong> Hosting and deployment services
            </li>
            <li>
              <strong>Google APIs:</strong> Maps and reviews integration
            </li>
          </ul>
          <p className="mb-6">
            Your use of these third-party services is subject to their
            respective terms of service and privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            QR Code License
          </h2>
          <p className="mb-4">
            The QR codes generated by our platform are provided for your
            exclusive use in connection with your restaurant's menu display. You
            may:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Print and display QR codes in your restaurant</li>
            <li>Include QR codes in your marketing materials</li>
            <li>Share QR codes with customers and partners</li>
          </ul>
          <p className="mb-6">
            QR codes remain functional only while your subscription is active.
            Upon termination of service, QR codes will cease to function.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            API and Integration License
          </h2>
          <p className="mb-4">
            If you use our API or integration tools, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Comply with our API documentation and rate limits</li>
            <li>Use APIs only for legitimate business purposes</li>
            <li>Not attempt to circumvent API restrictions</li>
            <li>Implement proper security measures for API keys</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Analytics and Data License
          </h2>
          <p className="mb-4">
            You grant us permission to collect and analyze usage data from your
            menu and customer interactions to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Provide analytics and insights to you</li>
            <li>Improve our platform and services</li>
            <li>Generate anonymized industry benchmarks</li>
            <li>Detect and prevent fraud or abuse</li>
          </ul>
          <p className="mb-6">
            All analytics data is processed in accordance with our Privacy
            Policy and applicable data protection laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibrand mb-4 text-gray-900">
            Trademark License
          </h2>
          <p className="mb-4">
            We grant you a limited license to use our trademarks and logos
            solely for the purpose of identifying our services in connection
            with your use of the platform. You may not:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Modify our trademarks or logos</li>
            <li>Use our branding in a way that suggests endorsement</li>
            <li>
              Use our trademarks for commercial purposes beyond platform
              integration
            </li>
            <li>Register similar trademarks or domain names</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Export Control
          </h2>
          <p className="mb-6">
            Our software and services may be subject to export control laws and
            regulations. You agree to comply with all applicable export control
            laws and not to export, re-export, or transfer our software or
            services to any prohibited country, entity, or person.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            License Termination
          </h2>
          <p className="mb-4">
            This license is effective until terminated. Your rights under this
            license will terminate automatically if you fail to comply with any
            of its terms. Upon termination:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>You must cease all use of our platform and services</li>
            <li>You must delete any downloaded software or materials</li>
            <li>Your QR codes will become non-functional</li>
            <li>You may export your data within 30 days of termination</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Updates and Modifications
          </h2>
          <p className="mb-6">
            We may update our software and modify this licensing agreement from
            time to time. Continued use of our services after such updates
            constitutes acceptance of the modified terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Support and Maintenance
          </h2>
          <p className="mb-6">
            Your subscription includes access to our support services and
            regular platform updates. Support is provided during business hours
            and subject to our support policies outlined in our Terms of
            Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Contact Information
          </h2>
          <p className="mb-4">
            For questions about licensing or to request additional permissions,
            please contact us at:
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
