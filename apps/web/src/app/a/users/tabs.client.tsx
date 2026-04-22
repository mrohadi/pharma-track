'use client';

import { useState } from 'react';
import type { Pharmacy, DriverRow } from '@pharmatrack/db';
import { PharmacyRow } from './pharmacy-row';
import { DriverRowComponent } from './driver-row';

type Tab = 'pharmacies' | 'drivers';

const TH_STYLE: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  whiteSpace: 'nowrap',
};

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
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}
    >
      {/* Tab header row */}
      <div
        style={{
          padding: '0 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex' }}>
          {(['pharmacies', 'drivers'] as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setSearch(''); }}
                style={{
                  padding: '14px 20px',
                  border: 'none',
                  fontFamily: 'inherit',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'transparent',
                  color: active ? 'oklch(0.52 0.18 250)' : '#64748b',
                  borderBottom: `2px solid ${active ? 'oklch(0.52 0.18 250)' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
              >
                {t === 'pharmacies' ? 'Apotek' : 'Driver'}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 13,
              color: '#94a3b8',
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>
          <input
            type="search"
            placeholder={`Cari ${tab === 'pharmacies' ? 'apotek' : 'driver'}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '6px 12px 6px 30px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
              width: 220,
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        {tab === 'pharmacies' ? (
          <table style={{ minWidth: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={TH_STYLE}>ID</th>
                <th style={TH_STYLE}>Apotek</th>
                <th style={TH_STYLE}>Kontak</th>
                <th style={TH_STYLE}>Status</th>
                <th style={TH_STYLE}>Bergabung</th>
                <th style={TH_STYLE}></th>
              </tr>
            </thead>
            <tbody>
              {filteredPharmacies.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 14 }}
                  >
                    Tidak ada apotek ditemukan.
                  </td>
                </tr>
              ) : (
                filteredPharmacies.map((p) => <PharmacyRow key={p.id} pharmacy={p} />)
              )}
            </tbody>
          </table>
        ) : (
          <table style={{ minWidth: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={TH_STYLE}>ID</th>
                <th style={TH_STYLE}>Driver</th>
                <th style={TH_STYLE}>Telepon</th>
                <th style={TH_STYLE}>Kendaraan</th>
                <th style={TH_STYLE}>Status</th>
                <th style={TH_STYLE}>Bergabung</th>
                <th style={TH_STYLE}></th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 14 }}
                  >
                    Tidak ada driver ditemukan.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((d) => <DriverRowComponent key={d.id} driver={d} />)
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
