import { z } from 'zod';

export const Role = z.enum(['admin', 'pharmacy', 'driver']);
export type Role = z.infer<typeof Role>;
