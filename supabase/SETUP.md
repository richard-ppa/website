# Supabase setup — PPA blog CMS

One-time setup for the article store that backs `/admin/articles`.

## 1. Create the Supabase project

1. Sign in at <https://supabase.com> and create a new project on the free tier.
   - Region: `us-east-1` (closest to Cloudflare's primary US edge).
   - Save the database password somewhere safe (you won't need it day-to-day).
2. Once the project is provisioned, grab two values from **Project Settings → API**:
   - **Project URL** → this is `SUPABASE_URL`.
   - **service_role secret** → this is `SUPABASE_SERVICE_ROLE_KEY`. Treat it
     like a root password. Server-side only. Never paste it into client code.
   - You can ignore `anon` / `publishable` keys; we don't use them.

## 2. Run the migration

Option A — Dashboard (fastest):
1. Open **SQL Editor** in the Supabase dashboard.
2. Paste the contents of `supabase/migrations/0001_articles.sql`.
3. Click **Run**. Expect "Success. No rows returned."

Option B — Supabase CLI:
```sh
supabase link --project-ref <your-ref>
supabase db push   # applies anything in supabase/migrations/
```

## 3. Cloudflare Pages env vars

In the Cloudflare dashboard: **Workers & Pages → ppa-website → Settings →
Environment variables**. Add to **Production** (and **Preview** if you want
the admin to work in previews):

| Name                            | Value                                  | Notes                          |
| ------------------------------- | -------------------------------------- | ------------------------------ |
| `SUPABASE_URL`                  | `https://<ref>.supabase.co`            | Server-side only.              |
| `SUPABASE_SERVICE_ROLE_KEY`     | the service_role secret                | Server-side only. NEVER expose. |
| `CLOUDFLARE_DEPLOY_WEBHOOK_URL` | the deploy hook URL from step 4        | Server-side only.              |

After adding, **redeploy** so Pages Functions pick the new vars up.

## 4. Cloudflare Pages deploy webhook

1. **Workers & Pages → ppa-website → Settings → Builds & deployments**.
2. Under **Deploy hooks**, click **Add deploy hook**.
3. Name: `articles-publish`. Branch: `master`. Save.
4. Copy the generated URL into `CLOUDFLARE_DEPLOY_WEBHOOK_URL` (step 3).

The publish endpoint (`POST /admin/api/articles/:id/publish`) `POST`s to this
URL with an empty body to trigger a fresh static build.

## 5. Verify the schema is live

From the SQL Editor:
```sql
select count(*) from public.articles;          -- expect: 0 (pre-seed) or 8 (post-seed)
select indexname from pg_indexes where tablename = 'articles';
-- expect: articles_pkey, articles_slug_key, articles_slug_idx, articles_published_date_idx
```

Or via curl (replace placeholders):
```sh
curl -s "$SUPABASE_URL/rest/v1/articles?select=id,slug,published&limit=5" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

## 6. Seed existing posts

After the schema is live, the build-time agent will run
`scripts/seed-articles.ts` once. See `seed-data-source.md` for the checklist
of slugs that should appear in `articles` after seeding.
