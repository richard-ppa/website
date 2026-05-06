"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageContainer, PageHeader } from "@/components/admin/PageHeader";
import { SetupRequired } from "@/components/admin/SetupRequired";
import { Stat, StatGrid } from "@/components/admin/Stat";

interface TrafficSummary {
  totalPageViews: number;
  totalUniques: number;
  totalRequests: number;
  daily: Array<{ date: string; pageViews: number; uniques: number }>;
  topPages: Array<{ path: string; views: number }>;
  topCountries: Array<{ country: string; views: number }>;
  topReferrers: Array<{ referrer: string; views: number }>;
}

interface ApiError {
  error: string;
  detail?: string;
}

type FetchState =
  | { status: "loading" }
  | { status: "ok"; data: TrafficSummary }
  | { status: "not-configured" }
  | { status: "fetch-failed"; detail: string }
  | { status: "error"; detail: string };

const SETUP_STEPS = [
  "Cloudflare → My Profile → API Tokens → Create Token → Custom token",
  "Permissions: Account → Account Analytics → Read; Zone → Zone Analytics → Read",
  "Account Resources: Include → Specific account → your account",
  "Zone Resources: Include → Specific zone → ppa.aero",
  "Create token, copy the value",
  "Cloudflare Pages → Settings → Environment variables → add CLOUDFLARE_API_TOKEN (Secret)",
  "Get Account ID and Zone ID from Cloudflare → ppa.aero → Overview (right sidebar)",
  "Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_ZONE_ID as plain (not secret) env vars",
  "Redeploy. This page will populate.",
];

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatShortDate(iso: string): string {
  // iso is YYYY-MM-DD
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Best-effort flag emoji from country name. Cloudflare returns full names ("United States"),
// so we keep a small lookup of common ones — fall back to no flag.
const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "🇺🇸",
  Canada: "🇨🇦",
  "United Kingdom": "🇬🇧",
  Mexico: "🇲🇽",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Australia: "🇦🇺",
  Brazil: "🇧🇷",
  India: "🇮🇳",
  China: "🇨🇳",
  Japan: "🇯🇵",
  Netherlands: "🇳🇱",
  Spain: "🇪🇸",
  Italy: "🇮🇹",
  Ireland: "🇮🇪",
  Switzerland: "🇨🇭",
  Singapore: "🇸🇬",
  Russia: "🇷🇺",
  Ukraine: "🇺🇦",
  Poland: "🇵🇱",
  "United Arab Emirates": "🇦🇪",
  "Saudi Arabia": "🇸🇦",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  Turkey: "🇹🇷",
  Argentina: "🇦🇷",
  Colombia: "🇨🇴",
  Chile: "🇨🇱",
  Sweden: "🇸🇪",
  Norway: "🇳🇴",
  Denmark: "🇩🇰",
  Finland: "🇫🇮",
  Belgium: "🇧🇪",
  Austria: "🇦🇹",
  Portugal: "🇵🇹",
  Greece: "🇬🇷",
  "Hong Kong": "🇭🇰",
  Taiwan: "🇹🇼",
  Thailand: "🇹🇭",
  Vietnam: "🇻🇳",
  Indonesia: "🇮🇩",
  Philippines: "🇵🇭",
  Malaysia: "🇲🇾",
  "New Zealand": "🇳🇿",
  Israel: "🇮🇱",
  Egypt: "🇪🇬",
  Nigeria: "🇳🇬",
  Kenya: "🇰🇪",
};

function truncateReferrer(ref: string, max = 48): string {
  if (!ref) return "(direct)";
  if (ref.length <= max) return ref;
  return `${ref.slice(0, max - 1)}…`;
}

