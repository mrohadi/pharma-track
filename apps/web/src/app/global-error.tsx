'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: 'oklch(0.97 0.008 250)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'oklch(0.52 0.18 250)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
            position: 'relative',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="12" y="5" width="4" height="18" rx="2" fill="white" />
            <rect x="5" y="12" width="18" height="4" rx="2" fill="white" />
            <circle cx="21" cy="7" r="3" fill="oklch(0.52 0.15 195)" />
          </svg>
        </div>

        {/* Error badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'oklch(0.95 0.05 25)',
            color: 'oklch(0.45 0.2 25)',
            borderRadius: 999,
            padding: '4px 14px',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          500 · Terjadi Kesalahan
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(24px, 5vw, 40px)',
            fontWeight: 800,
            color: 'oklch(0.18 0.02 250)',
            margin: '0 0 12px',
            textAlign: 'center',
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
          }}
        >
          Server mengalami gangguan
        </h1>
        <p
          style={{
            fontSize: 15,
            color: 'oklch(0.58 0.03 250)',
            margin: '0 0 36px',
            textAlign: 'center',
            maxWidth: 380,
            lineHeight: 1.6,
          }}
        >
          Sistem pengiriman sedang mengalami masalah teknis. Tim kami sudah diberitahu. Coba lagi
          sebentar.
        </p>

        {/* Illustration */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: '#fff',
            border: '1px solid oklch(0.92 0.012 250)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 64,
            marginBottom: 36,
          }}
        >
          🚑
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              background: 'oklch(0.52 0.18 250)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '11px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Coba Lagi
          </button>
          <a
            href="/"
            style={{
              background: '#fff',
              color: 'oklch(0.36 0.14 250)',
              borderRadius: 10,
              padding: '11px 24px',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid oklch(0.92 0.012 250)',
            }}
          >
            Ke Beranda
          </a>
        </div>

        <p
          style={{
            marginTop: 48,
            fontSize: 12,
            color: 'oklch(0.7 0.02 250)',
            textAlign: 'center',
          }}
        >
          PharmaTrack · Sistem Pengiriman Obat
        </p>
      </body>
    </html>
  );
}
