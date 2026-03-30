import ClientLayoutClient from '@/components/client/ClientLayoutClient';

export const metadata = {
  title: 'Client Dashboard | Yuvichaar Funnels',
  description: 'View your brand deliverables, videos, and payments.',
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayoutClient>{children}</ClientLayoutClient>;
}
