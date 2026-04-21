/**
 * Pure SVG bar chart — zero dependencies, matches PT design system colours.
 * Each bar fades in opacity based on relative value (matches pt-admin.jsx BarChart).
 */

type BarDatum = {
  /** Short label shown below bar (e.g. "Mon", "2025-04-14"). */
  label: string;
  value: number;
};

type BarChartProps = {
  data: BarDatum[];
  height?: number;
  /** Tailwind fill colour class, defaults to brand blue. */
  color?: string;
};

export function BarChart({ data, height = 80, color = '#4f7cec' }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barAreaHeight = height - 18; // 18px reserved for labels
  const barWidth = 100 / data.length;

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
      aria-hidden="true"
    >
      {data.map((d, i) => {
        const barH = Math.max((d.value / max) * barAreaHeight, 1);
        const x = i * barWidth + barWidth * 0.15;
        const w = barWidth * 0.7;
        const y = barAreaHeight - barH;
        const opacity = 0.15 + 0.85 * (d.value / max);

        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={barH} rx="1.5" fill={color} opacity={opacity} />
            <text
              x={x + w / 2}
              y={height - 2}
              textAnchor="middle"
              fontSize="5"
              fill="#94a3b8"
              fontWeight="500"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
