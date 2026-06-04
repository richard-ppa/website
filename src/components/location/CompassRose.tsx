import { MAP_THEME } from "./map-data";

interface CompassRoseProps {
  size?: number;
}

export function CompassRose({ size = 42 }: CompassRoseProps) {
  const T = MAP_THEME;
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      style={{ filter: "drop-shadow(0 4px 10px rgba(15,40,80,0.12))" }}
      aria-hidden="true"
    >
      <circle r="44" fill="rgba(255,255,255,0.92)" stroke={T.panelBorder} strokeWidth="1" />
      {[0, 90, 180, 270].map((a) => (
        <line
          key={a}
          x1="0"
          y1="-40"
          x2="0"
          y2="-32"
          stroke={T.textMuted}
          strokeWidth="1.4"
          transform={`rotate(${a})`}
        />
      ))}
      {[45, 135, 225, 315].map((a) => (
        <line
          key={a}
          x1="0"
          y1="-38"
          x2="0"
          y2="-34"
          stroke={T.textFaint}
          strokeWidth="1"
          transform={`rotate(${a})`}
        />
      ))}
      <polygon points="0,-30 -6,4 0,-2 6,4" fill={T.accent} />
      <polygon points="0,-30 0,-2 6,4" fill={T.accentDark} />
      <polygon points="0,30 -6,-4 0,2 6,-4" fill={T.textMuted} opacity="0.3" />
      <text
        x="0"
        y="-42"
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fontFamily="var(--font-archivo), sans-serif"
        fill={T.accent}
      >
        N
      </text>
      <circle r="2.5" fill={T.accent} />
    </svg>
  );
}
