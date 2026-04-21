'use client';

import { useState } from 'react';
import type { Pharmacy, DriverRow } from '@pharmatrack/db';
import { PharmacyRow } from './pharmacy-row';
import { DriverRowComponent } from './driver-row';

type Tab = 'pharmacies' | 'drivers';

export function UsersTabs({
  pharmacies,
  drivers,
}: {
  pharmacies: Pharmacy[];
  drivers: DriverRow[];
}) {
  const [tab, setTab] = useState<Tab>('pharmacies');
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();

  const filteredPharmacies = pharmacies.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.city ?? '').toLowerCase().includes(q) ||
      (p.phone ?? '').includes(q),
  );

  const filteredDrivers = drivers.filter(
    (d) =>
      (d.name ?? '').toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      (d.vehicle ?? '').toLowerCase().includes(q),
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          {(['pharmacies', 'drivers'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {tab === 'pharmacies' && (
        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">City</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Joined</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPharmacies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-slate-400">
                    No pharmacies found.
                  </td>
                </tr>
              ) : (
                filteredPharmacies.map((p) => <PharmacyRow key={p.id} pharmacy={p} />)
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'drivers' && (
        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Vehicle</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                    No drivers found.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((d) => <DriverRowComponent key={d.id} driver={d} />)
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
