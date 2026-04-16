import { CSV_TEMPLATE_ROWS } from '@pharmatrack/shared';

/**
 * Public download — a minimal CSV template with header + 2 example rows.
 * Not gated by auth on purpose: the template contains no PII.
 */
export function GET() {
  const body = CSV_TEMPLATE_ROWS.map((row) =>
    row.map((cell) => (/[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join(','),
  ).join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="pharmatrack-orders-template.csv"',
    },
  });
}
