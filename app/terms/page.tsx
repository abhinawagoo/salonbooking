import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and Conditions for salon services, bookings, and payments.',
}

async function getContactInfo() {
  try {
    const [site, location] = await Promise.all([
      prisma.siteCustomization.findFirst({ where: { id: 1 } }),
      prisma.location.findFirst({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    ])
    return {
      brandName: site?.brandName ?? 'Sasaram Shahnaz Salon',
      address: location?.address ?? 'Sasaram, Bihar, India',
      phone: location?.mobile ?? '',
      website: site?.invoiceWebsite ?? '',
    }
  } catch {
    return {
      brandName: 'Sasaram Shahnaz Salon',
      address: 'Sasaram, Bihar, India',
      phone: '',
      website: '',
    }
  }
}

export default async function TermsPage() {
  const { brandName, address, phone, website } = await getContactInfo()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          {brandName} · {address}
        </p>

        <div className="prose prose-gray prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Introduction</h2>
            <p>
              These Terms and Conditions (&quot;Terms&quot;) govern the use of services, bookings, and payments
              made at {brandName}. By booking an appointment or availing any of our services, you
              (&quot;Client&quot;) agree to be bound by these Terms. Please read them carefully before
              proceeding.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Services Offered</h2>
            <p>
              {brandName} provides beauty, grooming, and wellness services. Service availability may
              vary depending on staff availability, appointment schedule, and operational
              considerations. We reserve the right to refuse service where appropriate, including
              but not limited to situations involving inappropriate conduct or health and safety
              concerns.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Appointments and Cancellation Policy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clients must arrive on time for their scheduled appointments.</li>
              <li>Late arrival may result in reduced service time or rescheduling at the salon&apos;s discretion.</li>
              <li>The salon reserves the right to cancel or reschedule appointments due to unforeseen circumstances, staff unavailability, or operational requirements.</li>
              <li>Repeated no-shows or late cancellations may result in refusal of future bookings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Pricing and Taxes</h2>
            <p>
              All service prices are subject to change without prior notice. Applicable GST and
              other taxes will be charged as per prevailing government regulations. The final
              billing amount, including all taxes, will be displayed on the invoice at the time of
              payment.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Payments must be made at the time of service unless otherwise agreed in writing.</li>
              <li>The salon accepts cash, card, and digital payment methods.</li>
              <li>All online payments are processed through secure third-party payment gateways approved by relevant regulatory authorities.</li>
              <li>The salon is not responsible for payment gateway downtime, technical failures, or delays caused by third-party processors.</li>
              <li>Transactions once completed cannot be reversed except as per the Refund and Return Policy set forth below.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Refund and Return Policy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Services once provided are non-refundable.</li>
              <li>Refunds may be considered only in cases of genuine service deficiency and at the sole discretion of management.</li>
              <li>No refunds will be issued for change of mind or dissatisfaction where the service was rendered as described.</li>
              <li>Any approved refund will be processed within a reasonable timeframe, subject to payment processor and banking procedures.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Client Responsibilities</h2>
            <p>Clients must:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Inform staff of any allergies, skin conditions, or medical concerns before receiving any service.</li>
              <li>Follow aftercare instructions provided by the salon.</li>
              <li>Maintain respectful behaviour toward staff and other clients at all times.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Health and Safety Disclaimer</h2>
            <p>
              While {brandName} maintains high standards of hygiene and safety, the salon shall
              not be liable for any adverse reactions, allergies, or health issues arising due to
              undisclosed medical conditions, sensitivities, or failure to follow aftercare
              instructions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Limitation of Liability</h2>
            <p>
              {brandName} shall not be liable for: (a) indirect, incidental, or consequential
              damages; (b) loss or damage to personal belongings left or misplaced within the
              premises; (c) service dissatisfaction where reasonable care and skill was exercised
              in the provision of services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Privacy Policy</h2>
            <p>
              Customer personal information is collected only for appointment scheduling, billing,
              and communication purposes. Data will not be sold or shared with third parties except
              where required by law or for payment processing with authorised partners. We take
              reasonable measures to protect your data in accordance with applicable privacy
              regulations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Intellectual Property</h2>
            <p>
              All branding, logos, content, and materials associated with {brandName} are the
              property of the salon and may not be reproduced, used, or distributed without prior
              written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">12. Digital Payments Clause</h2>
            <p>
              All digital transactions are processed via authorised payment service providers in
              compliance with applicable regulations. By making a payment through our platform,
              you agree to comply with the terms of the payment processor and all relevant
              regulatory requirements. The salon does not store or have access to your full
              payment card details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">13. Dispute Resolution</h2>
            <p>
              Any disputes arising out of or in connection with these Terms or the services
              provided shall be subject to the exclusive jurisdiction of the courts at Sasaram,
              Bihar, India.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">14. Modification of Terms</h2>
            <p>
              {brandName} reserves the right to update these Terms at any time without prior
              notice. Updated Terms will be effective upon publication on this page. Continued use
              of our services after such changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">15. Contact Information</h2>
            <p>
              {brandName}<br />
              {address}
              {phone && <><br />Phone: {phone}</>}
              {website && <><br />Website: {website}</>}
            </p>
          </section>

          <section className="mt-8 pt-6 border-t border-gray-200">
            <p className="font-medium text-gray-900">
              By availing our services, you acknowledge that you have read, understood, and agreed
              to these Terms and Conditions.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
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
