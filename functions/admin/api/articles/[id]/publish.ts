// Cloudflare Pages Function — POST /admin/api/articles/:id/publish
// Sets published=true (and published_at=now() if currently null), then fires
// the Cloudflare Pages deploy webhook to trigger a rebuild. If the webhook
// fails the article is still published in Supabase — we report
// webhook_triggered=false and let Richard kick a manual deploy.

import {
  selectArticleById,
  SupabaseError,
  updateArticle,
  type SupabaseEnv,
} from "../../../../_shared/supabase";

interface Env extends SupabaseEnv {
  CLOUDFLARE_DEPLOY_WEBHOOK_URL?: string;
}

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

  let existing;
  try {
    existing = await selectArticleById(env, id);
  } catch (e) {
    console.error("publish/select failed", e);
    return jsonResponse({ error: "read-failed" }, { status: 500 });
  }
  if (!existing) return jsonResponse({ error: "not-found" }, { status: 404 });

  const patch: { published: boolean; published_at?: string } = { published: true };
  if (!existing.published_at) {
    patch.published_at = new Date().toISOString();
  }

  let updated;
  try {
    updated = await updateArticle(env, id, patch);
  } catch (e) {
    console.error("publish/update failed", e);
    if (e instanceof SupabaseError) {
      return jsonResponse({ error: "upstream", detail: e.body.slice(0, 500) }, { status: 500 });
    }
    return jsonResponse({ error: "update-failed" }, { status: 500 });
  }
  if (!updated) return jsonResponse({ error: "not-found" }, { status: 404 });

  // Fire the deploy webhook. Don't rollback on failure — the article IS
  // published in Supabase; deploy can be triggered manually if the hook
  // is unavailable.
  let webhookTriggered = false;
  if (env.CLOUDFLARE_DEPLOY_WEBHOOK_URL) {
    try {
      const res = await fetch(env.CLOUDFLARE_DEPLOY_WEBHOOK_URL, { method: "POST" });
      webhookTriggered = res.ok;
      if (!res.ok) {
        console.error(`deploy webhook returned ${res.status}`);
      }
    } catch (e) {
      console.error("deploy webhook fetch failed", e);
    }
  } else {
    console.warn("CLOUDFLARE_DEPLOY_WEBHOOK_URL not set — skipping redeploy");
  }

  return jsonResponse({
    article: updated,
    webhook_triggered: webhookTriggered,
    deploy: { triggered: webhookTriggered },
  });
};
