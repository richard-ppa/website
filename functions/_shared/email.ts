// Email helpers for the admin article workflow.
//
// Currently exports `sendReviewEmail`, which the submit-for-review endpoint
// (functions/admin/api/articles/[id]/submit-for-review.ts) calls after an
// editor (Tristan/Travis) flips an article into the `in_review` state.
//
// Resend is invoked directly via its REST API (POST https://api.resend.com/emails)
// to match the pattern already in use by functions/contact.ts and
// functions/quote.ts — no SDK, no extra dependencies.

import type { Article } from "../../src/lib/articles-types";

// FROM address mirrors the pattern from functions/contact.ts and
// functions/quote.ts. Using the noreply@app.ppa.aero sender that's already
// verified with Resend.
const FROM_ADDRESS = "Plane Place Aviation Editorial <noreply@app.ppa.aero>";

export interface SendReviewEmailArgs {
  /** The freshly-updated article row, after status was set to in_review. */
  article: Article;
  /** Recipient — typically hardcoded to "richard@avidmktg.com" by the caller. */
  reviewerEmail: string;
  /** Origin of the admin URL, e.g. "https://ppa.aero" — used to build the deep link. */
  adminBaseUrl: string;
}

export type SendReviewEmailResult =
  | { ok: true }
  | { ok: false; error: string };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Send the "article ready for review" notification to the reviewer.
 *
 * Behavior:
 *  - If env.RESEND_API_KEY is missing, returns `{ ok: false, error: "no api key" }`.
 *    No throw — the calling endpoint must not crash if email is misconfigured.
 *  - On a non-2xx Resend response, returns `{ ok: false, error: <response body> }`.
 *  - Any exception is caught and returned as `{ ok: false, error: e.message }`.
 *  - On Resend 2xx, returns `{ ok: true }`.
 */
export async function sendReviewEmail(
  env: { RESEND_API_KEY?: string },
  args: SendReviewEmailArgs,
): Promise<SendReviewEmailResult> {
  if (!env.RESEND_API_KEY) {
    return { ok: false, error: "no api key" };
  }

  const { article, reviewerEmail, adminBaseUrl } = args;

  // Trim a trailing slash off the admin base URL so we don't build "//admin/...".
  const base = adminBaseUrl.replace(/\/+$/, "");
  const editorUrl = `${base}/admin/articles/${article.id}`;

  const subject = `[PPA] Article ready for review — ${article.title}`;

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 24px;">
    <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#0C7CB0;font-weight:600;margin-bottom:8px;">Article ready for review</div>
      <h1 style="margin:0 0 8px 0;font-size:22px;color:#111827;line-height:1.3;">${escapeHtml(article.title)}</h1>
      <div style="color:#6b7280;font-size:13px;margin-bottom:24px;">
        <span style="text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(article.category)}</span>
        &nbsp;·&nbsp;
        <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${escapeHtml(article.slug)}</span>
      </div>
      <div style="color:#111827;font-size:15px;line-height:1.6;margin-bottom:32px;">${escapeHtml(article.excerpt)}</div>
      <div style="margin-bottom:8px;">
        <a href="${escapeHtml(editorUrl)}" style="display:inline-block;background:#0B1F3A;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.02em;padding:14px 24px;border-radius:3px;">Open in admin</a>
      </div>
      <div style="color:#9ca3af;font-size:12px;margin-top:24px;">
        Or paste this link into your browser:<br>
        <a href="${escapeHtml(editorUrl)}" style="color:#9ca3af;word-break:break-all;">${escapeHtml(editorUrl)}</a>
      </div>
    </div>
    <div style="margin-top:16px;text-align:center;color:#9ca3af;font-size:12px;">
      Sent by the PPA admin — submit-for-review notification.
    </div>
  </div>
</body></html>`;

  const text =
    `Article ready for review\n\n` +
    `Title: ${article.title}\n` +
    `Slug: ${article.slug}\n` +
    `Category: ${article.category}\n\n` +
    `Excerpt:\n${article.excerpt}\n\n` +
    `Open in admin: ${editorUrl}\n`;

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [reviewerEmail],
        subject,
        html,
        text,
      }),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }

  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {
      body = `HTTP ${res.status}`;
    }
    return { ok: false, error: body || `HTTP ${res.status}` };
  }

  return { ok: true };
}
