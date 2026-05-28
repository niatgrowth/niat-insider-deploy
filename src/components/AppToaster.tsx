'use client';

import { Toaster } from '@/components/ui/sonner';

/** Global Sonner host — mount once in root layout. */
export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4500}
      expand={false}
    />
  );
}
