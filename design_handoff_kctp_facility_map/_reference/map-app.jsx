const { useState, useEffect, useRef, useLayoutEffect } = React;

const T = window.MAP_THEME;

// ============================================================
// SVG theming + decoration: applied as scoped CSS
// ============================================================
function buildSvgCSS(scope) {
  const lines = [];
  // Hide the embedded stats card (light-blue panel + its dark-blue outline + the text)
  lines.push(`${scope} path[fill="#EEFAFF"], ${scope} path[fill="#eefaff"] { display: none; }`);
  // Stats-card text uses navy #273B80 — hide it (hangar number labels use cyan #00ADEE, those stay)
  lines.push(`${scope} text[fill="#273B80"], ${scope} text[fill="#273b80"] { display: none; }`);
  lines.push(`${scope} text tspan[fill="#273B80"], ${scope} text tspan[fill="#273b80"] { display: none; }`);
  lines.push(`${scope} [data-stats-card] { display: none; }`);
  lines.push(`${scope} [data-bg-card] { display: none; }`);
  lines.push(`${scope} [data-logo] { display: none; }`);

  // Hangars
  lines.push(`${scope} path[data-hangar] {
    fill: ${T.hangarFill};
    cursor: pointer;
    transition: fill 240ms ease, filter 240ms ease;
  }`);
  lines.push(`${scope} path[data-hangar]:hover, ${scope} path[data-hangar].is-hover {
    fill: ${T.hangarHover};
    stroke: ${T.accent2};
    stroke-width: 2.5;
    paint-order: stroke fill;
  }`);
  lines.push(`${scope} path[data-hangar].is-active {
    fill: ${T.hangarActive} !important;
    stroke: #ffffff;
    stroke-width: 2;
    paint-order: stroke fill;
    filter: drop-shadow(0 6px 14px ${T.accent2}88);
  }`);
  // Ramps
  lines.push(`${scope} path[data-ramp] {
    fill: ${T.rampFill};
    cursor: pointer;
    transition: fill 220ms ease;
  }`);
  lines.push(`${scope} path[data-ramp]:hover, ${scope} path[data-ramp].is-hover {
    fill: ${T.rampHover};
  }`);
  lines.push(`${scope} path[data-ramp].is-active {
    fill: ${T.rampActive};
  }`);
  // Cyan label text → white on the hangar
  lines.push(`${scope} text[fill="#00ADEE"] {
    fill: #ffffff;
    font-weight: 900;
  }`);
  return lines.join("\n");
}

// Hide any SVG <text> nodes whose center falls inside the stats-card region.
// Card bbox in original viewBox coords (measured before display:none was applied).
function hideStatsCardText(svgEl) {
  const cb = { x: 101, y: 369, w: 836, h: 560 };
  const inside = (b) => {
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    return cx >= cb.x && cx <= cb.x + cb.w && cy >= cb.y && cy <= cb.y + cb.h;
  };
  svgEl.querySelectorAll("text").forEach((t) => {
    try { if (inside(t.getBBox())) t.style.display = "none"; } catch (e) {}
  });
  svgEl.querySelectorAll('path[fill="#273B80"], path[fill="#273b80"], rect[fill="#273B80"], rect[fill="#273b80"], line[fill="#273B80"], line[fill="#273b80"]').forEach((p) => {
    try { if (inside(p.getBBox())) p.style.display = "none"; } catch (e) {}
  });
}

