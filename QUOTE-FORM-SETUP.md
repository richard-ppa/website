# Quote + Contact form setup

The `/quote` and `/contact` forms post to Cloudflare Pages Functions that:

1. Validate **Cloudflare Turnstile** (anti-spam, anti-bot)
2. Validate honeypot field
3. Validate required fields
4. (Quote only) Validate file attachments by:
   - Extension (PDF, XLS, XLSX only)
   - Magic-byte check (file content matches its claimed type)
   - Per-file size cap (10MB), max 5 files
   - **VirusTotal scan** (synchronous, ~25s budget)
5. (Quote only) Upload clean files to **Cloudflare R2** with UUID keys
6. (Quote only) Generate **HMAC-signed download URLs** (30-day expiry)
7. Send email via Resend with attachment links (NOT raw attachments)

## Architecture

### Quote form
```
User submits /quote form
        ↓
Cloudflare Pages Function (functions/quote.ts)
  ├─ Turnstile token verified via Cloudflare API
  ├─ Honeypot + required-field check
  ├─ For each file:
  │   ├─ Extension allowlist (.pdf, .xls, .xlsx only)
  │   ├─ Magic bytes match the extension
  │   ├─ Size ≤10MB
  │   ├─ Submit to VirusTotal API + poll for verdict
  │   ├─ If clean → upload to R2 (key: attachments/<uuid>)
  │   └─ Generate HMAC-signed download URL (30-day expiry)
  └─ Send email via Resend
        ↓
Email lands at quotes@ppa.aero
  ├─ FROM: noreply@app.ppa.aero (Resend-verified)
  ├─ Reply-To: customer's email
  └─ Body: form data + signed download links
        ↓
Recipient clicks download link
        ↓
GET /files/:id?expires=...&signature=... (functions/files/[id].ts)
  ├─ Verify HMAC signature
  ├─ Check expiry
  └─ Stream file from R2
```

### Contact form
Same but simpler — no file attachments, no R2, no VirusTotal. Turnstile + honeypot + send.

## Required environment variables (Cloudflare Pages → Settings → Environment variables)

| Variable | Type | Source |
|---|---|---|
| `RESEND_API_KEY` | Secret | Resend dashboard → API Keys |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile dashboard → site → Secret Key |
| `VIRUSTOTAL_API_KEY` | Secret | virustotal.com → Account → API Key |
| `FILE_SIGNING_SECRET` | Secret | Random 32+ char string (random.org) |

All set as **Secret** type, scoped to **Production** environment.

## Required R2 binding

Cloudflare Pages → ppa-website-8vu → Settings → **Functions** → R2 bucket bindings:

| Variable name | R2 bucket |
|---|---|
| `QUOTE_FILES` | `ppa-quote-attachments` |

## Hardcoded values (in code, not env vars)

- **Turnstile site key** (public, safe to commit): `0x4AAAAAADJznk9rZYC4F2WZ`
- **Quote form recipient**: `quotes@ppa.aero`
- **Contact form recipient**: `info@ppa.aero`
- **Sender**: `noreply@app.ppa.aero` (Resend-verified domain)

To change recipient/sender, edit constants at top of `functions/quote.ts` and `functions/contact.ts`.

## File constraints (quote form attachments)

| Constraint | Value |
|---|---|
| Allowed extensions | `.pdf`, `.xls`, `.xlsx` |
| Max files per submission | 5 |
| Max per-file size | 10 MB |
| Max total size | 25 MB |
| Magic-byte verification | Yes (rejects file if claimed type doesn't match content) |
| Virus scan | Yes (VirusTotal API, ~25s budget per file) |

## Testing the live form

1. Go to https://ppa.aero/quote
2. Fill out form, attach a small PDF or XLSX
3. Solve Turnstile (usually auto-completes)
4. Submit
5. Page may take 10-30 seconds (virus scan happening server-side)
6. You should land on /quote/thank-you
7. Email arrives at quotes@ppa.aero with download links
8. Click a link in the email → file downloads from R2

## Troubleshooting

### "turnstile-failed" error
- Check `TURNSTILE_SECRET_KEY` is set in Cloudflare Pages env vars
- Confirm the secret matches what's shown in the Turnstile dashboard for the site
- Confirm the public site key in `src/app/quote/page.tsx` and `src/app/contact/page.tsx` matches

### "scan-failed" or stuck submitting
- VirusTotal free tier rate limit (4/min) — multiple concurrent submissions can hit this
- VirusTotal API may be slow for large or new files (>25s polling timeout)
- Check function logs in Cloudflare → Workers & Pages → ppa-website → Functions → real-time logs

### "virus-detected" error
- Working as designed — the file was flagged. Have the customer scan locally + resubmit, or call.

### "storage-failed" error
- R2 binding not configured correctly
- Confirm binding name is exactly `QUOTE_FILES` and bucket is `ppa-quote-attachments`

### Download link returns 410 (Gone)
- Link is older than 30 days. Customers/team should use links promptly. To extend, ask the recipient to forward, no — links can't be regenerated without the original submission.

### Download link returns 403 (Forbidden)
- Signature mismatch. Means either:
  - `FILE_SIGNING_SECRET` was rotated after the email was sent (don't rotate this casually)
  - URL was tampered with

### Download link returns 404
- File was deleted from R2 (manual delete or lifecycle rule)

## R2 lifecycle (recommended cleanup)

Files accumulate. Set an R2 lifecycle rule to auto-delete after a reasonable retention period:

1. Cloudflare → R2 → ppa-quote-attachments → Settings → **Lifecycle rules**
2. Add rule:
   - Name: "Delete old attachments"
   - Prefix: `attachments/`
   - Action: Delete after 90 days
3. Save

This keeps storage costs near zero and reduces blast radius if R2 access ever leaks.

## File structure

- `functions/quote.ts` — quote form Pages Function
- `functions/contact.ts` — contact form Pages Function
- `functions/files/[id].ts` — file download endpoint with HMAC validation
- `src/app/quote/page.tsx` — quote form UI (Turnstile widget, file restrictions)
- `src/app/contact/page.tsx` — contact form UI (Turnstile widget)
- `src/app/quote/thank-you/page.tsx`, `src/app/contact/thank-you/page.tsx` — success pages
- `src/components/FormErrorBanner.tsx` — error UI shared by both forms
