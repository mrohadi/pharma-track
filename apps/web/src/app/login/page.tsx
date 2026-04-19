import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getSession, homeForRole } from '@/lib/session';
import type { Role } from '@pharmatrack/shared';
import { LoginForm } from './login-form';

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

  const t = await getTranslations('LoginPage');

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-brand-700 text-3xl font-bold">{t('title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
      </div>
      <LoginForm next={next} />
    </main>
  );
}
