import { z } from 'zod';

export const UserPreferences = z.object({
  /** Preferred UI language. Default: 'en'. */
  locale: z.enum(['en', 'id']).optional().default('en'),
  /** Whether to receive push notifications for order status updates. Default: true. */
  pushNotifications: z.boolean().optional().default(true),
});

export type UserPreferences = z.infer<typeof UserPreferences>;
