import ClientLayout from './client-layout';

export const dynamic = 'force-dynamic';

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
