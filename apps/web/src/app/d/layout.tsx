import type { Metadata } from 'next';
import { requireRole } from '@/lib/guards';
import { PushSubscriptionManager } from './push-subscription-manager';

export const metadata: Metadata = {
  title: 'PharmaTrack Driver',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PharmaTrack',
  },
};

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  await requireRole('driver');
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* keeps push subscription alive */}
      <div className="sr-only">
        <PushSubscriptionManager />
      </div>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
