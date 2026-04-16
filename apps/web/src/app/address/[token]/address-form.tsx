'use client';

import { useState, useTransition } from 'react';
import { submitAddressAction, type AddressFormResult } from './actions';

export function AddressForm({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AddressFormResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await submitAddressAction(form);
      setResult(r);
    });
  }

  if (result?.ok) {
    return (
      <div className="rounded border border-green-300 bg-green-50 p-4 text-center">
        <p className="text-lg font-medium text-green-800">Thank you!</p>
        <p className="mt-1 text-sm text-green-700">
          Your delivery address has been saved. Your medication will be delivered soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium">
          Delivery address
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          required
          minLength={10}
          maxLength={500}
          placeholder="Enter your full delivery address including street, RT/RW, kelurahan, kecamatan, city, postal code"
          className="w-full rounded border border-slate-300 p-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {pending ? 'Submitting...' : 'Confirm address'}
      </button>

      {result && !result.ok && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {result.reason}
        </div>
      )}
    </form>
  );
}
