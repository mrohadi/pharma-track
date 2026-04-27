'use server';

import { revalidatePath } from 'next/cache';
import { insertOrdersFromCsv } from '@pharmatrack/db';
import { getSession } from '@/lib/session';
import { parseOrderCsv } from '@/lib/csv-upload';
import type { CsvRowError } from '@pharmatrack/shared';

export type UploadResult =
  | { ok: true; inserted: number }
  | { ok: false; errors: CsvRowError[]; reason?: string };

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB — ample for a 5k-row CSV
const MAX_ROWS = 5000;

/**
 * Parse + validate a pharmacy CSV and insert orders transactionally.
 *
 * Atomic on purpose: either every row lands with an audit entry or none do.
 * Partial commits on bad CSVs make reconciling with the pharmacy's source
 * spreadsheet painful, and we'd rather make them fix the file once.
 */
export async function uploadOrdersCsv(formData: FormData): Promise<UploadResult> {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'pharmacy' || !session.user.pharmacyId) {
    return { ok: false, errors: [], reason: 'Not authorized' };
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, errors: [], reason: 'No file uploaded' };
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      errors: [],
      reason: `File too large (${(file.size / 1024).toFixed(0)} KB). Max ${MAX_BYTES / 1024} KB.`,
    };
  }

  const text = await file.text();
  const { valid, errors } = parseOrderCsv(text);

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  if (valid.length === 0) {
    return { ok: false, errors: [], reason: 'No rows found in CSV' };
  }
  if (valid.length > MAX_ROWS) {
    return {
      ok: false,
      errors: [],
      reason: `Too many rows (${valid.length}). Max ${MAX_ROWS} per upload.`,
    };
  }

  const pharmacyId = session.user.pharmacyId as string;
  const actorUserId = session.user.id;

  await insertOrdersFromCsv({
    pharmacyId,
    actorUserId,
    rows: valid.map((r) => ({
      patientName: r.patient_name,
      patientPhone: r.patient_phone,
      patientEmail: r.patient_email,
      medicineText: r.medicine,
      deliveryAddress: r.delivery_address,
    })),
  });

  revalidatePath('/pharmacy');
  return { ok: true, inserted: valid.length };
}
