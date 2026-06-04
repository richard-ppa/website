"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, PageContainer } from "@/components/admin/PageHeader";
import { SetupRequired } from "@/components/admin/SetupRequired";
import type { Article, ArticleStatus } from "@/lib/articles-types";
import { StatusBadge } from "./_status-badge";

type FilterValue = "all" | ArticleStatus;

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

const FILTER_TABS: Array<{ value: FilterValue; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "in_review", label: "In Review" },
  { value: "published", label: "Published" },
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

function articleStatus(a: Article): ArticleStatus {
  // Defensive — handle older rows that may not yet have `status` set.
  if (a.status === "draft" || a.status === "in_review" || a.status === "published") {
    return a.status;
  }
  return a.published ? "published" : "draft";
}

async function fetchArticles(filter: FilterValue): Promise<Article[] | { setup: true } | { error: string }> {
  const url =
    filter === "all"
      ? "/admin/api/articles"
      : `/admin/api/articles?status=${encodeURIComponent(filter)}`;
  const res = await fetch(url, { credentials: "same-origin" });
  if (res.status === 503) {
    let body: { error?: string } = {};
    try {
      body = (await res.json()) as { error?: string };
    } catch {
      // ignore
    }
    if (body.error === "supabase-not-configured") {
      return { setup: true };
    }
    return { error: "Service unavailable" };
  }
  if (!res.ok) {
    return { error: `Request failed (${res.status})` };
  }
  const data = (await res.json()) as { articles: Article[] };
  return data.articles ?? [];
}

export default function ArticlesListPage() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [state, setState] = useState<FetchState>({ status: "loading" });

  // Independent "Needs Review" lane — always fetched on mount so the section
  // appears regardless of the active filter tab.
  const [needsReview, setNeedsReview] = useState<Article[]>([]);

  // Reload the main table whenever the filter changes.
  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchArticles(filter).then((result) => {
      if (cancelled) return;
      if (Array.isArray(result)) {
        setState({ status: "ready", articles: result });
      } else if ("setup" in result) {
        setState({ status: "setup-required" });
      } else {
        setState({ status: "error", message: result.error });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  // Fetch the "Needs Review" lane once on mount.
  useEffect(() => {
    let cancelled = false;
    fetchArticles("in_review").then((result) => {
      if (cancelled) return;
      if (Array.isArray(result)) {
        setNeedsReview(result);
      }
      // Silent failure — the main table will surface setup/error states.
    });
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
        <div className="bg-red-50 border border-red-300 p-6 text-sm text-red-900 mb-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-800 mb-2">
            Error
          </div>
          <div>Failed to load articles: {state.message}</div>
        </div>
      )}

      {state.status !== "setup-required" && needsReview.length > 0 && (
        <NeedsReviewSection articles={needsReview} />
      )}

      {state.status !== "setup-required" && (
        <FilterTabs value={filter} onChange={setFilter} />
      )}

      {state.status === "loading" && <LoadingSkeleton />}

      {state.status === "ready" && (
        <ArticlesTable articles={state.articles} filter={filter} />
      )}
    </PageContainer>
  );
}

function FilterTabs({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (next: FilterValue) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter articles by status"
      className="mb-4 flex flex-wrap items-center gap-1 border-b border-ppa-border"
    >
      {FILTER_TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors border-b-2 -mb-px ${
              active
                ? "text-ppa-black border-ppa-brass"
                : "text-ppa-muted border-transparent hover:text-ppa-black hover:border-ppa-border"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function NeedsReviewSection({ articles }: { articles: Article[] }) {
  return (
    <section
      className="border border-[#BAE6FD] mb-8"
      style={{ backgroundColor: "#F0F9FF" }}
    >
      <div className="flex items-baseline justify-between p-5 lg:p-6 border-b border-[#BAE6FD] gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: "#0C7CB0" }}>
            Awaiting review
          </div>
          <h2 className="font-display text-xl text-ppa-black">
            {articles.length} {articles.length === 1 ? "article" : "articles"} need your attention
          </h2>
        </div>
        <StatusBadge status="in_review" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.15em] text-ppa-muted border-b border-[#BAE6FD]">
              <th className="px-5 lg:px-6 py-3 font-semibold">Title</th>
              <th className="px-3 py-3 font-semibold">Category</th>
              <th className="px-3 py-3 font-semibold">Slug</th>
              <th className="px-5 lg:px-6 py-3 font-semibold">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr
                key={a.id}
                className="border-b border-[#BAE6FD] last:border-0 hover:bg-white/60 transition-colors cursor-pointer"
                onClick={() => {
                  window.location.href = `/admin/articles/new?id=${a.id}`;
                }}
              >
                <td className="px-5 lg:px-6 py-3 text-ppa-black font-medium max-w-md">
                  <Link
                    href={`/admin/articles/new?id=${a.id}`}
                    className="hover:text-ppa-brass-dark transition-colors line-clamp-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {a.title || <span className="italic text-ppa-muted">Untitled</span>}
                  </Link>
                </td>
                <td className="px-3 py-3 text-ppa-gray whitespace-nowrap">{a.category || "—"}</td>
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

function ArticlesTable({
  articles,
  filter,
}: {
  articles: Article[];
  filter: FilterValue;
}) {
  if (articles.length === 0) {
    const filterLabel = FILTER_TABS.find((t) => t.value === filter)?.label ?? "All";
    return (
      <section className="bg-ppa-white border border-ppa-border p-10 text-center">
        <h2 className="font-display text-xl text-ppa-black mb-2">
          {filter === "all" ? "No articles yet" : `No ${filterLabel.toLowerCase()} articles`}
        </h2>
        <p className="text-sm text-ppa-gray mb-6">
          {filter === "all"
            ? "Drafts and published posts will appear here."
            : "Nothing matches this filter right now."}
        </p>
        {filter === "all" && (
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-colors"
          >
            + New article
          </Link>
        )}
      </section>
    );
  }

  const heading = FILTER_TABS.find((t) => t.value === filter)?.label ?? "All";

  return (
    <section className="bg-ppa-white border border-ppa-border">
      <div className="flex items-baseline justify-between p-5 lg:p-6 border-b border-ppa-border gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-muted mb-1">
            {heading === "All" ? "All articles" : heading}
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
                  window.location.href = `/admin/articles/new?id=${a.id}`;
                }}
              >
                <td className="px-5 lg:px-6 py-3 text-ppa-black font-medium max-w-md">
                  <Link
                    href={`/admin/articles/new?id=${a.id}`}
                    className="hover:text-ppa-brass-dark transition-colors line-clamp-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {a.title || <span className="italic text-ppa-muted">Untitled</span>}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={articleStatus(a)} />
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
