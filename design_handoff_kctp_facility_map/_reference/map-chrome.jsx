// Header bar + corner widgets — chrome around the facility map

// Plane Place "P" logo mark — vector recreation
function PlanePlaceLogo({ size = 36, color = "#134B7A", accent = "#1E9FD8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Main "P" shape — chevron-like geometric P */}
      <path
        d="M 14 6 L 14 58 L 22 58 L 22 40 L 38 40 C 48 40 56 32.5 56 23 C 56 13.5 48 6 38 6 Z M 22 14 L 38 14 C 43.5 14 48 18 48 23 C 48 28 43.5 32 38 32 L 22 32 Z"
        fill={color}
      />
      {/* Accent triangle */}
      <path d="M 6 6 L 14 6 L 14 22 Z" fill={accent} />
    </svg>
  );
}

function Header({ theme, info, company, onQuoteClick }) {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 72,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px",
      background: "rgba(255,255,255,0.86)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: `1px solid ${theme.panelBorder}`,
      zIndex: 30,
      fontFamily: "'Archivo', system-ui, sans-serif",
      color: theme.text
    }}>
      {/* Left: logo + company + cert */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <PlanePlaceLogo size={40} color={theme.accent} accent={theme.accent2} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "0.01em", lineHeight: 1 }}>
            {company.name}
          </div>
          <div style={{ fontSize: 10.5, color: theme.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
            {company.certification}
          </div>
        </div>
      </div>

      {/* Center: facility map title (hides on small) */}
      <div className="kctp-header-center" style={{
        position: "absolute", left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 14
      }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
          color: theme.textMuted, fontWeight: 700
        }}>
          Facility Map
        </div>
        <div style={{ width: 1, height: 16, background: theme.panelBorder }} />
        <div style={{ fontSize: 12, color: theme.text, fontWeight: 600, letterSpacing: "0.04em" }}>
          {info.icao} · {info.cityState}
        </div>
      </div>

      {/* Right: AOG + CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <a href={`tel:${company.aog.replace(/[^\d]/g, "")}`} style={{
          display: "flex", alignItems: "center", gap: 8,
          textDecoration: "none", color: theme.text, fontFamily: "inherit"
        }}>
          <span style={{ display: "inline-flex", position: "relative", width: 8, height: 8 }}>
            <span style={{
              position: "absolute", inset: 0, borderRadius: 4, background: theme.warning,
              animation: "kctp-aog-pulse 1.8s ease-out infinite"
            }} />
            <span style={{ position: "absolute", inset: 0, borderRadius: 4, background: theme.warning }} />
          </span>
          <span style={{
            fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase",
            color: theme.textMuted, fontWeight: 700
          }}>AOG</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: theme.accent2, letterSpacing: "-0.01em" }}>
            {company.aog}
          </span>
        </a>
        <button
          onClick={onQuoteClick}
          style={{
            background: theme.accent, color: "#fff", border: "none",
            padding: "11px 22px", borderRadius: 4, cursor: "pointer",
            fontFamily: "inherit", fontSize: 11.5, fontWeight: 800,
            letterSpacing: "0.14em", textTransform: "uppercase",
            transition: "background 180ms ease, transform 120ms ease",
            boxShadow: "0 2px 0 rgba(0,0,0,0.06)"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = theme.accentDark}
          onMouseLeave={(e) => e.currentTarget.style.background = theme.accent}
        >
          Get a Quote
        </button>
      </div>
    </div>
  );
}

// Compass rose + runway designation, bottom-left
function CompassAndRunway({ theme, info, anchor }) {
  // Anchor under the stats card if we have its rect; otherwise fall back to bottom-left
  const positioned = anchor
    ? { left: anchor.left, top: anchor.top + anchor.height + 16 }
    : { left: 28, bottom: 28 };
  return (
    <div style={{
      position: "absolute", ...positioned,
      display: "flex", alignItems: "flex-end", gap: 18,
      fontFamily: "'Archivo', system-ui, sans-serif", color: theme.text,
      pointerEvents: "none", zIndex: 12,
      transition: "left 240ms ease, top 240ms ease",
    }}>
      <CompassRose size={64} theme={theme} />
      <div style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${theme.panelBorder}`,
        borderRadius: 4,
        padding: "10px 14px",
        boxShadow: theme.panelShadow,
      }}>
        <div style={{
          fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase",
          color: theme.textMuted, fontWeight: 700, marginBottom: 4
        }}>
          Runway {info.runway.designation}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: theme.text, letterSpacing: "-0.01em" }}>
            {info.runway.length}
          </span>
          <span style={{ fontSize: 10.5, color: theme.textMuted, fontWeight: 600 }}>
            × {info.runway.width} · {info.runway.surface}
          </span>
        </div>
      </div>
    </div>
  );
}

function CompassRose({ size = 64, theme }) {
  // Runway aligned -18.03° from vertical (north-up) — rose oriented true north
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" style={{
      filter: "drop-shadow(0 4px 10px rgba(15,40,80,0.12))"
    }}>
      <circle r="44" fill="rgba(255,255,255,0.92)" stroke={theme.panelBorder} strokeWidth="1" />
      {/* Cardinal ticks */}
      {[0, 90, 180, 270].map((a) => (
        <line key={a} x1="0" y1="-40" x2="0" y2="-32" stroke={theme.textMuted} strokeWidth="1.4"
              transform={`rotate(${a})`} />
      ))}
      {/* Inter-cardinal ticks */}
      {[45, 135, 225, 315].map((a) => (
        <line key={a} x1="0" y1="-38" x2="0" y2="-34" stroke={theme.textFaint} strokeWidth="1"
              transform={`rotate(${a})`} />
      ))}
      {/* North arrow — accent blue */}
      <polygon points="0,-30 -6,4 0,-2 6,4" fill={theme.accent} />
      <polygon points="0,-30 0,-2 6,4" fill={theme.accentDark} />
      {/* South */}
      <polygon points="0,30 -6,-4 0,2 6,-4" fill={theme.textMuted} opacity="0.3" />
      {/* N letter */}
      <text x="0" y="-42" textAnchor="middle" fontSize="10" fontWeight="800"
            fontFamily="'Archivo', sans-serif" fill={theme.accent}>N</text>
      {/* Center cap */}
      <circle r="2.5" fill={theme.accent} />
    </svg>
  );
}

