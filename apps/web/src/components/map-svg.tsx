export function MapSVG({ route = true }: { route?: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: '#e8eef4' }}>
      <svg width="100%" height="100%" viewBox="0 0 390 340" preserveAspectRatio="xMidYMid slice">
        <rect width="390" height="340" fill="#e8eef4" />
        {/* city blocks */}
        {(
          [
            [0, 0, 70, 90],
            [80, 0, 90, 90],
            [180, 0, 90, 90],
            [280, 0, 110, 90],
            [0, 100, 70, 80],
            [0, 190, 70, 80],
            [0, 280, 70, 60],
            [80, 190, 90, 80],
            [80, 280, 90, 60],
            [180, 190, 90, 80],
            [180, 280, 90, 60],
            [280, 190, 110, 80],
            [280, 280, 110, 60],
            [80, 100, 90, 80],
            [280, 100, 110, 80],
          ] as [number, number, number, number][]
        ).map(([x, y, w, h], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={i % 3 === 0 ? '#d4dde8' : i % 3 === 1 ? '#cdd8e4' : '#d8e2ec'}
            rx="2"
          />
        ))}
        {/* horizontal roads */}
        <rect x="0" y="90" width="390" height="10" fill="white" opacity="0.85" />
        <rect x="0" y="180" width="390" height="10" fill="white" opacity="0.85" />
        <rect x="0" y="270" width="390" height="10" fill="white" opacity="0.85" />
        {/* vertical roads */}
        <rect x="70" y="0" width="10" height="340" fill="white" opacity="0.85" />
        <rect x="170" y="0" width="10" height="340" fill="white" opacity="0.85" />
        <rect x="270" y="0" width="10" height="340" fill="white" opacity="0.85" />
        {/* road labels */}
        {(
          [
            ['Rizal St', 35, 175],
            ['EDSA', 160, 175],
            ['Ayala Ave', 255, 175],
            ['Shaw Blvd', 195, 95],
          ] as [string, number, number][]
        ).map(([label, x, y]) => (
          <text
            key={label}
            x={x}
            y={y}
            fontSize="8"
            fill="#9aaccb"
            fontFamily="system-ui"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
        {route && (
          <>
            {/* dashed route */}
            <path
              d="M 75 310 L 75 185 L 175 185 L 175 95 L 275 95"
              stroke="#3b82f6"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="7,4"
            />
            {/* driver position */}
            <circle cx="75" cy="310" r="9" fill="#3b82f6" opacity="0.25" />
            <circle cx="75" cy="310" r="6" fill="#3b82f6" />
            <circle cx="75" cy="310" r="3" fill="white" />
            {/* destination pin */}
            <ellipse cx="275" cy="104" rx="6" ry="2.5" fill="rgba(0,0,0,0.15)" />
            <path
              d="M275 64 C265 64 258 71 258 80 C258 92 275 104 275 104 C275 104 292 92 292 80 C292 71 285 64 275 64Z"
              fill="#ef4444"
            />
            <circle cx="275" cy="80" r="5" fill="white" />
          </>
        )}
      </svg>
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 6,
          padding: '3px 7px',
          fontSize: 9,
          color: '#777',
          fontFamily: 'system-ui',
        }}
      >
        Peta PharmaTrack
      </div>
    </div>
  );
}
