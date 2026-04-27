import { AdminSidebar } from './sidebar-nav.client';
import { PageTransition } from '@/components/page-transition';
import { getLocale } from 'next-intl/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <div
      style={{
        background: 'oklch(0.97 0.008 250)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        minHeight: '100vh',
      }}
    >
      <AdminSidebar userName="" userEmail="" pendingCount={0} locale={locale} />
      <div className="lg:ml-[240px]" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
