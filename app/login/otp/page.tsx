// TODO: Re-enable when login/signup is implemented. Auth disabled for now (AUTH_DISABLED_FOR_NOW in lib/auth.ts)
import { Suspense } from 'react'
import OtpForm from './OtpForm'

export default function OtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900" />
        </div>
      }
    >
      <OtpForm />
    </Suspense>
  )
}
