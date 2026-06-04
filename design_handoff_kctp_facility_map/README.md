# Handoff: KCTP Facility Map — Page Column Variant

## Overview

Interactive Cleburne Regional Airport (KCTP) facility map for the Plane Place
website. The component replaces the existing "Location" section: it bundles
the eyebrow, heading, body copy, address (now embedded in the diagram), and
the airport map into one self-contained card. Clicking a hangar opens a side
panel with specs, aircraft fit, and amenities.

This handoff is for the **Page Column** variant — the stacked layout that
fits inside the About page's right column (~640–760px wide). Text card sits
on top, diagram sits below.

## About the Design Files

The files in `_reference/` are **design references built in HTML/JSX** —
working prototypes that show the intended look, behavior, and animations.
They are **not** intended to be dropped into a production codebase as-is
(they use Babel-in-the-browser, global window assignments, and inlined SVG
strings).

Your task is to **recreate these designs in the target codebase's existing
environment** (likely React in a Next.js or similar framework). Use the
project's established patterns: real component files, scoped styles or CSS
modules, real bundler-managed imports for the SVG, etc. The reference files
are accurate down to colors, typography, spacing, and motion — match them.

## Fidelity

**High-fidelity.** All colors, fonts, sizes, and interactions are final.
Recreate pixel-perfectly using the codebase's existing libraries (styled
components, Tailwind, CSS modules, whatever is in use).

## Layout — Page Column Variant

Container: full width of its parent column. Min content height: ~640px (text
card naturally sizes; diagram has aspect ratio ~3:4).

```
┌──────────────────────────────────────────┐
│  ── LOCATION                             │  ← eyebrow + brand bar
│                                          │
│  Cleburne, Texas — KCPT                  │  ← heading
│                                          │
│  80,000 sq ft of hangar space across     │  ← body copy
│  four hangars at Cleburne Regional       │
│  Airport — 30 minutes south of DFW...    │
│                                          │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│                          ┌─────────────┐ │
│   [airport diagram]      │ ADDRESS     │ │
│   • runway w/ markings   │ 1650 Airport│ │
│   • 4 hangars (clickable)│ Dr, Hangar98│ │
│   • parked planes        │ Cleburne, TX│ │
│   • landing animation    │ 76033       │ │
│   • drifting clouds      │ GET DIR. →  │ │
│                          └─────────────┘ │
│                          ┌─────────────┐ │
│                          │  4          │ │
│                          │  HANGARS    │ │
│                          │  80k        │ │
│                          │  HANGAR SQFT│ │
│                          │  115k       │ │
│                          │  RAMP SQFT  │ │
│                          └─────────────┘ │
│                                          │
│   ┌──────────────────┐                   │
│   │ 🧭 RUNWAY 15/33  │                   │
│   │    5,778 ft      │                   │
│   │    ─── divider   │                   │
│   │    KCTP · CPT    │                   │
│   │    32°21'13"N    │                   │
│   │    97°25'59"W    │                   │
│   └──────────────────┘                   │
└──────────────────────────────────────────┘
```

The diagram fills the full width of the column. Address and Stats badges sit
in the top-right of the diagram, stacked. Compass + runway + coordinates sit
in the bottom-left. The diagram itself is an SVG that crops to viewBox
`440 60 1180 1100` (the airport portion of the original designer-supplied
asset).

## Components

### Text Card (top)

- **Container**: white background `#FFFFFF`, border `1px solid #E1E5EB`,
  border-radius `0` (square corners), padding `36px 36px 32px`. Pulls up to
  flush with diagram below (no margin between).
- **Eyebrow row**: small `20px × 2px` accent bar (`#1E9FD8`) + uppercase
  label "LOCATION", letter-spacing `0.18em`, font-size `12px`,
  font-weight `800`, color `#1E9FD8`. Margin-bottom `18px`.
- **Heading (h2)**: "Cleburne, Texas — KCPT". Font-family Archivo (or
  fallback `system-ui`), font-weight `900`, font-size `clamp(28px, 4vw, 40px)`,
  letter-spacing `-0.02em`, line-height `1.05`, color `#0F1A2B`.
- **Body**: 80,000 sq ft… (see `SITE_COPY.body` in `location-card.jsx`).
  Font-size `15px`, line-height `1.65`, color `#3B4960`, max-width `540px`,
  text-wrap `pretty`. Margin-top `18px`.

### Diagram Container (bottom)

- **Wrapper**: position relative, full width, aspect-ratio of the airport SVG.
  Background `#F1ECE0` (warm off-white that matches the original SVG
  background so the runway/grass blend in).
- **SVG layer**: the inlined `KCTP_MAP_SVG` rendered with viewBox
  `440 60 1180 1100`, `preserveAspectRatio="xMidYMid meet"`. CSS overrides
  in `buildSvgCSS` (in `map-app.jsx`) recolor hangars and hide the original
  embedded stats card.
