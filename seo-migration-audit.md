# SEO Migration Audit — planeplaceaviation.com → ppa.aero

**Date:** 2026-05-05
**Status:** Pre-cutover. Old site live, no 301s active. New site built but not promoted as canonical.
**Scope:** Identify content currently driving rankings on old WP site and confirm whether the Next.js site preserves it before cutover.

---

## TL;DR — Most Critical Findings

1. **P0 / hard ranking loss risk.** The old `/services` page is titled `Challenger 300/350 Maintenance Event | 96 or 192 Month` and currently ranks **#1** for "challenger 300 aircraft management" and "challenger 300 aircraft maintenance." The exact ranking copy ("Every 96 and 192 months your Challenger is due for a major inspection and landing gear removal…") **does not appear anywhere on the new site as on-page text.** The new `/services` page mentions "96 and 192-month inspections" only as a one-line bullet inside a feature pill. There is no page on the new site whose `<title>` targets these queries. Cutting over today drops the #1.

2. **P0 / Hawker 8-year inspection content lost.** The old `/services` page contains a dedicated "Hawker 8-year inspection" section with original prose. New site has zero on-page mention of "8-year inspection" (the bullet exists only in the scheduled-maintenance feature pill).

3. **P1 / Capabilities URL has no equivalent.** Old `/capabilities/` page is family-level ("First-class Maintenance on Hawker, Citation & Challenger"). New site uses three `/aircraft/[slug]` pages instead. There is no `/capabilities` route — without a redirect, this URL 404s and any backlinks to it die.

4. **P1 / News section is being dropped silently.** All 8 old news posts (including the FAA Part 145 cert announcement and the AIN trade-press piece on growth) currently exist as indexed URLs. The new `/blog` reads from `getAllPosts()` (likely seeded with different content). Without redirects, every news URL 404s.

5. **P2 / Citation 525 + 680A in new constants but not on old site.** Per CLAUDE.md these are off-list models. The new aircraft template prints them on the Citation page. Not a migration loss — but a contradiction with brand bible that should be resolved before cutover.

---

## 1. URL Migration Map

| # | Old URL | Proposed New URL | Match Type | Notes |
|---|---|---|---|---|
| 1 | `/` | `/` | **Direct match** | Both target Hawker/Citation/Challenger MRO. New homepage is materially stronger. |
| 2 | `/services/` | `/services` | **Content split / partial loss** | Old page is the #1 ranker for Challenger 300 queries because of "96/192-month" prose. New `/services` reframes content as 6 service cards; the airframe-specific inspection prose moved to `/aircraft/challenger` and `/aircraft/hawker` *only as feature pills*, not body copy. **Material content loss.** |
| 3 | `/capabilities/` | `/aircraft/hawker`, `/aircraft/citation`, `/aircraft/challenger` (split) | **Content split** | Old page is family-level; new architecture is per-airframe-family. Pick one redirect target — recommend `/aircraft` index or `/services`. See §5 for redirect choice. |
| 4 | `/about/` | `/about` | **Direct match** | New page is materially stronger. Founder narrative preserved. |
| 5 | `/contact/` | `/contact` | **Direct match** | New page adds AOG hotline call-out, structured contact cards. |
| 6 | `/gallery/` | (none) | **Content lost — minimal SEO value** | New site has photo strips on home/about/aircraft pages but no `/gallery` route. Old gallery had no captions or alt text — minimal SEO loss. Redirect to `/about` or homepage. |
| 7 | `/news/` | `/blog` | **Content split / loss** | Old listing has 8 indexed posts with H3 titles. New `/blog` reads from `getAllPosts()` — not the same posts. URL pattern OK to redirect, but per-post posts will 404 unless individually redirected. |
| 8 | `/aog-mrt/` | `/services#aog-response` *or* `/blog/aog-mrt` (recreate) | **Content lost** | Announcement-style news post about TX/OK AOG launch. New `/services` covers AOG conceptually but not as news. |
| 9 | `/plane-place-aviation-boosts-mx-offering-in-texas-oklahoma/` | (none) | **Content lost** | Companion AOG/MRT announcement. No equivalent. |
| 10 | `/plane-place-aviation-taps-into-surging-demand-for-airframe-mro/` | (none) | **Content lost** | AIN trade-press feature piece. Has trade-publication backlink value (links to ainonline.com). High brand-credibility content. |
| 11 | `/plane-place-aviation-adds-new-challenger-604-605-and-650-capabilities/` | `/aircraft/challenger` | **Loose match** | Capability is now built into Challenger page model list. News framing lost. |
| 12 | `/receives-faa-certification-as-a-part-145-repair-station/` | `/about` (cert section) | **Loose match** | New `/about` lists FAA Part 145 as a certification badge. The original announcement narrative is gone. |
| 13 | `/plane-place-aviation-expands-operations-with-move-to-larger-hangar-space/` | `/about` *or* `/contact` | **Content lost** | "40,000 sq ft hangar" detail does NOT appear on new site. New homepage says "three hangars on the field" — different framing. |
| 14 | `/now-hiring-ap-mechanic-avionics-technician/` | (none — careers page absent) | **Content lost** | No careers page on new site. This post is likely still attracting hiring traffic + lists Tristan's recruiting email. |
| 15 | `/plane-place-aviation-receives-mexico-afac-repair-station-certification/` | `/about` (cert section) | **Loose match** | New `/about` lists Mexico AFAC as a cert badge. Announcement narrative gone. |

