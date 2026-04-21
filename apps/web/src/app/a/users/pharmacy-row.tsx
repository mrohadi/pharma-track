'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Pharmacy } from '@pharmatrack/db';

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
  rejected: 'bg-slate-100 text-slate-600',
};

export function PharmacyRow({ pharmacy }: { pharmacy: Pharmacy }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(action: string, reason?: string) {
    setBusy(true);
    await fetch(`/api/admin/pharmacies/${pharmacy.id}/verification`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    router.refresh();
    setBusy(false);
  }

  async function handleSuspend() {
    const reason = prompt('Suspend reason:');
    if (!reason?.trim()) return;
    await patch('suspend', reason.trim());
  }

  const s = pharmacy.verificationStatus;

  return (
    <tr className="align-top hover:bg-slate-50">
      <td className="px-3 py-2 font-medium text-slate-800">{pharmacy.name}</td>
      <td className="px-3 py-2 text-slate-500">{pharmacy.city ?? '—'}</td>
      <td className="px-3 py-2 text-slate-500">{pharmacy.phone ?? '—'}</td>
      <td className="px-3 py-2">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[s] ?? 'bg-slate-100 text-slate-600'}`}
        >
          {s}
        </span>
      </td>
      <td className="px-3 py-2 text-xs text-slate-400">
        {new Date(pharmacy.createdAt).toLocaleDateString()}
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-1">
          {s === 'pending' && (
            <button
              disabled={busy}
              onClick={() => patch('approve')}
              className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
          )}
          {s === 'suspended' && (
            <button
              disabled={busy}
              onClick={() => patch('activate')}
              className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Activate
            </button>
          )}
          {(s === 'pending' || s === 'active') && (
            <button
              disabled={busy}
              onClick={handleSuspend}
              className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Suspend
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
