import { z } from 'zod';

export const PharmacySettings = z.object({
  /** Whether POD photo is required on delivery confirmation. Default: false (optional). */
  podPhotoRequired: z.boolean().optional().default(false),
});

export type PharmacySettings = z.infer<typeof PharmacySettings>;
