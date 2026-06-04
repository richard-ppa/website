# HomeHero — Type-Family Cycler

Drop-in replacement for `src/components/HomeHero.tsx`.

## What changed

The hero now cycles through your three airframe families (Hawker → Citation → Challenger) every 5 seconds. The active family is highlighted in the existing headline ("**Hawker**, Citation & Challenger." etc.) and a stats strip below the lede swaps to show that family's models + signature inspection cadence. A new selector strip at the bottom lets visitors:

- **Hover/focus a family** to preview it (locks the auto-cycle)
- **Click a family** to navigate to `/capabilities/{family}`
- **Click "Auto ↻"** to resume cycling

Existing copy, CTAs, and brand tokens are preserved. The parallax scroll behavior, intro animations, and gradient overlays are unchanged.

## What's new technically

- Uses `AIRFRAMES` from `@/lib/constants` for the models list (single source of truth)
- Uses `framer-motion`'s `AnimatePresence` for the stats swap — already in your dependencies
- Respects `prefers-reduced-motion`: no auto-cycle, no Ken-Burns scale, no flashy transitions
- The `Link` semantic on the selector means it's keyboard-accessible and crawlable
- New `aria-label`s + `aria-current` on the selector for screen readers

## Install

1. Copy `handoff/src/components/HomeHero.tsx` over `src/components/HomeHero.tsx`.
2. No new dependencies. No globals.css changes. No new images required (uses existing `/images/hawker.jpg`, `/images/citation.jpg`, `/images/challenger.jpg`).
3. `npm run dev` and visit `/`.

## Tweaks you may want

- **Cycle speed** — change `CYCLE_MS` at the top of the file (currently `5000`).
- **Stat #2** — currently shows inspection cadence per family (B–G Phase / Phase 1–5 / 96-Month). Could swap to engines, common services, or anything else from the `AIRFRAMES` constant.
- **Photo per family** — `position` controls the object-position crop, and `photo` controls the source. Use any image from `/public/images/`.
- **Selector behavior** — currently hover-to-preview + click-to-navigate. If you'd rather have click-to-preview (with no navigation), swap the `<Link>` for a `<button>` and drop the `href`.

## Notes

- The headline always reads "Hawker, Citation & Challenger." — only the *highlighting* cycles, not the word order. The brand statement stays intact.
- The "Three Airframe Families" section below the hero is still a static grid. If you want to deduplicate, you could remove that section now that the hero covers it — but it does double duty as a clearer click-through to capabilities, so I'd leave it.
- The selector at the bottom of the hero is keyboard-focusable in tab order. Tabbing past the AOG button will land on Hawker → Citation → Challenger → Auto.
