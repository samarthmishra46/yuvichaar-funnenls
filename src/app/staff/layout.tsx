import SessionProvider from '@/components/providers/SessionProvider';
import { Toaster } from '@/components/ui/toast';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  );
}
