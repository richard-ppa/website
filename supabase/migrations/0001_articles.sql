-- 0001_articles.sql — PPA blog CMS schema
--
-- Source of truth for all blog/article content. The Next.js site stays
-- statically rendered: a pre-build script reads published rows here and
-- writes a generated TS module the static build consumes.
--
-- Access model:
--   * Cloudflare Access protects /admin/* and /admin/api/* at the edge.
--   * Pages Functions speak to Supabase using the SERVICE ROLE key only.
--   * No browser-direct access. No anon access. SUPABASE_ANON_KEY is unused.
--   * The service role bypasses RLS by design — RLS below is defense-in-depth
--     for any hypothetical future non-service-role caller. If the service
--     role key ever leaks, RLS does NOT save you; rotate the key immediately.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- articles
-- ---------------------------------------------------------------------------
create table if not exists public.articles (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  excerpt         text not null,
  category        text not null,
  date            date not null,                 -- publication date (date, not timestamp)
  date_display    text not null,                 -- e.g. "April 21, 2026"
  author          text not null,
  reading_time    text not null,                 -- e.g. "4 min read"
  hero_src        text not null,
  hero_alt        text not null,
  tags            text[] not null default '{}',
  sections        jsonb not null,                -- BlogSection[] discriminated union
  cta_headline    text,
  cta_body        text,
  published       boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- sections must be a JSON array (we don't validate each element's shape in
  -- SQL — that's the editor's job; trust but don't crash on bad input).
  constraint articles_sections_is_array check (jsonb_typeof(sections) = 'array')
);

-- Slug lookup (the unique constraint already creates a btree index, but we
-- name it explicitly for clarity in query plans).
create index if not exists articles_slug_idx on public.articles (slug);

-- Build-time query: SELECT ... WHERE published = true ORDER BY date DESC.
create index if not exists articles_published_date_idx
  on public.articles (published, date desc);

-- updated_at auto-bump trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- article_revisions — lightweight versioning for "I overwrote my draft"
-- recovery. Snapshot of editable fields only; we do not snapshot the
-- published flags (publication state is tracked on the live row).
-- ---------------------------------------------------------------------------
create table if not exists public.article_revisions (
  id               uuid primary key default gen_random_uuid(),
  article_id       uuid not null references public.articles(id) on delete cascade,
  revision_number  integer not null,
  slug             text not null,
  title            text not null,
  excerpt          text not null,
  category         text not null,
  date             date not null,
  date_display     text not null,
  author           text not null,
  reading_time     text not null,
  hero_src         text not null,
  hero_alt         text not null,
  tags             text[] not null default '{}',
  sections         jsonb not null,
  cta_headline     text,
  cta_body         text,
  created_at       timestamptz not null default now(),
  unique (article_id, revision_number)
);

create index if not exists article_revisions_article_id_idx
  on public.article_revisions (article_id, revision_number desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.articles enable row level security;
alter table public.article_revisions enable row level security;

-- No policies for anon / authenticated roles => zero access for them.
-- The service_role bypasses RLS automatically; Pages Functions use it.
-- (We deliberately do NOT create a permissive policy here. A locked-down
--  table with no policies + service-role-only callers is the simplest
--  correct configuration.)

revoke all on public.articles            from anon, authenticated;
revoke all on public.article_revisions   from anon, authenticated;
