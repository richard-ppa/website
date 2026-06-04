// LocationCard — drop-in replacement for the website's "Location" section.
// Includes the eyebrow + heading + body + address + Get Directions link,
// followed by the interactive airport diagram. Adapts to its container width.

const SITE_COPY = {
  eyebrow: "Location",
  heading: "Cleburne, Texas — KCPT",
  body: "80,000 sq ft of hangar space across four hangars at Cleburne Regional Airport — 30 minutes south of DFW. Lower operating costs than Love Field or Addison translate directly to better value for our customers, with comfortable lounge and office space for visiting crews.",
  address1: "1650 Airport Dr, Hangar 98",
  address2: "Cleburne, TX 76033",
  directionsHref: "https://www.google.com/maps/dir/?api=1&destination=1650+Airport+Dr+Cleburne+TX+76033",
};

function LocationCard({ theme = window.MAP_THEME }) {
  const T = theme;
  const wrapRef = React.useRef(null);
  const [width, setWidth] = React.useState(960);
  const [hovered, setHovered] = React.useState(null);
  const [active, setActive] = React.useState(null);
  const [statsRect, setStatsRect] = React.useState(null);
  const [mousePos, setMousePos] = React.useState({ vx: 0, vy: 0 });
  const [quoteOpen, setQuoteOpen] = React.useState(false);
  const [quotePrefill, setQuotePrefill] = React.useState("");

  // Container query via ResizeObserver
  React.useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(e.contentRect.width);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);
  const isWide = width >= 960;

  // ESC closes
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (quoteOpen) setQuoteOpen(false);
      else if (active) setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, quoteOpen]);

  // Track mouse for tooltip
  React.useEffect(() => {
    const onMove = (e) => setMousePos({ vx: e.clientX, vy: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const openQuote = (n = "") => { setQuotePrefill(n ? `Hangar ${n}` : ""); setQuoteOpen(true); };

  return (
    <div ref={wrapRef} className="ppa-loc" style={{
      position: "relative",
      width: "100%",
      background: "#ffffff",
      border: `1px solid ${T.panelBorder}`,
      borderRadius: 8,
      overflow: "hidden",
      fontFamily: "'Archivo', system-ui, sans-serif",
      color: T.text,
      boxShadow: "0 8px 28px rgba(15,40,80,0.08), 0 1px 3px rgba(15,40,80,0.04)",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: isWide ? "minmax(340px, 0.85fr) minmax(0, 1.15fr)" : "1fr",
        minHeight: isWide ? 620 : "auto",
      }}>
        <TextColumn theme={T} isWide={isWide} onQuoteClick={() => openQuote()} />
        <div style={{
          position: "relative",
          minHeight: isWide ? "auto" : Math.max(420, Math.min(width * 0.95, 620)),
          background: T.bgGradient,
          borderTop: isWide ? "none" : `1px solid ${T.panelBorder}`,
          borderLeft: isWide ? `1px solid ${T.panelBorder}` : "none",
        }}>
          <MapSVG
            hovered={hovered}
            setHovered={setHovered}
            active={active}
            setActive={setActive}
            animations="rich"
            setStatsRect={setStatsRect}
            embedded
          />
          <MapBadge theme={T} info={window.AIRPORT_INFO} />
          <AddressBadge theme={T} />
          <StatsBadge theme={T} />
          <CoordsCorner theme={T} info={window.AIRPORT_INFO} />
          <SidePanel
            hangarId={active}
            theme={T}
            onClose={() => setActive(null)}
            onQuoteClick={openQuote}
            embedded
            narrow={!isWide}
          />
          <HoverTooltip
            hangarId={hovered && hovered !== active ? hovered : null}
            mousePos={mousePos}
            theme={T}
          />
        </div>
      </div>

      <QuoteModal
        open={quoteOpen}
        hangarPrefill={quotePrefill}
        theme={T}
        onClose={() => setQuoteOpen(false)}
      />
    </div>
  );
}

function TextColumn({ theme, isWide, onQuoteClick }) {
  const T = theme;
  return (
    <div style={{
      padding: isWide ? "44px 40px 40px" : "32px 28px 28px",
      display: "flex", flexDirection: "column",
      justifyContent: "flex-start",
      gap: 0,
    }}>
      {/* Eyebrow with brand bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <span style={{ width: 20, height: 2, background: T.accent2, display: "inline-block" }} />
        <span style={{
          fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
          color: T.accent2, fontWeight: 700,
        }}>
          {SITE_COPY.eyebrow}
        </span>
      </div>

      {/* Heading */}
      <h2 style={{
        margin: 0, fontSize: isWide ? 38 : 32, lineHeight: 1.05,
        fontWeight: 800, letterSpacing: "-0.02em", color: T.text,
      }}>
        {SITE_COPY.heading}
      </h2>

      {/* Body */}
      <p style={{
        marginTop: 18, marginBottom: 0,
        fontSize: 14.5, lineHeight: 1.65, color: T.textMuted,
        textWrap: "pretty", maxWidth: 540,
      }}>
        {SITE_COPY.body}
      </p>


    </div>
  );
}

function Stat({ label, value, theme }) {
  return (
    <div>
      <div style={{
        fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em",
        color: theme.accent, lineHeight: 1, fontStyle: "italic"
      }}>{value}</div>
      <div style={{
        marginTop: 6, fontSize: 9.5, color: theme.textMuted, fontWeight: 700,
        letterSpacing: "0.16em", textTransform: "uppercase"
      }}>{label}</div>
    </div>
  );
}

function MapBadge({ theme, info }) {
  return (
    <div style={{
      position: "absolute", bottom: 18, left: 18,
      display: "flex", alignItems: "flex-start", gap: 12,
      background: "rgba(255,255,255,0.94)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      border: `1px solid ${theme.panelBorder}`,
      borderRadius: 4, padding: "8px 14px 8px 8px",
      boxShadow: "0 4px 14px rgba(15,40,80,0.10)",
      pointerEvents: "none", zIndex: 12,
      fontFamily: "'Archivo', system-ui, sans-serif",
    }}>
      <CompassRose size={42} theme={theme} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{
            fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
            color: theme.textMuted, fontWeight: 700
          }}>
            Runway {info.runway.designation}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: theme.text, letterSpacing: "-0.01em" }}>
              {info.runway.length}
            </span>
            <span style={{ fontSize: 9.5, color: theme.textMuted, fontWeight: 600 }}>
              · {info.runway.surface}
            </span>
          </div>
        </div>
        {/* Horizontal divider */}
        <div style={{ height: 1, background: theme.panelBorder, marginTop: 2 }} />
        {/* Coordinates stacked underneath */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 1,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: theme.accent,
            letterSpacing: "0.18em"
          }}>
            {info.icao} · {info.iata}
          </div>
          <div style={{ fontSize: 9, color: theme.textMuted, letterSpacing: "0.04em" }}>
            {info.coords.lat}
          </div>
          <div style={{ fontSize: 9, color: theme.textMuted, letterSpacing: "0.04em" }}>
            {info.coords.lon}
          </div>
        </div>
      </div>
    </div>
  );
}

