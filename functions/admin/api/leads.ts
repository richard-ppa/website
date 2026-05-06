// Cloudflare Pages Function — GET /admin/api/leads
// Returns aggregate lead pipeline data from KV for the admin dashboard.

import { readLeadsSummary, type LeadsSummary } from "../../_shared/leads";

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: { name: string; expiration?: number }[];
    list_complete: boolean;
    cursor?: string;
  }>;
}

interface Env {
  LEADS_KV?: KVNamespace;
}

interface PagesContext<E> {
  request: Request;
  env: E;
}
type PagesHandler<E> = (context: PagesContext<E>) => Response | Promise<Response>;

const DEFAULT_DAYS = 30;
const MAX_DAYS = 90;

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

export const onRequestGet: PagesHandler<Env> = async ({ request, env }) => {
  if (!env.LEADS_KV) {
    return jsonResponse({ error: "kv-not-configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const daysRaw = url.searchParams.get("days");
  let days = DEFAULT_DAYS;
  if (daysRaw) {
    const parsed = parseInt(daysRaw, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      days = Math.min(parsed, MAX_DAYS);
    }
  }

  try {
    const summary: LeadsSummary = await readLeadsSummary(env.LEADS_KV, days);
    return jsonResponse(summary);
  } catch (e) {
    console.error("readLeadsSummary failed", e);
    return jsonResponse({ error: "read-failed" }, { status: 500 });
  }
};
