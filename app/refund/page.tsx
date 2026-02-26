import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'Refund and cancellation policy for SHAHNAZZ BEAUTY PARLOUR - appointment cancellation, refund requests, and contact information.',
}

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-sm text-gray-500 mb-2">
          Effective Date: 26 February 2026
        </p>
        <p className="text-sm text-gray-500 mb-8">
          <strong>Business Name:</strong> SHAHNAZZ BEAUTY PARLOUR<br />
          <strong>Website:</strong>{' '}
          <a href="https://www.shahnazsalonsasaram.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
            https://www.shahnazsalonsasaram.com/
          </a>
        </p>

        <div className="prose prose-gray prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Appointment Cancellation</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Appointments may be cancelled or rescheduled up to 24 hours before the scheduled time.</li>
              <li>Late cancellations or no-shows may result in forfeiture of the booking amount.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Refund Policy</h2>
            <p>SHAHNAZZ BEAUTY PARLOUR does not provide automatic refunds for any bookings or services.</p>
            <p className="mt-2">If a customer wishes to request a refund due to cancellation, payment issues, or service-related concerns:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>The customer must directly contact the salon owner/management.</li>
              <li>Refund requests will be reviewed on a case-by-case basis.</li>
              <li>Approval or rejection of refund requests is solely at the discretion of SHAHNAZZ BEAUTY PARLOUR.</li>
              <li>If approved, refunds will be processed to the original payment method within 7–10 business days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. No Automatic Refunds</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Payments once made are not automatically refundable.</li>
              <li>Change of mind after booking or service completion does not guarantee a refund.</li>
              <li>No-shows are non-refundable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Failed or Duplicate Payments</h2>
            <p>If a payment is deducted but booking confirmation is not received:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Customers must contact the salon immediately.</li>
              <li>After verification, appropriate action (refund or booking confirmation) will be taken.</li>
            </ul>
          </section>

          <section className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Contact for Refund or Issues</h2>
            <p>
              <strong>SHAHNAZZ BEAUTY PARLOUR</strong><br />
              Sasaram, Bihar<br />
              <a href="tel:+918877799982" className="text-primary-600 hover:underline">📞 +91 8877799982</a>
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
            href="/privacy"
            className="inline-flex items-center text-primary-600 font-medium hover:underline"
          >
            Privacy Policy
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
