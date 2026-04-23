'use client';

import { useEffect, useRef, useState } from 'react';

interface DeliveryMapProps {
  address: string;
  patientName: string;
}

// function buildOsmEmbedUrl(address: string): string {
//   const q = encodeURIComponent(address);
//   return `https://www.openstreetmap.org/export/embed.html?bbox=&layer=mapnik&marker=&mlat=&mlon=&query=${q}`;
// }

function buildNominatimSearchUrl(address: string): string {
  const q = encodeURIComponent(address);
  return `https://nominatim.openstreetmap.org/search?q=${q}&format=jsonv2&limit=1`;
}

function buildOsmEmbedByLatLng(lat: number, lng: number): string {
  const delta = 0.005;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

function buildGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
}

function buildWazeUrl(address: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
}

export function DeliveryMap({ address, patientName }: DeliveryMapProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current || !address) return;
    fetchedRef.current = true;

    fetch(buildNominatimSearchUrl(address), {
      headers: { 'Accept-Language': 'id', 'User-Agent': 'PharmaTrack/1.0' },
    })
      .then((r) => r.json())
      .then((data: Array<{ lat: string; lon: string }>) => {
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setEmbedUrl(buildOsmEmbedByLatLng(lat, lng));
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl">
      {/* Map frame */}
      <div className="relative flex-1 bg-slate-100" style={{ minHeight: 180 }}>
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="text-center">
              <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-xs text-slate-400">Memuat peta…</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="px-4 text-center">
              <span className="text-3xl">🗺️</span>
              <p className="mt-1 text-xs text-slate-500">Peta tidak tersedia</p>
              <p className="text-[10px] text-slate-400">{address}</p>
            </div>
          </div>
        )}
        {embedUrl && !error && (
          <iframe
            src={embedUrl}
            className="h-full w-full border-0"
            style={{ minHeight: 180 }}
            title={`Peta lokasi ${patientName}`}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          />
        )}

        {/* Destination label overlay */}
        {!loading && !error && (
          <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/95 px-3 py-1.5 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📍</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-semibold text-slate-800">
                  {patientName}
                </div>
                <div className="truncate text-[10px] text-slate-500">{address}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2 bg-white px-3 py-2">
        <a
          href={buildGoogleMapsUrl(address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-[12px] font-bold text-white"
        >
          <span>🗺️</span> Google Maps
        </a>
        <a
          href={buildWazeUrl(address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-[12px] font-bold text-slate-700"
        >
          <span>🚗</span> Waze
        </a>
      </div>
    </div>
  );
}
