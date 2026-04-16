'use server';

import { submitAddress } from '@pharmatrack/db';

export type AddressFormResult = { ok: true } | { ok: false; reason: string };

export async function submitAddressAction(formData: FormData): Promise<AddressFormResult> {
  const token = String(formData.get('token') ?? '');
  const address = String(formData.get('address') ?? '').trim();

  if (!token) return { ok: false, reason: 'Missing token' };
  if (!address || address.length < 10) {
    return {
      ok: false,
      reason: 'Please enter a complete delivery address (at least 10 characters).',
    };
  }
  if (address.length > 500) {
    return { ok: false, reason: 'Address is too long (max 500 characters).' };
  }

  const result = await submitAddress({ token, address });

  if (!result.ok) {
    switch (result.reason) {
      case 'not_found':
        return { ok: false, reason: 'This link is invalid.' };
      case 'already_submitted':
        return { ok: false, reason: 'Your address has already been submitted. Thank you!' };
      case 'expired':
        return { ok: false, reason: 'This link has expired. Please contact your pharmacy.' };
    }
  }

  return { ok: true };
}
