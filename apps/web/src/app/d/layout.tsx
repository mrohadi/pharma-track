import { requireRole } from '@/lib/guards';
import { SignOutButton } from '@/components/sign-out-button';
import { PushSubscriptionManager } from './push-subscription-manager';

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('driver');
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="text-brand-700 font-semibold">PharmaTrack</div>
        <div className="flex items-center gap-3 text-sm">
          <PushSubscriptionManager />
          <span className="text-slate-500">{session.user.email}</span>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
