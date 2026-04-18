import Link from 'next/link';
import { requireRole } from '@/lib/guards';
import { SignOutButton } from '@/components/sign-out-button';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('admin');
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
        <div className="text-brand-700 font-semibold">PharmaTrack · Admin</div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/a/audit-log" className="text-slate-500 hover:text-slate-800">
            Audit log
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">{session.user.email}</span>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
