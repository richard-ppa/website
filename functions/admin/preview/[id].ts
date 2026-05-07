// Cloudflare Pages Function — GET /admin/preview/:id
//
// APPROACH A (chosen): server-renders a self-contained minimal HTML page
// with inline CSS that mirrors the public /blog/[slug] structure. Why A:
//   - No reliance on Next.js's hashed asset URLs (which change on each build
//     and would make a /admin/preview/* route brittle).
//   - Self-contained — no client-side React fetch, no second auth round trip.
//   - One file, ~150 lines. Approach B would have required exporting the
//     `Section` component or duplicating it in a client admin route plus
//     wiring up the build to include that route — more surface area for the
//     same outcome (Richard reads the article).
//
// The preview is for editorial review only — visual fidelity is "good enough
// to verify content reads correctly" rather than pixel-parity with the live
// theme. Cloudflare Access guards the route at the edge; we also set
// X-Robots-Tag: noindex, nofollow as a belt-and-braces measure.

import { selectArticleById, type SupabaseEnv } from "../../_shared/supabase";
import type { Article, BlogSection } from "../../../src/lib/articles-types";

interface Env extends SupabaseEnv {}

interface PagesContext<E> {
  env: E;
  params: Record<string, string>;
}
type PagesHandler<E> = (context: PagesContext<E>) => Response | Promise<Response>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PREVIEW_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store, private",
  "X-Robots-Tag": "noindex, nofollow",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Bold pass: turn **text** into <strong>. Mirrors renderInline() in
 *  src/app/blog/[slug]/page.tsx. */
function renderInline(text: string): string {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts
    .map((p) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return `<strong>${escapeHtml(p.slice(2, -2))}</strong>`;
      }
      return escapeHtml(p);
    })
    .join("");
}

function renderSection(s: BlogSection): string {
  switch (s.kind) {
    case "paragraph":
      return `<p class="paragraph">${renderInline(s.text)}</p>`;
    case "heading":
      return `<h2 class="heading">${escapeHtml(s.text)}</h2>`;
    case "figure":
      return `
        <figure class="figure">
          <img src="${escapeHtml(s.src)}" alt="${escapeHtml(s.alt)}" />
          <figcaption>${escapeHtml(s.caption)}</figcaption>
        </figure>`;
    case "takeaways":
      return `
        <ol class="takeaways">
          ${s.items
            .map(
              (it) => `
            <li>
              <p class="takeaway-label">${escapeHtml(it.label)}</p>
              <p class="takeaway-text">${escapeHtml(it.text)}</p>
            </li>`
            )
            .join("")}
        </ol>`;
    case "callout":
      return `<blockquote class="callout"><p>${escapeHtml(s.text)}</p></blockquote>`;
  }
}

