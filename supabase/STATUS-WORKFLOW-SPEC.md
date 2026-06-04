# Review Workflow Spec

Contract for the three parallel agents implementing the
draft → review → publish flow on top of the existing article CMS.

## State machine

```
   draft  ──submit─▶  in_review  ──approve─▶  published
     ▲                    │                       │
     │                    │ ──reject/edit──▶      │
     │                    └─ (Richard sends it back to draft)
     │                                            │
     └─────────────── unpublish ──────────────────┘
```

- `draft` — default for new rows. Editor (Tristan/Travis) is working on it.
- `in_review` — Tristan clicked **Submit for Review**. An email goes to
  `richard@avidmktg.com`. Richard sees a "Needs Review" filter in the admin.
- `published` — Richard approved + clicked **Publish**. `published` boolean
  flips to true, `published_at` is set, the next `npm run build` includes it
  in the static blog. (No deploy webhook in this round — Richard runs
  `npm run build && npx wrangler pages deploy out` manually after publish.)

## Schema additions (already applied)

`supabase/migrations/0002_status.sql` adds:
- `status` TEXT NOT NULL DEFAULT 'draft' with CHECK constraint
- Index `articles_status_idx` on `(status, updated_at DESC)`

## TypeScript types (already applied)

`src/lib/articles-types.ts` exports `ArticleStatus` and the updated `Article`
interface with `status: ArticleStatus`.

---

## Agent A — API endpoints

### Files

- **Modify** `functions/admin/api/articles.ts`
  - `onRequestGet` — accept `?status=draft|in_review|published` query param to
    filter the list. Default = return all.
- **Modify** `functions/admin/api/articles/[id]/publish.ts`
  - Already sets `published=true`. Also set `status='published'` and
    `published_at=now()` (if not already set).
  - Continue to skip deploy webhook for now — Richard deploys manually.
- **Modify** `functions/admin/api/articles/[id]/unpublish.ts`
  - Set `published=false` and `status='draft'`. Don't fire any webhook.
- **CREATE** `functions/admin/api/articles/[id]/submit-for-review.ts`
  - Method: POST
  - Sets `status='in_review'`. Does NOT change `published` or `published_at`.
  - After successful Supabase update, call
    `sendReviewEmail(env, article)` from `functions/_shared/email.ts`
    (Agent C is writing that module — its signature is below).
  - Email failure should NOT roll back the status change. Log it and
    return JSON `{ article, email_sent: boolean, email_error?: string }`.

### Email contract (signature you must call)

```ts
// functions/_shared/email.ts — written by Agent C
export interface SendReviewEmailArgs {
  article: Article;            // the freshly-updated article row
  reviewerEmail: string;       // hardcode "richard@avidmktg.com" for now
  adminBaseUrl: string;        // derive from request URL origin
}
export async function sendReviewEmail(
  env: { RESEND_API_KEY?: string },
  args: SendReviewEmailArgs,
): Promise<{ ok: true } | { ok: false; error: string }>;
```

### Env additions

- `RESEND_API_KEY` — already exists in the project (used by quote/contact forms).
  Re-use it. The submit-for-review endpoint needs to receive it via its `env`.

### Behavior summary

| Endpoint | Status before | Status after | published | published_at | webhook |
|---|---|---|---|---|---|
| POST /submit-for-review | draft | in_review | unchanged | unchanged | — |
| POST /publish | in_review (or draft) | published | true | NOW() if null | — |
| POST /unpublish | published | draft | false | unchanged | — |

---

## Agent B — Admin UI

### Files

- **Modify** `src/app/admin/articles/page.tsx` (list view)
  - At the top, render a **"Needs Review"** section that fetches
    `/admin/api/articles?status=in_review` separately and shows those rows
    highlighted (subtle background tint + cyan badge). If none, show
    nothing — don't render an empty heading.
  - Add a status filter UI above the main table: "All / Drafts / In Review /
    Published" tabs. The selected tab calls
    `/admin/api/articles?status=<value>` (or `/admin/api/articles` for All).
  - Add a **status badge** column to each row showing one of:
    - `DRAFT` — grey
    - `NEEDS REVIEW` — cyan (`#1E9FD8`)
    - `PUBLISHED` — green (`#22A06B`)
