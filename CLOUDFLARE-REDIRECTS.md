# Cloudflare Redirect Rules — planeplaceaviation.com → ppa.aero

**Purpose:** Preserve search rankings when DNS cuts over. The new site uses `output: "export"` (static), so Next.js redirects do not run — these MUST be configured at Cloudflare.

**Where to configure:** Cloudflare dashboard → planeplaceaviation.com zone → Rules → Redirect Rules (or Bulk Redirects).

**When to enable:** Site is now indexable (`noindex` removed in `e4e052d`). Redirects can be enabled at Cloudflare immediately. Recommended order:
1. Configure rules in Cloudflare zone (planeplaceaviation.com) — staged
2. Test with curl (see Verification section)
3. Submit ppa.aero sitemap in Google Search Console
4. After 48h of stable redirects, submit GSC Change of Address from planeplaceaviation.com → ppa.aero

---

## Redirect rules (in priority order)

### 1. Apex + WWW (must be first)
| Source | Target | Status | Notes |
|---|---|---|---|
| `https://planeplaceaviation.com/*` | `https://ppa.aero/$1` | 301 | Catchall apex — apply if no specific rule matches below |
| `https://www.planeplaceaviation.com/*` | `https://ppa.aero/$1` | 301 | WWW variant catchall |

### 2. Static pages (1:1 mapping)
| Source | Target | Status |
|---|---|---|
| `/services/` | `/services` | 301 |
| `/about/` | `/about` | 301 |
| `/contact/` | `/contact` | 301 |

