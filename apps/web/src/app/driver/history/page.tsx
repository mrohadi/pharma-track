import { requireRole } from '@/lib/guards';
import { getDriverByUserId } from '@pharmatrack/db';
import { listCompletedOrders, getTodayEarnings } from '@pharmatrack/db';
import { BottomNav } from '../bottom-nav';

function formatRupiah(cents: number | null): string {
  if (!cents) return 'Rp0';
  return `Rp${Math.round(cents / 100).toLocaleString('id-ID')}`;
}

function timeAgo(date: Date | null): string {
  if (!date) return '—';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

export default async function HistoryPage() {
  const session = await requireRole('driver');

  const driver = await getDriverByUserId(session.user.id);
  if (!driver) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-red-600">Profil driver tidak ditemukan.</p>
      </div>
    );
  }

  const [trips, todayEarningsCents] = await Promise.all([
    listCompletedOrders(driver.id),
    getTodayEarnings(driver.id),
  ]);

  const totalEarningsCents = trips.reduce((sum, t) => sum + (t.driverFeeCents ?? 0), 0);

  return (
    <div className="flex min-h-screen flex-col" style={{ paddingBottom: 80 }}>
      {/* Dark header */}
      <header className="bg-slate-800 px-4 pb-5 pt-12">
        <div className="text-xs font-medium text-slate-400">Pengiriman Anda</div>
        <div className="mt-0.5 text-xl font-extrabold tracking-tight text-white">Riwayat</div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Penghasilan Hari Ini', value: formatRupiah(todayEarningsCents) },
            { label: 'Total Perjalanan', value: String(trips.length) },
            { label: 'Total Penghasilan', value: formatRupiah(totalEarningsCents) },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-2 py-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <div className="text-sm font-extrabold text-white">{s.value}</div>
              <div className="mt-0.5 text-[10px] font-medium leading-tight text-slate-400">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </header>

      <div className="flex-1 px-4 pt-4">
        {trips.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-400">Belum ada riwayat pengiriman.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {trips.map((t) => (
              <li key={t.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-800">{t.patientName}</div>
                    {t.deliveryAddress && (
                      <div className="mt-0.5 truncate text-xs text-slate-400">
                        📍 {t.deliveryAddress}
                      </div>
                    )}
                    <div className="mt-0.5 truncate text-xs text-slate-400">
                      💊 {t.medicineText}
                    </div>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <div className="text-base font-extrabold text-green-600">
                      {formatRupiah(t.driverFeeCents)}
                    </div>
                    <div className="text-[11px] text-slate-400">{timeAgo(t.deliveredAt)}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                    ✓ Delivered
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
