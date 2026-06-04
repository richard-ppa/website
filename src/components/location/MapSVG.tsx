"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatedPlane, ParkedPlane } from "./AnimatedPlane";
import { Clouds } from "./Clouds";
import { HANGAR_LABELS, MAP_THEME } from "./map-data";
import { KCTP_MAP_SVG } from "./kctp-map-svg";

const T = MAP_THEME;

// Scoped CSS overlay applied to the injected SVG: hides the embedded
// stats card region and themes the hangars / ramps. The reference SVG
// includes a stats card we want to hide so the airport diagram fills
// the frame.
function buildSvgCSS(scope: string): string {
  return [
    `${scope} path[fill="#EEFAFF"], ${scope} path[fill="#eefaff"] { display: none; }`,
    `${scope} text[fill="#273B80"], ${scope} text[fill="#273b80"] { display: none; }`,
    `${scope} text tspan[fill="#273B80"], ${scope} text tspan[fill="#273b80"] { display: none; }`,
    // The embedded stats card includes two thin horizontal navy <rect>
    // dividers (x=135–848) — hide them outright so they don't bleed across
    // the visible airport region.
    `${scope} rect[fill="#273B80"], ${scope} rect[fill="#273b80"] { display: none; }`,
    `${scope} [data-stats-card], ${scope} [data-bg-card], ${scope} [data-logo] { display: none; }`,
    `${scope} path[data-hangar] {
      fill: ${T.hangarFill};
      cursor: pointer;
      transition: fill 240ms ease, filter 240ms ease;
      outline: none;
    }`,
    `${scope} path[data-hangar]:hover, ${scope} path[data-hangar].is-hover, ${scope} path[data-hangar]:focus-visible {
      fill: ${T.hangarHover};
      stroke: ${T.accent2};
      stroke-width: 2.5;
      paint-order: stroke fill;
    }`,
    `${scope} path[data-ramp] {
      fill: ${T.rampFill};
      transition: fill 220ms ease;
    }`,
    `${scope} path[data-ramp].is-hover {
      fill: ${T.rampHover};
    }`,
    // The SVG's <text> nodes declare font-family="Archivo-Black" / "Archivo-Bold"
    // — those literal family names won't resolve. Force every text node to use
    // the Archivo loaded via next/font. Also make text transparent to mouse
    // events so the hangar number labels (cyan, on top of each hangar path)
    // don't swallow the hover that the underlying path needs to fire the tooltip.
    `${scope} text {
      font-family: var(--font-archivo), system-ui, sans-serif;
      pointer-events: none;
    }`,
    // Hangar number labels (cyan #00ADEE) must remain visible — defensive
    // override in case any other rule (or hideStatsCardText sweep) hides them.
    `${scope} text[fill="#00ADEE"] {
      fill: #ffffff;
      font-weight: 900;
      display: block !important;
    }`,
    // Reduce-motion: kill the SVG-driven animations.
    `@media (prefers-reduced-motion: reduce) {
      ${scope} animateMotion, ${scope} animateTransform { display: none; }
    }`,
  ].join("\n");
}

// Hide any decorative <text> nodes whose center falls inside the original
// stats-card region — those are part of the hidden card and would otherwise
// float over the diagram once the card itself is display:none.
function hideStatsCardText(svgEl: SVGSVGElement) {
  const cb = { x: 101, y: 369, w: 836, h: 560 };
  const inside = (b: { x: number; y: number; width: number; height: number }) => {
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    return cx >= cb.x && cx <= cb.x + cb.w && cy >= cb.y && cy <= cb.y + cb.h;
  };
  svgEl.querySelectorAll("text").forEach((t) => {
    try {
      if (inside((t as SVGGraphicsElement).getBBox())) {
        (t as SVGTextElement).style.display = "none";
      }
    } catch {
      /* getBBox can fail on disconnected nodes — ignore */
    }
  });
  svgEl
    .querySelectorAll(
      'path[fill="#273B80"], path[fill="#273b80"], rect[fill="#273B80"], rect[fill="#273b80"], line[fill="#273B80"], line[fill="#273b80"]',
    )
    .forEach((p) => {
      try {
        if (inside((p as SVGGraphicsElement).getBBox())) {
          (p as SVGElement).style.display = "none";
        }
      } catch {
        /* ignore */
      }
    });
}

interface BoundsState {
  viewBox: number[];
  rampCenters: Record<string, { cx: number; cy: number }>;
}

interface MapSVGProps {
  onHoverHangar?: (id: string | null) => void;
  onMouseMove?: (x: number, y: number) => void;
}

