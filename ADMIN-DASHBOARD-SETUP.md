# Admin Dashboard Setup

The `/admin` dashboard is a custom-built management interface for monitoring leads, SEO performance, traffic, and operational health. It's protected by **Cloudflare Access** (zero-trust SSO) and pulls data from multiple sources.

## Modules

| Module | URL | Data source | Required |
|---|---|---|---|
| Overview | `/admin` | — | Always works |
| Leads | `/admin/leads` | Cloudflare KV | KV namespace + binding |
| SEO | `/admin/seo` | Links out to Google Search Console | None (deliberate) |
| Traffic | `/admin/traffic` | Cloudflare GraphQL Analytics | Cloudflare API token |
| Operations | `/admin/operations` | Resend API + R2 binding | Already set up from form work |

Each module independently shows a "Setup required" panel if its credentials/bindings aren't configured. Set up the ones you care about, skip the rest.

---

## CRITICAL: Set up Cloudflare Access first

Without Cloudflare Access, the `/admin` URLs are publicly accessible. Anyone could see your data.

### Steps

1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) (one.dash.cloudflare.com)
2. Access → Applications → **Add an application** → **Self-hosted**
3. Application configuration:
   - Application name: **PPA Admin**
   - Session duration: **24 hours** (or longer if you prefer)
   - Application domain: `ppa.aero`
   - Path: `/admin`
   - Include subdomains: leave off
4. Identity providers: at minimum, enable **One-time PIN** (free, sends a 6-digit code to a verified email). Optionally add **Google Workspace** or **Microsoft 365** for SSO.
5. Click **Next**
6. Policies → **Add a policy**:
   - Policy name: PPA Team
   - Action: **Allow**
   - Configure rules → Include → **Emails** → enter:
     - `richard@avidmktg.com`
     - `tristan@ppa.aero`
     - `travis@ppa.aero`
     - (any others who need admin access)
7. Click **Next** → **Add application**

Test: open https://ppa.aero/admin in an incognito window — Access should challenge for email + PIN before showing the page.

---

## Module 1: Leads (lowest setup overhead)

Tracks form submissions to `/quote` and `/contact`. The form Pages Functions (`functions/quote.ts`, `functions/contact.ts`) write a record to KV after each successful submission.

### Setup

1. **Create KV namespace**:
   - Cloudflare Dashboard → Workers & Pages → KV → **Create namespace**
   - Name: `ppa-leads`
2. **Bind to Pages project**:
   - Workers & Pages → ppa-website-8vu → Settings → **Functions** → **KV namespace bindings** → **Add**
   - Variable name: `LEADS_KV`
   - KV namespace: `ppa-leads`
   - Save
