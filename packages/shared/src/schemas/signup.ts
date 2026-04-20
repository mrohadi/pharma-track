import { z } from 'zod';

// Indonesian validation helpers
const phoneID = z.string().regex(/^(\+62|08)\d{7,12}$/, 'Nomor telepon harus diawali +62 atau 08');

const nik = z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka');

// NPWP formatted: ##.###.###.#-###.### (stored without separators)
const npwpFormatted = z
  .string()
  .regex(/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/, 'Format NPWP: ##.###.###.#-###.###');

/** Strip NPWP formatting characters before storing */
export function stripNpwp(formatted: string): string {
  return formatted.replace(/[.\-]/g, '');
}

/** Format a raw 15-digit NPWP string to ##.###.###.#-###.### */
export function formatNpwp(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 15) return raw;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}.${d[8]}-${d.slice(9, 12)}.${d.slice(12)}`;
}

// ─── Pharmacy signup (3-step) ─────────────────────────────────────────────

export const PharmacySignupStep1Schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
  picName: z.string().min(1, 'Nama PIC wajib diisi'),
  phone: phoneID,
});

export const PharmacySignupStep2Schema = z.object({
  pharmacyName: z.string().min(1, 'Nama apotek wajib diisi'),
  pharmacyAddress: z.string().min(1, 'Alamat apotek wajib diisi'),
  pharmacyPhone: phoneID,
  province: z.string().min(1, 'Provinsi wajib diisi'),
  city: z.string().min(1, 'Kota wajib diisi'),
});

export const PharmacySignupStep3Schema = z.object({
  npwp: npwpFormatted,
  siaNumber: z.string().optional(),
  sipaNumber: z.string().optional(),
});

export const PharmacySignupSchema =
  PharmacySignupStep1Schema.merge(PharmacySignupStep2Schema).merge(PharmacySignupStep3Schema);

export type PharmacySignupInput = z.infer<typeof PharmacySignupSchema>;

// ─── Driver signup (4-step) ───────────────────────────────────────────────

export const DriverSignupStep1Schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
  name: z.string().min(1, 'Nama lengkap wajib diisi'),
  phone: phoneID,
});

export const DriverSignupStep2Schema = z.object({
  nik: nik,
  province: z.string().min(1, 'Provinsi wajib diisi'),
});

export const DriverSignupStep3Schema = z.object({
  vehicleType: z.enum(['motorcycle', 'car', 'bicycle']),
  vehicleModel: z.string().min(1, 'Model kendaraan wajib diisi'),
  licensePlate: z.string().min(1, 'Nomor plat wajib diisi'),
  simClass: z.enum(['A', 'B1', 'B2', 'C']),
  simNumber: z.string().min(1, 'Nomor SIM wajib diisi'),
  simExpiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal: YYYY-MM-DD'),
});

export const DriverSignupStep4Schema = z.object({
  payoutBank: z.string().min(1, 'Nama bank wajib diisi'),
  payoutAccountNumber: z.string().min(1, 'Nomor rekening wajib diisi'),
  payoutAccountName: z.string().min(1, 'Nama pemilik rekening wajib diisi'),
});

export const DriverSignupSchema = DriverSignupStep1Schema.merge(DriverSignupStep2Schema)
  .merge(DriverSignupStep3Schema)
  .merge(DriverSignupStep4Schema);

export type DriverSignupInput = z.infer<typeof DriverSignupSchema>;
