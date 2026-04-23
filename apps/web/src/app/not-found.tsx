import Link from 'next/link';
import { PTLogo } from '@/components/logo';

export default function NotFound() {
  return (
    <div
      style={{
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
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <PTLogo size={48} />
      </div>

      {/* 404 badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'oklch(0.94 0.04 250)',
          color: 'oklch(0.36 0.14 250)',
          borderRadius: 999,
          padding: '4px 14px',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 20,
        }}
      >
        404 · Halaman Tidak Ditemukan
      </div>

      {/* Headline */}
      <h1
        style={{
          fontSize: 'clamp(28px, 6vw, 48px)',
          fontWeight: 800,
          color: 'oklch(0.18 0.02 250)',
          margin: '0 0 12px',
          textAlign: 'center',
          lineHeight: 1.15,
          letterSpacing: '-0.5px',
        }}
      >
        Halaman tidak ada
      </h1>
      <p
        style={{
          fontSize: 15,
          color: 'oklch(0.58 0.03 250)',
          margin: '0 0 40px',
          textAlign: 'center',
          maxWidth: 360,
          lineHeight: 1.6,
        }}
      >
        URL yang Anda kunjungi tidak ditemukan. Mungkin sudah dipindahkan atau tidak pernah ada.
      </p>

      {/* Illustration */}
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: '#fff',
          border: '1px solid oklch(0.92 0.012 250)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 72,
          marginBottom: 40,
        }}
      >
        📦
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            background: 'oklch(0.52 0.18 250)',
            color: '#fff',
            borderRadius: 10,
            padding: '11px 24px',
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Ke Beranda
        </Link>
        <Link
          href="/login"
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
          Masuk
        </Link>
      </div>

      {/* Footer note */}
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
    </div>
  );
}