// ============================================================
// Inlined SVG host
// ============================================================
function MapSVG({ hovered, setHovered, active, setActive, animations }) {
  const wrapRef = useRef(null);
  const [bounds, setBounds] = useState(null);

  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const svgEl = wrapRef.current.querySelector("svg.kctp-map-svg");
    if (!svgEl) return;
    // Crop the viewBox to focus on the airport (hangars + runway), excluding the
    // empty space where the stats card used to be.
    svgEl.setAttribute("viewBox", "440 60 1180 1100");
    svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svgEl.style.width = "100%";
    svgEl.style.height = "100%";
    svgEl.style.display = "block";

    hideStatsCardText(svgEl);

    const hangarPaths = svgEl.querySelectorAll("path[data-hangar]");
    const rampPaths = svgEl.querySelectorAll("path[data-ramp]");

    function attach(path, kind) {
      const id = path.getAttribute(`data-${kind}`);
      const onEnter = () => setHovered(id);
      const onLeave = () => setHovered(null);
      const onClick = (e) => {
        e.stopPropagation();
        setActive((curr) => (curr === id ? null : id));
      };
      path.addEventListener("mouseenter", onEnter);
      path.addEventListener("mouseleave", onLeave);
      path.addEventListener("click", onClick);
      return () => {
        path.removeEventListener("mouseenter", onEnter);
        path.removeEventListener("mouseleave", onLeave);
        path.removeEventListener("click", onClick);
      };
    }
    const cleanups = [];
    hangarPaths.forEach((p) => cleanups.push(attach(p, "hangar")));
    rampPaths.forEach((p) => cleanups.push(attach(p, "ramp")));

    const rampCenters = {};
    rampPaths.forEach((p) => {
      const id = p.getAttribute("data-ramp");
      const bbox = p.getBBox();
      rampCenters[id] = { cx: bbox.x + bbox.width / 2, cy: bbox.y + bbox.height / 2 };
    });

    const vb = svgEl.getAttribute("viewBox").split(/\s+/).map(Number);
    setBounds({ viewBox: vb, rampCenters });

    return () => cleanups.forEach((c) => c());
  }, []);

  // Update active/hover classes
  useEffect(() => {
    if (!wrapRef.current) return;
    const svgEl = wrapRef.current.querySelector("svg.kctp-map-svg");
    if (!svgEl) return;
    svgEl.querySelectorAll("path[data-hangar]").forEach((p) => {
      const id = p.getAttribute("data-hangar");
      p.classList.toggle("is-active", id === active);
      p.classList.toggle("is-hover", id === hovered && id !== active);
    });
    svgEl.querySelectorAll("path[data-ramp]").forEach((p) => {
      const id = p.getAttribute("data-ramp");
      p.classList.toggle("is-active", id === active);
      p.classList.toggle("is-hover", id === hovered && id !== active);
    });
  }, [hovered, active]);

  return (
    <div
      ref={wrapRef}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={() => setActive(null)}
    >
      <style>{buildSvgCSS(".kctp-map-host")}</style>
      <div className="kctp-map-host" style={{
        position: "absolute", inset: 16, display: "flex",
        alignItems: "center", justifyContent: "center"
      }}>
        <div
          style={{ position: "relative", width: "100%", height: "100%" }}
          dangerouslySetInnerHTML={{
            __html: `<svg class="kctp-map-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1617.70215 1220.93567">${window.KCTP_MAP_SVG}</svg>`
          }}
        />

        {bounds && (
          <svg
            viewBox={bounds.viewBox.join(" ")}
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              pointerEvents: "none"
            }}
          >
            <defs>
              <filter id="plane-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.35" />
              </filter>
              <filter id="cloud-blur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
              <filter id="cloud-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="14" in="SourceGraphic" result="blur" />
              </filter>
              <radialGradient id="cloud-grad" cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#ffffff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {animations !== "off" && <AnimatedPlane intensity={animations} />}

            {Object.entries(bounds.rampCenters).map(([id, c]) => (
              <ParkedPlane key={id} cx={c.cx} cy={c.cy} />
            ))}

            {animations !== "off" && <Clouds intensity={animations} />}
          </svg>
        )}
      </div>
    </div>
  );
}

function AnimatedPlane({ intensity }) {
  const speeds = { subtle: 22, medium: 14, rich: 9 };
  const dur = speeds[intensity] || 14;
  const path = "M 644 279 L 1033 1470";
  return (
    <g filter="url(#plane-shadow)">
      <g>
        <animateMotion dur={`${dur}s`} repeatCount="indefinite" rotate="auto" path={path} />
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1.6;1.2;0.7;0.55;0.55"
          keyTimes="0;0.25;0.55;0.8;1"
          dur={`${dur}s`}
          repeatCount="indefinite"
          additive="sum"
        />
        <PlaneGlyph />
      </g>
    </g>
  );
}

