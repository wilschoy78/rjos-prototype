/**
 * Renders a lightweight SVG trend chart for presentation dashboards.
 *
 * @param {object} props Component props.
 * @param {string[]} props.labels Axis labels.
 * @param {number[]} props.values Numeric series values.
 * @param {string} props.color Accent color.
 * @returns {JSX.Element} Trend chart.
 */
function TrendChart({ labels, values, color }) {
  const width = 640;
  const height = 220;
  const padding = 24;
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const valueRange = Math.max(maxValue - minValue, 1);
  const stepX = (width - padding * 2) / Math.max(values.length - 1, 1);

  const points = values.map((value, index) => {
    const x = padding + index * stepX;
    const y = height - padding - ((value - minValue) / valueRange) * (height - padding * 2);
    return { x, y, value, label: labels[index] };
  });

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPath = [
    `M ${points[0]?.x ?? padding} ${height - padding}`,
    ...points.map((point) => `L ${point.x} ${point.y}`),
    `L ${points[points.length - 1]?.x ?? width - padding} ${height - padding}`,
    'Z',
  ].join(' ');

  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const y = padding + index * ((height - padding * 2) / 3);
    return y;
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full">
        <defs>
          <linearGradient id="trend-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.34" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {gridLines.map((y) => (
          <line
            key={y}
            x1={padding}
            x2={width - padding}
            y1={y}
            y2={y}
            stroke="rgba(113, 113, 122, 0.16)"
            strokeDasharray="4 6"
          />
        ))}

        <path d={areaPath} fill="url(#trend-area)" />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylinePoints}
        />

        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="4" fill={color} />
            <circle cx={point.x} cy={point.y} r="8" fill={color} fillOpacity="0.12" />
            <text x={point.x} y={height - 8} textAnchor="middle" fontSize="11" fill="#71717a">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default TrendChart;
