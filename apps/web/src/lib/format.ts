/**
 * Shared formatters for UI (status labels, PII masking).
 */

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_address: 'Pending address',
  address_collected: 'Address collected',
  assigned: 'Assigned',
  picked_up: 'Picked up',
  in_transit: 'In transit',
  delivered: 'Delivered',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_BADGE: Record<string, string> = {
  pending_address: 'bg-amber-100 text-amber-800',
  address_collected: 'bg-sky-100 text-sky-800',
  assigned: 'bg-indigo-100 text-indigo-800',
  picked_up: 'bg-violet-100 text-violet-800',
  in_transit: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-slate-100 text-slate-700',
};

/** Show country code + first 2 + last 2 digits; mask the middle. */
export function maskPhone(phone: string): string {
  if (phone.length <= 6) return phone;
  return `${phone.slice(0, 4)}••••${phone.slice(-2)}`;
}
