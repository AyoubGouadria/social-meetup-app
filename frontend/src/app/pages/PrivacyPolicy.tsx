import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          <p><strong>Last Updated:</strong> February 25, 2026</p>
          <p><strong>Effective Date:</strong> February 25, 2026</p>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Welcome to Meetly ("we," "our," or "us"). We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our social connection platform.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            This policy complies with the General Data Protection Regulation (GDPR) and other applicable data protection laws in Germany and the European Union.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Data Controller</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>Company Name:</strong> Meetly Social Platform
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>Location:</strong> Germany
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Contact:</strong> privacy@meetly.com
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Information We Collect</h2>
          
          <h3 className="text-lg font-medium mb-3 mt-6">3.1 Personal Information</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Account Information:</strong> Name, email address, password (encrypted), city, languages, date of birth, gender</li>
            <li><strong>Profile Information:</strong> Avatar, bio, occupation, education, interests, relationship status</li>
            <li><strong>Contact Information:</strong> Phone number (optional), social media links (optional)</li>
          </ul>

          <h3 className="text-lg font-medium mb-3 mt-6">3.2 Usage Data</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Events created, joined, and participated in</li>
            <li>Messages sent and received</li>
            <li>User interactions (likes, join requests, notifications)</li>
            <li>Last active timestamp</li>
          </ul>

          <h3 className="text-lg font-medium mb-3 mt-6">3.3 Technical Data</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Cookies and similar technologies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. How We Use Your Information</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">We use your personal data for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Service Provision:</strong> To create and manage your account, facilitate social connections, and provide event management features</li>
            <li><strong>Communication:</strong> To send you notifications, respond to inquiries, and communicate about events</li>
            <li><strong>Personalization:</strong> To customize your experience and show relevant events and users</li>
            <li><strong>Security:</strong> To protect against fraud, unauthorized access, and ensure platform safety</li>
            <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms of service</li>
            <li><strong>Analytics:</strong> To improve our services and understand user behavior (only with your consent)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Legal Basis for Processing (GDPR)</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">We process your personal data based on:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Consent:</strong> For analytics and marketing communications (Article 6(1)(a) GDPR)</li>
            <li><strong>Contract Performance:</strong> To provide our services (Article 6(1)(b) GDPR)</li>
            <li><strong>Legal Obligation:</strong> To comply with laws (Article 6(1)(c) GDPR)</li>
            <li><strong>Legitimate Interests:</strong> For fraud prevention and service improvement (Article 6(1)(f) GDPR)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Data Sharing and Disclosure</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">We may share your information with:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Other Users:</strong> Your profile information is visible to other platform users</li>
            <li><strong>Service Providers:</strong> Cloud hosting (MongoDB Atlas), image storage (Cloudinary)</li>
            <li><strong>Legal Authorities:</strong> When required by law or to protect rights and safety</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            <strong>We do not sell your personal data to third parties.</strong>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Your GDPR Rights</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">Under GDPR, you have the following rights:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Right to Access (Article 15):</strong> Request a copy of your personal data</li>
            <li><strong>Right to Rectification (Article 16):</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Right to Erasure (Article 17):</strong> Request deletion of your data ("right to be forgotten")</li>
            <li><strong>Right to Data Portability (Article 20):</strong> Export your data in a structured format</li>
            <li><strong>Right to Object (Article 21):</strong> Object to certain types of processing</li>
            <li><strong>Right to Restrict Processing (Article 18):</strong> Limit how we use your data</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for analytics/marketing at any time</li>
          </ul>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>To exercise your rights:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Use the "Export My Data" feature in your account settings</li>
              <li>Use the "Delete Account" feature for data erasure</li>
              <li>Contact us at <a href="mailto:privacy@meetly.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@meetly.com</a></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. Data Retention</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We retain your personal data for as long as your account is active or as needed to provide services. Specifically:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Active Accounts:</strong> Data retained while account is active</li>
            <li><strong>Inactive Accounts:</strong> Automatically deleted after 2 years of inactivity</li>
            <li><strong>Legal Requirements:</strong> Some data may be retained longer to comply with legal obligations</li>
            <li><strong>Deleted Accounts:</strong> All data permanently deleted within 30 days of deletion request</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">9. Data Security</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Encryption:</strong> Passwords are hashed using bcrypt; data in transit uses HTTPS</li>
            <li><strong>Access Controls:</strong> Limited employee access to personal data</li>
            <li><strong>Security Monitoring:</strong> Rate limiting, XSS protection, NoSQL injection prevention</li>
            <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">10. Cookies and Tracking</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use the following types of cookies:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Necessary Cookies:</strong> Essential for authentication and security (cannot be disabled)</li>
            <li><strong>Analytics Cookies:</strong> Track usage patterns (requires your consent)</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            You can manage cookie preferences through our Cookie Consent banner.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">11. International Data Transfers</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Your data is primarily stored within the European Union. If data is transferred outside the EU, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by the European Commission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">12. Children's Privacy</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Our service is not intended for users under 18 years of age. We do not knowingly collect personal data from children. If you believe we have collected data from a child, please contact us immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">13. Changes to This Policy</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our platform. Your continued use after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">14. Contact Us</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights, contact us:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Email:</strong> <a href="mailto:privacy@meetly.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@meetly.com</a></li>
              <li><strong>Data Protection Officer:</strong> <a href="mailto:dpo@meetly.com" className="text-blue-600 dark:text-blue-400 hover:underline">dpo@meetly.com</a></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">15. Supervisory Authority</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You have the right to lodge a complaint with a supervisory authority if you believe your data protection rights have been violated. In Germany, you can contact:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Die Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI)</strong><br />
              Website: <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">www.bfdi.bund.de</a>
            </p>
          </div>
        </section>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-12">
          <p className="text-center text-gray-600 dark:text-gray-400">
            © 2026 Meetly. All rights reserved. | <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}
