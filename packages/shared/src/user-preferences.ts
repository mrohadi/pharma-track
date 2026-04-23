import { z } from 'zod';

export const UserPreferences = z.object({
  /** Preferred UI language. Default: 'en'. */
  locale: z.enum(['en', 'id']).optional().default('en'),
  /** Push notifications for order status updates (driver pickup, delivered). Default: true. */
  pushNotifications: z.boolean().optional().default(true),
  /** Notify when driver is en route to the pharmacy. Default: true. */
  driverArrivalNotif: z.boolean().optional().default(true),
  /** Platform news and promo notifications. Default: false. */
  promoNotif: z.boolean().optional().default(false),
});

export type UserPreferences = z.infer<typeof UserPreferences>;
