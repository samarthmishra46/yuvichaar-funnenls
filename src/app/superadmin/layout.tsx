import SuperadminLayoutClient from '@/components/superadmin/SuperadminLayoutClient';

export const metadata = {
  title: 'Superadmin | Yuvichaar Funnels',
  description: 'Yuvichaar Funnels superadmin — finances and full access.',
};

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperadminLayoutClient>{children}</SuperadminLayoutClient>;
}
