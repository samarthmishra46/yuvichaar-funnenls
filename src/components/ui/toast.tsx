'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          fontFamily: 'inherit',
        },
        classNames: {
          success: 'border-l-4 !border-l-[var(--success)]',
          error: 'border-l-4 !border-l-[var(--error)]',
        },
      }}
    />
  );
}
