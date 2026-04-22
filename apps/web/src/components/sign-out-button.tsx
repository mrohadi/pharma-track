'use client';

import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut();
        router.replace('/login');
        router.refresh();
      }}
      className={
        className ?? 'rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50'
      }
    >
      Sign out
    </button>
  );
}
