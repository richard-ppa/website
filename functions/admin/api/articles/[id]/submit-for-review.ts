// Cloudflare Pages Function — POST /admin/api/articles/:id/submit-for-review
// Flips status=in_review and emails the reviewer (richard@avidmktg.com).
// Email failure does NOT roll back the status change — the article still
// transitions to in_review and the response reports email_sent=false.
//
// Does NOT change `published` or `published_at`.

import {
  selectArticleById,
  SupabaseError,
  updateArticle,
  type SupabaseEnv,
} from "../../../../_shared/supabase";
import { sendReviewEmail } from "../../../../_shared/email";

interface Env extends SupabaseEnv {
  RESEND_API_KEY?: string;
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
const REVIEWER_EMAIL = "richard@avidmktg.com";

export const onRequestPost: PagesHandler<Env> = async ({ env, params, request }) => {
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
    console.error("submit-for-review/select failed", e);
    return jsonResponse({ error: "read-failed" }, { status: 500 });
  }
  if (!existing) return jsonResponse({ error: "not-found" }, { status: 404 });

  let updated;
  try {
    updated = await updateArticle(env, id, { status: "in_review" });
  } catch (e) {
    console.error("submit-for-review/update failed", e);
    if (e instanceof SupabaseError) {
      return jsonResponse({ error: "upstream", detail: e.body.slice(0, 500) }, { status: 500 });
    }
    return jsonResponse({ error: "update-failed" }, { status: 500 });
  }
  if (!updated) return jsonResponse({ error: "not-found" }, { status: 404 });

  // Status flip succeeded. Now attempt the email — failures here must not
  // roll back the status change.
  let emailSent = false;
  let emailError: string | undefined;

  if (!env.RESEND_API_KEY) {
    emailError = "RESEND_API_KEY not configured";
    console.warn("submit-for-review: RESEND_API_KEY missing — skipping email");
  } else {
    try {
      const adminBaseUrl = new URL(request.url).origin;
      const result = await sendReviewEmail(env, {
        article: updated,
        reviewerEmail: REVIEWER_EMAIL,
        adminBaseUrl,
      });
      if (result.ok) {
        emailSent = true;
      } else {
        emailError = result.error;
        console.error("submit-for-review: sendReviewEmail returned not-ok", result.error);
      }
    } catch (e) {
      emailError = e instanceof Error ? e.message : String(e);
      console.error("submit-for-review: sendReviewEmail threw", e);
    }
  }

  const responseBody: {
    article: typeof updated;
    email_sent: boolean;
    email_error?: string;
  } = { article: updated, email_sent: emailSent };
  if (emailError) responseBody.email_error = emailError;
  return jsonResponse(responseBody);
};
