"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, PageContainer } from "@/components/admin/PageHeader";
import { SetupRequired } from "@/components/admin/SetupRequired";
import type { Article } from "@/lib/articles-types";

type FetchState =
  | { status: "loading" }
  | { status: "ready"; articles: Article[] }
  | { status: "setup-required" }
  | { status: "error"; message: string };

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDateTime(iso: string): string {
  try {
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return iso;
    const m = MONTH_ABBR[dt.getMonth()];
    const d = dt.getDate();
    const y = dt.getFullYear();
    const hours = dt.getHours();
    const mins = dt.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = ((hours + 11) % 12) + 1;
    return `${m} ${d}, ${y} · ${h12}:${mins} ${ampm}`;
  } catch {
    return iso;
  }
}

export default function ArticlesListPage() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/admin/api/articles", { credentials: "same-origin" });
        if (cancelled) return;
        if (res.status === 503) {
          let body: { error?: string } = {};
          try {
            body = (await res.json()) as { error?: string };
          } catch {
            // ignore
          }
          if (body.error === "supabase-not-configured") {
            setState({ status: "setup-required" });
            return;
          }
          setState({ status: "error", message: "Service unavailable" });
          return;
        }
        if (!res.ok) {
          setState({ status: "error", message: `Request failed (${res.status})` });
          return;
        }
        const data = (await res.json()) as { articles: Article[] };
        setState({ status: "ready", articles: data.articles ?? [] });
      } catch (e) {
        if (cancelled) return;
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Unknown error",
        });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Content"
        title="Articles"
        description="Blog posts and field insights. Publishing fires a redeploy."
        action={
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-colors"
          >
            <span aria-hidden>+</span> New article
          </Link>
        }
      />

      {state.status === "loading" && <LoadingSkeleton />}

      {state.status === "setup-required" && (
        <SetupRequired
          title="Supabase not configured"
          description="The articles CMS requires Supabase environment variables on the Pages project."
          steps={[
            "Create a Supabase project (or pick the existing one) and run the schema migration in supabase/0001_articles.sql",
            "In Cloudflare Pages → Settings → Environment variables, add SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and CLOUDFLARE_DEPLOY_WEBHOOK_URL (production scope)",
            "Redeploy — bindings activate on the next deploy",
            "Refresh this page; the article list will load",
          ]}
        />
      )}

      {state.status === "error" && (
        <div className="bg-red-50 border border-red-300 p-6 text-sm text-red-900">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-800 mb-2">
            Error
          </div>
          <div>Failed to load articles: {state.message}</div>
        </div>
      )}

      {state.status === "ready" && <ArticlesTable articles={state.articles} />}
    </PageContainer>
  );
}

function ArticlesTable({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <section className="bg-ppa-white border border-ppa-border p-10 text-center">
        <h2 className="font-display text-xl text-ppa-black mb-2">No articles yet</h2>
        <p className="text-sm text-ppa-gray mb-6">
          Drafts and published posts will appear here.
        </p>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-colors"
        >
          + New article
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-ppa-white border border-ppa-border">
      <div className="flex items-baseline justify-between p-5 lg:p-6 border-b border-ppa-border gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-muted mb-1">
            All articles
          </div>
          <h2 className="font-display text-xl text-ppa-black">
            {articles.length} {articles.length === 1 ? "post" : "posts"}
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.15em] text-ppa-muted border-b border-ppa-border">
              <th className="px-5 lg:px-6 py-3 font-semibold">Title</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Category</th>
              <th className="px-3 py-3 font-semibold">Date</th>
              <th className="px-3 py-3 font-semibold">Slug</th>
              <th className="px-5 lg:px-6 py-3 font-semibold">Last edited</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr
                key={a.id}
                className="border-b border-ppa-border last:border-0 hover:bg-ppa-light/40 transition-colors cursor-pointer"
                onClick={() => {
                  window.location.href = `/admin/articles/${a.id}`;
                }}
              >
                <td className="px-5 lg:px-6 py-3 text-ppa-black font-medium max-w-md">
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="hover:text-ppa-brass-dark transition-colors line-clamp-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {a.title || <span className="italic text-ppa-muted">Untitled</span>}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <StatusBadge published={a.published} />
                </td>
                <td className="px-3 py-3 text-ppa-gray whitespace-nowrap">{a.category || "—"}</td>
                <td className="px-3 py-3 text-ppa-gray whitespace-nowrap tabular-nums">
                  {a.date || "—"}
                </td>
                <td className="px-3 py-3 text-ppa-muted text-xs font-mono">{a.slug}</td>
                <td className="px-5 lg:px-6 py-3 text-ppa-gray whitespace-nowrap tabular-nums">
                  {formatDateTime(a.updated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  if (published) {
    return (
      <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-900 bg-emerald-100 border border-emerald-300 rounded-sm">
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-ppa-muted bg-ppa-light border border-ppa-border rounded-sm">
      Draft
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-ppa-white border border-ppa-border animate-pulse">
      <div className="p-5 lg:p-6 border-b border-ppa-border">
        <div className="h-4 w-44 bg-ppa-border" />
      </div>
      <div className="p-5 lg:p-6 space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-6 bg-ppa-light" />
        ))}
      </div>
    </div>
  );
}
