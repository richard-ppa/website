"use client";

import { useEffect, useRef, useState } from "react";
import { AddressBadge, MapBadge, StatsBadge } from "./Badges";
import { HangarTooltip } from "./HangarTooltip";
import { MapSVG } from "./MapSVG";
import { AIRPORT_INFO, MAP_THEME, SITE_COPY, STATS } from "./map-data";

const T = MAP_THEME;

// Below this width the overlay badges cover the airport diagram, so we hide
// them and render a stacked info strip below instead.
const MOBILE_BREAKPOINT_PX = 768;

/**
 * KCTP Facility Map — page column variant.
 * Stacked text card on top, interactive airport diagram below.
 * Designed for the About page right column (~640–760px wide).
 */
export function KCTPFacilityMap() {
  const [hoveredHangar, setHoveredHangar] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const diagramRef = useRef<HTMLDivElement | null>(null);
  const [diagramSize, setDiagramSize] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Track diagram column dimensions so the tooltip can flip to the left/up
  // edge of the cursor instead of overflowing the wrapper.
  useEffect(() => {
    if (!diagramRef.current) return;
    const el = diagramRef.current;
    const update = () => {
      const r = el.getBoundingClientRect();
      setDiagramSize({ width: r.width, height: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Detect narrow viewports so we can stack the badges instead of overlaying.
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div
      className="kctp-facility-map"
      style={{
        position: "relative",
        width: "100%",
        background: T.panelBg,
        border: `1px solid ${T.panelBorder}`,
        borderRadius: 8,
        overflow: "hidden",
        fontFamily: "var(--font-archivo), system-ui, sans-serif",
        color: T.text,
        boxShadow:
          "0 8px 28px rgba(15,40,80,0.08), 0 1px 3px rgba(15,40,80,0.04)",
      }}
    >
      {/* Text card */}
      <div
        style={{
          padding: "32px 28px 28px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <span
            style={{
              width: 20,
              height: 2,
              background: T.accent2,
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: T.accent2,
              fontWeight: 700,
            }}
          >
            {SITE_COPY.eyebrow}
          </span>
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: 32,
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: T.text,
          }}
        >
          {SITE_COPY.heading}
        </h2>
        <p
          style={{
            marginTop: 18,
            marginBottom: 0,
            fontSize: 14.5,
            lineHeight: 1.65,
            color: T.textMuted,
            textWrap: "pretty" as React.CSSProperties["textWrap"],
            maxWidth: 540,
          }}
        >
          {SITE_COPY.body}
        </p>
      </div>

      {/* Diagram column. Aspect ratio matches the cropped SVG viewBox
          (1180 / 1100) so the airport fills the frame edge-to-edge. */}
      <div
        ref={diagramRef}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1180 / 1100",
          background: T.bgGradient,
          borderTop: `1px solid ${T.panelBorder}`,
        }}
      >
        <MapSVG
          onHoverHangar={setHoveredHangar}
          onMouseMove={(x, y) => setMousePos({ x, y })}
        />
        {!isMobile && (
          <>
            <MapBadge />
            <AddressBadge />
            <StatsBadge />
          </>
        )}
        {/* Tooltip lives inside the diagram column so its absolute positioning
            (relative to this container) lines up with the wrapper-relative
            mouse coordinates we get from MapSVG. */}
        <HangarTooltip
          hangarId={hoveredHangar}
          mousePos={mousePos}
          bounds={diagramSize}
        />
      </div>

      {isMobile && <MobileInfoStrip />}
    </div>
  );
}

/**
 * Mobile stacked info — same data as the overlay badges, presented below the
 * diagram so the airport stays unobstructed on narrow screens.
 */
function MobileInfoStrip() {
  const info = AIRPORT_INFO;
  return (
    <div
      style={{
        padding: "20px 24px 24px",
        borderTop: `1px solid ${T.panelBorder}`,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        fontFamily: "var(--font-archivo), system-ui, sans-serif",
      }}
    >
      {/* Address */}
      <a
        href={SITE_COPY.directionsHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open driving directions to Plane Place Aviation, 1650 Airport Dr, Hangar 98, Cleburne, TX 76033"
        style={{ textDecoration: "none", color: T.text, display: "block" }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: T.textMuted,
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          Address
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4 }}>
          {SITE_COPY.address1}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.4 }}>{SITE_COPY.address2}</div>
        <div
          style={{
            marginTop: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
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

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          paddingTop: 16,
          borderTop: `1px solid ${T.panelBorder}`,
        }}
      >
        {STATS.map((s) => (
          <div key={s.label}>
            <div
              style={{
                fontSize: 22,
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
                marginTop: 4,
                fontSize: 9,
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

      {/* Runway + airport identifier */}
      <div
        style={{
          paddingTop: 16,
          borderTop: `1px solid ${T.panelBorder}`,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
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
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: T.text }}>
            {info.runway.length}
          </span>
          <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
            · {info.runway.surface}
          </span>
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            fontWeight: 700,
            color: T.accent,
            letterSpacing: "0.18em",
            fontFamily: "var(--font-jetbrains-mono), 'Courier New', monospace",
          }}
        >
          {info.icao} · {info.iata}
        </div>
      </div>
    </div>
  );
}
