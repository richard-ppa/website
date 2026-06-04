import { HANGAR_DATA, MAP_THEME } from "./map-data";

const T = MAP_THEME;

// Estimated tooltip dimensions used to detect overflow and flip side. We use
// estimates rather than measuring on render to avoid a render→measure→re-render
// flicker. The values are slightly larger than the actual rendered size so
// the flip happens before any clipping is visible.
const TOOLTIP_W = 270;
const TOOLTIP_H = 140;
const OFFSET = 14;

interface HangarTooltipProps {
  hangarId: string | null;
  /** Position relative to the diagram column (wrapper) — NOT the viewport. */
  mousePos: { x: number; y: number };
  /** Wrapper dimensions, used to clamp/flip the tooltip when it would overflow. */
  bounds: { width: number; height: number };
}

export function HangarTooltip({ hangarId, mousePos, bounds }: HangarTooltipProps) {
  if (!hangarId) return null;
  const d = HANGAR_DATA[hangarId];
  if (!d) return null;

  // Flip the tooltip to the left/up side of the cursor if showing it on the
  // right/below would overflow the diagram wrapper.
  let left = mousePos.x + OFFSET;
  let top = mousePos.y + OFFSET;
  if (bounds.width > 0 && left + TOOLTIP_W > bounds.width) {
    left = Math.max(0, mousePos.x - OFFSET - TOOLTIP_W);
  }
  if (bounds.height > 0 && top + TOOLTIP_H > bounds.height) {
    top = Math.max(0, mousePos.y - OFFSET - TOOLTIP_H);
  }

  return (
    <div
      role="tooltip"
      style={{
        position: "absolute",
        left,
        top,
        background: T.panelBg,
        border: `1px solid ${T.panelBorder}`,
        borderRadius: 6,
        padding: "12px 16px 14px",
        color: T.text,
        fontFamily: "var(--font-archivo), system-ui, sans-serif",
        pointerEvents: "none",
        zIndex: 50,
        minWidth: 230,
        boxShadow: T.panelShadow,
        whiteSpace: "nowrap",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 9.5,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: T.textMuted,
            fontWeight: 700,
            marginBottom: 2,
          }}
        >
          Hangar
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: T.accent,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {d.number}
        </div>
      </div>
      <div
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: `1px solid ${T.panelBorder}`,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          fontSize: 11.5,
          color: T.textMuted,
        }}
      >
        <Row label="Hangar" value={`${d.hangarSqft.toLocaleString()} sqft`} />
        <Row label="Ramp" value={`${d.rampSqft.toLocaleString()} sqft`} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span>{label}</span>
      <span style={{ color: T.text, fontWeight: 600 }}>{value}</span>
    </div>
  );
}
