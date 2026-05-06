# Admin Dashboard Setup

The `/admin` dashboard is a custom-built management interface for monitoring leads, SEO performance, traffic, and operational health. It's protected by **Cloudflare Access** (zero-trust SSO) and pulls data from multiple sources.

## Modules

| Module | URL | Data source | Required |
|---|---|---|---|
| Overview | `/admin` | — | Always works |
| Leads | `/admin/leads` | Cloudflare KV | KV namespace + binding |
| SEO | `/admin/seo` | Google Search Console API | Google service account creds |
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

## Module 2: SEO (most setup work)

Pulls organic search data from Google Search Console.

### Setup

1. **Google Cloud Console**:
   - Go to [console.cloud.google.com](https://console.cloud.google.com/)
   - Create or select a project (e.g., "PPA Marketing")
   - APIs & Services → Library → search "Search Console API" → **Enable**
2. **Create service account**:
   - APIs & Services → Credentials → **Create Credentials** → **Service Account**
   - Name: `ppa-admin-dashboard`
   - Skip optional grants → **Done**
   - Click the new service account → **Keys** tab → **Add Key** → **Create new key** → JSON → download the file
3. **Grant the service account access to GSC**:
   - Open [search.google.com/search-console](https://search.google.com/search-console)
   - Select your `ppa.aero` property → Settings → **Users and permissions**
   - **Add user**:
     - Email: the service account email (looks like `ppa-admin-dashboard@your-project.iam.gserviceaccount.com`)
     - Permission: **Restricted** (read-only is fine)
4. **Add to Cloudflare Pages env vars**:
   - Workers & Pages → ppa-website-8vu → Settings → Environment variables → Add:
     - `GSC_SERVICE_ACCOUNT_KEY` (Secret) → paste the **entire contents** of the JSON key file
     - `GSC_PROPERTY` (plain text) → either `sc-domain:ppa.aero` (if you have domain-level verification) or `https://ppa.aero/` (if URL-prefix property)
5. **Trigger redeploy**

To find which property format to use, look at your GSC properties — domain properties show `sc-domain:` prefix.

### Notes

- The service account file should be guarded — anyone with it has read access to your GSC data.
- The JSON contains escaped newlines in the private key; just paste the raw file contents and the function will handle it.
- Data updates with a ~24-48h lag (this is GSC's normal lag, not our cache).

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
│  seo.ts         → calls Google Search Console API (JWT auth)     │
│  traffic.ts     → calls Cloudflare GraphQL Analytics API         │
│  operations.ts  → calls Resend API + lists R2 bucket             │
└──────────────────────────────────────────────────────────────────┘
```

## Required env vars summary

| Variable | Type | Module | Source |
|---|---|---|---|
| `LEADS_KV` | KV binding | Leads | Cloudflare KV namespace |
| `GSC_SERVICE_ACCOUNT_KEY` | Secret | SEO | Google Cloud service account JSON |
| `GSC_PROPERTY` | Plain | SEO | `sc-domain:ppa.aero` or URL form |
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
├── seo.ts               # Calls Google Search Console API
├── traffic.ts           # Calls Cloudflare GraphQL Analytics
└── operations.ts        # Resend + R2

functions/_shared/
└── leads.ts             # KV schema + helpers (recordLead, readLeadsSummary)
```

## Troubleshooting

### `/admin` is publicly accessible

Cloudflare Access not configured. Set up the Access app per the first section above. **Critical security issue.**

### Leads page shows "KV not configured" but I created the namespace

The KV namespace itself isn't enough — you also need the **binding** in Pages settings. Workers & Pages → ppa-website-8vu → Settings → Functions → KV namespace bindings → Add `LEADS_KV` → `ppa-leads`. Then redeploy.

### SEO page shows "GSC fetch failed"

Common causes:
1. Service account email not added to GSC users (most common)
2. `GSC_PROPERTY` value wrong (check sc-domain: prefix vs URL form)
3. Service account JSON has been corrupted in copy/paste — re-paste from the original file
4. Search Console API not enabled in your Google Cloud project

Check Cloudflare Pages → Functions → real-time logs while you reload `/admin/seo` for the actual error message.

### Traffic page shows "Cloudflare Analytics fetch failed"

Common causes:
1. API token missing required permissions (must include both Account Analytics and Zone Analytics)
2. Wrong account ID or zone ID
3. Token expired (rare unless you set an expiration)

Check Pages function logs.

### Operations page is empty / no Resend data

The Resend API `/emails` list endpoint requires the API key to have read permissions. Most keys created during initial setup have full access. If you scoped the key to "send only," create a new full-access key in Resend.
