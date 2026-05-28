import RequireSessionServer from '@/components/RequireSessionServer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <RequireSessionServer fallbackFrom="/settings">{children}</RequireSessionServer>;
}
