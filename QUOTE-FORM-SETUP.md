# Quote form email delivery — setup

The `/quote` form posts to a Cloudflare Pages Function (`functions/quote.ts`) that emails the submission to the inbox.

## Architecture

```
User submits form on ppa.aero/quote
        ↓
Cloudflare Pages Function (functions/quote.ts)
        ↓
Resend API (sends FROM noreply@estimates.ppa.aero)
        ↓
quotes@aerobase.ppa.aero
        ↓
Cloudflare Email Routing forwards to your real inbox
```

- **Sending domain**: `estimates.ppa.aero` (verified in Resend)
- **Receiving address**: `quotes@aerobase.ppa.aero` (Cloudflare Email Routing → your real inbox)
- **Reply-To**: customer's email (so you can reply directly to the requester)

## One-time setup steps

### 1. Add the Resend API key as a Cloudflare Pages env var

The Pages Function reads `env.RESEND_API_KEY`. You need to set it on your Cloudflare Pages project (NOT in code — never commit the API key).

1. Cloudflare Dashboard → Workers & Pages → ppa-website-8vu (or whatever your Pages project is named)
2. Settings → Environment variables → **Add variable**
3. Variable name: `RESEND_API_KEY`
4. Value: paste your Resend API key (from Resend dashboard → API Keys)
5. Type: **Secret** (encrypted, hidden after save)
6. Environment: **Production** (and Preview if you want preview deploys to send)
7. Save

After saving, redeploy. New deploys will have access to `env.RESEND_API_KEY`.

### 2. Verify Cloudflare Email Routing has `quotes@aerobase.ppa.aero` configured

This should already be done based on your earlier screenshot. To confirm:

1. Cloudflare Dashboard → ppa.aero → Email → Email Routing → Routes
2. Confirm `quotes@aerobase.ppa.aero` exists with a destination address that forwards to your real inbox
3. Send a test email to that address — confirm you receive it in your real inbox

### 3. Test the live form

After deploy:

1. Go to https://ppa.aero/quote
2. Fill out the form with test data + an attachment
3. Submit
4. You should see https://ppa.aero/quote/thank-you
5. Check your inbox for the test email

If something fails, you'll be redirected to https://ppa.aero/quote?error=... — the error banner explains the cause.

## Troubleshooting

### "send-failed" error after submit

Check the Cloudflare Pages **Functions logs** in the dashboard:
- Workers & Pages → your project → Functions tab → real-time logs
- Submit a test form
- Look for `Resend API error` log entries

Common causes:
- `RESEND_API_KEY` not set or wrong → check env var
- Resend domain not verified → check `estimates.ppa.aero` shows Verified in Resend dashboard
- Rate limit hit → Resend free tier is 100/day, 3000/month

### Emails not arriving

1. Check Resend → **Logs** tab — confirms whether the email was accepted by Resend's API
2. If accepted, problem is downstream. Check Cloudflare → Email → Email Routing → Activity log
3. If Cloudflare received and forwarded, check the destination inbox spam folder

### Form attachments fail

Total attachment size limit: 25MB (Pages Function code) / 40MB (Resend ceiling). If users hit this, they'll see an error "attachments too large" on the form.

## File structure

- `functions/quote.ts` — handles POST /quote, calls Resend
- `src/app/quote/page.tsx` — form (action="/quote", method="POST")
- `src/app/quote/thank-you/page.tsx` — success landing page (noindexed)
- `src/components/QuoteErrorBanner.tsx` — shows errors via ?error= URL param

## Changing settings

To change the recipient or sender, edit the constants at the top of `functions/quote.ts`:

```ts
const FROM_ADDRESS = "Plane Place Aviation Quotes <noreply@estimates.ppa.aero>";
const TO_ADDRESS = "quotes@aerobase.ppa.aero";
```

Then `npm run build && wrangler pages deploy out`.
