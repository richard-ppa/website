# Integration spec — PPA blog CMS

Contract between the schema (this directory) and the two agents that build
on top of it: the **build-time agent** (pre-build fetch + seed scripts) and
the **admin UI agent** (Pages Functions + admin pages).

## 1. Shared TypeScript types

All shared types live in **`src/lib/articles-types.ts`** (new file — created
by the build-time agent). Both the Pages Functions and the admin UI must
import from this module. Reuse `BlogSection` and `BlogPost` from the
existing `src/lib/blog-posts.ts`; do not redefine them.

```ts
// src/lib/articles-types.ts
import type { BlogPost, BlogSection } from "@/lib/blog-posts";
export type { BlogSection, BlogPost };

/** Full row as stored in Supabase. snake_case mirrors the DB. */
export interface Article {
  id: string;                       // uuid
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;                     // YYYY-MM-DD
  date_display: string;             // "April 21, 2026"
  author: string;
  reading_time: string;             // "4 min read"
  hero_src: string;
  hero_alt: string;
  tags: string[];
  sections: BlogSection[];          // jsonb -> typed via BlogSection
  cta_headline: string | null;
  cta_body: string | null;
  published: boolean;
  published_at: string | null;      // ISO timestamp
  created_at: string;               // ISO timestamp
  updated_at: string;               // ISO timestamp
}

/** Body for POST /admin/api/articles. id/created_at/updated_at are
 *  generated server-side; published defaults to false. */
export type ArticleInsert = Omit<
  Article,
  "id" | "created_at" | "updated_at" | "published" | "published_at"
> & {
  published?: boolean;
  published_at?: string | null;
};

/** Body for PATCH /admin/api/articles/:id. Every field optional. */
export type ArticleUpdate = Partial<ArticleInsert>;

/**
 * Transform a Supabase row into the `BlogPost` shape the existing render
 * code (`src/app/blog/[slug]/page.tsx`, `BlogSection` switch, etc.) already
 * understands. The renderer must NOT be modified — it consumes BlogPost.
 *
 *   - hero_src/hero_alt collapse into `hero: { src, alt }`
 *   - date_display -> dateDisplay, reading_time -> readingTime (camelCase)
 *   - cta_headline/cta_body collapse into optional `cta: { headline, body }`
 *     (omitted entirely if both are null)
 *   - everything else passes through 1:1
 */
export declare function articleToBlogPost(row: Article): BlogPost;
```

**Constraint for both downstream agents:** every Article-shaped payload that
flows into existing render code (`generateStaticParams`, `Section` switch,
JSON-LD, `/blog/[slug]/page.tsx`) MUST be transformed via
`articleToBlogPost` first. The renderer expects `BlogPost`, not `Article`.

## 2. API contract — `/admin/api/articles/*`

All endpoints follow the existing pattern in `functions/admin/api/leads.ts`:
typed `Env`, `PagesHandler`, `jsonResponse` helper, `Cache-Control:
private, no-store`. Cloudflare Access guards the route at the edge — assume
the request is authenticated. All endpoints return JSON unless noted.

### Env interface

```ts
interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  CLOUDFLARE_DEPLOY_WEBHOOK_URL: string;
}
```

If any of the three is missing, return `503 { error: "supabase-not-configured" }`
(mirrors how `leads.ts` handles a missing KV binding).

### Endpoints

| Method | Path                                  | Body              | Success                     | Errors                                         |
| ------ | ------------------------------------- | ----------------- | --------------------------- | ---------------------------------------------- |
| GET    | `/admin/api/articles`                 | —                 | `200 { articles: Article[] }` ordered by `updated_at desc` | `503` env missing, `500` upstream         |
| GET    | `/admin/api/articles/:id`             | —                 | `200 Article`               | `404` not found, `503`, `500`                  |
| POST   | `/admin/api/articles`                 | `ArticleInsert`   | `201 Article`               | `400` validation, `409` slug conflict, `503`, `500` |
| PATCH  | `/admin/api/articles/:id`             | `ArticleUpdate`   | `200 Article` (updated row) | `400`, `404`, `409` slug conflict, `503`, `500` |
| DELETE | `/admin/api/articles/:id`             | —                 | `204` no body               | `404`, `503`, `500`                            |
| POST   | `/admin/api/articles/:id/publish`     | —                 | `200 { article: Article, deploy: { triggered: boolean } }` — sets `published=true`, sets `published_at=now()` if null, then POSTs the deploy webhook. If the webhook POST fails, still return 200 with `deploy.triggered=false` and log; do NOT roll back the publish. | `404`, `503`, `500` |
| POST   | `/admin/api/articles/:id/unpublish`   | —                 | `200 Article` — sets `published=false`. Does NOT trigger redeploy; the post falls out of the next build. | `404`, `503`, `500` |
| GET    | `/admin/preview/:id`                  | —                 | `200 text/html` — server-renders the draft using the same components as `/blog/[slug]`. Headers: `X-Robots-Tag: noindex, nofollow`, `Cache-Control: no-store, private`. | `404` if id missing |

