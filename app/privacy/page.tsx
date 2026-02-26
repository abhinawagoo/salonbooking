import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Shahnaz Salon - how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Effective Date: 26 February 2026
        </p>

        <div className="prose prose-gray prose-sm max-w-none space-y-6 text-gray-700">
          <p>
            <strong>Business Name:</strong> SHAHNAZZ BEAUTY PARLOUR<br />
            <strong>Website:</strong>{' '}
            <a href="https://www.shahnazsalonsasaram.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
              https://www.shahnazsalonsasaram.com/
            </a>
          </p>
          <p>
            At SHAHNAZZ BEAUTY PARLOUR, we respect your privacy and are committed to protecting your personal information.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>We collect only the following information:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Customer Name</li>
              <li>Mobile Number</li>
              <li>Service history (services availed at our salon)</li>
            </ul>
            <p className="mt-3">
              We do not collect or store debit/credit card details, UPI PIN, banking information, or any sensitive personal data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Purpose of Collecting Information</h2>
            <p>We collect your information only to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Book and manage appointments</li>
              <li>Send booking confirmations</li>
              <li>Send SMS or WhatsApp updates</li>
              <li>Verify customer identity during visits</li>
              <li>Maintain service history for better customer experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Payment Information</h2>
            <p>
              If you make payments online, transactions are processed securely through authorized third-party payment gateways such as PhonePe.
            </p>
            <p className="mt-2">
              We do not store your debit/credit card details, UPI PIN, or banking credentials on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Data Sharing</h2>
            <p>We do not sell, rent, or trade your personal information.</p>
            <p className="mt-2">Your information may only be shared:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>With SMS or WhatsApp service providers for communication purposes</li>
              <li>With payment gateways for processing transactions</li>
              <li>When required by law or government authorities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Data Security</h2>
            <p>
              We take reasonable administrative and technical measures to protect your information from unauthorized access, misuse, or disclosure.
            </p>
            <p className="mt-2">
              Customer data is used strictly for salon operations and service improvement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p>You may request:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Correction of your mobile number or name</li>
              <li>Deletion of your customer profile (subject to business record requirements)</li>
              <li>Opt-out from promotional messages</li>
            </ul>
            <p className="mt-3">
              To request any changes, please contact us directly.
            </p>
          </section>

          <section className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Contact Information</h2>
            <p>
              <strong>SHAHNAZZ BEAUTY PARLOUR</strong><br />
              Sasaram, Bihar, India<br />
              Phone: <a href="tel:+918877799982" className="text-primary-600 hover:underline">+91 8877799982</a>
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-4">
          <Link
            href="/terms"
            className="inline-flex items-center text-primary-600 font-medium hover:underline"
          >
            Terms &amp; Conditions
          </Link>
          <Link
            href="/refund"
            className="inline-flex items-center text-primary-600 font-medium hover:underline"
          >
            Refund &amp; Cancellation
          </Link>
          <Link
            href="/"
            className="inline-flex items-center text-primary-600 font-medium hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
