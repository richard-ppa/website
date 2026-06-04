import { MAP_THEME } from "./map-data";

export function PlaneGlyph() {
  const c = MAP_THEME.accent;
  return (
    <g>
      <ellipse cx="0" cy="0" rx="22" ry="4" fill={c} />
      <polygon points="-4,-22 4,-22 8,-2 -8,-2" fill={c} />
      <polygon points="-4,22 4,22 8,2 -8,2" fill={c} />
      <polygon points="-18,-7 -14,-7 -12,0 -18,0" fill={c} />
      <polygon points="-18,7 -14,7 -12,0 -18,0" fill={c} />
      <ellipse cx="6" cy="0" rx="4" ry="2.4" fill="#0b1220" opacity="0.55" />
    </g>
  );
}