**Validation on POST/PATCH:**
- `slug` matches `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- `date` parseable as YYYY-MM-DD.
- `sections` is an array (DB also enforces this).
- `tags` is an array of strings (default `[]`).
- On 400, return `{ error: "validation", details: { field: message } }`.

### File layout for the Pages Functions

```
functions/
  _shared/
    supabase.ts              # tiny REST client around fetch (no SDK; smaller bundle)
    articles.ts              # CRUD helpers + articleToBlogPost
  admin/
    api/
      articles.ts            # GET list, POST create
      articles/
        [id].ts              # GET, PATCH, DELETE one
        [id]/
          publish.ts         # POST publish (+ deploy webhook fire)
          unpublish.ts       # POST unpublish
  admin/
    preview/
      [id].ts                # GET — returns rendered HTML
```

## 3. Build-time integration contract

The build-time agent owns:

1. **`scripts/fetch-articles.ts`** — runs before `next build`.
   - Reads `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` from `process.env`.
   - Queries: `select * from articles where published = true order by date desc`.
   - Writes **`src/lib/blog-posts.generated.ts`** containing
     `export const BLOG_POSTS: BlogPost[] = [ ... ]` — the rows transformed
     via `articleToBlogPost`.
   - Existing **`src/lib/blog-posts.ts`** is rewritten to re-export from
     the generated file:
     ```ts
     export type { BlogPost, BlogSection } from "./articles-types";
     export { BLOG_POSTS } from "./blog-posts.generated";
     export function getPostBySlug(slug: string) { /* unchanged */ }
     export function getAllPosts() { /* unchanged */ }
     ```
     Existing imports (`@/lib/blog-posts`) keep working.
   - If `SUPABASE_URL` is unset (e.g. local dev without Supabase), the script
     should **noop** and leave whatever generated file already exists, so
     a developer can build without a Supabase connection.

2. **`package.json`** scripts:
   ```json
   "build": "tsx scripts/fetch-articles.ts && next build"
   ```
   (`tsx` or whatever runner is already in use — match the repo conventions.
   Check existing scripts before installing anything.)

3. **`scripts/seed-articles.ts`** — one-shot migration of the 8 existing
   hardcoded posts. Imports the current `BLOG_POSTS` array from a snapshot
   (do NOT import from `@/lib/blog-posts` after the rewrite, since that path
   will then be loading from Supabase). Inserts each row with
   `published=true`, `published_at = date::timestamptz` so freshness/order
   stay correct. Idempotent: upsert on `slug` so re-runs don't duplicate.
   See `seed-data-source.md` for the checklist of slugs.

## 4. Admin UI contract

The admin UI agent owns:

1. **Nav update** — add an "Articles" link to the existing nav in
   `src/app/admin/layout.tsx`, slotted between existing items consistently.

2. **`src/app/admin/articles/page.tsx`** — list view:
   - Fetches `GET /admin/api/articles`.
   - Table columns: Title, Slug, Status (Draft / Published), Last edited
     (`updated_at`), Actions (Edit, Preview, Delete).
   - "New article" button → POSTs an empty draft and redirects to the editor.
   - Use `PageHeader`, `PageContainer`, `Stat`, `StatGrid` from
     `@/components/admin/*` and the same `"use client"` + fetch-state
     patterns as `src/app/admin/leads/page.tsx`.

3. **`src/app/admin/articles/[id]/page.tsx`** — editor:
   - One field per `BlogPost` field. `tags` as a comma-separated input.
   - `sections` as a structured editor: a list of section cards (paragraph,
     heading, figure, takeaways, callout) with add/remove/reorder controls.
     Each card shows the fields for that discriminator.
   - Auto-saves via debounced `PATCH /admin/api/articles/:id` (or explicit
     Save button — agent's call, but keep the round-trip fast).
   - **Preview button** → opens `/admin/preview/:id` in a new tab.
   - **Publish button** → confirmation dialog → `POST /admin/api/articles/:id/publish`.
     Toast on success including whether the deploy was triggered.
   - **Unpublish button** (visible only when `published=true`) →
     `POST /admin/api/articles/:id/unpublish`.

4. **Styling** — match the existing admin look. No new design system; reuse
   `admin.css` / Tailwind classes already in `leads/page.tsx`.

## 5. Hard constraints

1. **Always transform `Article → BlogPost` via `articleToBlogPost`** before
   passing to existing render code. The static blog renderer is untouched.
2. **Service role key is server-side only.** Never inject into client
   bundles. The admin UI talks to `/admin/api/*`, never to Supabase directly.
3. **Publish triggers deploy; unpublish does not.** Unpublished posts simply
   fall out of the next build. This is intentional — it avoids a
   double-deploy on retract-then-edit-then-republish flows.
4. **Schema is the contract.** If you need a column that isn't in
   `0001_articles.sql`, add a new migration (`0002_*.sql`) — do not edit
   `0001` after it has been applied to a real project.