- **Modify** `src/app/admin/articles/[id]/Editor.tsx`
  - Read `article.status` and show a **status badge** in the page header
    next to the title.
  - **Button bar logic** (in the footer of the editor):
    - If `status === 'draft'`: show **Save**, **Save & Preview**,
      **Submit for Review** (primary action, cyan), **Delete**.
    - If `status === 'in_review'`: show **Save**, **Save & Preview**,
      **Publish** (primary action, brand navy), **Send back to draft**
      (secondary; calls a separate "back to draft" action — implement it
      as a PATCH with `status='draft'`). Hide Submit for Review.
    - If `status === 'published'`: show **Save**, **Save & Preview**,
      **Unpublish**. Hide both Submit for Review and Publish.
  - Wire **Submit for Review** to call POST
    `/admin/api/articles/:id/submit-for-review`. On success, show a
    toast: `Submitted for review. Richard will get an email.` and update
    the local state to reflect `status='in_review'`.

### Visual specs

- Status badge inline style: small uppercase chip, `letter-spacing: 0.18em`,
  font-size 10px, padding 4px 8px, border-radius 3px.
  - DRAFT: bg `#E5E7EB`, text `#374151`
  - NEEDS REVIEW: bg `#E0F2FE`, text `#0C7CB0`
  - PUBLISHED: bg `#DCFCE7`, text `#15803D`

### Out of scope

- Don't change the section editor itself.
- Don't change the preview Pages Function.
- Don't add real-time updates (websockets) — refresh on action is fine.

---

## Agent C — Email module + Challenger draft seeding

### Files

- **CREATE** `functions/_shared/email.ts`
  - Implements `sendReviewEmail(env, args)` per the signature above.
  - Uses Resend's REST API (`POST https://api.resend.com/emails`) directly —
    no SDK. Read `functions/contact.ts` and `functions/quote.ts` for the
    existing Resend send pattern in this codebase; copy that style.
  - From address: re-use whatever the existing form endpoints use (read
    `functions/_shared/leads.ts` or the form endpoints to find it).
  - To: `args.reviewerEmail`.
  - Subject: `[PPA] Article ready for review — ${article.title}`
  - Body (HTML): brief preview with article title, slug, category, the
    excerpt, and a deep link to `${args.adminBaseUrl}/admin/articles/${article.id}`.
  - Returns `{ ok: true }` on Resend 2xx, `{ ok: false, error: string }` on
    any failure (don't throw — the calling endpoint must not crash if email
    is misconfigured).
- **CREATE** `scripts/seed-challenger-draft.ts`
  - Reads the Word doc draft (or just hardcodes the content — your call) and
    upserts ONE article into Supabase with:
    - slug: `challenger-300-350-maintenance-guide`
    - status: `draft`
    - All section content from the Word doc at
      `C:\Users\Richard Broadhead\PPA-Marketing\data\content\drafts\challenger-300-350-maintenance-guide.docx`
    - Keep the `[NEEDS PPA INPUT — ...]` markers as literal text in the
      content so Tristan can find and replace them in the editor.
  - Uses `tsx --env-file-if-exists=.env.local` like the existing seed script.
  - Add npm script: `"seed:challenger": "tsx --env-file-if-exists=.env.local scripts/seed-challenger-draft.ts"`
  - **Recommended approach for parsing the docx**: install `mammoth` as a
    devDependency (`npm i -D mammoth`) and use it to extract structured
    content. Or — easier — just hardcode the article structure in the script
    as a `const ARTICLE: ArticleInsert = { ... }`. Hardcoding is fine since
    this is a one-shot seed.
- **CREATE** `scripts/seed-challenger-draft.README.md` (~30 lines) — a quick
  README describing how to run the seed and how to re-run if needed.

### Out of scope

- Don't touch the existing `scripts/seed-articles.ts` (the 7-original-posts seeder).
- Don't touch any API endpoints.
- Don't touch UI files.

---

## Validation gates (each agent)

1. `npx tsc --noEmit` — clean
2. `npm run build` — succeeds with the existing committed env vars
3. Report any files written/modified + any deviations from this spec

## Coordination notes

- Agent A imports from `functions/_shared/email.ts` (created by Agent C).
  If Agent C hasn't finished when Agent A is implementing, Agent A should
  still write the import; the module will exist when the user runs the code.
- Agent B does not depend on Agent A's API code (it just calls endpoints);
  the API contract above is the source of truth.
- Agent C's seed script does not depend on A or B — it just inserts a row.

## Out of all scope (defer)

- Two-factor or per-user auth — Cloudflare Access handles auth at the edge.
- Audit log / who-edited-what — possible later, not now.
- Auto-deploy on publish — explicitly skipped; manual `wrangler` for now.