- **Hangars**: paths tagged `data-hangar="99|98|1010|2100"`. Default fill
  `#1E4B7A`, stroke `#1E9FD8` 2px. Hover: outline glow `0 0 0 3px rgba(30,159,216,0.35)`,
  cursor pointer. Active (clicked): white `2px` outline + soft blue glow,
  drop shadow.
- **Aircraft icons**: parked planes auto-positioned at ramp centroids
  (`data-ramp="99|98|1010|2100"`). Vector glyph defined in `PlaneGlyph()`.

### AddressBadge — top-right of diagram

- Position absolute, `top: 18, right: 18`.
- Background `rgba(255,255,255,0.94)` with `backdrop-filter: blur(8px)`.
- Border `1px solid #E1E5EB`, border-radius `4px`, padding `10px 14px`.
- Box-shadow `0 4px 14px rgba(15,40,80,0.10)`.
- Hover: shadow deepens to `0 6px 18px rgba(15,40,80,0.16)`.
- Renders as an `<a>` to Google Maps directions URL.
- Content:
  - Small label "ADDRESS" — `9px`, `font-weight: 700`, `letter-spacing: 0.2em`,
    uppercase, color `#7A8194`.
  - Address line 1 "1650 Airport Dr, Hangar 98" — `13px`, `font-weight: 700`,
    color `#0F1A2B`, line-height `1.35`.
  - Address line 2 "Cleburne, TX 76033" — same but `font-weight: 400`.
  - "GET DIRECTIONS →" CTA — `10.5px`, `font-weight: 800`,
    `letter-spacing: 0.16em`, uppercase, color `#1E9FD8`. Margin-top `6px`.

### StatsBadge — directly below AddressBadge

- Position absolute, `top: 168, right: 18` (~14px gap below address card).
- Same surface treatment as AddressBadge.
- Padding `12px 16px`. `display: flex, flex-direction: column, gap: 14px`.
- Three stacked `Stat` blocks. Each Stat:
  - Big italic value: font-size `26px`, font-weight `900`, italic,
    letter-spacing `-0.02em`, color `#134B7A`.
  - Small label below: font-size `9.5px`, font-weight `700`,
    letter-spacing `0.16em`, uppercase, color `#7A8194`. Margin-top `6px`.
- Values:
  - `4` — HANGARS
  - `80k` — HANGAR SQFT
  - `115k` — RAMP SQFT

### MapBadge — bottom-left of diagram

- Position absolute, `bottom: 18, left: 18`.
- Same surface treatment as the other badges.
- Layout: `display: flex, align-items: flex-start, gap: 12px`.
- **Compass rose** (left): 42px SVG. Circle outline, 4-point rose, "N"
  label at top. See `CompassRose` in `map-chrome.jsx`.
- **Right column** (`flex-direction: column, gap: 4px`):
  - "RUNWAY 15/33" eyebrow — `9px`, `letter-spacing: 0.2em`, uppercase,
    color `#7A8194`, font-weight `700`.
  - Big runway length — `5,778 ft` `14px` `font-weight: 800` color `#0F1A2B`,
    next to it `· Asphalt` `9.5px` color `#7A8194`.
  - Horizontal divider (1px, `#E1E5EB`).
  - Coordinates block (font-family JetBrains Mono):
    - "KCTP · CPT" — `10px`, `font-weight: 700`,
      `letter-spacing: 0.18em`, color `#134B7A`.
    - "32°21′13″N" — `9px`, color `#7A8194`.
    - "97°25′59″W" — same.

### SidePanel (clicking a hangar)

- Slides in from the right of the diagram (or modal-style on narrow viewports).
- See `map-panel.jsx` for full markup. Header band uses navy `#134B7A` with
  italic 56px hangar number; specs table; Aircraft Fit section; quote CTA card.

## Interactions & Behavior

- **Hangar hover**: subtle accent-blue outline + cursor pointer.
- **Hangar click**: opens SidePanel for that hangar. Closes on backdrop click,
  Escape, or close button. Hangar gets active treatment (white outline +
  soft glow + drop shadow) until panel closes.
- **Address badge**: click opens Google Maps directions in a new tab
  (`target="_blank" rel="noopener"`).
- **AOG indicator** (in Header chrome — not used in column variant): pulses.
- **Animations**:
  - **Landing plane**: continuous loop. Plane appears on a diagonal
    glide-path (north-west off-screen approach), descends along the runway
    heading, and shrinks from scale 1.6 → 1.2 → 0.7 → 0.55. Period: 9s
    (rich), 14s (medium), 22s (subtle). Uses SVG `<animateMotion>` +
    `<animateTransform>`. See `AnimatedPlane` in `map-app.jsx`.
  - **Clouds**: 5 semi-transparent blobs drift left → right across the
    scene at varying altitudes, scales (0.81–1.61), opacities (0.50–0.72),
    and durations (60–110s). Negative `begin` offsets so the loop is
    populated on first paint. Built from overlapping radial-gradient
    ellipses through a Gaussian blur filter (`#cloud-blur`, `stdDeviation=6`).
  - **Hangar hover**: 160ms ease.
  - **Side panel slide-in**: 280ms `cubic-bezier(0.22, 1, 0.36, 1)`.

