'use client';

import { useState } from 'react';
import { maskPhone } from '@/lib/format';
import type { RecentOrderRow } from '@pharmatrack/db';

const STATUS_LABELS: Record<string, string> = {
  pending_address: 'Menunggu Alamat',
  address_collected: 'Alamat Terkumpul',
  assigned: 'Driver Ditugaskan',
  picked_up: 'Diambil',
  in_transit: 'Dalam Perjalanan',
  delivered: 'Terkirim',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
};

const STATUS_BADGE: Record<string, string> = {
  pending_address: 'bg-blue-100 text-blue-700',
  address_collected: 'bg-teal-100 text-teal-700',
  assigned: 'bg-amber-100 text-amber-700',
  picked_up: 'bg-amber-100 text-amber-700',
  in_transit: 'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

const FILTERS = [
  { label: 'Semua', value: 'all' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Dalam Perjalanan', value: 'transit' },
  { label: 'Terkirim', value: 'delivered' },
  { label: 'Gagal / Batal', value: 'closed' },
];

const FILTER_STATUSES: Record<string, string[]> = {
  all: [],
  pending: ['pending_address', 'address_collected'],
  transit: ['assigned', 'picked_up', 'in_transit'],
  delivered: ['delivered'],
  closed: ['failed', 'cancelled'],
};

export function OrderList({ orders }: { orders: RecentOrderRow[] }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const statuses = FILTER_STATUSES[filter] ?? [];
  const visible = orders.filter((o) => {
    if (statuses.length > 0 && !statuses.includes(o.status)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !o.patientName.toLowerCase().includes(q) &&
        !o.id.toLowerCase().includes(q) &&
        !o.patientPhone.includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter + search bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 font-medium transition-colors ${filter === f.value ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Cari nama pasien, ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="focus:ring-brand-500 w-56 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2"
        />
      </div>

      {/* Card list */}
      {visible.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-400">
          Tidak ada order ditemukan.
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((o) => (
            <li
              key={o.id}
              className="space-y-2 rounded-xl border border-slate-200 bg-white px-5 py-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-500">
                    #{o.id.slice(0, 8)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[o.status] ?? 'bg-slate-100 text-slate-500'}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(o.createdAt).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 text-sm">
                <div>
                  <span className="text-slate-500">👤 </span>
                  <span className="font-medium text-slate-800">{o.patientName}</span>
                </div>
                <div className="self-center font-mono text-xs text-slate-500">
                  {maskPhone(o.patientPhone)}
                </div>
              </div>

              {o.items.length > 0 && (
                <div className="text-xs text-slate-500">
                  💊 {o.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                </div>
              )}

              {o.status === 'delivered' && (
                <div className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                  ✓ Berhasil dikirim
                </div>
              )}
              {(o.status === 'failed' || o.status === 'cancelled') && (
                <div className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600">
                  ✕ {STATUS_LABELS[o.status]}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
