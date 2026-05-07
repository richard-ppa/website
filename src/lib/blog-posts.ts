// Public API for blog posts. The post DATA lives in blog-posts.generated.ts,
// which is rewritten on every build by scripts/fetch-articles.ts pulling
// from Supabase. This file holds the types and the helper functions the
// renderer (src/app/blog/[slug]/page.tsx) and other consumers import.

import { BLOG_POSTS } from "./blog-posts.generated";

export type BlogSection =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "figure"; src: string; alt: string; caption: string }
  | { kind: "takeaways"; items: { label: string; text: string }[] }
  | { kind: "callout"; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  dateDisplay: string;
  author: string;
  readingTime: string;
  hero: { src: string; alt: string };
  sections: BlogSection[];
  tags: string[];
  /** Optional per-post override for the bottom CTA. Falls back to a generic message. */
  cta?: { headline?: string; body?: string };
}

export { BLOG_POSTS };

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));
}