export function MapSVG({ onHoverHangar, onMouseMove }: MapSVGProps = {}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [bounds, setBounds] = useState<BoundsState | null>(null);
  const callbacksRef = useRef({ onHoverHangar, onMouseMove });
  callbacksRef.current = { onHoverHangar, onMouseMove };

  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const svgEl = wrapRef.current.querySelector<SVGSVGElement>("svg.kctp-map-svg");
    if (!svgEl) return;

    // The viewBox crop ("440 60 1180 1100") is now authored into the
    // initial SVG markup below so the cropped view is correct on first
    // paint with no dependency on this effect running. We re-assert it
    // here as a belt-and-suspenders in case anything mutated the attribute.
    svgEl.setAttribute("viewBox", "440 60 1180 1100");
    svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svgEl.style.width = "100%";
    svgEl.style.height = "100%";
    svgEl.style.display = "block";

    hideStatsCardText(svgEl);

    const hangarPaths = svgEl.querySelectorAll<SVGPathElement>("path[data-hangar]");
    const rampPaths = svgEl.querySelectorAll<SVGPathElement>("path[data-ramp]");

    const cleanups: Array<() => void> = [];

    // Set accessibility attributes on each hangar path. Hover detection
    // happens via event delegation on the wrapper (below) — per-path
    // mouseenter is unreliable on SVG paths under React's hydration model.
    hangarPaths.forEach((p) => {
      const id = p.getAttribute("data-hangar") ?? "";
      const label = HANGAR_LABELS[id] ?? `Hangar ${id}`;
      p.setAttribute("tabindex", "0");
      p.setAttribute("role", "img");
      p.setAttribute("aria-label", label);
    });

    // ── Hover via event delegation on the wrapper ───────────────────────────
    // We track which hangar (if any) is currently under the cursor and fire
    // callbacks only on transitions. This works reliably because mousemove on
    // the wrapper fires with target=<hangar path> when the cursor is over one.
    let currentId: string | null = null;
    const setRampHoverClass = (id: string | null) => {
      rampPaths.forEach((r) => {
        const match = id !== null && r.getAttribute("data-ramp") === id;
        r.classList.toggle("is-hover", match);
      });
    };
    const onDelegatedMove = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const hangarEl = target?.closest?.("path[data-hangar]") as Element | null;
      const newId = hangarEl?.getAttribute("data-hangar") ?? null;
      // Always update mouse position when over a hangar.
      if (newId && wrapRef.current) {
        const rect = wrapRef.current.getBoundingClientRect();
        callbacksRef.current.onMouseMove?.(e.clientX - rect.left, e.clientY - rect.top);
      }
      // Fire on transitions only.
      if (newId !== currentId) {
        currentId = newId;
        setRampHoverClass(newId);
        callbacksRef.current.onHoverHangar?.(newId);
      }
    };
    const onDelegatedLeave = () => {
      if (currentId !== null) {
        currentId = null;
        setRampHoverClass(null);
        callbacksRef.current.onHoverHangar?.(null);
      }
    };
    wrapRef.current.addEventListener("mousemove", onDelegatedMove);
    wrapRef.current.addEventListener("mouseleave", onDelegatedLeave);
    cleanups.push(() => {
      wrapRef.current?.removeEventListener("mousemove", onDelegatedMove);
      wrapRef.current?.removeEventListener("mouseleave", onDelegatedLeave);
    });

    // Keyboard accessibility — focus/blur on the actual path elements.
    hangarPaths.forEach((p) => {
      const id = p.getAttribute("data-hangar") ?? "";
      const onFocus = () => {
        currentId = id;
        setRampHoverClass(id);
        callbacksRef.current.onHoverHangar?.(id);
      };
      const onBlur = () => {
        if (currentId === id) {
          currentId = null;
          setRampHoverClass(null);
          callbacksRef.current.onHoverHangar?.(null);
        }
      };
      p.addEventListener("focus", onFocus);
      p.addEventListener("blur", onBlur);
      cleanups.push(() => {
        p.removeEventListener("focus", onFocus);
        p.removeEventListener("blur", onBlur);
      });
    });

    // Ramp centers feed the parked-plane overlay.
    const rampCenters: Record<string, { cx: number; cy: number }> = {};
    rampPaths.forEach((p) => {
      const id = p.getAttribute("data-ramp");
      if (!id) return;
      try {
        const bbox = p.getBBox();
        rampCenters[id] = {
          cx: bbox.x + bbox.width / 2,
          cy: bbox.y + bbox.height / 2,
        };
      } catch {
        /* ignore */
      }
    });

    const vbStr = svgEl.getAttribute("viewBox") ?? "440 60 1180 1100";
    const vb = vbStr.split(/\s+/).map(Number);
    setBounds({ viewBox: vb, rampCenters });

    return () => cleanups.forEach((c) => c());
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      role="img"
      aria-label="Diagram of Cleburne Regional Airport (KCTP) showing four Plane Place Aviation hangars, the runway, and parked aircraft"
    >
      <style>{buildSvgCSS(".kctp-map-host")}</style>
      <div
        className="kctp-map-host"
        style={{
          position: "absolute",
          inset: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{ position: "relative", width: "100%", height: "100%" }}
          dangerouslySetInnerHTML={{
            // Author the cropped viewBox + sizing into the initial markup so
            // the airport is correctly framed on first paint. Without this,
            // a hydration/timing edge case can leave the SVG rendering at
            // its native (huge) viewBox where the airport is ~50% of the area.
            __html: `<svg class="kctp-map-svg" xmlns="http://www.w3.org/2000/svg" viewBox="440 60 1180 1100" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block;">${KCTP_MAP_SVG}</svg>`,
          }}
        />

        {bounds && (
          <svg
            viewBox={bounds.viewBox.join(" ")}
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          >
            <defs>
              <filter
                id="kctp-plane-shadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.35" />
              </filter>
              <filter
                id="kctp-cloud-blur"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="6" />
              </filter>
              <radialGradient id="kctp-cloud-grad" cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#ffffff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>

            <AnimatedPlane intensity="rich" />

            {Object.entries(bounds.rampCenters).map(([id, c]) => (
              <ParkedPlane key={id} cx={c.cx} cy={c.cy} />
            ))}

            <Clouds intensity="rich" />
          </svg>
        )}
      </div>
    </div>
  );
}