## State Management

```ts
// Inside <LocationCard>
const [hovered, setHovered] = useState<string | null>(null);   // hangar id
const [active, setActive]   = useState<string | null>(null);   // hangar id
```

No external data fetching. Hangar specs are static (see `map-data.js`).

## Design Tokens

```ts
const T = {
  bg:           "#F6F2EA",   // page background (warm off-white)
  panel:        "#FFFFFF",
  panelBorder:  "#E1E5EB",
  text:         "#0F1A2B",
  textMuted:    "#7A8194",
  accent:       "#134B7A",   // Plane Place navy
  accent2:      "#1E9FD8",   // Plane Place light blue
  accentDark:   "#0E3A60",
  warning:      "#C24F2E",   // AOG / leased
  hangarFill:   "#1E4B7A",
  hangarStroke: "#1E9FD8",
};

// Spacing scale
4, 6, 8, 12, 14, 16, 18, 22, 24, 28, 32, 36

// Border radius
0   // text card (square)
3   // buttons
4   // badges, panels, hangar outlines
8   // modal cards

// Shadows
sm:  "0 4px 14px rgba(15,40,80,0.10)"     // badges
md:  "0 6px 18px rgba(15,40,80,0.16)"     // hover
lg:  "0 30px 80px rgba(0,0,0,0.4)"        // modals

// Typography
heading: Archivo, system-ui — 900 weight
body:    Archivo — 400/700
mono:    JetBrains Mono (coords only) — 400/700
```

## Assets

- **Airport SVG**: hand-tagged version of the designer-supplied
  `KCTP Map3-01.svg`. Hangars carry `data-hangar="99|98|1010|2100"` and
  ramp parking spots carry `data-ramp="…"`. The bundled string lives in
  `_reference/map-svg.js` as `window.KCTP_MAP_SVG`. In a real codebase,
  import it as a static asset (`import mapSvg from './kctp-map.svg?raw'`)
  and inject via `dangerouslySetInnerHTML` on a wrapper div.
- **Plane Place "P" logo**: vector recreation, 64×64 viewBox. See
  `PlanePlaceLogo` in `_reference/map-chrome.jsx`. (Used in Header — not
  in the column variant. Kept for reference.)
- **Aircraft glyph**: vector, drawn in `PlaneGlyph()` in `_reference/map-app.jsx`.
- **Compass rose**: vector, see `CompassRose()` in `_reference/map-chrome.jsx`.

## Files

`_reference/`
- `KCTP Interactive Map.html` — entry point. Mounts `<DemoApp>` which
  renders `<LocationCard>` (the deliverable) plus a Standalone variant
  showing the wide layout for comparison. **Implement the column
  variant only** — `isWide: false` branch of `LocationCard`.
- `location-card.jsx` — top-level layout: text card, diagram wrapper,
  AddressBadge, StatsBadge, Stat. **This is the main component to
  recreate.**
- `map-app.jsx` — `MapSVG` (SVG host + hangar interaction wiring),
  `AnimatedPlane`, `ParkedPlane`, `PlaneGlyph`, `Clouds`, and the
  `buildSvgCSS` / `hideStatsCardText` helpers that recolor hangars and
  hide the original embedded stats panel.
- `map-chrome.jsx` — `Header`, `CompassAndRunway`, `CompassRose`,
  `MapLegend`, `PlanePlaceLogo`. The column variant uses **MapBadge
  only** (defined inline in `location-card.jsx`); the rest is for the
  standalone wide variant.
- `map-data.js` — hangar specs, theme tokens (`T`), `AIRPORT_INFO`,
  `COMPANY_INFO`.
- `map-panel.jsx` — `SidePanel` (the click-through detail view) and
  `QuoteModal`.
- `map-svg.js` — inlined airport SVG string.
- `tweaks-panel.jsx` — design-time tweak controls. **Not part of the
  production component** — drop entirely.

## Implementation Notes

1. **SVG injection**: the SVG string is injected via `innerHTML` into a
   wrapper div, then queried for `[data-hangar]` paths to attach event
   listeners and apply theme colors. In React, do this in a `useLayoutEffect`
   so listeners are attached before paint.
2. **viewBox crop**: the original SVG includes a stats card region that we
   hide via CSS + a `<text>` element bbox sweep (see `hideStatsCardText`).
   Cleaner alternative: request a pre-cropped SVG from the designer.
3. **Don't ship**: the Tweaks panel, the standalone wide-layout variant,
   the Header chrome (logo / cert / AOG / Get a Quote button), and the
   demo wrapper in `KCTP Interactive Map.html`.
4. **Fonts**: load Archivo (400, 700, 800, 900 + 800 italic, 900 italic)
   and JetBrains Mono (400, 700) — both on Google Fonts.
5. **Address badge href**: currently a Google Maps directions URL; swap
   for whatever directions provider you prefer.
