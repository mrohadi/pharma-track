import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { SignOutButton } from '@/components/sign-out-button';

export default async function PendingVerificationPage() {
  const session = await getSession();

  // Unauthenticated users have no pending verification to show.
  if (!session?.user) {
    redirect('/login');
  }

  // Admin and approved users shouldn't land here — send them home.
  const role = session.user.role as string | undefined;
  if (role === 'admin') {
    redirect('/a');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
        ⏳
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Menunggu Verifikasi</h1>
        <p className="mt-2 text-sm text-slate-500">
          Akun Anda sedang ditinjau oleh tim admin PharmaTrack. Anda akan mendapat notifikasi
          setelah akun disetujui dan dapat digunakan.
        </p>
      </div>
      <div className="w-full rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium">Apa selanjutnya?</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-left">
          <li>Admin akan memverifikasi dokumen KYC Anda</li>
          <li>Proses verifikasi biasanya 1–2 hari kerja</li>
          <li>Setelah disetujui, masuk kembali ke akun Anda</li>
        </ul>
      </div>
      <p className="text-xs text-slate-400">
        Masuk sebagai: <span className="font-medium">{session.user.email}</span>
      </p>
      <SignOutButton />
    </main>
  );
}
