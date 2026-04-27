import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@pharmatrack/db';
import { sendEmail } from '@/lib/ses';

const CRON_SECRET = process.env.CRON_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_REPORT_EMAIL;

/**
 * GET /api/cron/daily-report
 *
 * Sends a daily summary email to ADMIN_REPORT_EMAIL.
 * Auth: Authorization: Bearer <CRON_SECRET>
 *
 * Schedule with an external cron (Lightsail, cron-job.org, etc.):
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain/api/cron/daily-report
 *
 * Runs at 23:59 WIB daily via cron: 59 16 * * * (UTC)
 */
export async function GET(req: NextRequest) {
  if (!CRON_SECRET) {
    return NextResponse.json({ error: 'Daily report endpoint not configured' }, { status: 503 });
  }
  if (!ADMIN_EMAIL) {
    return NextResponse.json({ error: 'ADMIN_REPORT_EMAIL not set' }, { status: 503 });
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = await getDashboardStats();
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const deliveryRate =
    stats.todayOrders > 0 ? Math.round((stats.deliveredToday / stats.todayOrders) * 100) : 0;

  const statusTable = stats.statusBreakdown
    .map(
      (s) =>
        `<tr><td style="padding:4px 12px;color:#475569">${s.status}</td><td style="padding:4px 12px;font-weight:600">${s.count}</td></tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"></head>
<body style="font-family:sans-serif;background:#f5f5f5;margin:0;padding:24px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <h1 style="margin-top:0;font-size:20px;color:#0f172a">Laporan Harian PharmaTrack</h1>
    <p style="color:#64748b;font-size:14px">${today}</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">

    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px">
      ${[
        { label: 'Order Hari Ini', value: stats.todayOrders },
        { label: 'Terkirim', value: stats.deliveredToday },
        { label: 'Tingkat Keberhasilan', value: `${deliveryRate}%` },
        { label: 'Driver Aktif', value: stats.activeDrivers },
        { label: 'Apotek Aktif', value: stats.activePharmacies },
      ]
        .map(
          (s) => `
        <div style="background:#f8fafc;border-radius:8px;padding:14px 18px;min-width:120px">
          <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.06em">${s.label}</div>
          <div style="font-size:24px;font-weight:800;color:#0f172a;margin-top:4px">${s.value}</div>
        </div>`,
        )
        .join('')}
    </div>

    <h2 style="font-size:15px;color:#0f172a;margin-bottom:12px">Breakdown Status (All Time)</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead>
        <tr style="background:#f8fafc">
          <th style="padding:8px 12px;text-align:left;color:#64748b;font-weight:600">Status</th>
          <th style="padding:8px 12px;text-align:left;color:#64748b;font-weight:600">Jumlah</th>
        </tr>
      </thead>
      <tbody>${statusTable}</tbody>
    </table>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#94a3b8;font-size:12px;margin:0">PharmaTrack &mdash; Laporan otomatis dikirim setiap hari pukul 23:59 WIB</p>
  </div>
</body>
</html>`;

  const text = `Laporan Harian PharmaTrack — ${today}
Order hari ini: ${stats.todayOrders}
Terkirim: ${stats.deliveredToday}
Tingkat keberhasilan: ${deliveryRate}%
Driver aktif: ${stats.activeDrivers}
Apotek aktif: ${stats.activePharmacies}`;

  const result = await sendEmail({
    to: ADMIN_EMAIL,
    subject: `[PharmaTrack] Laporan Harian — ${today}`,
    text,
    html,
  });

  if (!result.success) {
    console.error('[DailyReport] Email failed:', result.error);
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sentTo: ADMIN_EMAIL });
}
