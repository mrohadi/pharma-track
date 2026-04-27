import { getSession } from '@/lib/session';
import { listAllPharmacies, listAllDrivers } from '@pharmatrack/db';
import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';

const getPendingCount = unstable_cache(
  async () => {
    const [pharmacies, drivers] = await Promise.all([listAllPharmacies(), listAllDrivers()]);
    return (
      pharmacies.filter((p) => p.verificationStatus === 'pending').length +
      drivers.filter((d) => d.verificationStatus === 'pending').length
    );
  },
  ['admin-pending-count'],
  { revalidate: 30 },
);

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user;
  const base = { name: user.name ?? user.email ?? '', email: user.email ?? '', role: user.role };

  if (user.role === 'admin') {
    const pendingCount = await getPendingCount();
    return NextResponse.json({ ...base, pendingCount });
  }

  return NextResponse.json(base);
}
