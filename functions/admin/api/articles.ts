// Cloudflare Pages Function — /admin/api/articles
//   GET  → list all articles, ordered by updated_at desc
//   POST → create a new article
//
// Cloudflare Access guards this route at the edge — assume requests are
// authenticated. Service-role Supabase key never reaches the client.

import {
  insertArticle,
  selectArticles,
  SupabaseError,
  type SupabaseEnv,
} from "../../_shared/supabase";
import type { Article, ArticleInsert } from "../../../src/lib/articles-types";

interface Env extends SupabaseEnv {
  CLOUDFLARE_DEPLOY_WEBHOOK_URL?: string;
}

interface PagesContext<E> {
  request: Request;
  env: E;
}
type PagesHandler<E> = (context: PagesContext<E>) => Response | Promise<Response>;

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
      ...(init?.headers || {}),
    },
  });
}

function envConfigured(env: Env): boolean {
  return !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface ValidationDetails {
  [field: string]: string;
}

/** Validate an ArticleInsert body. Returns null if valid, else field errors. */
function validateInsert(body: unknown): { ok: true; value: ArticleInsert } | { ok: false; details: ValidationDetails } {
  const errs: ValidationDetails = {};
  if (!body || typeof body !== "object") {
    return { ok: false, details: { _: "body must be an object" } };
  }
  const b = body as Record<string, unknown>;

  const requireString = (field: string) => {
    const v = b[field];
    if (typeof v !== "string" || v.trim() === "") {
      errs[field] = `${field} is required`;
    }
  };
  requireString("slug");
  requireString("title");
  requireString("excerpt");
  requireString("category");
  requireString("date");
  requireString("author");
  requireString("reading_time");
  requireString("hero_src");
  requireString("hero_alt");

  if (typeof b.slug === "string" && b.slug && !SLUG_RE.test(b.slug)) {
    errs.slug = "slug must match /^[a-z0-9]+(?:-[a-z0-9]+)*$/";
  }
  if (typeof b.date === "string" && b.date && !DATE_RE.test(b.date)) {
    errs.date = "date must be YYYY-MM-DD";
  }
  if (b.sections === undefined || !Array.isArray(b.sections)) {
    errs.sections = "sections must be an array";
  }
  // tags optional, but if present must be a string array
  if (b.tags !== undefined && !Array.isArray(b.tags)) {
    errs.tags = "tags must be an array of strings";
  } else if (Array.isArray(b.tags) && !b.tags.every((t) => typeof t === "string")) {
    errs.tags = "tags must be an array of strings";
  }

  if (Object.keys(errs).length > 0) {
    return { ok: false, details: errs };
  }

  // Normalize: tags default to [], date_display falls back to "" (DB / transform handles fallback)
  const value: ArticleInsert = {
    slug: (b.slug as string).trim(),
    title: (b.title as string).trim(),
    excerpt: (b.excerpt as string).trim(),
    category: (b.category as string).trim(),
    date: (b.date as string).trim(),
    date_display: typeof b.date_display === "string" ? b.date_display : "",
    author: (b.author as string).trim(),
    reading_time: (b.reading_time as string).trim(),
    hero_src: (b.hero_src as string).trim(),
    hero_alt: (b.hero_alt as string).trim(),
    tags: (b.tags as string[] | undefined) ?? [],
    sections: b.sections as ArticleInsert["sections"],
    cta_headline:
      typeof b.cta_headline === "string" && b.cta_headline.trim() !== ""
        ? b.cta_headline.trim()
        : null,
    cta_body:
      typeof b.cta_body === "string" && b.cta_body.trim() !== ""
        ? b.cta_body.trim()
        : null,
  };
  return { ok: true, value };
}

export const onRequestGet: PagesHandler<Env> = async ({ env }) => {
  if (!envConfigured(env)) {
    return jsonResponse({ error: "supabase-not-configured" }, { status: 503 });
  }
  try {
    const articles = await selectArticles(env);
    return jsonResponse({ articles });
  } catch (e) {
    console.error("selectArticles failed", e);
    if (e instanceof SupabaseError) {
      return jsonResponse({ error: "upstream", detail: e.body.slice(0, 500) }, { status: 500 });
    }
    return jsonResponse({ error: "read-failed" }, { status: 500 });
  }
};

export const onRequestPost: PagesHandler<Env> = async ({ request, env }) => {
  if (!envConfigured(env)) {
    return jsonResponse({ error: "supabase-not-configured" }, { status: 503 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "validation", details: { _: "invalid JSON body" } }, { status: 400 });
  }

  const result = validateInsert(body);
  if (!result.ok) {
    return jsonResponse({ error: "validation", details: result.details }, { status: 400 });
  }

  try {
    const created: Article = await insertArticle(env, result.value);
    return jsonResponse(created, { status: 201 });
  } catch (e) {
    console.error("insertArticle failed", e);
    if (e instanceof SupabaseError) {
      // 23505 unique violation → likely slug conflict
      if (e.status === 409 || /duplicate|unique/i.test(e.body)) {
        return jsonResponse({ error: "conflict", detail: "slug already exists" }, { status: 409 });
      }
      return jsonResponse({ error: "upstream", detail: e.body.slice(0, 500) }, { status: 500 });
    }
    return jsonResponse({ error: "insert-failed" }, { status: 500 });
  }
};