function ParkedPlane({ cx, cy }) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(-18.03)`}>
      <g transform="scale(0.55)">
        <PlaneGlyph />
      </g>
    </g>
  );
}

function PlaneGlyph() {
  return (
    <g>
      <ellipse cx="0" cy="0" rx="22" ry="4" fill={T.accent} />
      <polygon points="-4,-22 4,-22 8,-2 -8,-2" fill={T.accent} />
      <polygon points="-4,22 4,22 8,2 -8,2" fill={T.accent} />
      <polygon points="-18,-7 -14,-7 -12,0 -18,0" fill={T.accent} />
      <polygon points="-18,7 -14,7 -12,0 -18,0" fill={T.accent} />
      <ellipse cx="6" cy="0" rx="4" ry="2.4" fill="#0b1220" opacity="0.55" />
    </g>
  );
}

Object.assign(window, { MapSVG, AnimatedPlane, ParkedPlane, PlaneGlyph, Clouds });

// ============================================================
// Clouds — semi-transparent, soft-edged, drifting across the scene
// ============================================================
function Cloud({ scale, opacity, blur }) {
  // A blob built from several overlapping ellipses with a soft radial fill,
  // drawn through a gaussian blur for naturalistic edges.
  return (
    <g transform={`scale(${scale})`} opacity={opacity} filter="url(#cloud-blur)">
      <ellipse cx="0" cy="0" rx="90" ry="26" fill="url(#cloud-grad)" />
      <ellipse cx="-50" cy="-8" rx="48" ry="24" fill="url(#cloud-grad)" />
      <ellipse cx="40" cy="-14" rx="58" ry="26" fill="url(#cloud-grad)" />
      <ellipse cx="-80" cy="6" rx="36" ry="18" fill="url(#cloud-grad)" />
      <ellipse cx="78" cy="2" rx="40" ry="20" fill="url(#cloud-grad)" />
      <ellipse cx="10" cy="-22" rx="34" ry="18" fill="url(#cloud-grad)" />
    </g>
  );
}

function Clouds({ intensity }) {
  // viewBox is 440 60 1180 1100 — clouds drift left-to-right across this band.
  const speed = intensity === "rich" ? 1 : intensity === "subtle" ? 0.55 : 0.75;
  // Each cloud: y position, scale, opacity, duration (s), begin offset (s).
  const clouds = [
    { y: 220,  scale: 1.61, opacity: 0.72, dur: 95,  begin: 0 },
    { y: 580,  scale: 1.04, opacity: 0.58, dur: 72,  begin: -38 },
    { y: 980,  scale: 1.38, opacity: 0.66, dur: 110, begin: -65 },
    { y: 380,  scale: 0.81, opacity: 0.50, dur: 60,  begin: -22 },
    { y: 1300, scale: 1.15, opacity: 0.55, dur: 88,  begin: -52 },
  ];
  // Drift band: from x = 280 (off-screen left) to x = 1820 (off-screen right)
  const startX = 280, endX = 1820;
  return (
    <g pointerEvents="none">
      {clouds.map((c, i) => (
        <g key={i} transform={`translate(0, ${c.y})`}>
          <Cloud scale={c.scale} opacity={c.opacity} />
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

// ============================================================
// DEMO PAGE — shows the LocationCard at two widths so the user can
// preview both the "embedded in About page right column" version
// and the standalone wider version.
// ============================================================
function DemoApp() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F4F1EC",
      padding: "48px 32px",
      fontFamily: "'Archivo', system-ui, sans-serif",
      color: T.text,
      overflowY: "auto"
    }}>
      <div style={{ maxWidth: 1480, margin: "0 auto" }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
          color: T.textMuted, fontWeight: 700, marginBottom: 8
        }}>
          Plane Place Aviation · Facility Map Component
        </div>
        <h1 style={{
          margin: 0, fontSize: 30, fontWeight: 800, color: T.text,
          letterSpacing: "-0.02em"
        }}>
          Two layouts for two contexts
        </h1>
        <p style={{
          marginTop: 8, fontSize: 14, color: T.textMuted, maxWidth: 720,
          lineHeight: 1.55
        }}>
          The same component adapts to its container. Below ~960px wide it stacks
          (text on top, diagram below) for the About page right column.
          Above 960px it splits side-by-side for a dedicated /facility page.
        </p>

        <div style={{ marginTop: 36 }}>
          <SectionHeader>Standalone — full width (≈ 1240px)</SectionHeader>
          <div style={{ width: "100%", maxWidth: 1240 }}>
            <LocationCard />
          </div>
        </div>

        <div style={{ marginTop: 56 }}>
          <SectionHeader>Embedded — About-page column (≈ 720px)</SectionHeader>
          <div style={{ width: 720, maxWidth: "100%" }}>
            <LocationCard />
          </div>
        </div>

        <div style={{ height: 80 }} />
      </div>

      <style>{`
        @keyframes kctp-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes kctp-scale-in { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(15,40,80,0.18); border-radius: 4px; }
      `}</style>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14, marginBottom: 18
    }}>
      <span style={{ width: 24, height: 2, background: T.accent2 }} />
      <span style={{
        fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
        color: T.text, fontWeight: 700
      }}>
        {children}
      </span>
    </div>
  );
}

Object.assign(window, { DemoApp, SectionHeader });
