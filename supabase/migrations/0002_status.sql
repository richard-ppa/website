-- 0002_status.sql — Article review workflow status column
--
-- Adds a 3-state status column to drive the editor → review → publish flow:
--   * draft       — Tristan/Travis or anyone else is editing
--   * in_review   — submitted for Richard's approval (triggers email)
--   * published   — live on the site (build script pulls these)
--
-- The existing `published` boolean stays as the build-time filter so
-- scripts/fetch-articles.ts doesn't need to change. status is the workflow
-- source of truth; published mirrors `status = 'published'`.

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_review', 'published'));

-- Backfill: any existing live row should have status='published' so the
-- workflow matches reality after this migration runs.
UPDATE public.articles
  SET status = 'published'
  WHERE published = true AND status = 'draft';

-- Helpful index for the "Needs Review" admin filter.
CREATE INDEX IF NOT EXISTS articles_status_idx
  ON public.articles (status, updated_at DESC);
