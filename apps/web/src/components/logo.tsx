export function PTLogo({ size = 32, white = false }: { size?: number; white?: boolean }) {
  const bg = white ? 'rgba(255,255,255,0.18)' : 'oklch(0.94 0.04 250)';
  const c = white ? '#fff' : 'oklch(0.52 0.18 250)';
  const dot = white ? 'rgba(255,255,255,0.7)' : 'oklch(0.52 0.15 195)';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill={bg} />
      <rect x="14.5" y="7" width="3.5" height="18" rx="1.75" fill={c} />
      <rect x="7" y="14.5" width="18" height="3.5" rx="1.75" fill={c} />
      <circle cx="23" cy="9.5" r="2.5" fill={dot} />
    </svg>
  );
}