function CoordsCorner() { return null; }

function AddressBadge({ theme }) {
  return (
    <a
      href={SITE_COPY.directionsHref}
      target="_blank"
      rel="noopener"
      style={{
        position: "absolute", top: 18, right: 18, zIndex: 12,
        display: "flex", flexDirection: "column", gap: 2,
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${theme.panelBorder}`,
        borderRadius: 4, padding: "10px 14px",
        boxShadow: "0 4px 14px rgba(15,40,80,0.10)",
        textDecoration: "none",
        fontFamily: "'Archivo', system-ui, sans-serif",
        transition: "transform 120ms ease, box-shadow 120ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 18px rgba(15,40,80,0.16)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(15,40,80,0.10)";
      }}
    >
      <div style={{
        fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
        color: theme.textMuted, fontWeight: 700, marginBottom: 2,
      }}>
        Address
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, lineHeight: 1.35 }}>
        {SITE_COPY.address1}
      </div>
      <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.35 }}>
        {SITE_COPY.address2}
      </div>
      <div style={{
        marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 10.5, fontWeight: 800, color: theme.accent2,
        letterSpacing: "0.16em", textTransform: "uppercase",
      }}>
        Get Directions
        <span style={{ fontSize: 13, lineHeight: 1, transform: "translateY(-1px)" }}>→</span>
      </div>
    </a>
  );
}

function StatsBadge({ theme }) {
  return (
    <div style={{
      position: "absolute", top: 168, right: 18, zIndex: 12,
      background: "rgba(255,255,255,0.94)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      border: `1px solid ${theme.panelBorder}`,
      borderRadius: 4, padding: "12px 16px",
      boxShadow: "0 4px 14px rgba(15,40,80,0.10)",
      fontFamily: "'Archivo', system-ui, sans-serif",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      <Stat label="Hangars" value="4" theme={theme} />
      <Stat label="Hangar sqft" value="80k" theme={theme} />
      <Stat label="Ramp sqft" value="115k" theme={theme} />
    </div>
  );
}

Object.assign(window, { LocationCard, TextColumn, MapBadge, AddressBadge, StatsBadge, CoordsCorner, SITE_COPY });

ReactDOM.createRoot(document.getElementById("root")).render(<DemoApp />);