// Decorative coordinate type — top-right (under header) and bottom-right corners
function CornerCoordinates({ theme, info }) {
  return (
    <>
      {/* Top-right small ICAO/coords stack — but BELOW the header */}
      <div style={{
        position: "absolute", top: 28, right: 28,
        textAlign: "right", fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        color: theme.textMuted, fontSize: 10.5, letterSpacing: "0.08em",
        lineHeight: 1.6, pointerEvents: "none", zIndex: 12
      }}>
        <div style={{ fontWeight: 700, color: theme.accent, fontSize: 12, letterSpacing: "0.18em" }}>
          {info.icao} · {info.iata}
        </div>
        <div>{info.coords.lat}</div>
        <div>{info.coords.lon}</div>
      </div>
    </>
  );
}

function ScaleBar({ theme }) {
  // Visual scale only — the SVG isn't georeferenced, so this is decorative
  return (
    <div style={{
      position: "absolute", bottom: 28, right: 28,
      display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6,
      fontFamily: "'JetBrains Mono', monospace",
      pointerEvents: "none", zIndex: 12
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 0,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)",
        padding: "6px 10px", borderRadius: 3,
        border: `1px solid ${theme.panelBorder}`,
      }}>
        <div style={{ display: "flex", height: 4 }}>
          <div style={{ width: 28, background: theme.text }} />
          <div style={{ width: 28, background: "transparent", borderTop: `4px solid ${theme.text}`, borderBottom: `4px solid ${theme.text}`, marginTop: -4 }} />
          <div style={{ width: 28, background: theme.text }} />
        </div>
        <div style={{
          fontSize: 9.5, color: theme.textMuted, marginLeft: 10,
          letterSpacing: "0.08em", fontWeight: 600
        }}>500 FT</div>
      </div>
    </div>
  );
}

// Status legend — bottom-center (small)
function MapLegend({ theme }) {
  const items = [
    { color: theme.accent2, label: "Available" },
    { color: theme.accent, label: "Leased" },
    { color: theme.rampFill, label: "Ramp" },
  ];
  return (
    <div style={{
      position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
      display: "flex", gap: 18, alignItems: "center",
      background: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(8px)",
      padding: "10px 18px", borderRadius: 4,
      border: `1px solid ${theme.panelBorder}`,
      boxShadow: theme.panelShadow,
      fontFamily: "'Archivo', system-ui, sans-serif",
      fontSize: 11, color: theme.text, fontWeight: 600, letterSpacing: "0.06em",
      pointerEvents: "none", zIndex: 12
    }}>
      {items.map((it) => (
        <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: it.color, display: "inline-block" }} />
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

// Export to global window so other Babel scripts can use them
Object.assign(window, {
  PlanePlaceLogo, Header, CompassAndRunway, CompassRose, CornerCoordinates, MapLegend
});
