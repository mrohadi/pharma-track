'use client';

import { useEffect, useRef } from 'react';

const INTERVAL_MS = 30_000; // 30 seconds

/**
 * Invisible component — mounts on driver map/active pages.
 * Calls the Geolocation API and POSTs coordinates to /api/driver/location
 * every INTERVAL_MS. Silently no-ops if geolocation unavailable.
 */
export function LocationTracker() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    async function sendLocation() {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await fetch('/api/driver/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            });
          } catch {
            // best-effort — ignore errors
          }
        },
        () => {
          // permission denied or unavailable — ignore
        },
        { enableHighAccuracy: false, timeout: 10_000 },
      );
    }

    sendLocation(); // fire immediately on mount
    intervalRef.current = setInterval(sendLocation, INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return null;
}