export default function TrafficPage() {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    (async () => {
      try {
        const res = await fetch("/admin/api/traffic", {
          headers: { Accept: "application/json" },
        });

        if (res.status === 503) {
          const body = (await res.json().catch(() => ({}))) as ApiError;
          if (cancelled) return;
          if (body.error === "cloudflare-analytics-not-configured") {
            setState({ status: "not-configured" });
            return;
          }
          setState({
            status: "fetch-failed",
            detail: body.detail || body.error || "Cloudflare Analytics request failed.",
          });
          return;
        }

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as ApiError;
          if (cancelled) return;
          setState({
            status: "error",
            detail: body.detail || body.error || `HTTP ${res.status}`,
          });
          return;
        }

        const data = (await res.json()) as TrafficSummary;
        if (cancelled) return;
        setState({ status: "ok", data });
      } catch (e) {
        if (cancelled) return;
        const detail = e instanceof Error ? e.message : String(e);
        setState({ status: "error", detail });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const avgPagesPerVisitor = useMemo(() => {
    if (state.status !== "ok") return "—";
    const { totalPageViews, totalUniques } = state.data;
    if (!totalUniques) return "—";
    return (totalPageViews / totalUniques).toFixed(1);
  }, [state]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Site analytics"
        title="Visitor traffic"
        description="Last 28 days. Data from Cloudflare Web Analytics."
      />

      {state.status === "loading" && (
        <div className="bg-ppa-white border border-ppa-border p-8 text-sm text-ppa-gray">
          Loading traffic data…
        </div>
      )}

      {state.status === "not-configured" && (
        <SetupRequired
          title="Cloudflare Analytics API not configured"
          description="The traffic dashboard pulls from Cloudflare's GraphQL Analytics API. You need an API token plus account and zone IDs."
          steps={SETUP_STEPS}
        />
      )}

      {(state.status === "fetch-failed" || state.status === "error") && (
        <div className="bg-red-50 border border-red-300 p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-800 mb-2">
            {state.status === "fetch-failed" ? "Cloudflare API error" : "Request failed"}
          </div>
          <h2 className="font-display text-xl text-red-900 mb-2">
            Couldn&apos;t load traffic data
          </h2>
          <p className="text-sm text-red-900/80 mb-4 break-words">{state.detail}</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex items-center px-4 py-2 bg-red-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-red-800 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {state.status === "ok" && (
        <>
          <StatGrid>
            <Stat
              label="Page views (28d)"
              value={formatNumber(state.data.totalPageViews)}
            />
            <Stat
              label="Unique visitors (28d)"
              value={formatNumber(state.data.totalUniques)}
            />
            <Stat
              label="Total requests"
              value={formatNumber(state.data.totalRequests)}
            />
            <Stat
              label="Avg pages / visitor"
              value={avgPagesPerVisitor}
            />
          </StatGrid>

          <section className="bg-ppa-white border border-ppa-border mb-8">
            <div className="px-5 py-4 border-b border-ppa-border flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-muted">
                  Daily traffic
                </div>
                <h2 className="font-display text-lg text-ppa-black mt-1">
                  Page views &amp; unique visitors — last 28 days
                </h2>
              </div>
              <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.15em] text-ppa-muted">
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-[#9a7b3f]" />
                  Page views
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-[#00aeef]" />
                  Uniques
                </span>
              </div>
            </div>
            <div className="px-2 pt-4 pb-2">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={state.data.daily}
                    margin={{ top: 10, right: 24, left: 8, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9a7b3f" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#9a7b3f" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="uniquesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00aeef" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#00aeef" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e6e1d6" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatShortDate}
                      stroke="#8a8578"
                      fontSize={11}
                      tickMargin={8}
                      minTickGap={24}
                    />
                    <YAxis
                      stroke="#8a8578"
                      fontSize={11}
                      width={36}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#fdfcf8",
                        border: "1px solid #e6e1d6",
                        fontSize: 12,
                        borderRadius: 0,
                      }}
                      labelFormatter={(label) => formatShortDate(String(label))}
                      formatter={(value, name) => [
                        formatNumber(Number(value)),
                        name === "pageViews" ? "Page views" : name === "uniques" ? "Uniques" : String(name),
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="pageViews"
                      stroke="#9a7b3f"
                      strokeWidth={2}
                      fill="url(#trafficFill)"
                    />
                    <Area
                      type="monotone"
                      dataKey="uniques"
                      stroke="#00aeef"
                      strokeWidth={2}
                      fill="url(#uniquesFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <TrafficTable
              eyebrow="Top pages"
              title="Most visited (last 24h)"
              headers={["Path", "Views"]}
              rows={state.data.topPages.map((p) => [
                <span key="p" className="font-mono text-[12px] text-ppa-black break-all">
                  {p.path || "/"}
                </span>,
                <span key="v" className="tabular-nums text-ppa-black">
                  {formatNumber(p.views)}
                </span>,
              ])}
              emptyMessage="No page-level data yet."
            />
            <TrafficTable
              eyebrow="Top countries"
              title="By country (last 24h)"
              headers={["Country", "Views"]}
              rows={state.data.topCountries.map((c) => {
                const flag = COUNTRY_FLAGS[c.country];
                return [
                  <span key="c" className="text-ppa-black">
                    {flag ? <span className="mr-2">{flag}</span> : null}
                    {c.country}
                  </span>,
                  <span key="v" className="tabular-nums text-ppa-black">
                    {formatNumber(c.views)}
                  </span>,
                ];
              })}
              emptyMessage="No country data yet."
            />
          </div>

          {/* Top referrers omitted — clientRequestReferer is a paid-only Cloudflare GraphQL field */}
        </>
      )}
    </PageContainer>
  );
}

interface TrafficTableProps {
  eyebrow: string;
  title: string;
  headers: [string, string];
  rows: Array<[React.ReactNode, React.ReactNode]>;
  emptyMessage: string;
}

function TrafficTable({ eyebrow, title, headers, rows, emptyMessage }: TrafficTableProps) {
  return (
    <section className="bg-ppa-white border border-ppa-border">
      <div className="px-5 py-4 border-b border-ppa-border">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-muted">
          {eyebrow}
        </div>
        <h2 className="font-display text-lg text-ppa-black mt-1">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <div className="px-5 py-6 text-sm text-ppa-gray">{emptyMessage}</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-ppa-muted border-b border-ppa-border">
              <th className="px-5 py-2.5 font-semibold">{headers[0]}</th>
              <th className="px-5 py-2.5 font-semibold text-right w-32">{headers[1]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-ppa-border/60 last:border-b-0 hover:bg-ppa-light/40"
              >
                <td className="px-5 py-2.5 align-top">{row[0]}</td>
                <td className="px-5 py-2.5 text-right align-top">{row[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
