'use client';

import { useState } from 'react';
import { maskPhone } from '@/lib/format';
import type { RecentOrderRow } from '@pharmatrack/db';

const STATUS_LABELS: Record<string, string> = {
  pending_address: 'Menunggu',
  address_collected: 'Menunggu',
  assigned: 'Dalam Perjalanan',
  picked_up: 'Dalam Perjalanan',
  in_transit: 'Dalam Perjalanan',
  delivered: 'Terkirim',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
};

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  pending_address: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  address_collected: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  assigned: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  picked_up: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  in_transit: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  delivered: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  failed: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
};

const FILTERS = [
  { label: 'Semua', value: 'all' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Dalam Perjalanan', value: 'transit' },
  { label: 'Terkirim', value: 'delivered' },
  { label: 'Dibatalkan', value: 'closed' },
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
      {/* Filter + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-[10px] border border-slate-200 bg-white">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-[7px] text-[13px] font-semibold transition-colors ${
                filter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Cari pasien, ID order…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-[10px] border border-slate-200 px-3 py-[7px] text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <div className="rounded-[14px] border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-400">
          Tidak ada order ditemukan.
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {visible.map((o) => {
            const sc = STATUS_COLOR[o.status] ?? STATUS_COLOR.cancelled;
            const time = new Date(o.createdAt).toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <li key={o.id} className="rounded-[14px] border border-slate-200 bg-white px-5 py-4">
                {/* Top row */}
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[15px] font-extrabold text-slate-800">
                      #{o.id.slice(0, 6)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${sc.bg} ${sc.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">{time}</div>
                  </div>
                </div>

                {/* Detail grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[13px] text-slate-500">
                  <div>
                    👤 <span className="font-medium text-slate-800">{o.patientName}</span>
                  </div>
                  <div className="font-mono text-xs">{maskPhone(o.patientPhone)}</div>
                  {o.items.length > 0 && (
                    <div className="col-span-2">
                      💊 {o.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                    </div>
                  )}
                </div>

                {/* Status banners */}
                {o.status === 'delivered' && (
                  <div className="mt-2.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                    ✓ Berhasil dikirim · {time}
                  </div>
                )}
                {(o.status === 'failed' || o.status === 'cancelled') && (
                  <div className="mt-2.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                    ✕ {STATUS_LABELS[o.status]}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
