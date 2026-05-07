// Tiny REST client around Supabase's PostgREST endpoint.
// No SDK — keeps the Pages Functions bundle small.
//
// Auth: service-role key (server-side only — Cloudflare Access guards the
// route at the edge; never inject this key into client bundles).

import type { Article, ArticleInsert, ArticleUpdate } from "../../src/lib/articles-types";

export interface SupabaseEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export class SupabaseError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`Supabase ${status}: ${body.slice(0, 500)}`);
    this.status = status;
    this.body = body;
  }
}

/**
 * Generic REST fetch wrapper. Adds apikey + Bearer auth headers, JSON body,
 * and throws SupabaseError on non-2xx.
 */
export async function supabaseFetch<T>(
  env: SupabaseEnv,
  path: string,
  init: RequestInit & { returning?: "representation" | "minimal" } = {}
): Promise<T> {
  const url = `${env.SUPABASE_URL.replace(/\/+$/, "")}/rest/v1${path}`;
  const headers: Record<string, string> = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (init.returning) {
    headers.Prefer = `return=${init.returning}`;
  }
  const merged: RequestInit = {
    ...init,
    headers: { ...headers, ...((init.headers as Record<string, string>) || {}) },
  };

  const res = await fetch(url, merged);
  if (!res.ok) {
    const body = await res.text();
    throw new SupabaseError(res.status, body);
  }
  // 204 (delete with no body) — return undefined cast as T
  if (res.status === 204) return undefined as unknown as T;
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

const ARTICLES = "/articles";

export async function selectArticles(env: SupabaseEnv): Promise<Article[]> {
  return supabaseFetch<Article[]>(env, `${ARTICLES}?select=*&order=updated_at.desc`);
}

export async function selectArticleById(
  env: SupabaseEnv,
  id: string
): Promise<Article | null> {
  const rows = await supabaseFetch<Article[]>(
    env,
    `${ARTICLES}?id=eq.${encodeURIComponent(id)}&select=*&limit=1`
  );
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function insertArticle(
  env: SupabaseEnv,
  body: ArticleInsert
): Promise<Article> {
  const rows = await supabaseFetch<Article[]>(env, ARTICLES, {
    method: "POST",
    body: JSON.stringify(body),
    returning: "representation",
  });
  return rows[0];
}

export async function updateArticle(
  env: SupabaseEnv,
  id: string,
  patch: ArticleUpdate & { published?: boolean; published_at?: string | null }
): Promise<Article | null> {
  const rows = await supabaseFetch<Article[]>(
    env,
    `${ARTICLES}?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
      returning: "representation",
    }
  );
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function deleteArticle(env: SupabaseEnv, id: string): Promise<void> {
  await supabaseFetch<void>(env, `${ARTICLES}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
