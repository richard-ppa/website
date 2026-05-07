/**
 * seed-articles.ts — one-time migration that inserts the existing hardcoded
 * BLOG_POSTS into Supabase. Idempotent: re-running upserts on `slug`.
 *
 * Reads from src/lib/blog-posts.generated.ts (the stub committed alongside
 * this script). We do NOT import from @/lib/blog-posts directly — after the
 * fetch script runs once, that module's data comes from Supabase, which
 * would make a re-seed circular and useless. The .generated stub is the
 * frozen pre-CMS snapshot.
 *
 * Run:
 *   SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  npx tsx scripts/seed-articles.ts
 */

import { BLOG_POSTS } from "../src/lib/blog-posts.generated";
import type { BlogPost } from "../src/lib/blog-posts";

interface ArticleRow {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  date_display: string;
  author: string;
  reading_time: string;
  hero_src: string;
  hero_alt: string;
  tags: string[];
  sections: BlogPost["sections"];
  cta_headline: string | null;
  cta_body: string | null;
  published: boolean;
  published_at: string;
}

function blogPostToArticleRow(post: BlogPost): ArticleRow {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    date: post.date,
    date_display: post.dateDisplay,
    author: post.author,
    reading_time: post.readingTime,
    hero_src: post.hero.src,
    hero_alt: post.hero.alt,
    tags: post.tags,
    sections: post.sections,
    cta_headline: post.cta?.headline ?? null,
    cta_body: post.cta?.body ?? null,
    published: true,
    // Use the post's date at midnight UTC so ordering matches the pre-CMS
    // site exactly (getAllPosts() sorts by `date` string descending).
    published_at: `${post.date}T00:00:00.000Z`,
  };
}

async function upsertArticle(
  supabaseUrl: string,
  serviceRoleKey: string,
  row: ArticleRow,
): Promise<void> {
  // Postgrest upsert: POST with Prefer: resolution=merge-duplicates against
  // the unique key (slug). We add on_conflict=slug for clarity, matching
  // PostgREST's documented upsert flow.
  const url = new URL("/rest/v1/articles", supabaseUrl);
  url.searchParams.set("on_conflict", "slug");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Upsert failed for slug=${row.slug}: ${res.status} ${res.statusText} — ${body.slice(0, 500)}`,
    );
  }
}

async function main(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "[seed-articles] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
    console.error(
      "[seed-articles] Set both env vars before running this script.",
    );
    process.exit(1);
  }

  console.log(`[seed-articles] Seeding ${BLOG_POSTS.length} posts to ${supabaseUrl}...`);

  let success = 0;
  for (const post of BLOG_POSTS) {
    const row = blogPostToArticleRow(post);
    await upsertArticle(supabaseUrl, serviceRoleKey, row);
    success += 1;
    console.log(`  [${success}/${BLOG_POSTS.length}] upserted ${post.slug}`);
  }

  console.log(`[seed-articles] Done. ${success} rows upserted.`);
}

main().catch((err) => {
  console.error("[seed-articles] Failed:", err);
  process.exit(1);
});
