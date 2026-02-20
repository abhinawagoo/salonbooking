import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Terms &amp; Conditions</h1>
        <p className="text-gray-600 mb-4">
          Welcome to Shahnaz Salon. By using our booking service and website you agree to these terms.
          We reserve the right to update them at any time. For questions, contact us at support@sasaramshahnazsalon.com.
        </p>
        <Link href="/" className="text-primary-600 font-medium hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  )
}
