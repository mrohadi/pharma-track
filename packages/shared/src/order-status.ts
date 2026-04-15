import { z } from 'zod';

export const OrderStatus = z.enum([
  'pending_address',
  'address_collected',
  'assigned',
  'picked_up',
  'in_transit',
  'delivered',
  'failed',
  'cancelled',
]);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const FailureReason = z.enum([
  'no_answer',
  'wrong_address',
  'patient_refused',
  'patient_not_home',
  'other',
]);
export type FailureReason = z.infer<typeof FailureReason>;
