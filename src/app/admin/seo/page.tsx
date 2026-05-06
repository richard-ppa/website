"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageContainer, PageHeader } from "@/components/admin/PageHeader";
import { SetupRequired } from "@/components/admin/SetupRequired";
import { Stat, StatGrid } from "@/components/admin/Stat";

interface SeoRow {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SeoSummary {
  totalClicks: number;
  totalImpressions: number;
  avgPosition: number;
  avgCtr: number;
  topQueries: Array<SeoRow & { query: string }>;
  topPages: Array<SeoRow & { page: string }>;
  daily: Array<{ date: string; clicks: number; impressions: number }>;
}

type FetchState =
  | { status: "loading" }
  | { status: "ok"; data: SeoSummary }
  | { status: "not-configured" }
  | { status: "fetch-failed"; detail: string };

const SETUP_STEPS = [
  "Go to Google Cloud Console → create a project (or use existing) → enable Search Console API",
  "Create a service account, generate a JSON key file",
  "In Search Console → Settings → Users and permissions → add the service account email as a Restricted user for ppa.aero",
  "In Cloudflare Pages → Settings → Environment variables → add GSC_SERVICE_ACCOUNT_KEY (Secret) with the contents of the JSON key file",
  "Add GSC_PROPERTY env var (plain text) with value 'sc-domain:ppa.aero' (or the full URL form if you only verified one)",
  "Redeploy. This page will populate within minutes.",
];

const BRASS = "#a4824a";
const GRAY = "#6b7280";

function formatInt(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

function formatPercent(n: number, decimals = 1): string {
  return `${(n * 100).toFixed(decimals)}%`;
}

function formatPosition(n: number): string {
  return n.toFixed(1);
}

function formatDateShort(iso: string): string {
  // iso is "YYYY-MM-DD"
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

export default function SeoPage() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/admin/api/seo", { cache: "no-store" });
      if (res.status === 503) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
          detail?: string;
        };
        if (body.error === "gsc-not-configured") {
          setState({ status: "not-configured" });
          return;
        }
        setState({
          status: "fetch-failed",
          detail: body.detail || body.error || "Search Console request failed.",
        });
        return;
      }
      if (!res.ok) {
        setState({
          status: "fetch-failed",
          detail: `Unexpected response (${res.status})`,
        });
        return;
      }
      const data = (await res.json()) as SeoSummary;
      setState({ status: "ok", data });
    } catch (err) {
      setState({
        status: "fetch-failed",
        detail: err instanceof Error ? err.message : "Network error",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Search Console"
        title="Organic search performance"
        description="Last 28 days. Data from Google Search Console for ppa.aero."
      />

      {state.status === "loading" && (
        <div className="text-sm text-ppa-muted">Loading Search Console data…</div>
      )}

      {state.status === "not-configured" && (
        <SetupRequired
          title="Google Search Console not connected"
          description="Connecting GSC requires a Google Cloud service account with read access to the ppa.aero property."
          steps={SETUP_STEPS}
        />
      )}

      {state.status === "fetch-failed" && (
        <div className="bg-red-50 border border-red-300 p-6 lg:p-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-800 mb-2">
            Search Console error
          </div>
          <h2 className="font-display text-2xl text-red-900 mb-2">
            Couldn&apos;t fetch Search Console data
          </h2>
          <p className="text-sm text-red-900/80 mb-4 break-words">{state.detail}</p>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center px-4 py-2 bg-red-900 text-white text-xs font-semibold uppercase tracking-[0.15em] hover:bg-red-800 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {state.status === "ok" && <SeoDashboard data={state.data} />}
    </PageContainer>
  );
}

function SeoDashboard({ data }: { data: SeoSummary }) {
  return (
    <>
      <StatGrid>
        <Stat label="Total clicks" value={formatInt(data.totalClicks)} hint="28 days" />
        <Stat
          label="Total impressions"
          value={formatInt(data.totalImpressions)}
          hint="28 days"
        />
        <Stat label="Average position" value={formatPosition(data.avgPosition)} hint="Lower is better" />
        <Stat label="Average CTR" value={formatPercent(data.avgCtr)} hint="Clicks ÷ impressions" />
      </StatGrid>

      <section className="mb-10">
        <div className="bg-ppa-white border border-ppa-border p-5 lg:p-6">
          <div className="flex items-baseline justify-between mb-4 gap-4 flex-wrap">
            <h2 className="font-display text-xl text-ppa-black">Daily clicks &amp; impressions</h2>
            <p className="text-xs text-ppa-muted">Last 28 days</p>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.daily} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateShort}
                  tick={{ fontSize: 11, fill: GRAY }}
                  stroke="#d1d5db"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: BRASS }}
                  stroke="#d1d5db"
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: GRAY }}
                  stroke="#d1d5db"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke={BRASS}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="impressions"
                  name="Impressions"
                  stroke={GRAY}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-xl text-ppa-black mb-3">Top 20 queries</h2>
        <DataTable
          columns={[
            { key: "query", label: "Query", className: "text-left" },
            { key: "clicks", label: "Clicks", numeric: true, render: (r) => formatInt(r.clicks) },
            {
              key: "impressions",
              label: "Impressions",
              numeric: true,
              render: (r) => formatInt(r.impressions),
            },
            { key: "ctr", label: "CTR", numeric: true, render: (r) => formatPercent(r.ctr) },
            {
              key: "position",
              label: "Position",
              numeric: true,
              render: (r) => formatPosition(r.position),
            },
          ]}
          rows={data.topQueries.map((r) => ({ ...r, label: r.query }))}
          empty="No query data for this period."
        />
      </section>

      <section>
        <h2 className="font-display text-xl text-ppa-black mb-3">Top 20 pages</h2>
        <DataTable
          columns={[
            { key: "page", label: "Page", className: "text-left", render: (r) => (
              <a
                href={r.page}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ppa-black hover:text-ppa-brass underline-offset-2 hover:underline break-all"
              >
                {r.page}
              </a>
            ) },
            { key: "clicks", label: "Clicks", numeric: true, render: (r) => formatInt(r.clicks) },
            {
              key: "impressions",
              label: "Impressions",
              numeric: true,
              render: (r) => formatInt(r.impressions),
            },
            { key: "ctr", label: "CTR", numeric: true, render: (r) => formatPercent(r.ctr) },
            {
              key: "position",
              label: "Position",
              numeric: true,
              render: (r) => formatPosition(r.position),
            },
          ]}
          rows={data.topPages.map((r) => ({ ...r, label: r.page }))}
          empty="No page data for this period."
        />
      </section>
    </>
  );
}

interface TableRow {
  query?: string;
  page?: string;
  label: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface TableColumn {
  key: string;
  label: string;
  numeric?: boolean;
  className?: string;
  render?: (row: TableRow) => React.ReactNode;
}

function DataTable({
  columns,
  rows,
  empty,
}: {
  columns: TableColumn[];
  rows: TableRow[];
  empty: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="bg-ppa-white border border-ppa-border p-6 text-sm text-ppa-muted">
        {empty}
      </div>
    );
  }
  return (
    <div className="bg-ppa-white border border-ppa-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ppa-border bg-ppa-light/40">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-ppa-muted ${
                  col.numeric ? "text-right" : "text-left"
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${row.label}-${i}`}
              className="border-b border-ppa-border/60 last:border-b-0 hover:bg-ppa-light/30"
            >
              {columns.map((col) => {
                const fallback =
                  col.key === "query" || col.key === "page"
                    ? row.label
                    : (row[col.key as keyof TableRow] as React.ReactNode);
                return (
                  <td
                    key={col.key}
                    className={`px-4 py-2.5 ${
                      col.numeric ? "text-right tabular-nums" : "text-left"
                    } text-ppa-black`}
                  >
                    {col.render ? col.render(row) : fallback}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
