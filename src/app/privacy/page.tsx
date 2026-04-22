import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Plane Place Aviation and its marketing integrations.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ppa-white text-ppa-dark">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="font-bebas text-5xl mb-2 tracking-wide">Privacy Policy</h1>
        <p className="text-gray-400 mb-12">Last updated: March 31, 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section>
            <h2 className="font-bebas text-2xl text-white tracking-wide mb-3">1. Introduction</h2>
            <p>
              Plane Place Aviation, LLC (&quot;PPA,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the
              website ppa.aero and associated marketing tools. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you visit our website or
              interact with our services.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl text-white tracking-wide mb-3">2. Information We Collect</h2>
            <p className="mb-3">We may collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-white">Contact Information:</strong> Name, email address, phone number,
                and company name when you submit a quote request, contact form, or sign up for communications.
              </li>
              <li>
                <strong className="text-white">Website Usage Data:</strong> Pages visited, time on site, referring
                URLs, browser type, and device information collected through standard analytics tools.
              </li>
              <li>
                <strong className="text-white">Social Media Data:</strong> When you interact with our social media
                pages (Facebook, Instagram, LinkedIn), we may access publicly available profile information
                and engagement data through authorized platform APIs for marketing analytics purposes.
              </li>
              <li>
                <strong className="text-white">CRM Data:</strong> Business contact information stored in our
                customer relationship management system (Salesforce) related to service inquiries,
                maintenance records, and business communications.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-bebas text-2xl text-white tracking-wide mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To respond to service inquiries and provide maintenance quotes</li>
              <li>To communicate about scheduled maintenance, inspections, and service updates</li>
              <li>To send marketing communications (with your consent) about services relevant to your aircraft</li>
              <li>To analyze website traffic and improve our online presence</li>
              <li>To manage our social media presence and measure marketing effectiveness</li>
              <li>To comply with FAA regulatory requirements and maintain proper documentation</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bebas text-2xl text-white tracking-wide mb-3">4. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services that may process your data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Meta (Facebook/Instagram):</strong> We use the Meta Graph API to manage our business pages, publish content, and analyze engagement metrics on our Facebook and Instagram accounts.</li>
              <li><strong className="text-white">LinkedIn:</strong> We use the LinkedIn API to manage our company page, publish professional content, and analyze engagement with our business community.</li>
              <li><strong className="text-white">Salesforce:</strong> Customer relationship management for service inquiries and business communications.</li>
              <li><strong className="text-white">Cloudflare:</strong> Website hosting, security, and content delivery.</li>
              <li><strong className="text-white">Google Analytics:</strong> Website traffic analysis and visitor behavior insights.</li>
            </ul>
            <p className="mt-3">
              Each third-party service operates under its own privacy policy. We encourage you to review
              their respective policies for information on their data practices.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl text-white tracking-wide mb-3">5. Data Retention</h2>
            <p>
              We retain personal information for as long as necessary to fulfill the purposes outlined in
              this policy, comply with legal obligations (including FAA record-keeping requirements),
              resolve disputes, and enforce our agreements. Marketing analytics data is retained in
              aggregate form and does not include personally identifiable information.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl text-white tracking-wide mb-3">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal
              information. API access tokens and credentials are stored as encrypted environment secrets
              and are never exposed in client-side code. All data transmission occurs over encrypted
              HTTPS connections.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl text-white tracking-wide mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request access to the personal information we hold about you</li>
              <li>Request correction of inaccurate personal information</li>
              <li>Request deletion of your personal information (subject to legal retention requirements)</li>
              <li>Opt out of marketing communications at any time</li>
              <li>Withdraw consent for data processing where consent is the legal basis</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bebas text-2xl text-white tracking-wide mb-3">8. Cookies</h2>
            <p>
              Our website may use cookies and similar tracking technologies to enhance your browsing
              experience and collect usage data. You can control cookie preferences through your browser
              settings. Disabling cookies may affect certain website functionality.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl text-white tracking-wide mb-3">9. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not knowingly
              collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl text-white tracking-wide mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated &quot;Last updated&quot; date. Your continued use of our services after any
              changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl text-white tracking-wide mb-3">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, contact us at:
            </p>
            <div className="mt-4 p-6 border border-gray-700 rounded-lg">
              <p className="font-semibold text-white">Plane Place Aviation, LLC</p>
              <p>1650 Airport Dr, Hangar 98</p>
              <p>Cleburne, TX 76033</p>
              <p className="mt-2">Phone: (817) 768-8884</p>
              <p>Email: info@ppa.aero</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
