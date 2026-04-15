'use client';

import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut();
        router.replace('/login');
        router.refresh();
      }}
      className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
    >
      Sign out
    </button>
  );
}
