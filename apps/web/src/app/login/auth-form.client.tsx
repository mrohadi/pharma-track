'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth-client';
import { PharmacySignupForm } from './pharmacy-signup.client';
import { DriverSignupForm } from './driver-signup.client';

// ── PT design tokens ──────────────────────────────────────────────────────────
export const PT = {
  primary: 'oklch(0.52 0.18 250)',
  primaryHover: 'oklch(0.46 0.18 250)',
  primaryLight: 'oklch(0.94 0.04 250)',
  primaryText: 'oklch(0.36 0.14 250)',
  success: 'oklch(0.52 0.15 145)',
  successLight: 'oklch(0.94 0.05 145)',
  warning: 'oklch(0.68 0.14 75)',
  warningLight: 'oklch(0.96 0.05 75)',
  danger: 'oklch(0.55 0.2 25)',
  dangerLight: 'oklch(0.95 0.05 25)',
  bg: 'oklch(0.97 0.008 250)',
  text: 'oklch(0.18 0.02 250)',
  textSub: 'oklch(0.38 0.03 250)',
  muted: 'oklch(0.58 0.03 250)',
  border: 'oklch(0.92 0.012 250)',
};

type Tab = 'login' | 'signup';
type LoginRole = 'admin' | 'pharmacy' | 'driver';
type SignupRole = 'pharmacy' | 'driver';

export function AuthForm({ next }: { next?: string }) {
  const [tab, setTab] = useState<Tab>('login');
  const [signupRole, setSignupRole] = useState<SignupRole>('pharmacy');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Tab switcher */}
      <div style={{ display: 'flex', background: PT.border, borderRadius: 12, padding: 3 }}>
        {(
          [
            ['login', 'Masuk'],
            ['signup', 'Daftar'],
          ] as [Tab, string][]
        ).map(([t, l]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 10,
              border: 'none',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? PT.text : PT.muted,
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'login' ? (
        <LoginPanel next={next} />
      ) : (
        <SignupPanel
          signupRole={signupRole}
          setSignupRole={setSignupRole}
          onSwitchToLogin={() => setTab('login')}
        />
      )}

      <div style={{ textAlign: 'center', fontSize: 13, color: PT.muted }}>
        {tab === 'login' ? (
          <>
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={() => setTab('signup')}
              style={{
                fontSize: 13,
                color: PT.primary,
                fontWeight: 700,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                padding: 0,
              }}
            >
              Daftar gratis
            </button>
          </>
        ) : (
          <>
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={() => setTab('login')}
              style={{
                fontSize: 13,
                color: PT.primary,
                fontWeight: 700,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                padding: 0,
              }}
            >
              Masuk
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Login Panel ───────────────────────────────────────────────────────────────

const LOGIN_ROLES = [
  { id: 'admin' as LoginRole, icon: '🛡️', label: 'Admin' },
  { id: 'pharmacy' as LoginRole, icon: '🏥', label: 'Apotek' },
  { id: 'driver' as LoginRole, icon: '🚴', label: 'Driver' },
];

function LoginPanel({ next }: { next?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [loginRole, setLoginRole] = useState<LoginRole>('pharmacy');

  function onSubmit(formData: FormData) {
    setError(null);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    startTransition(async () => {
      const res = await signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message ?? 'Gagal masuk');
        return;
      }
      const role = (res.data?.user as { role?: string } | null)?.role;
      const dest =
        next ??
        (role === 'admin'
          ? '/admin'
          : role === 'pharmacy'
            ? '/pharmacy'
            : role === 'driver'
              ? '/driver'
              : '/');
      router.replace(dest);
      router.refresh();
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: PT.text,
            margin: '0 0 4px',
            letterSpacing: '-0.4px',
          }}
        >
          Selamat datang kembali
        </h2>
        <p style={{ color: PT.muted, fontSize: 13.5, margin: 0 }}>Masuk ke akun PharmaTrack Anda</p>
      </div>

      {/* Role selector */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: PT.text, marginBottom: 8 }}>
          Masuk sebagai
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {LOGIN_ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setLoginRole(r.id)}
              style={{
                padding: '10px 8px',
                borderRadius: 10,
                border: `2px solid ${loginRole === r.id ? PT.primary : PT.border}`,
                textAlign: 'center',
                cursor: 'pointer',
                background: loginRole === r.id ? PT.primaryLight : '#fff',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{r.icon}</div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: loginRole === r.id ? PT.primaryText : PT.muted,
                }}
              >
                {r.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {loginRole === 'admin' && (
        <div
          style={{
            padding: '10px 14px',
            background: PT.warningLight,
            borderRadius: 10,
            fontSize: 12.5,
            color: 'oklch(0.48 0.14 75)',
            fontWeight: 500,
          }}
        >
          🛡️ Akun Admin hanya dapat diakses melalui undangan dari Super Admin.
        </div>
      )}

      <form action={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <AuthField
          label="Email"
          name="email"
          type="email"
          placeholder="anda@example.co.id"
          icon="✉️"
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          icon="🔒"
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              fontSize: 13,
              color: PT.muted,
              cursor: 'pointer',
            }}
          >
            <input type="checkbox" style={{ accentColor: PT.primary }} /> Ingat saya
          </label>
          <a
            href="#"
            style={{ fontSize: 13, color: PT.primary, textDecoration: 'none', fontWeight: 600 }}
          >
            Lupa password?
          </a>
        </div>

        {error && (
          <p
            style={{
              background: 'oklch(0.95 0.05 25)',
              color: 'oklch(0.45 0.18 25)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
              margin: 0,
            }}
          >
            {error}
          </p>
        )}

        <PrimaryButton pending={pending}>{pending ? 'Sedang masuk…' : 'Masuk →'}</PrimaryButton>
      </form>
    </div>
  );
}

// ── Signup Panel ──────────────────────────────────────────────────────────────

function SignupPanel({
  signupRole,
  setSignupRole,
  onSwitchToLogin,
}: {
  signupRole: SignupRole;
  setSignupRole: (r: SignupRole) => void;
  onSwitchToLogin: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: PT.text,
            margin: '0 0 4px',
            letterSpacing: '-0.4px',
          }}
        >
          Buat Akun Baru
        </h2>
        <p style={{ color: PT.muted, fontSize: 13.5, margin: 0 }}>Pilih tipe akun Anda</p>
      </div>

      {/* Role selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          {
            id: 'pharmacy' as SignupRole,
            icon: '🏥',
            label: 'Apotek',
            desc: 'Daftarkan apotek Anda',
          },
          {
            id: 'driver' as SignupRole,
            icon: '🚴',
            label: 'Driver',
            desc: 'Bergabung sebagai mitra pengemudi',
          },
        ].map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSignupRole(r.id)}
            style={{
              padding: '14px 12px',
              borderRadius: 12,
              border: `2px solid ${signupRole === r.id ? PT.primary : PT.border}`,
              cursor: 'pointer',
              background: signupRole === r.id ? PT.primaryLight : '#fff',
              transition: 'all 0.15s',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 6 }}>{r.icon}</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: signupRole === r.id ? PT.primaryText : PT.text,
              }}
            >
              {r.label}
            </div>
            <div style={{ fontSize: 11.5, color: PT.muted, marginTop: 3 }}>{r.desc}</div>
          </button>
        ))}
      </div>

      {/* Admin info box */}
      <div
        style={{
          padding: '10px 14px',
          background: PT.bg,
          borderRadius: 10,
          border: `1px solid ${PT.border}`,
          fontSize: 12.5,
          color: PT.muted,
          lineHeight: 1.6,
        }}
      >
        🛡️ <strong style={{ color: PT.text }}>Admin?</strong> Akun admin dibuat melalui undangan
        langsung oleh Super Admin. Hubungi{' '}
        <a
          href="mailto:admin@pharmatrack.id"
          style={{ color: PT.primary, fontWeight: 600, textDecoration: 'none' }}
        >
          admin@pharmatrack.id
        </a>{' '}
        untuk informasi lebih lanjut.
      </div>

      {signupRole === 'pharmacy' ? (
        <PharmacySignupForm onSuccess={onSwitchToLogin} />
      ) : (
        <DriverSignupForm onSuccess={onSwitchToLogin} />
      )}
    </div>
  );
}