---

## 2. Critical Content Gaps (ranked by SEO risk)

### GAP-01 — P0 — Challenger 96/192-month inspection prose (currently #1 ranked)

**Verbatim old text (from `/services`):**
> "Every 96 and 192 months your Challenger is due for a major inspection and landing gear removal. Plane Place Aviation has completed several of these inspections and gear removals. We have the tooling, knowledge, and attention to detail that this maintenance requires. We have trained techs on staff ranking to support your Challenger 300/350 needs at all times. Allow us the opportunity to quote your next maintenance event on your Challenger 300/350."

**Old page SEO signals:**
- `<title>`: "Challenger 300/350 Maintenance Event | 96 or 192 Month"
- H2: "Challenger 300/350"
- H3: "96 or 192 Month Inspection"

**Confirmed ranking queries (per owner):**
- "challenger 300 aircraft management" → **#1**
- "challenger 300 aircraft maintenance" → **#1**

**New site coverage:** None as body prose. Only appears as a feature pill on `/aircraft/challenger` ("96/192-month inspections") and as a bullet on `/services` ("12, 24, 36, 48, 96, and 192-month inspections"). The literal phrase "Every 96 and 192 months your Challenger is due for…" is not present anywhere.

**Where it should live on new site:**
- Primary: `src/app/aircraft/[slug]/page.tsx` — needs a body prose section (not feature pills) for the Challenger slug specifically. Easiest win: extend `AIRFRAMES.challenger.description` in `src/lib/constants.ts` to 2-3 paragraphs, OR add a Challenger-specific content section in the page template that pulls extended copy.
- Secondary mirror: `src/app/services/page.tsx` — add a Challenger maintenance subsection inside the scheduled-maintenance section, OR create a per-airframe drill-down within the SERVICE_DETAILS map.

**Severity: P0** — direct loss of confirmed #1 ranking.

---

### GAP-02 — P0 — Hawker 8-year inspection prose

**Verbatim old text (from `/services`):**
> "Every 8 years your Hawker is due for its major inspection. Plane Place Aviation has extensive experience performing 8-year inspections. Allow Plane Place Aviation the opportunity to show you how our experience with these airframes is unlike any around. We will go above the floor (and beyond) on surpassing expectations for your maintenance provider when your aircraft leaves."

**Old page SEO signals:**
- H3: "8-year inspection"
- H2: "Hawker"

**Likely supported queries:**
- "hawker 8 year inspection"
- "hawker 800XP major inspection"
- "hawker annual inspection cost" (CLAUDE.md medium-priority keyword)

**New site coverage:** None as prose. "4-year and 8-year inspections" is one feature pill on `/aircraft/hawker` and "B, C, D, E, F, G, 4-year, and 8-year inspections" is one bullet on `/services`. No paragraph-level treatment.

**Where it should live:**
- `src/lib/constants.ts` → extend `AIRFRAMES.hawker.description`, OR
- `src/app/aircraft/[slug]/page.tsx` → add a per-airframe "Major Inspection Events" section.

