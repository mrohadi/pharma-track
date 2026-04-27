import { z } from 'zod';

/**
 * CSV upload row schema — the contract between the pharmacy-supplied CSV
 * template and our order ingest.
 *
 * Required headers (case-insensitive, trimmed): patient_name, patient_phone, medicine.
 * Optional header: delivery_address (pharmacies usually leave this blank;
 * we collect it from the patient via WhatsApp in Phase 2).
 *
 * Phone numbers: we accept common Indonesian formats and normalize to E.164
 * (+62…). Non-ID numbers already in E.164 pass through.
 */
export const CSV_HEADERS = {
  required: ['patient_name', 'patient_phone', 'medicine'] as const,
  optional: ['delivery_address', 'patient_email'] as const,
};

export const ALL_CSV_HEADERS = [...CSV_HEADERS.required, ...CSV_HEADERS.optional] as const;

/** Normalize an Indonesian phone number to E.164. Returns null if unparseable. */
export function normalizePhoneID(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, '');
  if (!digits) return null;
  // Already E.164
  if (digits.startsWith('+')) return /^\+\d{8,15}$/.test(digits) ? digits : null;
  // 62… → +62…
  if (digits.startsWith('62')) return `+${digits}`;
  // 08… → +628…
  if (digits.startsWith('0')) return `+62${digits.slice(1)}`;
  // Bare 8… (Indonesian mobile without leading 0)
  if (digits.startsWith('8')) return `+62${digits}`;
  return null;
}

export const CsvOrderRow = z.object({
  patient_name: z.string().trim().min(2, 'patient_name must be at least 2 characters').max(200),
  patient_phone: z
    .string()
    .trim()
    .min(1, 'patient_phone is required')
    .transform((v, ctx) => {
      const n = normalizePhoneID(v);
      if (!n) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `patient_phone "${v}" is not a valid phone number`,
        });
        return z.NEVER;
      }
      return n;
    }),
  medicine: z.string().trim().min(1, 'medicine is required').max(2000),
  delivery_address: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v ? v : undefined)),
  patient_email: z
    .string()
    .trim()
    .transform((v) => v || undefined)
    .pipe(z.string().email('patient_email must be a valid email').optional()),
});

export type CsvOrderRow = z.infer<typeof CsvOrderRow>;

export type CsvRowError = {
  /** 1-based row number as it appears in the CSV (header = row 1). */
  row: number;
  field?: string;
  message: string;
};

/** Example rows for the downloadable template. */
export const CSV_TEMPLATE_ROWS = [
  ['patient_name', 'patient_phone', 'medicine', 'delivery_address', 'patient_email'],
  ['Budi Santoso', '081234567890', 'Paracetamol 500mg x10; Amoxicillin 500mg x15', '', ''],
  [
    'Siti Rahayu',
    '+6281298765432',
    'Vitamin D3 1000IU x30',
    'Jl. Merdeka No. 12, Jakarta',
    'siti@example.com',
  ],
];
