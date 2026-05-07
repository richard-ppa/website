// Cloudflare Pages Function — /admin/api/articles/:id
//   GET    → fetch one
//   PATCH  → partial update
//   DELETE → remove

import {
  deleteArticle,
  selectArticleById,
  SupabaseError,
  updateArticle,
  type SupabaseEnv,
} from "../../../_shared/supabase";
import type { ArticleUpdate } from "../../../../src/lib/articles-types";

interface Env extends SupabaseEnv {}

interface PagesContext<E> {
  request: Request;
  env: E;
  params: Record<string, string>;
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
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED_PATCH_FIELDS: Array<keyof ArticleUpdate> = [
  "slug",
  "title",
  "excerpt",
  "category",
  "date",
  "date_display",
  "author",
  "reading_time",
  "hero_src",
  "hero_alt",
  "tags",
  "sections",
  "cta_headline",
  "cta_body",
];
const FORBIDDEN_PATCH_FIELDS = new Set(["id", "created_at", "updated_at"]);

function validatePatch(
  body: unknown
): { ok: true; value: ArticleUpdate } | { ok: false; details: Record<string, string> } {
  if (!body || typeof body !== "object") {
    return { ok: false, details: { _: "body must be an object" } };
  }
  const b = body as Record<string, unknown>;
  const errs: Record<string, string> = {};
  const out: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(b)) {
    if (FORBIDDEN_PATCH_FIELDS.has(key)) {
      // silently strip — never let client touch these
      continue;
    }
    if (!(ALLOWED_PATCH_FIELDS as string[]).includes(key)) {
      // unknown field — ignore
      continue;
    }
    out[key] = val;
  }

  if (typeof out.slug === "string" && !SLUG_RE.test(out.slug)) {
    errs.slug = "slug must match /^[a-z0-9]+(?:-[a-z0-9]+)*$/";
  }
  if (typeof out.date === "string" && !DATE_RE.test(out.date)) {
    errs.date = "date must be YYYY-MM-DD";
  }
  if (out.sections !== undefined && !Array.isArray(out.sections)) {
    errs.sections = "sections must be an array";
  }
  if (out.tags !== undefined) {
    if (!Array.isArray(out.tags) || !(out.tags as unknown[]).every((t) => typeof t === "string")) {
      errs.tags = "tags must be an array of strings";
    }
  }

  if (Object.keys(errs).length > 0) return { ok: false, details: errs };
  return { ok: true, value: out as ArticleUpdate };
}

export const onRequestGet: PagesHandler<Env> = async ({ env, params }) => {
  if (!envConfigured(env)) {
    return jsonResponse({ error: "supabase-not-configured" }, { status: 503 });
  }
  const id = params.id;
  if (!id || !UUID_RE.test(id)) {
    return jsonResponse({ error: "not-found" }, { status: 404 });
  }
  try {
    const row = await selectArticleById(env, id);
    if (!row) return jsonResponse({ error: "not-found" }, { status: 404 });
    return jsonResponse(row);
  } catch (e) {
    console.error("selectArticleById failed", e);
    return jsonResponse({ error: "read-failed" }, { status: 500 });
  }
};

export const onRequestPatch: PagesHandler<Env> = async ({ request, env, params }) => {
  if (!envConfigured(env)) {
    return jsonResponse({ error: "supabase-not-configured" }, { status: 503 });
  }
  const id = params.id;
  if (!id || !UUID_RE.test(id)) {
    return jsonResponse({ error: "not-found" }, { status: 404 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "validation", details: { _: "invalid JSON body" } }, { status: 400 });
  }
  const result = validatePatch(body);
  if (!result.ok) {
    return jsonResponse({ error: "validation", details: result.details }, { status: 400 });
  }

  try {
    const updated = await updateArticle(env, id, result.value);
    if (!updated) return jsonResponse({ error: "not-found" }, { status: 404 });
    return jsonResponse(updated);
  } catch (e) {
    console.error("updateArticle failed", e);
    if (e instanceof SupabaseError) {
      if (e.status === 409 || /duplicate|unique/i.test(e.body)) {
        return jsonResponse({ error: "conflict", detail: "slug already exists" }, { status: 409 });
      }
      return jsonResponse({ error: "upstream", detail: e.body.slice(0, 500) }, { status: 500 });
    }
    return jsonResponse({ error: "update-failed" }, { status: 500 });
  }
};

export const onRequestDelete: PagesHandler<Env> = async ({ env, params }) => {
  if (!envConfigured(env)) {
    return jsonResponse({ error: "supabase-not-configured" }, { status: 503 });
  }
  const id = params.id;
  if (!id || !UUID_RE.test(id)) {
    return jsonResponse({ error: "not-found" }, { status: 404 });
  }
  try {
    // Confirm exists first so we can return a real 404 (PostgREST DELETE on
    // empty filter is a no-op 204).
    const existing = await selectArticleById(env, id);
    if (!existing) return jsonResponse({ error: "not-found" }, { status: 404 });
    await deleteArticle(env, id);
    return new Response(null, { status: 204, headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    console.error("deleteArticle failed", e);
    return jsonResponse({ error: "delete-failed" }, { status: 500 });
  }
};
