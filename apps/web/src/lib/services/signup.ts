import { insertPharmacySignup, insertDriverSignup } from '@pharmatrack/db';
import { auth } from '@/lib/auth';
import {
  type PharmacySignupInput,
  type DriverSignupInput,
  stripNpwp,
} from '@pharmatrack/shared';

/**
 * Create a pharmacy account:
 *  1. Create better-auth user with role='pharmacy'
 *  2. Insert pharmacy row, link user, and write audit log (transactional)
 */
export async function signupPharmacy(input: PharmacySignupInput): Promise<void> {
  const result = await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: input.password,
      name: input.picName,
      role: 'pharmacy',
      phone: input.phone,
    },
  });

  await insertPharmacySignup(result.user.id, {
    name: input.pharmacyName,
    address: input.pharmacyAddress,
    phone: input.pharmacyPhone,
    province: input.province,
    city: input.city,
    picName: input.picName,
    npwp: stripNpwp(input.npwp),
    siaNumber: input.siaNumber,
    sipaNumber: input.sipaNumber,
  });
}

/**
 * Create a driver account:
 *  1. Create better-auth user with role='driver'
 *  2. Insert driver row and write audit log (transactional)
 */
export async function signupDriver(input: DriverSignupInput): Promise<void> {
  const result = await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: input.password,
      name: input.name,
      role: 'driver',
      phone: input.phone,
    },
  });

  await insertDriverSignup(result.user.id, {
    nik: input.nik,
    province: input.province,
    vehicleType: input.vehicleType,
    vehicleModel: input.vehicleModel,
    vehicle: `${input.vehicleModel} (${input.licensePlate})`,
    licensePlate: input.licensePlate,
    simClass: input.simClass,
    simNumber: input.simNumber,
    simExpiresAt: input.simExpiresAt,
    payoutBank: input.payoutBank,
    payoutAccountNumber: input.payoutAccountNumber,
    payoutAccountName: input.payoutAccountName,
  });
}