**Severity: P0** — paragraph-level depth removal hurts both rankings and on-page topical relevance for Hawker queries (currently the `/capabilities` page ranks #2 for "Hawker 850XP aircraft maintenance"; comparable Hawker queries likely affected).

---

### GAP-03 — P1 — "WE KNOW HAWKERS" + Hawker parts inventory claim

**Verbatim old text (from `/capabilities`):**
> "Plane Place Aviation has extensive experience with all Hawker airframes. WE KNOW HAWKERS. When it comes to Hawker maintenance, look no further than Place Place Aviation. We are a one-stop-shop for any and all Hawker maintenance needs. Plane Place Aviation also has access to extensive Hawker parts inventory."

**Why it matters:** Hawker parts availability is industry-wide pain. The old page explicitly claims parts inventory access — strong differentiator. The AIN trade article also calls this out: PPA has a parts-out partner on the field.

**New site coverage:** Generic "tooling, parts access, and type-specific knowledge" line on `/aircraft/hawker`. The "extensive Hawker parts inventory" claim is gone.

**Where it should live:** `src/app/aircraft/[slug]/page.tsx` (Hawker block) or extend `AIRFRAMES.hawker.description`.

**Severity: P1** — depth loss on a high-priority airframe family page.

---

### GAP-04 — P1 — Consulting / Maintenance Management narrative

**Verbatim old text (from `/services`):**
> "We understand that your time is valuable. Let us do the dirty work and help you navigate your way through your aircraft's maintenance. Our team can represent you in scheduling, negotiating, and overseeing maintenance visits."
>
> "Our team has extensive experience with your type of aircraft. We can provide you with one on one aircraft maintenance management, regulatory compliance (FAA, DOT), and storage of aircraft… We can plan ahead to work on your schedule, reduce downtime, and lower operating costs. We can also provide weekly, bi-weekly, or even monthly service checks…"

**New site coverage:** `/services` has a Maintenance Management section with bullets, but the narrative around "consulting / representing you / weekly bi-weekly monthly service checks" is gone. Specifically: "regulatory compliance (FAA, DOT)" and "storage of aircraft" are absent from the new site entirely.

**Where it should live:** `src/app/services/page.tsx` → expand `SERVICE_DETAILS["maintenance-management"].description` to two paragraphs and add the FAA/DOT compliance + storage features.

**Severity: P1** — long-tail keyword loss ("aircraft maintenance management Texas", "aircraft storage Cleburne").

---

### GAP-05 — P1 — FAR/Part 145 announcement post (brand+credential queries)

**Old URL:** `/receives-faa-certification-as-a-part-145-repair-station/`
**Old `<title>`:** "Receives FAA Certification as a Part 145 Repair Station - Plane Place Aviation"

**Why it matters:** When operators Google "Plane Place Aviation Part 145" or "PPA FAA certification" they likely hit this post. It's also one of the few news posts with internal narrative depth. The announcement page is itself an SEO asset for credential verification queries.

**New site coverage:** The new `/about` page lists "FAA Part 145 Repair Station" as a single line under Certifications. No dedicated URL.

**Where it should live:** Either (a) recreate as `/blog/faa-part-145-certification` with the announcement narrative, OR (b) redirect old URL → `/about#certifications`.

**Severity: P1** — credential-verification queries likely lose the dedicated landing page.

---

### GAP-06 — P1 — AIN trade-press article ("Taps Into Surging Demand")

**Old URL:** `/plane-place-aviation-taps-into-surging-demand-for-airframe-mro/`

**Why it matters:** This page contains substantial prose, quotes from both founders, and links out to the AIN article on ainonline.com. It's likely **the single most backlinked old-site URL** because aviation press syndicates pieces. It provides depth for queries like "Plane Place Aviation reviews", "Plane Place Aviation history", and broker/operator due-diligence searches.

**New site coverage:** None.

**Where it should live:** Recreate as `/blog/ain-airframe-mro-feature` or redirect to `/about`.

**Severity: P1** — likely highest-authority inbound page on old site.

---

### GAP-07 — P1 — Hangar size / "40,000 sq ft" claim

**Verbatim old text (from `/plane-place-aviation-expands-operations-with-move-to-larger-hangar-space/`):**
> "40,000 sq. ft. of hangar space at Cleburne airport… a comfortable lounge area and ample office space for customers and employees."

**Why it matters:** Concrete numbers (square footage, technician count) drive credibility and long-tail queries ("aircraft MRO 40000 sq ft Texas"). New site says "three hangars on the field" but no square footage.

**New site coverage:** "40+ Technicians" is on the homepage. Hangar square footage is absent.

**Where it should live:** `src/app/page.tsx` (Cleburne / KCPT section) or `src/app/about/page.tsx` (Location section). Add: "40,000 sq ft across three hangars."

**Severity: P1** — concrete fact loss; weakens E-E-A-T signal.

---

### GAP-08 — P2 — Hawker / Citation / Challenger sell sheet PDFs

**Old links (from `/capabilities`):**
- `/wp-content/uploads/2025/05/PP-Hawker-Sell-Sheet-R3-LR.pdf`
- `/wp-content/uploads/2025/05/PP-Citation-Sell-Sheet-R4-LR.pdf`
- `/wp-content/uploads/2025/05/PP-Challenger-Sell-Sheet-R3-LR.pdf`
- `/wp-content/uploads/2025/05/PP-Capabilities-Sell-Sheet-R3-LR.pdf`

**New site coverage:** No PDF assets exposed. These PDFs may be ranking for branded "Plane Place Aviation Hawker" image/PDF searches and are linked from external referrers.

**Severity: P2** — recommend either rehost on new site under `/downloads/` or 410-Gone these.

---

### GAP-09 — P2 — Now Hiring page (recruitment traffic)

**Old URL:** `/now-hiring-ap-mechanic-avionics-technician/`
**Active recruiting CTA + Tristan's direct phone (817-739-5630).**

**New site coverage:** No careers page exists.

**Severity: P2** — non-revenue but recruiting pipeline impact. If hiring is paused, accept loss; if active, recreate.

---

## 3. Per-Airframe Model Coverage Gap

Counts are lower-bound; multiple references to the same model on the same page are counted as 1 occurrence per page. Old site mentions are reflected across the site-wide footer "We Specialize in:" block (homepage, /services, /capabilities, /about, /contact, /gallery, /news, all 8 news posts). New site mentions come from page-specific copy + the `/aircraft/[slug]` model badges + quote form dropdown.

### Hawker

| Model | Old site (pages) | New site (places) | Notes |
|---|---|---|---|
| 800 | All 15 pages (footer block) | `/aircraft/hawker` (model grid + modelSpecs in constants), `/quote` (dropdown), `/page.tsx` airframe card | Comparable. |
| 800XP | All 15 pages (footer block) | Same as 800 + image alt text on `/aircraft/hawker` ("Hawker 800XP in hangar") | Comparable. Stronger on new site (alt text). |
| 900XP | All 15 pages (footer block) | Same as 800 | Comparable. |
| 1000 | All 15 pages (footer block) | Same as 800 | Comparable. |
| 850 | (Not listed in models, but `/capabilities` ranks #2 for "Hawker 850XP aircraft maintenance" with Google flagging "Missing: 850XP") | `/aircraft/hawker` fleet background image alt: "Hawker 850 on the ramp" | Per owner: ignore 850XP. (Old ranking is incidental.) |

### Citation

| Model | Old site | New site | Notes |
|---|---|---|---|
| 525 | **Not on old site** | `/aircraft/citation` (model grid), constants modelSpecs, /quote dropdown | **New addition.** Per CLAUDE.md, 525 is OFF-LIST. **Flag for owner.** |
| 550 | All 15 pages (footer block) | `/aircraft/citation`, /quote, page.tsx airframe card | Comparable. |
| 560 | All 15 pages | Same | Comparable. |
| 560XL/XLS | All 15 pages | Same | Comparable. |
| 650 | All 15 pages | **MISSING** from new Citation models | **Regression.** Old `/capabilities` mentions Citation 650 twice. Old footer block lists it. New `AIRFRAMES.citation.models` array has `["525", "550", "560", "560XL/XLS", "680", "680A"]` — **no 650.** Per CLAUDE.md: Citation 650 IS on the official airframe list. **P1 fix: add `"650"` back to constants.ts.** |
| 680 | All 15 pages | `/aircraft/citation` model grid, fleet bg alt "Citation 680 Sovereign on the ramp" | Comparable. |
| 680A | **Not on old site** | `/aircraft/citation` (model grid + modelSpecs) | **New addition.** Per CLAUDE.md, 680A is OFF-LIST. **Flag for owner.** |

### Challenger

| Model | Old site | New site | Notes |
|---|---|---|---|
| 300 | All 15 pages + dedicated `/services` H2 + dedicated H3 + 3 paragraphs of body prose + 3 mentions in news posts | `/aircraft/challenger` (model grid), constants modelSpecs, /quote, page.tsx | **Depth regression.** Old site has paragraph-level Challenger 300 content driving #1 rankings; new site has list-level only. |
| 350 | All 15 pages + dedicated `/services` H2 + paragraphs | `/aircraft/challenger` (model grid + fleet bg alt "Challenger 350 on the ramp") | Same depth regression as 300. |
| 604 | All 15 pages + dedicated news post `/plane-place-aviation-adds-new-challenger-604-605-and-650-capabilities/` | `/aircraft/challenger` (model grid + modelSpecs) | News-post URL gone. |
| 605 | Same as 604 | Same | Same. |
| 650 | Same as 604 | Same | Same. |

**Summary of model coverage:**
- **Citation 650:** removed from new constants — needs to be restored. Highest-priority model fix.
- **Citation 525 / 680A:** added on new site contrary to CLAUDE.md. Decision needed: trim from constants, or update CLAUDE.md. Recommend trim (the brand bible is authoritative).
- **Challenger 300 / 350:** present in lists but **lost the paragraph-level prose that's currently ranking #1**.

---

## 4. News Post Handling

The new `/blog` route exists and reads from `getAllPosts()` in `src/lib/blog-posts.ts`, but there is no evidence the 8 old news posts have been ported. All 8 old news URLs will 404 at cutover unless redirected.

| Post | Likely SEO Value | Recommended Action |
|---|---|---|
| `/aog-mrt/` | Low. Brief announcement. | 301 → `/services#aog-response` |
| `/plane-place-aviation-boosts-mx-offering-in-texas-oklahoma/` | Low–medium. Geo + AOG signal. | 301 → `/services#aog-response` |
| `/plane-place-aviation-taps-into-surging-demand-for-airframe-mro/` | **High.** Trade press, founder quotes, likely backlinked from AIN syndication. | **Recreate as `/blog/...` post** OR 301 → `/about`. Recreate is preferred (preserves prose + outbound link to ainonline.com). |
| `/plane-place-aviation-adds-new-challenger-604-605-and-650-capabilities/` | Medium. Capability announcement. | 301 → `/aircraft/challenger` |
| `/receives-faa-certification-as-a-part-145-repair-station/` | **High.** Brand+credential queries. | **Recreate as `/blog/faa-part-145-certification`** OR 301 → `/about#certifications`. Recreate preferred. |
| `/plane-place-aviation-expands-operations-with-move-to-larger-hangar-space/` | Medium. Has 40,000 sq ft fact. | 301 → `/about`. Bring "40,000 sq ft" fact onto `/about` first (see GAP-07). |
| `/now-hiring-ap-mechanic-avionics-technician/` | Medium for recruiting. Low for sales. | If hiring active: recreate at `/careers`. If paused: 301 → `/about` (or accept 404 with `noindex`). |
| `/plane-place-aviation-receives-mexico-afac-repair-station-certification/` | **High.** Mexico operator search queries. | Recreate as `/blog/mexico-afac-certification` OR 301 → `/about#certifications`. Recreate preferred. |

**Recommendation:** Recreate the three high-value posts (AIN feature, FAA Part 145, Mexico AFAC) as actual `/blog/...` entries on the new site **before cutover**. 301 the rest to the closest topical match.

---

## 5. Redirect Strategy

The new site uses `output: "export"` (static — see Next.js export setup) so `next.config.js` redirects cannot run. **All redirects must be configured at Cloudflare** (Bulk Redirects or Rules → Redirect Rules).

### Required redirect rules (one per old URL)

| Source (old) | Target (new) | Type | Justification |
|---|---|---|---|
| `https://planeplaceaviation.com/` | `https://ppa.aero/` | 301 | Apex redirect. Set up first. |
| `/services/` | `/services` | 301 | Same intent. (Trailing slash also normalized.) |
| `/capabilities/` | `/services` | 301 | **Recommend `/services` over `/aircraft` index** — old page mixes services + family overview, and `/services` carries more keyword breadth. Alternative: redirect to `/aircraft/hawker` to preserve the #2 "Hawker 850XP" rank. **Owner decision needed.** |
| `/about/` | `/about` | 301 | Direct match. |
| `/contact/` | `/contact` | 301 | Direct match. |
| `/gallery/` | `/about` | 301 | Closest topical match. Photo content is on `/about` photo strip. |
| `/news/` | `/blog` | 301 | URL pattern parity. |
| `/aog-mrt/` | `/services#aog-response` | 301 | Anchor preserves topical match. |
| `/plane-place-aviation-boosts-mx-offering-in-texas-oklahoma/` | `/services#aog-response` | 301 | Same as above. |
| `/plane-place-aviation-taps-into-surging-demand-for-airframe-mro/` | `/blog/<recreated-slug>` if recreated, else `/about` | 301 | **Recreate preferred.** |
| `/plane-place-aviation-adds-new-challenger-604-605-and-650-capabilities/` | `/aircraft/challenger` | 301 | Capability covered on the family page. |
| `/receives-faa-certification-as-a-part-145-repair-station/` | `/blog/faa-part-145-certification` if recreated, else `/about#certifications` | 301 | **Recreate preferred.** |
| `/plane-place-aviation-expands-operations-with-move-to-larger-hangar-space/` | `/about` | 301 | After GAP-07 is fixed. |
| `/now-hiring-ap-mechanic-avionics-technician/` | `/careers` if recreated, else `/about` | 301 | Owner decision: hiring active or not. |
| `/plane-place-aviation-receives-mexico-afac-repair-station-certification/` | `/blog/mexico-afac-certification` if recreated, else `/about#certifications` | 301 | **Recreate preferred.** |
| `/wp-content/uploads/2025/05/PP-*-Sell-Sheet-*.pdf` (4 PDFs) | `/about` *or* recreate at `/downloads/` | 301 or 410 | Owner decision. Default: 410 Gone if PDFs not migrated. |
| `/wp-*/`, `/wp-content/*` (catchall except above) | (none) | 404 | Old WP infrastructure; let die. |
| `/?p=*`, `/?page_id=*` (WP query strings) | (none) | 404 or canonical to `/` | Low value. |

### Soft-404 risk flags

- **`/gallery/` → `/about`:** Some user-intent mismatch (gallery vs about-us). Acceptable but watch GSC for soft-404 reports.
- **`/news/` → `/blog`:** OK only if `/blog` has actual posts at cutover. If `/blog` is empty, redirect `/news/` → `/about` instead until posts ship.
- **News posts → `/about`:** If 4+ news posts redirect to `/about`, GSC may flag those as soft-404. Mitigation: recreate the 3 high-value posts so only 5 redirects collapse to thin targets.

### URLs that should NOT redirect
- WP-admin paths (`/wp-admin/*`, `/wp-login.php`) — return 404, not redirect (security hygiene + no SEO value).
- WP feed paths (`/feed/`, `/comments/feed/`) — 404 or 410.
- Anything with `?replytocom=` or other comment query params — 404.

---

## 6. Pre-Cutover Checklist

**Strict order.** Each item references specific files in the new repo.

### P0 — Must complete before DNS cutover

1. **Restore Citation 650 to constants.**
   - File: `src/lib/constants.ts`
   - Change: `AIRFRAMES.citation.models` from `["525", "550", "560", "560XL/XLS", "680", "680A"]` to `["550", "560", "560XL/XLS", "650", "680"]` (per CLAUDE.md authoritative list — also drops 525 and 680A which are off-list).
   - Update `modelSpecs` accordingly: remove 525 and 680A entries; add 650 entry.
   - Why P0: Citation 650 is in CLAUDE.md as a serviced model AND was indexed on every old-site page. Removing it from new site = silent loss across the entire Citation footprint.

2. **Add Challenger 96/192-month inspection prose to `/aircraft/challenger`.**
   - File: `src/lib/constants.ts` → expand `AIRFRAMES.challenger.description` to two paragraphs **OR** file `src/app/aircraft/[slug]/page.tsx` → add a per-slug content block for Challenger.
   - Required content (verbatim or rewritten close-paraphrase): "Every 96 and 192 months your Challenger is due for a major inspection and landing gear removal. Plane Place Aviation has completed several of these inspections and gear removals…"
   - Why P0: Currently the **#1 rank** for "challenger 300 aircraft maintenance" lives on this content.

3. **Add Hawker 8-year inspection prose to `/aircraft/hawker`.**
   - File: same as above, Hawker slug.
   - Required content: "Every 8 years your Hawker is due for its major inspection. Plane Place Aviation has extensive experience performing 8-year inspections…"
   - Why P0: Same depth-loss risk on Hawker family.

4. **Confirm `/services` page title carries Challenger ranking signal.**
   - File: `src/app/services/page.tsx` (line 95).
   - Current: `"Aircraft Maintenance Services — Hawker, Citation & Challenger"`.
   - Old: `"Challenger 300/350 Maintenance Event | 96 or 192 Month"`.
   - Recommendation: keep current `<title>` as the family page identity, BUT ensure the Challenger maintenance event keyword is anchored in an H2/H3 on `/aircraft/challenger` (e.g., "Challenger 300/350 Maintenance Event — 96/192 Month") so the rank can transfer to that URL via redirect.

5. **Configure all 15 redirect rules at Cloudflare.**
   - Use the table in §5. Stage in Cloudflare BEFORE flipping the DNS so old URLs hit the new site immediately when traffic redirects.
   - Test each redirect with `curl -I` after staging.

### P1 — Strongly recommended before cutover

6. **Recreate the three high-value news posts as blog entries.**
   - File: `src/lib/blog-posts.ts` (or wherever `getAllPosts()` reads from — confirm via `Read`).
   - Create slugs: `faa-part-145-certification`, `ain-airframe-mro-feature`, `mexico-afac-certification`.
   - Use verbatim body text from the old posts (extracted in this audit). Backdate `publishedAt` to original 2023/2024/2025 dates for chronology and signal continuity.
   - Why P1: Preserves brand-credibility content, minimizes soft-404 risk, restores high-authority backlinkable URLs.

7. **Add Hawker parts inventory claim back to `/aircraft/hawker`.**
   - File: `src/lib/constants.ts` (extend `AIRFRAMES.hawker.description`) or the airframe page template.
   - Required: "extensive Hawker parts inventory" or equivalent. The AIN article (and old `/capabilities` page) both cite it.

8. **Expand Maintenance Management description.**
   - File: `src/app/services/page.tsx` → `SERVICE_DETAILS["maintenance-management"]`.
   - Add "regulatory compliance (FAA, DOT)" and "aircraft storage" features. Expand description from one sentence to two paragraphs covering scheduling/negotiating/oversight.

9. **Add concrete hangar fact ("40,000 sq ft across three hangars") to `/about` Location section.**
   - File: `src/app/about/page.tsx` (Location section, around line 270).

### P2 — Nice-to-have before cutover (or fast-follow)

10. **Decide PDF sell sheet fate.**
    - Either rehost under `public/downloads/` and link from `/aircraft/[slug]` pages, or 410-Gone the WP paths at Cloudflare.

11. **Decide careers page fate.**
    - If hiring active: build `/careers` page with content from `/now-hiring-ap-mechanic-avionics-technician/`. Tristan's direct contact.
    - If paused: 301 to `/about`.

12. **Submit new sitemap to GSC after cutover.**
    - File: `src/app/sitemap.ts` (already dynamic — confirmed). New sitemap URL: `https://ppa.aero/sitemap.xml`.
    - Submit in Search Console BOTH properties (planeplaceaviation.com and ppa.aero) post-cutover.

13. **Add `<link rel="canonical">` overrides to confirm ppa.aero is the canonical domain.**
    - Already done in `layout.tsx` and per-page metadata. Verify by curling 5 representative pages post-deploy.

14. **Set up Change of Address in GSC** from planeplaceaviation.com to ppa.aero AFTER 301s are live and stable for 48h.

---

## Appendix A — Old-site footer block (every page)

Every old-site page (all 15 URLs) ends with the same "We Specialize in:" footer listing Hawker (800, 800Xp, 900Xp & 1000), Citation (550, 560, 560XL/XLS, 650, 680), Challenger (300, 350, 604, 605 & 650). This sitewide repetition reinforces every airframe model on every URL — a substantial loss of model-specific keyword density when the site shrinks to ~10 URLs.

The new site does NOT replicate this footer block on every page. The model footprint depends entirely on the dedicated `/aircraft/[slug]` pages + the homepage airframe cards + the quote dropdown. **This is acceptable as long as Citation 650 is restored** (P0 item 1) and the per-airframe pages have body prose (P0 items 2 + 3).

---

## Appendix B — High-priority CLAUDE.md keywords vs new-site coverage

| Keyword | Old site | New site coverage |
|---|---|---|
| hawker maintenance texas | Implicit (footer + capabilities prose) | `/aircraft/hawker` description + `/services` body | OK |
| citation maintenance DFW | Implicit | Homepage Cleburne section mentions DFW; `/aircraft/citation` doesn't say "DFW" | **Light gap** |
| challenger MRO texas | Implicit | `/aircraft/challenger` + homepage | OK |
| pre-purchase inspection hawker / citation / challenger | `/services` lists "Pre-purchase evaluations to include SB and AD compliance" | `/services` PPI section + `/quote` form option | OK (parity) |
| FAR 145 repair station texas | "Certified 145-repair station" prose on every old page | `/about` certifications + JSON-LD in `layout.tsx` | OK |
| AOG service texas | `/aog-mrt` + `/services` "24/7 AOG support" | `/services` AOG section + JSON-LD | OK |
| aircraft maintenance cleburne texas | Every old page footer | Homepage + `/about` location + `/contact` | OK |
| hawker 800XP maintenance | `/capabilities` H2 + footer | `/aircraft/hawker` model grid + image alt "Hawker 800XP in hangar" | OK |
| citation 560XL inspection | Footer | `/aircraft/citation` model grid | Light gap (no "inspection" keyword anchored) |
| challenger 350 maintenance | `/services` H2 prose | `/aircraft/challenger` model grid + fleet bg alt "Challenger 350 on the ramp" | **Depth gap (see GAP-01)** |
| aircraft pre-buy inspection texas | `/services` PPI bullets | `/services` PPI section | OK |
| business jet MRO DFW | Implicit | Homepage Cleburne section | OK |
| hawker annual inspection cost | `/services` 8-year prose | None | **GAP-02** |
| citation phase inspection | Footer + capabilities | `/services` Phase 1-5 inspection bullet, `/aircraft/citation` Phase inspections feature pill | OK |
| best MRO for hawker 800 series | "WE KNOW HAWKERS" + parts inventory | Generic "deep expertise across the entire Hawker 800 series" | **GAP-03 partial** |
| independent challenger maintenance provider | Implicit on `/services` | `/aircraft/challenger` description | OK |
| how to choose an aircraft MRO | None | None | Not blocked (long-tail blog territory) |
| pre-purchase inspection checklist business jet | None on either | None | Not blocked |
| aircraft maintenance records resale value | None | `/services` "Documentation for resale value protection" feature pill | New site **stronger** here. |

---

## Appendix C — File paths referenced in this audit

**New site files reviewed:**
- `src/app/page.tsx`
- `src/app/services/page.tsx`
- `src/app/aircraft/[slug]/page.tsx`
- `src/lib/constants.ts`
- `src/app/about/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/quote/page.tsx`
- `src/app/blog/page.tsx`
- `src/app/sitemap.ts`
- `src/app/layout.tsx`

**Files needing edits per checklist:**
- `src/lib/constants.ts` (P0 #1, P0 #2, P0 #3, P1 #7)
- `src/app/aircraft/[slug]/page.tsx` (P0 #2, P0 #3, P1 #7 — alternative path)
- `src/app/services/page.tsx` (P0 #4 verification, P1 #8)
- `src/app/about/page.tsx` (P1 #9)
- `src/lib/blog-posts.ts` (P1 #6 — file not yet read; confirm structure before editing)

**Files referenced for context (not edited):**
- `c:\Users\Richard Broadhead\PPA-Marketing\CLAUDE.md` (brand bible / authoritative airframe list)
- `c:\Users\Richard Broadhead\.claude\projects\...\memory\project_p1_services_deferred.md` (per-airframe-MODEL pages, out of scope for THIS audit)
