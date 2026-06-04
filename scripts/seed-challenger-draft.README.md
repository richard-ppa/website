# seed-challenger-draft

One-shot seeder that inserts the **Challenger 300 & 350 Maintenance Guide**
draft article into Supabase. Used once to bootstrap the article so Tristan
and Travis can fill in the `[NEEDS PPA INPUT — …]` markers in the admin
editor at `/admin/articles`.

## What it does

- Upserts a single row into the `articles` table.
- `slug`: `challenger-300-350-maintenance-guide`
- `status`: `draft` (will not appear in the public blog until reviewed + published)
- `category`: `Maintenance Guides`
- `hero_src`: `/images/Challenger-350.jpg`
- Sections include preserved `[NEEDS PPA INPUT — …]` markers so the editor
  can search for them and replace each one.

## Required env vars

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role secret>
```

Both can live in `.env.local` at the repo root — the npm script loads it
automatically via `tsx --env-file-if-exists=.env.local`.

## Run

```sh
npm run seed:challenger
```

## Idempotency

Safe to re-run. The upsert is keyed on `slug` (`on_conflict=slug,
resolution=merge-duplicates`), so a second run overwrites the same row
rather than creating duplicates. Re-running **will** clobber edits Tristan
has made in the admin editor — only re-run if you intend to reset the
article to its seeded state.

## Related

- Original draft (Word doc): `data/content/drafts/challenger-300-350-maintenance-guide.docx`
- Generator (Python): `scripts/generate_challenger_draft.py` (in the parent
  marketing repo, not this site)
