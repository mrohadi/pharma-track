import {
  getPharmacyDashboardStats,
  updatePharmacyProfile as dbUpdatePharmacyProfile,
  requestLegalDocUpdate as dbRequestLegalDocUpdate,
} from '@pharmatrack/db';
import type { PharmacyProfilePatch, LegalDocPatch } from '@pharmatrack/db';

export type { PharmacyDashboardStats } from '@pharmatrack/db';
export type { PharmacyProfilePatch, LegalDocPatch };

export { getPharmacyDashboardStats };

export async function updatePharmacyProfile(
  pharmacyId: string,
  actorUserId: string,
  patch: PharmacyProfilePatch,
): Promise<void> {
  return dbUpdatePharmacyProfile(pharmacyId, actorUserId, patch);
}

export async function requestLegalDocUpdate(
  pharmacyId: string,
  actorUserId: string,
  patch: LegalDocPatch,
): Promise<void> {
  return dbRequestLegalDocUpdate(pharmacyId, actorUserId, patch);
}
