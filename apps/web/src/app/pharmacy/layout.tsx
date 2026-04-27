import { PharmacySidebar } from './_components/pharmacy-sidebar.client';
import { PageTransition } from '@/components/page-transition';
import { getLocale } from 'next-intl/server';

export default async function PharmacyLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <div className="min-h-screen bg-slate-50 font-sans lg:flex">
      <PharmacySidebar initial="" pharmacyName="" userEmail="" locale={locale} />

      {/* Desktop spacer */}
      <div className="hidden lg:block" style={{ width: 240, flexShrink: 0 }} />

      {/* Main */}
      <div className="min-w-0 flex-1 overflow-auto">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
