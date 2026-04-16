import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { getSession } from '@/lib/session';
import { exportOrdersForPharmacy, type ExportPharmacyOrderFilters } from '@pharmatrack/db';
import { OrderStatus } from '@pharmatrack/shared';
import { ORDER_STATUS_LABELS } from '@/lib/format';

/**
 * GET /api/export/pharmacy-orders?status=...&from=...&to=...
 *
 * Pharmacy-only. Returns a CSV of that pharmacy's orders.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user || (session.user.role as string) !== 'pharmacy') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const pharmacyId = session.user.pharmacyId as string | undefined;
  if (!pharmacyId) {
    return NextResponse.json({ error: 'No pharmacy linked' }, { status: 400 });
  }

  const sp = req.nextUrl.searchParams;
  const filters: ExportPharmacyOrderFilters = { pharmacyId };

  const statusParsed = OrderStatus.safeParse(sp.get('status'));
  if (statusParsed.success) filters.status = statusParsed.data;

  const from = sp.get('from');
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) filters.from = from;

  const to = sp.get('to');
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) filters.to = to;

  const { rows, total } = await exportOrdersForPharmacy(filters);

  const csvRows = rows.map((r) => ({
    'Order ID': r.id,
    'Patient Name': r.patientName,
    'Patient Phone': r.patientPhone,
    Medicine: r.medicineText,
    'Delivery Address': r.deliveryAddress ?? '',
    Status: ORDER_STATUS_LABELS[r.status] ?? r.status,
    Driver: r.driverName ?? '',
    'Failure Reason': r.failureReason ?? '',
    'Has POD Photo': r.podPhotoUrl ? 'Yes' : 'No',
    'Created At': r.createdAt.toISOString(),
    'Delivered At': r.deliveredAt?.toISOString() ?? '',
  }));

  const csv = Papa.unparse(csvRows);

  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `pharmacy_orders_${ts}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'X-Total-Rows': String(total),
    },
  });
}
