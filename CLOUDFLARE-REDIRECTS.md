# Cloudflare Redirect Rules — planeplaceaviation.com → ppa.aero

**Purpose:** Preserve search rankings when DNS cuts over. The new site uses `output: "export"` (static), so Next.js redirects do not run — these MUST be configured at Cloudflare.

**Where to configure:** Cloudflare dashboard → planeplaceaviation.com zone → Rules → Redirect Rules (or Bulk Redirects).

**When to enable:** AFTER the noindex is removed from ppa.aero AND after `https://ppa.aero/` is verified working with all the migration content. Before flipping these on, the new site must be live and indexable.

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

### 3. Capabilities — split, redirect to airframe index
| Source | Target | Status | Notes |
|---|---|---|---|
| `/capabilities/` | `/services` | 301 | Old page mixed services + family overview. `/services` covers more keyword breadth than any single `/aircraft/[slug]` page. |

### 4. Gallery — no equivalent
| Source | Target | Status | Notes |
|---|---|---|---|
| `/gallery/` | `/about` | 301 | New site has no gallery route. About page has photo strip. Watch GSC for soft-404 reports. |

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
| `/wp-content/uploads/2025/05/PP-Hawker-Sell-Sheet-R3-LR.pdf` | `/aircraft/hawker` | 301 OR 410 | Same |
| `/wp-content/uploads/2025/05/PP-Citation-Sell-Sheet-R4-LR.pdf` | `/aircraft/citation` | 301 OR 410 | Same |
| `/wp-content/uploads/2025/05/PP-Challenger-Sell-Sheet-R3-LR.pdf` | `/aircraft/challenger` | 301 OR 410 | Same |
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

Before enabling the redirects above, verify in this order:

1. [ ] `ppa.aero` is fully built and deployed with all migration SEO content
2. [ ] `noindex` meta has been REMOVED from `src/app/layout.tsx` and redeployed
3. [ ] `curl -s https://ppa.aero/ | grep robots` returns nothing (or only structured data references)
4. [ ] `https://ppa.aero/sitemap.xml` returns the full sitemap including all `/blog/` slugs
5. [ ] All recreated blog posts return 200 OK (test the 6 slugs in section 6)
6. [ ] Submit `https://ppa.aero/sitemap.xml` in Google Search Console (ppa.aero property)
7. [ ] Stage redirect rules in Cloudflare DRAFT mode if available
8. [ ] Apply rules and run verification curls above
9. [ ] In GSC: cancel any active "URL removal" requests on ppa.aero
10. [ ] In GSC: submit Change of Address from planeplaceaviation.com → ppa.aero (after redirects stable for 48h)

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
- /gallery/ image-search visibility (~4,422 imp at pos 4.4) — gallery photos on /about don't have same indexability
- Citation 525 + Citation 680A coverage (off CLAUDE.md airframe list, deliberately removed)
- Sell sheet PDFs (decision pending)
