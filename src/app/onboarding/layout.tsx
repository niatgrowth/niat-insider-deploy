import type { Metadata } from 'next'
import RequireSessionServer from '@/components/RequireSessionServer'
import OnboardingHeader from '@/components/onboarding/OnboardingHeader'

export const metadata: Metadata = {
  title: 'Onboarding',
  description: 'Set up your NIAT Insider profile.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function OnboardingLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <RequireSessionServer fallbackFrom="/onboarding">
      <div className="flex min-h-screen flex-col bg-white">
        <OnboardingHeader />
        {children}
      </div>
    </RequireSessionServer>
  )
}
