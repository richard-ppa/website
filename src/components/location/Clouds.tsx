interface CloudsProps {
  /** Drift pace. "rich" = baseline, "medium" = 0.75x, "subtle" = 0.55x. */
  intensity?: "rich" | "medium" | "subtle";
}

interface CloudDef {
  y: number;
  scale: number;
  opacity: number;
  dur: number;
  begin: number;
}

const CLOUDS: CloudDef[] = [
  { y: 220, scale: 1.61, opacity: 0.72, dur: 95, begin: 0 },
  { y: 580, scale: 1.04, opacity: 0.58, dur: 72, begin: -38 },
  { y: 980, scale: 1.38, opacity: 0.66, dur: 110, begin: -65 },
  { y: 380, scale: 0.81, opacity: 0.5, dur: 60, begin: -22 },
  { y: 1300, scale: 1.15, opacity: 0.55, dur: 88, begin: -52 },
];

const SPEED_MULT = { rich: 1, medium: 0.75, subtle: 0.55 };

function CloudBlob({ scale, opacity }: { scale: number; opacity: number }) {
  return (
    <g transform={`scale(${scale})`} opacity={opacity} filter="url(#kctp-cloud-blur)">
      <ellipse cx="0" cy="0" rx="90" ry="26" fill="url(#kctp-cloud-grad)" />
      <ellipse cx="-50" cy="-8" rx="48" ry="24" fill="url(#kctp-cloud-grad)" />
      <ellipse cx="40" cy="-14" rx="58" ry="26" fill="url(#kctp-cloud-grad)" />
      <ellipse cx="-80" cy="6" rx="36" ry="18" fill="url(#kctp-cloud-grad)" />
      <ellipse cx="78" cy="2" rx="40" ry="20" fill="url(#kctp-cloud-grad)" />
      <ellipse cx="10" cy="-22" rx="34" ry="18" fill="url(#kctp-cloud-grad)" />
    </g>
  );
}

export function Clouds({ intensity = "rich" }: CloudsProps) {
  const speed = SPEED_MULT[intensity];
  // Drift band: from x = 280 (off-screen left) to x = 1820 (off-screen right)
  // in the original viewBox coordinate system.
  const startX = 280;
  const endX = 1820;
  return (
    <g pointerEvents="none">
      {CLOUDS.map((c, i) => (
        <g key={i} transform={`translate(0, ${c.y})`}>
          <CloudBlob scale={c.scale} opacity={c.opacity} />
          <animateTransform
            attributeName="transform"
            type="translate"
            from={`${startX} ${c.y}`}
            to={`${endX} ${c.y}`}
            dur={`${c.dur / speed}s`}
            begin={`${c.begin}s`}
            repeatCount="indefinite"
            additive="replace"
          />
        </g>
      ))}
    </g>
  );
}
