import { z } from 'zod';

const phoneID = z.string().regex(/^(\+62|08)\d{7,12}$/, 'Nomor telepon harus diawali +62 atau 08');

// ─── Wizard steps ─────────────────────────────────────────────────────────────

export const OrderWizardStep1Schema = z.object({
  patientName: z.string().min(1, 'Nama pasien wajib diisi'),
  patientPhone: phoneID,
  patientEmail: z
    .string()
    .email('Format email tidak valid')
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  deliveryAddress: z.string().optional(),
});

export const OrderWizardStep2Schema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().min(1, 'Nama obat wajib diisi'),
        quantity: z.number().int().min(1, 'Jumlah minimal 1'),
        unitPriceCents: z.number().int().min(0).optional(),
      }),
    )
    .min(1, 'Minimal 1 item obat'),
});

export const OrderWizardStep3Schema = z.object({
  priority: z.enum(['normal', 'urgent']).default('normal'),
  paymentMode: z.enum(['cod', 'prepaid', 'insurance']).default('cod'),
});

export const OrderWizardStep4Schema = z.object({
  notes: z.string().optional(),
});

// ─── Full wizard schema (all steps merged) ───────────────────────────────────

export const OrderWizardSchema = OrderWizardStep1Schema.merge(OrderWizardStep2Schema)
  .merge(OrderWizardStep3Schema)
  .merge(OrderWizardStep4Schema);

export type OrderWizardInput = z.infer<typeof OrderWizardSchema>;
