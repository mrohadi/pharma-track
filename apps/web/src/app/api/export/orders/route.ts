import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { getSession } from '@/lib/session';
import { exportOrdersForAdmin, type ExportOrderFilters } from '@pharmatrack/db';
import { OrderStatus } from '@pharmatrack/shared';
import { ORDER_STATUS_LABELS } from '@/lib/format';

/**
 * GET /api/export/orders?status=...&pharmacyId=...&from=...&to=...
 *
 * Admin-only. Returns a CSV file as a download attachment.
 * Includes an audit-friendly filename with the current timestamp.
 */
export async function GET(req: NextRequest) {
  // Auth: admin only
  const session = await getSession();
  if (!session?.user || (session.user.role as string) !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Parse filters from query params
  const sp = req.nextUrl.searchParams;
  const filters: ExportOrderFilters = {};

  const statusParsed = OrderStatus.safeParse(sp.get('status'));
  if (statusParsed.success) filters.status = statusParsed.data;

  const pharmacyId = sp.get('pharmacyId');
  if (pharmacyId && /^[0-9a-f-]{36}$/i.test(pharmacyId)) {
    filters.pharmacyId = pharmacyId;
  }

  const from = sp.get('from');
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) filters.from = from;

  const to = sp.get('to');
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) filters.to = to;

  const { rows, total } = await exportOrdersForAdmin(filters);

  // Transform to human-readable CSV rows
  const csvRows = rows.map((r) => ({
    'Order ID': r.id,
    'Patient Name': r.patientName,
    'Patient Phone': r.patientPhone,
    Medicine: r.medicineText,
    'Delivery Address': r.deliveryAddress ?? '',
    Status: ORDER_STATUS_LABELS[r.status] ?? r.status,
    Pharmacy: r.pharmacyName,
    Driver: r.driverName ?? '',
    'Failure Reason': r.failureReason ?? '',
    'Failure Note': r.failureNote ?? '',
    'Has POD Photo': r.podPhotoUrl ? 'Yes' : 'No',
    'Created At': r.createdAt.toISOString(),
    'Picked Up At': r.pickedUpAt?.toISOString() ?? '',
    'Delivered At': r.deliveredAt?.toISOString() ?? '',
  }));

  const csv = Papa.unparse(csvRows);

  // Filename: orders_export_2026-04-16T14-30-00.csv
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `orders_export_${ts}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'X-Total-Rows': String(total),
    },
  });
}