### 3. Capabilities — direct 1:1 URL match
| Source | Target | Status | Notes |
|---|---|---|---|
| `/capabilities/` | `/capabilities` | 301 | Direct URL match (just the trailing-slash normalization). New `/capabilities` page is family-level and ranks for cross-airframe queries (e.g. "citation 650 aircraft maintenance" #4). H1 "Aircraft Maintenance Capabilities · Hawker · Citation · Challenger" puts the keywords in the strongest on-page signal. H2 "Maintenance Built Around Your Fleet." Body prose preserves "factory-trained Challenger 300/350 technicians" and "extensive Hawker parts inventory" — the phrases driving current cross-airframe rankings. Links to `/capabilities/{hawker,citation,challenger}` family pages for drill-down. FAQ section + FAQPage schema for rich SERP features. |

### 3a. Internal /aircraft → /capabilities (ppa.aero zone — short-lived)
The new site briefly used `/aircraft` as the airframe-index URL before being renamed to `/capabilities` to match the old site's URL structure. Add these on the `ppa.aero` zone (not `planeplaceaviation.com`) for ~30 days then remove.

| Source | Target | Status | Notes |
|---|---|---|---|
| `https://ppa.aero/aircraft` | `https://ppa.aero/capabilities` | 301 | Index |
| `https://ppa.aero/aircraft/hawker` | `https://ppa.aero/capabilities/hawker` | 301 | |
| `https://ppa.aero/aircraft/citation` | `https://ppa.aero/capabilities/citation` | 301 | |
| `https://ppa.aero/aircraft/challenger` | `https://ppa.aero/capabilities/challenger` | 301 | |

### 4. Gallery — direct 1:1 URL match
| Source | Target | Status | Notes |
|---|---|---|---|
| `/gallery/` | `/gallery` | 301 | Direct URL match (trailing-slash normalization). New site now has a /gallery page with 36 photos and ImageGallery JSON-LD. Old /gallery had 4,422 imp at pos 4.4 (mostly image-search rankings) — direct match should preserve image equity. |

### 5. News index → blog index
| Source | Target | Status |
|---|---|---|
| `/news/` | `/blog` | 301 |

### 6. News posts → recreated blog entries (1:1)
These were recreated as `/blog/[slug]` posts in commit `5190877`. Slugs match where possible.

| Source | Target | Status |
|---|---|---|
| `/aog-mrt/` | `/services#aog-response` | 301 |
| `/plane-place-aviation-boosts-mx-offering-in-texas-oklahoma/` | `/services#aog-response` | 301 |
| `/plane-place-aviation-taps-into-surging-demand-for-airframe-mro/` | `/blog/plane-place-aviation-taps-into-surging-demand-for-airframe-mro` | 301 |
| `/plane-place-aviation-adds-new-challenger-604-605-and-650-capabilities/` | `/blog/plane-place-aviation-adds-new-challenger-604-605-and-650-capabilities` | 301 |
| `/receives-faa-certification-as-a-part-145-repair-station/` | `/blog/receives-faa-certification-as-a-part-145-repair-station` | 301 |
| `/plane-place-aviation-expands-operations-with-move-to-larger-hangar-space/` | `/blog/plane-place-aviation-expands-operations-with-move-to-larger-hangar-space` | 301 |
| `/now-hiring-ap-mechanic-avionics-technician/` | `/blog/now-hiring-ap-mechanic-avionics-technician` | 301 |
| `/plane-place-aviation-receives-mexico-afac-repair-station-certification/` | `/blog/plane-place-aviation-receives-mexico-afac-repair-station-certification` | 301 |

### 7. PDFs — decide before cutover
| Source | Target | Status | Notes |
|---|---|---|---|
| `/wp-content/uploads/2025/05/PP-Capabilities-Sell-Sheet-R3-LR.pdf` | `/about` | 301 OR 410 | Decision needed. Default: 301 to /about. If sell sheets are stale, return 410 Gone. |
| `/wp-content/uploads/2025/05/PP-Hawker-Sell-Sheet-R3-LR.pdf` | `/capabilities/hawker` | 301 OR 410 | Same |
| `/wp-content/uploads/2025/05/PP-Citation-Sell-Sheet-R4-LR.pdf` | `/capabilities/citation` | 301 OR 410 | Same |
| `/wp-content/uploads/2025/05/PP-Challenger-Sell-Sheet-R3-LR.pdf` | `/capabilities/challenger` | 301 OR 410 | Same |
| `/wp-content/uploads/2023/08/PP-Capabilities-*.pdf` | `/about` | 301 OR 410 | Older variant |

### 8. WordPress junk — return 404 (do NOT redirect)
These have no SEO value and shouldn't redirect anywhere. Let them 404.

| Source | Status | Notes |
|---|---|---|
| `/wp-admin/*` | 404 | Security hygiene |
| `/wp-login.php` | 404 | Security hygiene |
| `/wp-content/*` (except PDFs above) | 404 | |
| `/wp-includes/*` | 404 | |
| `/feed/`, `/comments/feed/` | 410 Gone | RSS feeds — no equivalent on new site |
| `/?p=*`, `/?page_id=*` | 410 Gone | WordPress query strings |
| `/?replytocom=*` | 410 Gone | WordPress comment artifacts |
| `/category/uncategorized/` | 301 → `/blog` | Single category page |
| `/author/adecce15_admin/` | 301 → `/about` | Author archive — 533 imp historical |

---

## Verification after cutover

Run these `curl` checks AFTER enabling the rules. Each should return 301 status and the expected `Location` header.

```bash
# Apex
curl -sI https://planeplaceaviation.com/ | grep -E '^(HTTP|location)'
# Expected: 301 → https://ppa.aero/

# Services page
curl -sI https://planeplaceaviation.com/services/ | grep -E '^(HTTP|location)'
# Expected: 301 → https://ppa.aero/services

# Capabilities (highest-traffic redirect)
curl -sI https://planeplaceaviation.com/capabilities/ | grep -E '^(HTTP|location)'
# Expected: 301 → https://ppa.aero/services

# FAA Part 145 cert (8,338 impressions)
curl -sI https://planeplaceaviation.com/receives-faa-certification-as-a-part-145-repair-station/ | grep -E '^(HTTP|location)'
# Expected: 301 → https://ppa.aero/blog/receives-faa-certification-as-a-part-145-repair-station

# AIN feature (5,081 impressions)
curl -sI https://planeplaceaviation.com/plane-place-aviation-taps-into-surging-demand-for-airframe-mro/ | grep -E '^(HTTP|location)'
# Expected: 301 → https://ppa.aero/blog/plane-place-aviation-taps-into-surging-demand-for-airframe-mro
```

---

## Pre-cutover checklist

Status as of 2026-05-05:

1. [x] `ppa.aero` is fully built and deployed with all migration SEO content
2. [x] `noindex` meta has been REMOVED from `src/app/layout.tsx` and redeployed (`e4e052d`)
3. [x] `curl -s https://ppa.aero/ | grep robots` returns nothing — verified
4. [x] `https://ppa.aero/sitemap.xml` returns the full sitemap including all `/blog/` slugs
5. [x] All recreated blog posts return 200 OK (FAA cert, AIN, Mexico AFAC, hangar expansion, careers, Challenger 604/605/650)
6. [ ] **TODO:** Submit `https://ppa.aero/sitemap.xml` in Google Search Console (ppa.aero property)
7. [ ] **TODO:** Stage redirect rules in Cloudflare (use companion `CLOUDFLARE-REDIRECTS.xlsx` file for the full rule set)
8. [ ] **TODO:** Apply rules and run verification curls above
9. [ ] **TODO:** In GSC: cancel any active "URL removal" requests on ppa.aero
10. [ ] **TODO:** In GSC: submit Change of Address from planeplaceaviation.com → ppa.aero (after redirects stable for 48h)

---

## What this preserves vs what's accepted as loss

**Preserved (designed):**
- Homepage rank (914 clicks / 17,460 imp)
- All 6 high-value news posts, recreated as /blog entries (16,000+ combined impressions)
- /services, /about, /contact rankings (each top-5 average position)
- FAA Part 145 query cluster (5,000+ imp) — strengthened on /about + dedicated blog post
- Challenger 96/192-month + factory-trained queries (driving the /services rank)
- Hawker parts inventory queries (937+ imp)
- Brand queries (980+ imp at top-3 positions)

**Accepted as loss:**
- `/aog-mrt/` and `/boosts-mx-offering` standalone pages (folded into /services#aog-response)
- Citation 525 + Citation 680A coverage (off CLAUDE.md airframe list, deliberately removed)
- Sell sheet PDFs (decision pending)

**Recovered after audit (originally listed as loss):**
- /gallery image-search visibility (~4,422 imp at pos 4.4) — new /gallery page built with 36 photos, ImageGallery JSON-LD schema, and descriptive alt text. 1:1 URL match preserves image equity.
