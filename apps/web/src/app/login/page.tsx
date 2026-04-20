import { redirect } from 'next/navigation';
import { getSession, homeForRole } from '@/lib/session';
import type { Role } from '@pharmatrack/shared';
import { AuthForm } from './auth-form.client';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  const { next } = await searchParams;

  if (session?.user) {
    redirect(next ?? homeForRole(session.user.role as Role));
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-brand-700 text-3xl font-bold">PharmaTrack</h1>
        <p className="mt-1 text-sm text-slate-500">Masuk atau daftar untuk melanjutkan</p>
      </div>
      <AuthForm next={next} />
    </main>
  );
}
