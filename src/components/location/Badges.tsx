import { CompassRose } from "./CompassRose";
import { AIRPORT_INFO, MAP_THEME, SITE_COPY, STATS } from "./map-data";

const T = MAP_THEME;

const SURFACE_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.94)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: `1px solid ${T.panelBorder}`,
  borderRadius: 4,
  boxShadow: "0 4px 14px rgba(15,40,80,0.10)",
};

export function AddressBadge() {
  return (
    <a
      href={SITE_COPY.directionsHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open driving directions to Plane Place Aviation, 1650 Airport Dr, Hangar 98, Cleburne, TX 76033"
      className="kctp-address-badge"
      style={{
        ...SURFACE_STYLE,
        position: "absolute",
        top: 18,
        right: 18,
        zIndex: 12,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "10px 14px",
        textDecoration: "none",
        fontFamily: "var(--font-archivo), system-ui, sans-serif",
        transition: "box-shadow 120ms ease",
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: T.textMuted,
          fontWeight: 700,
          marginBottom: 2,
        }}
      >
        Address
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.35 }}>
        {SITE_COPY.address1}
      </div>
      <div style={{ fontSize: 13, color: T.text, lineHeight: 1.35 }}>
        {SITE_COPY.address2}
      </div>
      <div
        style={{
          marginTop: 6,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 10.5,
          fontWeight: 800,
          color: T.accent2,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        Get Directions
        <span style={{ fontSize: 13, lineHeight: 1, transform: "translateY(-1px)" }}>→</span>
      </div>
    </a>
  );
}

export function StatsBadge() {
  return (
    <div
      style={{
        ...SURFACE_STYLE,
        position: "absolute",
        top: 168,
        right: 18,
        zIndex: 12,
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        fontFamily: "var(--font-archivo), system-ui, sans-serif",
      }}
      aria-label="Facility statistics"
    >
      {STATS.map((s) => (
        <div key={s.label}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: T.accent,
              lineHeight: 1,
              fontStyle: "italic",
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 9.5,
              color: T.textMuted,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MapBadge() {
  const info = AIRPORT_INFO;
  return (
    <div
      style={{
        ...SURFACE_STYLE,
        position: "absolute",
        bottom: 18,
        left: 18,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "8px 14px 8px 8px",
        pointerEvents: "none",
        zIndex: 12,
        fontFamily: "var(--font-archivo), system-ui, sans-serif",
      }}
      aria-label={`${info.icao} airport details`}
    >
      <CompassRose size={42} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: T.textMuted,
              fontWeight: 700,
            }}
          >
            Runway {info.runway.designation}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: T.text,
                letterSpacing: "-0.01em",
              }}
            >
              {info.runway.length}
            </span>
            <span style={{ fontSize: 9.5, color: T.textMuted, fontWeight: 600 }}>
              · {info.runway.surface}
            </span>
          </div>
        </div>
        <div style={{ height: 1, background: T.panelBorder, marginTop: 2 }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            fontFamily: "var(--font-jetbrains-mono), 'Courier New', monospace",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: T.accent,
              letterSpacing: "0.18em",
            }}
          >
            {info.icao} · {info.iata}
          </div>
          <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: "0.04em" }}>
            {info.coords.lat}
          </div>
          <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: "0.04em" }}>
            {info.coords.lon}
          </div>
        </div>
      </div>
    </div>
  );
}