// ── Shared components ─────────────────────────────────────────────────────────

export function AuthField({
  label,
  name,
  type = 'text',
  placeholder,
  icon,
  autoComplete,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  icon?: string;
  autoComplete?: string;
  defaultValue?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: PT.text }}>{label}</span>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 14,
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: `1.5px solid ${PT.border}`,
            borderRadius: 10,
            background: '#fff',
            padding: icon ? '10px 12px 10px 36px' : '10px 12px',
            fontSize: 13.5,
            color: PT.text,
            outline: 'none',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = PT.primary;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${PT.primaryLight}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = PT.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  pending,
  onClick,
  style: extraStyle,
}: {
  children: React.ReactNode;
  pending?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      disabled={pending}
      onClick={onClick}
      style={{
        width: '100%',
        padding: '12px 0',
        borderRadius: 12,
        border: 'none',
        background: PT.primary,
        color: '#fff',
        fontSize: 15,
        fontWeight: 600,
        cursor: pending ? 'not-allowed' : 'pointer',
        opacity: pending ? 0.6 : 1,
        fontFamily: 'inherit',
        transition: 'background 0.15s',
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!pending) e.currentTarget.style.background = PT.primaryHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = PT.primary;
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '10px 16px',
        borderRadius: 12,
        border: `1.5px solid ${PT.border}`,
        background: '#fff',
        color: PT.text,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = PT.bg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#fff';
      }}
    >
      {children}
    </button>
  );
}