function renderHtml(article: Article): string {
  const dateDisplay =
    article.date_display && article.date_display.trim()
      ? article.date_display
      : article.date;
  const sections = article.sections.map(renderSection).join("\n");
  const cta = article.cta_headline || article.cta_body
    ? `
      <section class="cta">
        <h2>${escapeHtml(article.cta_headline || "Need maintenance on your Hawker, Citation, or Challenger?")}</h2>
        <p>${escapeHtml(article.cta_body || "Send us the squawk or your upcoming inspection scope — we'll tell you what we'd do about it.")}</p>
      </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>Preview — ${escapeHtml(article.title)}</title>
  <style>
    :root {
      --ppa-black: #14171c;
      --ppa-dark: #2b2f36;
      --ppa-gray: #555a63;
      --ppa-muted: #7c828c;
      --ppa-light: #f7f6f3;
      --ppa-white: #ffffff;
      --ppa-border: #d9d6cf;
      --ppa-brass: #a0763d;
      --ppa-brass-bright: #c9923f;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--ppa-white);
      color: var(--ppa-black);
      font-family: Georgia, "Times New Roman", serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .preview-banner {
      background: #fff8d8;
      color: #5b4a00;
      padding: 8px 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 12px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: 600;
      text-align: center;
      border-bottom: 1px solid #e8d878;
    }
    .hero {
      background: var(--ppa-black);
      color: var(--ppa-white);
      padding: 64px 24px 48px;
    }
    .hero-inner {
      max-width: 1200px;
      margin: 0 auto;
    }
    .hero img {
      width: 100%;
      max-height: 420px;
      object-fit: cover;
      display: block;
      margin-bottom: 32px;
    }
    .hero .meta {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 11px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--ppa-brass-bright);
      margin-bottom: 12px;
    }
    .hero h1 {
      font-size: clamp(28px, 5vw, 56px);
      line-height: 1.05;
      margin: 0 0 24px;
      max-width: 900px;
    }
    .hero .byline {
      font-size: 14px;
      opacity: 0.8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .body {
      max-width: 720px;
      margin: 0 auto;
      padding: 64px 24px;
    }
    .excerpt {
      font-size: 22px;
      line-height: 1.5;
      font-weight: 300;
      margin: 0 0 48px;
      color: var(--ppa-black);
    }
    .paragraph {
      font-size: 18px;
      line-height: 1.75;
      color: var(--ppa-dark);
      font-weight: 300;
      margin: 0 0 24px;
    }
    .heading {
      font-size: clamp(24px, 3.5vw, 36px);
      line-height: 1.15;
      margin: 56px 0 8px;
      color: var(--ppa-black);
    }
    .figure {
      margin: 40px 0;
    }
    .figure img {
      width: 100%;
      display: block;
      background: var(--ppa-light);
    }
    .figure figcaption {
      margin-top: 12px;
      font-size: 14px;
      font-style: italic;
      color: var(--ppa-muted);
    }
    .takeaways {
      list-style: none;
      padding: 0 0 0 24px;
      margin: 32px 0;
      border-left: 2px solid var(--ppa-brass);
    }
    .takeaways li { margin-bottom: 24px; }
    .takeaway-label {
      font-size: 18px;
      font-weight: 600;
      color: var(--ppa-black);
      margin: 0 0 4px;
    }
    .takeaway-text {
      color: var(--ppa-gray);
      font-weight: 300;
      margin: 0;
    }
    .callout {
      margin: 48px 0;
      padding: 32px 0;
      border-top: 1px solid var(--ppa-border);
      border-bottom: 1px solid var(--ppa-border);
    }
    .callout p {
      font-size: clamp(20px, 2.5vw, 28px);
      line-height: 1.2;
      margin: 0;
      color: var(--ppa-black);
    }
    .tags {
      margin: 64px 0 0;
      padding-top: 32px;
      border-top: 1px solid var(--ppa-border);
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .tag {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 11px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--ppa-muted);
      padding: 6px 12px;
      border: 1px solid var(--ppa-border);
    }
    .cta {
      background: var(--ppa-light);
      border-top: 1px solid var(--ppa-border);
      padding: 64px 24px;
      max-width: none;
      text-align: left;
    }
    .cta-inner {
      max-width: 1200px;
      margin: 0 auto;
    }
    .cta h2 {
      font-size: clamp(28px, 4vw, 44px);
      margin: 0 0 12px;
      line-height: 1;
    }
    .cta p {
      color: var(--ppa-gray);
      max-width: 640px;
      margin: 0;
    }
    .draft-badge {
      display: inline-block;
      background: #fff8d8;
      color: #5b4a00;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      border-radius: 2px;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="preview-banner">
    Preview — ${article.published ? "Published" : "Draft"} · /blog/${escapeHtml(article.slug)}
  </div>

  <section class="hero">
    <div class="hero-inner">
      <img src="${escapeHtml(article.hero_src)}" alt="${escapeHtml(article.hero_alt)}" />
      <div class="meta">
        ${escapeHtml(article.category)} · ${escapeHtml(dateDisplay)}
      </div>
      <h1>${escapeHtml(article.title)}</h1>
      <div class="byline">
        ${escapeHtml(article.author)} · ${escapeHtml(article.reading_time)}
      </div>
    </div>
  </section>

  <article class="body">
    <p class="excerpt">${escapeHtml(article.excerpt)}</p>
    ${sections}

    ${
      article.tags && article.tags.length > 0
        ? `<div class="tags">${article.tags
            .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
            .join("")}</div>`
        : ""
    }
  </article>

  ${cta ? `<div class="cta-inner">${cta}</div>` : ""}
</body>
</html>`;
}

export const onRequestGet: PagesHandler<Env> = async ({ env, params }) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response("Preview unavailable: Supabase not configured.", {
      status: 503,
      headers: PREVIEW_HEADERS,
    });
  }
  const id = params.id;
  if (!id || !UUID_RE.test(id)) {
    return new Response("Not found.", { status: 404, headers: PREVIEW_HEADERS });
  }
  try {
    const article = await selectArticleById(env, id);
    if (!article) {
      return new Response("Article not found.", { status: 404, headers: PREVIEW_HEADERS });
    }
    return new Response(renderHtml(article), { status: 200, headers: PREVIEW_HEADERS });
  } catch (e) {
    console.error("preview failed", e);
    return new Response("Preview rendering failed.", {
      status: 500,
      headers: PREVIEW_HEADERS,
    });
  }
};
