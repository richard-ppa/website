// Shared types for the article CMS.
//
// Imported by:
//   - functions/_shared/articles.ts (Pages Functions CRUD helpers)
//   - functions/admin/api/articles*.ts (admin REST endpoints)
//   - src/app/admin/articles/**/*.tsx (admin UI)
//   - scripts/fetch-articles.ts (build-time fetcher)
//   - scripts/seed-articles.ts (one-time seeder)
//
// The renderer in src/app/blog/[slug]/page.tsx consumes BlogPost (NOT Article).
// Anything that flows into the renderer must be transformed via
// articleToBlogPost() first.

import type { BlogPost, BlogSection } from "./blog-posts";

export type { BlogPost, BlogSection };

/**
 * Full row as stored in Supabase. snake_case mirrors the DB columns.
 */
export interface Article {
  id: string; // uuid
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // YYYY-MM-DD
  date_display: string; // "April 21, 2026"
  author: string;
  reading_time: string; // "4 min read"
  hero_src: string;
  hero_alt: string;
  tags: string[];
  sections: BlogSection[]; // jsonb -> typed via BlogSection
  cta_headline: string | null;
  cta_body: string | null;
  published: boolean;
  published_at: string | null; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Body for POST /admin/api/articles. id/created_at/updated_at are
 * generated server-side; published defaults to false.
 */
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
 * Format a YYYY-MM-DD string as "Month D, YYYY" — used as a fallback when
 * date_display is missing on a row.
 */
function formatDateDisplay(date: string): string {
  // Parse as a date in UTC so we don't get off-by-one timezone issues for
  // YYYY-MM-DD strings.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;
  const [, y, m, d] = match;
  const dt = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Transform a Supabase row into the BlogPost shape the existing renderer
 * (src/app/blog/[slug]/page.tsx) understands. The renderer must NOT be
 * modified — it consumes BlogPost.
 *
 *   - hero_src/hero_alt collapse into hero: { src, alt }
 *   - date_display -> dateDisplay (fallback derived from date)
 *   - reading_time -> readingTime
 *   - cta_headline/cta_body collapse into optional cta (omitted entirely
 *     if both are null/empty)
 *   - sections / tags pass through 1:1 (trusted input from the editor)
 */
export function articleToBlogPost(row: Article): BlogPost {
  const post: BlogPost = {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    date: row.date,
    dateDisplay: row.date_display || formatDateDisplay(row.date),
    author: row.author,
    readingTime: row.reading_time,
    hero: { src: row.hero_src, alt: row.hero_alt },
    sections: row.sections,
    tags: row.tags ?? [],
  };

  const headline = row.cta_headline ?? undefined;
  const body = row.cta_body ?? undefined;
  if (headline || body) {
    post.cta = {};
    if (headline) post.cta.headline = headline;
    if (body) post.cta.body = body;
  }

  return post;
}
