# Claude Code Prompt — Build the Careers Page

Copy everything below this line into Claude Code from inside the `ppa-website/` repo root.

---

Build a new **Careers** page at `/careers` that follows the design direction in the attached mockup (`Jobs Page V3.html`). It should match the rest of the PPA site visually and structurally — same tokens from `src/app/globals.css`, same `<Header>`/`<Footer>` chrome, same Breadcrumb component, same metadata + JSON-LD pattern as `/about`.

## Route + page file

- Create `src/app/careers/page.tsx` (server component, like `/about/page.tsx`).
- Export `metadata` (title, description, canonical, OG, Twitter — mirror the about page's shape). Title template: `"Careers — Join the PPA Floor in Cleburne, TX"`.
- Add a JSON-LD `@graph` with an `AboutPage` (or `WebPage`) node + an `Organization` link back to `https://ppa.aero/#organization` (the @id from `layout.tsx`).
- Update `src/app/sitemap.ts` to include `/careers`.

## Navigation + footer wiring

- Add `{ label: "Careers", href: "/careers" }` to `NAV_LINKS` in `src/lib/constants.ts`. Place it between **About** and **Gallery**.
- The mobile takeover and desktop nav in `src/components/Header.tsx` both render `NAV_LINKS` directly, so no further changes there.
- In `src/components/Footer.tsx`, the "Company" column already filters on `NAV_LINKS.filter((l) => !l.children)` — verify Careers appears there once added.

## Layout & content — page structure

Build the page top-to-bottom in this order. All sizing/spacing/tokens come from `globals.css` (`var(--color-ppa-*)`, `var(--space-*)`, `--text-h*`, `font-display`, `font-label`, etc.). Use Tailwind utility classes the way the rest of the codebase does — no inline styles unless unavoidable.

### 1. Hero — split (50/50)

`<section>` with `grid grid-cols-1 lg:grid-cols-2 min-h-[720px]`.

- **Left half**: full-bleed `next/image` with `fill` + `object-cover`. Use `/images/hangar-Hawker-v2.jpg`. Layered on top:
  - **"Now Hiring" stamp** — a 200×200 circular badge in the top-left, `bg-ppa-brass`, white text, rotated ~−6°, drop shadow. Inside: "Now Hiring" in `font-display` (~36px), and "Year-Round" in JetBrains Mono caption beneath. Add a 1px dashed white concentric ring inside the circle.
  - **Caption** bottom-left: small uppercase tracking-wide label with a 24px leading rule. Text: `Hangar 98 · Cleburne Regional · KCPT`.
- **Right half**: `bg-ppa-white`, `px-20 py-[200px_80px]`, vertically centered.
  - Reuse `<Breadcrumb crumbs={[{ label: "Careers", href: "/careers" }]} variant="light" />`.
  - Eyebrow row (brass dash + label): `Careers at PPA`.
  - H1 in `font-display`, ~88px desktop / fluid down: `Skilled hands.` on line 1, `Sharper reps.` on line 2 with the second line in `text-ppa-brass`.
  - Lede paragraph (~18px, `text-ppa-gray`, max 520px): a 2-sentence framing about specialization and continuous hiring.
  - CTA row: primary `Send a Résumé` button → `bg-ppa-brass text-white`, secondary `Call the Hangar` outline button → `<a href={\`tel:\${COMPANY.phoneRaw}\`}>`.
  - Below CTAs, a 3-column stat row separated by `border-t border-ppa-border pt-8`:
    - Team — `40+` — "Technicians & staff"
    - Tenure — `4y` — "Median for full-time techs"
    - Posture — `Founder-led` — "Tristan & Travis on the floor"

### 2. Perks ribbon

`<section className="bg-ppa-black text-white py-7">` with a max-w-1400 container, `grid grid-cols-2 md:grid-cols-5 gap-8`. Each item:
- Mono caption in `text-ppa-brass-bright` (e.g. "Pay")
- `font-display` 18px value in white (e.g. "Competitive, paid weekly")

Five items: Pay, Coverage, Retirement, Time off, Tools & training. Copy from the mockup.

### 3. Why work here + Sticky Apply Rail (two-column)

`<section className="py-30">` with `grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-20`.

**Main column (left):**
- Eyebrow `Why work here`.
- H2 in `font-display` (~64px): "A shop built by techs, for techs."
- 3 paragraphs of body copy in `text-ppa-gray font-light leading-relaxed` (use the mockup copy as a starting point — credit Tristan Noe & Travis Roberson by name and link to `/about`).
- A 2×2 grid of "why" mini-cards below. Each card: `border border-ppa-border bg-ppa-white p-7`, with:
  - A 44×44 outlined square icon slot (use inline SVG from `lucide-react` or hand-rolled — the mockup uses simple shield/clock/lines/diamond glyphs in `text-ppa-brass`).
  - H4 in `font-display` ~22px.
  - 2-line description in `text-ppa-gray font-light`.
- The four blocks:
  1. **FAA Part 145 specialist shop** — "Repair Station PLPR528E. Hawker, Citation, Challenger — full stop. No context-switching." (Reference `COMPANY.faaCert` from constants.)
  2. **Predictable hours**
  3. **Records as craft**
  4. **Cleburne, not Addison**

**Right rail (`<aside>`):** wrap in `<div className="lg:sticky lg:top-6">`.
- Container is `bg-ppa-black text-white p-10`.
- Pill at top: `bg-ppa-brass` "Hiring" tag with a pulsing white dot before it.
- H3 `font-display` ~38px: "Get in touch — we're reading."
- 2-sentence body in `text-white/70`.
- A vertical list with `border-y border-white/12` rows, 80px/1fr two-column:
  - Email → `careers@ppa.aero` (mailto link, brass-bright color)
  - Phone → `COMPANY.phone`
  - Address → `COMPANY.address.street` + city/state line
- Stacked actions at bottom: primary `Upload Résumé →` (brass), secondary outlined `Call the Hangar`.

Wrap the whole aside in an element with `id="apply"` so the hero buttons can deep-link.

### 4. Roles grid

`<section className="bg-ppa-surface border-y border-ppa-border py-30">`.

- Header row: 2-col grid. Left: eyebrow `Hiring across` + H2 "Where we're looking, broadly." Right: a 1-paragraph framing.
- 3×2 grid of role cards (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`). Each card: `bg-ppa-white border border-ppa-border p-8 min-h-80 flex flex-col gap-4 hover:border-ppa-brass transition-colors`. Card contents:
  - Top row: a mono badge in `bg-ppa-light` ("Floor" / "Office") + mono `/01` counter.
  - H3 in `font-display` ~30px.
  - Tag row (small bordered chips) listing relevant keywords (airframes, certs, focus areas).
  - 2–3 sentence description.
  - Footer link: `Express Interest →` in brass, anchors to `#apply`.

Six cards in this order: **Airframe Technicians**, **Inspection & QC**, **Avionics**, **Service Advisors**, **Parts & Logistics**, **Ops & Admin**. Copy in the mockup.

### 5. Founders quote band

`<section className="bg-ppa-black text-white py-30">` with a `grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-20 items-center` container.

- Left: brass eyebrow `From the founders`, then a `<blockquote>` in `font-display` ~44px: short, two-sentence quote ending with the call-out portion in `text-ppa-brass-bright`. Cite: `Tristan Noe & Travis Roberson — Co-Founders`.
- Right: square `next/image` of `/images/PPA-22.jpg` (or `/images/PPA-Employees.jpg` if that crops better).

### 6. FAQ accordion

`<section className="py-30">`, 1fr/2fr two-column grid.

- Left column: eyebrow `FAQ`, H2 "The questions we get.", short paragraph pointing to `careers@ppa.aero` and naming Ron Larson, Accountable Manager.
- Right column: 6 expandable items inside a `<details>` element each (or a small client component if you want animated expand — `<details>` is fine and SEO-friendly). Each `<summary>` shows the question in `font-display` ~22px with a `+`/`−` indicator on the right.

Questions to include (use mockup copy as starting point):
1. Do I need an A&P certificate?
2. Do you offer relocation assistance?
3. What does a typical schedule look like?
4. Do you sponsor visas or transfers?
5. How long does the hiring process take?
6. What's the culture like?

If you ship the FAQ as `<details>` elements, also emit a `FAQPage` JSON-LD block at the bottom of the page so the questions are eligible for rich results.

### 7. Footer CTA strip (override)

The site-wide footer already renders an "Get a Quote / AOG" CTA strip at the top of `<Footer>`. For this page, render a **page-local** CTA section *above* the footer (do NOT modify the global Footer). Keep the visual treatment but swap the copy:

- H2: `Send a résumé. Come walk the hangar.`
- Body: `We're hiring continuously. The fastest way in is a real résumé and a short note about which airframe you're strongest on.`
- Primary button: `Apply Now` → `mailto:careers@ppa.aero` (or `#apply`).
- Secondary button: `careers@ppa.aero`.

Implementation note: the global `<Footer>` currently *always* shows the quote CTA. If having two CTA strips stacked feels off, gate the quote one with a `hideQuoteCTA` prop and pass it from `/careers/page.tsx`. Keep changes scoped — don't refactor the Footer broadly.

## Imagery

All hero/section imagery references files already in `/public/images/`. Confirmed paths:

- Hero left: `/images/hangar-Hawker-v2.jpg`
- Founders band: `/images/PPA-22.jpg` (alternative: `/images/PPA-Employees.jpg`)

Every `next/image` needs `fill` + `sizes` + a real `alt`. Use `priority` only on the hero image.

## Constants additions

Add a `careers` object to `src/lib/constants.ts` exporting:

```ts
export const CAREERS = {
  email: "careers@ppa.aero",
  applyHref: "mailto:careers@ppa.aero?subject=Careers%20Inquiry",
  stats: {
    teamSize: "40+",
    medianTenure: "4y",
    posture: "Founder-led",
  },
};
```

Use these in the page rather than hardcoding strings — same pattern as `COMPANY`.

## Things NOT to do

- Don't post individual job titles or open requisitions — the page is intentionally evergreen.
- Don't introduce new colors, fonts, or spacing tokens. Everything must come from `globals.css`.
- Don't invent stats. The numbers in the hero stat row are placeholder values the marketing team will verify — leave a `TODO(content):` comment next to each so they're easy to grep.
- Don't add a blog-style "Latest from the team" section, social proof carousel, or third-party form embed. Email-first applications only.
- Don't replace or restructure the existing site `<Header>` or `<Footer>` — only add to `NAV_LINKS` and (if needed) gate the Footer's quote CTA.

## Quality bar

- All copy must reuse the PPA voice from `/about` and `/capabilities/*`: precise, founder-led, no marketing slop, no exclamation points, no "we're passionate about..." constructions.
- Run `npm run lint` and `npx tsc --noEmit` clean before declaring done.
- Verify the page renders correctly at 375 / 768 / 1024 / 1440 widths. The split hero should stack on mobile (image first, then content), the sticky apply rail should un-stick and become a regular block on mobile, the 3-up stat row should stack to 1 column.
- Use the existing `AnimatedSection` pattern from `/about/page.tsx` for scroll-triggered reveals if it fits naturally — don't force it.

## Deliverable checklist

- [ ] `src/app/careers/page.tsx` created and rendering
- [ ] `NAV_LINKS` updated in `src/lib/constants.ts`
- [ ] `CAREERS` constant added
- [ ] `/careers` added to `src/app/sitemap.ts`
- [ ] Page-level JSON-LD added
- [ ] FAQ JSON-LD added (if using FAQ accordion)
- [ ] Mobile responsiveness verified
- [ ] `npm run lint && npx tsc --noEmit` clean
- [ ] `TODO(content):` left on placeholder stats so marketing can replace them