3. **Trigger redeploy** (push any commit, or use the dashboard's "Retry deployment")

After this, every quote/contact submission records:
- A 90-day-TTL record with the full submission data
- An incrementing total counter per type
- A 90-day-TTL daily counter per type
- An entry in the recent-50 list

The `/admin/leads` page reads these. Existing submissions made BEFORE setup won't appear — only future ones.

---

## Module 2: SEO (no setup needed — links out to GSC)

The SEO module deliberately does NOT mirror Google Search Console data. Instead, `/admin/seo` shows a polished landing card with a prominent "Open Search Console" button.

### Why no API integration

We tried (twice) to wire up GSC API access via service account auth:
1. Searched Console's "Add User" flow returned "email not found" for service account emails — a known issue for Google accounts that don't have a Workspace org backing them
2. The OAuth alternative requires either a 7-day re-auth ritual (Testing mode) or 4-8 weeks of Google verification (since `webmasters.readonly` is a sensitive scope)

The trade-off comparison:
- Native GSC has dramatically more capability than what we'd build (filters, comparisons, Discover data, manual actions, Core Web Vitals, etc.)
- It's already one click away
- No tokens to rotate, no quota to manage, no integration to maintain

### What's on /admin/seo

- Link card with prominent "Open Search Console →" button (deep-links to the ppa.aero property)
- Reference list of capabilities you'll find in GSC
- Quick reference: property type, verified owner, link to old planeplaceaviation.com property for migration monitoring

No env vars or bindings needed for this module.

---

## Module 3: Traffic (moderate setup)

Pulls visitor data from Cloudflare's GraphQL Analytics API.

### Setup

1. **Create API token**:
   - Cloudflare → My Profile → API Tokens → **Create Token** → **Custom token**
   - Token name: PPA Admin Analytics
   - Permissions:
     - **Account** → **Account Analytics** → **Read**
     - **Zone** → **Zone Analytics** → **Read**
   - Account Resources: Include → Specific account → your account
   - Zone Resources: Include → Specific zone → `ppa.aero`
   - Continue → **Create Token** → copy the value (you only see it once)
2. **Get account + zone IDs**:
   - Cloudflare Dashboard → ppa.aero → Overview → right sidebar shows **API** with **Zone ID** and **Account ID**
3. **Add to Cloudflare Pages env vars**:
   - `CLOUDFLARE_API_TOKEN` (Secret) → paste the token
   - `CLOUDFLARE_ACCOUNT_ID` (plain text) → paste account ID
   - `CLOUDFLARE_ZONE_ID` (plain text) → paste zone ID
4. **Trigger redeploy**

Cloudflare's GraphQL Analytics API is free and includes the data we need: page views, unique visitors, top pages, top countries, top referrers.

---

## Module 4: Operations (already configured)

Email delivery + R2 storage stats. Both data sources should already be set up from the quote form work:

- `RESEND_API_KEY` (set during quote form setup)
- `QUOTE_FILES` R2 binding (set during R2 configuration)

If both are present, this module works automatically. If neither is, the page shows "Setup required."

---

## Architecture

```
                            ┌─────────────────────────────────┐
                            │  Cloudflare Access (zero-trust) │
                            │  - Email allowlist auth         │
                            │  - 24h session                  │
                            └─────────────────────────────────┘
                                          │
                                          ▼
┌──────────────────────────────────────────────────────────────────┐
│  /admin (Next.js pages, client-rendered with mock-tolerant API)  │
│                                                                   │
│   /admin                  Overview, links to modules             │
│   /admin/leads     ────►  fetch /admin/api/leads                │
│   /admin/seo       ────►  fetch /admin/api/seo                  │
│   /admin/traffic   ────►  fetch /admin/api/traffic              │
│   /admin/operations────►  fetch /admin/api/operations           │
└──────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌──────────────────────────────────────────────────────────────────┐
│  Pages Functions (functions/admin/api/*.ts)                       │
│                                                                   │
│  leads.ts       → reads Cloudflare KV (LEADS_KV)                 │
│  (no seo.ts)    → /admin/seo links out to GSC, no API needed    │
│  traffic.ts     → calls Cloudflare GraphQL Analytics API         │
│  operations.ts  → calls Resend API + lists R2 bucket             │
└──────────────────────────────────────────────────────────────────┘
```

## Required env vars summary

| Variable | Type | Module | Source |
|---|---|---|---|
| `LEADS_KV` | KV binding | Leads | Cloudflare KV namespace |
| `CLOUDFLARE_API_TOKEN` | Secret | Traffic | Cloudflare API tokens page |
| `CLOUDFLARE_ACCOUNT_ID` | Plain | Traffic | Cloudflare overview sidebar |
| `CLOUDFLARE_ZONE_ID` | Plain | Traffic | Cloudflare overview sidebar |
| `RESEND_API_KEY` | Secret | Operations | Resend dashboard (already set) |
| `QUOTE_FILES` | R2 binding | Operations | Already bound from form setup |

## File map

```
src/app/admin/
├── layout.tsx           # Admin chrome (top nav, brand, footer)
├── admin.css            # Shared admin styles
├── page.tsx             # Dashboard overview
├── leads/page.tsx
├── seo/page.tsx
├── traffic/page.tsx
└── operations/page.tsx

src/components/admin/
├── PageHeader.tsx       # Eyebrow + title + description + container
├── Stat.tsx             # Stat card + StatGrid
└── SetupRequired.tsx    # Setup-needed panel

functions/admin/api/
├── leads.ts             # Reads LEADS_KV
├── traffic.ts           # Calls Cloudflare GraphQL Analytics
└── operations.ts        # Resend + R2
                         # (no seo.ts — module links out to GSC)

functions/_shared/
└── leads.ts             # KV schema + helpers (recordLead, readLeadsSummary)
```

## Troubleshooting

### `/admin` is publicly accessible

Cloudflare Access not configured. Set up the Access app per the first section above. **Critical security issue.**

### Leads page shows "KV not configured" but I created the namespace

The KV namespace itself isn't enough — you also need the **binding** in Pages settings. Workers & Pages → ppa-website-8vu → Settings → Functions → KV namespace bindings → Add `LEADS_KV` → `ppa-leads`. Then redeploy.

### Traffic page shows "Cloudflare Analytics fetch failed"

Common causes:
1. API token missing required permissions (must include both Account Analytics and Zone Analytics)
2. Wrong account ID or zone ID
3. Token expired (rare unless you set an expiration)

Check Pages function logs.

### Operations page is empty / no Resend data

The Resend API `/emails` list endpoint requires the API key to have read permissions. Most keys created during initial setup have full access. If you scoped the key to "send only," create a new full-access key in Resend.
