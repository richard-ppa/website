// Cloudflare Pages Function — POST /admin/api/articles/:id/unpublish
// Flips published=false. Does NOT fire the deploy webhook — unpublished
// posts simply fall out of the next build.

import {
  selectArticleById,
  SupabaseError,
  updateArticle,
  type SupabaseEnv,
} from "../../../../_shared/supabase";

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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const onRequestPost: PagesHandler<Env> = async ({ env, params }) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: "supabase-not-configured" }, { status: 503 });
  }
  const id = params.id;
  if (!id || !UUID_RE.test(id)) {
    return jsonResponse({ error: "not-found" }, { status: 404 });
  }

  try {
    const existing = await selectArticleById(env, id);
    if (!existing) return jsonResponse({ error: "not-found" }, { status: 404 });
    const updated = await updateArticle(env, id, { published: false, status: "draft" });
    if (!updated) return jsonResponse({ error: "not-found" }, { status: 404 });
    return jsonResponse(updated);
  } catch (e) {
    console.error("unpublish failed", e);
    if (e instanceof SupabaseError) {
      return jsonResponse({ error: "upstream", detail: e.body.slice(0, 500) }, { status: 500 });
    }
    return jsonResponse({ error: "update-failed" }, { status: 500 });
  }
};
