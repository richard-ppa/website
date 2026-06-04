"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PageHeader, PageContainer } from "@/components/admin/PageHeader";
import { Stat, StatGrid } from "@/components/admin/Stat";
import { SetupRequired } from "@/components/admin/SetupRequired";
import { serviceLabel, timelineLabel } from "@/lib/quoteFormLabels";

interface LeadAttribution {
  referer?: string;
  userAgent?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  gclid?: string;
}

interface LeadRecord {
  id: string;
  type: "quote" | "contact";
  ts: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  airframe?: string;
  service?: string;
  timeline?: string;
  attachments?: number;
  messagePreview?: string;
  attribution?: LeadAttribution;
}

/**
 * Distill the attribution data into a short human-readable source label.
 * "Google / organic", "Direct", "ppa.aero/blog/...", "Google Ads (utm_source=google)", etc.
 */
function summarizeAttribution(a?: LeadAttribution): string {
  if (!a) return "—";
  if (a.utm?.source || a.utm?.medium) {
    const parts: string[] = [];
    if (a.utm.source) parts.push(a.utm.source);
    if (a.utm.medium) parts.push(a.utm.medium);
    return parts.join(" / ");
  }
  if (a.gclid) return "Google Ads";
  if (!a.referer) return "Direct";
  try {
    const u = new URL(a.referer);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "ppa.aero" || host === "www.ppa.aero") {
      return `Internal · ${u.pathname}`;
    }
    if (host.includes("google.")) return "Google / organic";
    if (host.includes("bing.")) return "Bing / organic";
    if (host.includes("duckduckgo")) return "DuckDuckGo / organic";
    if (host.includes("facebook.") || host.includes("fb.com")) return "Facebook";
    if (host.includes("linkedin.")) return "LinkedIn";
    if (host.includes("instagram.")) return "Instagram";
    if (host.includes("twitter.") || host.includes("x.com")) return "X / Twitter";
    return host;
  } catch {
    return "Referrer (unparsed)";
  }
}

interface LeadsSummary {
  totalQuote: number;
  totalContact: number;
  daily: Array<{ date: string; quote: number; contact: number }>;
  recent: LeadRecord[];
}

type FetchState =
  | { status: "loading" }
  | { status: "ready"; data: LeadsSummary }
  | { status: "setup-required" }
  | { status: "error"; message: string };

const QUOTE_COLOR = "oklch(0.50 0.145 230)"; // ppa-brass
const CONTACT_COLOR = "#00aeef";

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

function formatShortDate(iso: string): string {
  // iso like "2026-05-05"
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (Number.isNaN(m) || Number.isNaN(d) || m < 0 || m > 11) return iso;
  return `${MONTH_ABBR[m]} ${d}`;
}

function formatDateTime(iso: string): string {
  try {
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return iso;
    const m = MONTH_ABBR[dt.getMonth()];
    const d = dt.getDate();
    const hours = dt.getHours();
    const mins = dt.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = ((hours + 11) % 12) + 1;
    return `${m} ${d}, ${h12}:${mins} ${ampm}`;
  } catch {
    return iso;
  }
}

function sumLast(daily: LeadsSummary["daily"], n: number, key: "quote" | "contact"): number {
  if (!daily.length) return 0;
  const slice = daily.slice(-n);
  return slice.reduce((acc, d) => acc + (d[key] || 0), 0);
}

export default function LeadsPage() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/admin/api/leads?days=30", {
          credentials: "same-origin",
        });
        if (cancelled) return;
        if (res.status === 503) {
          let body: { error?: string } = {};
          try {
            body = (await res.json()) as { error?: string };
          } catch {
            // ignore
          }
          if (body.error === "kv-not-configured") {
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
        const data = (await res.json()) as LeadsSummary;
        setState({ status: "ready", data });
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
        eyebrow="Lead pipeline"
        title="Quote and contact submissions"
        description="Form submissions tracked in real time. Records retained 90 days."
      />

      {state.status === "loading" && <LoadingSkeleton />}

      {state.status === "setup-required" && (
        <SetupRequired
          title="KV namespace not configured"
          description="Lead tracking requires a Cloudflare KV namespace bound as LEADS_KV."
          steps={[
            "In Cloudflare dashboard: Workers & Pages → KV → Create namespace 'ppa-leads'",
            "Bind to your Pages project: Settings → Functions → KV namespace bindings → Add: variable LEADS_KV, namespace ppa-leads",
            "Redeploy (push any change or trigger from dashboard) — bindings activate on next deploy",
            "Submit a test quote or contact form — records will start appearing here",
          ]}
        />
      )}

      {state.status === "error" && (
        <div className="bg-red-50 border border-red-300 p-6 text-sm text-red-900">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-800 mb-2">
            Error
          </div>
          <div>Failed to load lead data: {state.message}</div>
        </div>
      )}

      {state.status === "ready" && <LeadsDashboard data={state.data} />}
    </PageContainer>
  );
}

function LeadsDashboard({ data }: { data: LeadsSummary }) {
  const last7Quotes = useMemo(() => sumLast(data.daily, 7, "quote"), [data.daily]);
  const last7Contacts = useMemo(() => sumLast(data.daily, 7, "contact"), [data.daily]);

  const chartData = useMemo(
    () =>
      data.daily.map((d) => ({
        date: d.date,
        label: formatShortDate(d.date),
        Quotes: d.quote,
        Contacts: d.contact,
      })),
    [data.daily]
  );

  return (
    <>
      <StatGrid>
        <Stat label="Total quote requests" value={data.totalQuote} hint="All time" />
        <Stat label="Total contact messages" value={data.totalContact} hint="All time" />
        <Stat label="Quotes — last 7 days" value={last7Quotes} hint="Trailing 7 days" />
        <Stat label="Contacts — last 7 days" value={last7Contacts} hint="Trailing 7 days" />
      </StatGrid>

      <section className="bg-ppa-white border border-ppa-border p-5 lg:p-6 mb-8">
        <div className="flex items-baseline justify-between mb-4 gap-4 flex-wrap">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-muted mb-1">
              Daily submissions
            </div>
            <h2 className="font-display text-xl text-ppa-black">Last 30 days</h2>
          </div>
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.15em] text-ppa-gray">
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block w-3 h-3"
                style={{ backgroundColor: QUOTE_COLOR }}
                aria-hidden
              />
              Quotes
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block w-3 h-3"
                style={{ backgroundColor: CONTACT_COLOR }}
                aria-hidden
              />
              Contacts
            </span>
          </div>
        </div>
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="oklch(0.86 0.010 230)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "oklch(0.40 0.014 230)" }}
                axisLine={{ stroke: "oklch(0.86 0.010 230)" }}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "oklch(0.40 0.014 230)" }}
                axisLine={{ stroke: "oklch(0.86 0.010 230)" }}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: "#f7f6f3",
                  border: "1px solid oklch(0.86 0.010 230)",
                  borderRadius: 0,
                  fontSize: 12,
                }}
                labelStyle={{ color: "oklch(0.14 0.015 230)", fontWeight: 600 }}
                cursor={{ stroke: "oklch(0.86 0.010 230)", strokeWidth: 1 }}
              />
              <Legend
                wrapperStyle={{ display: "none" }}
              />
              <Line
                type="monotone"
                dataKey="Quotes"
                stroke={QUOTE_COLOR}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Contacts"
                stroke={CONTACT_COLOR}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-ppa-white border border-ppa-border">
        <div className="flex items-baseline justify-between p-5 lg:p-6 border-b border-ppa-border gap-4 flex-wrap">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-muted mb-1">
              Recent submissions
            </div>
            <h2 className="font-display text-xl text-ppa-black">Latest activity</h2>
          </div>
          <div className="text-xs text-ppa-gray">
            Showing {data.recent.length} most recent
          </div>
        </div>

        {data.recent.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-sm text-ppa-gray">
              No submissions yet. Records will appear here as they come in.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.15em] text-ppa-muted border-b border-ppa-border">
                  <th className="px-5 lg:px-6 py-3 font-semibold">Date / time</th>
                  <th className="px-3 py-3 font-semibold">Type</th>
                  <th className="px-3 py-3 font-semibold">Name</th>
                  <th className="px-3 py-3 font-semibold">Company</th>
                  <th className="px-3 py-3 font-semibold">Email</th>
                  <th className="px-3 py-3 font-semibold">Source</th>
                  <th className="px-5 lg:px-6 py-3 font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-ppa-border last:border-0 hover:bg-ppa-light/40 transition-colors"
                  >
                    <td className="px-5 lg:px-6 py-3 text-ppa-gray tabular-nums whitespace-nowrap">
                      {formatDateTime(r.ts)}
                    </td>
                    <td className="px-3 py-3">
                      <TypeBadge type={r.type} />
                    </td>
                    <td className="px-3 py-3 text-ppa-black font-medium">{r.name || "—"}</td>
                    <td className="px-3 py-3 text-ppa-gray">{r.company || "—"}</td>
                    <td className="px-3 py-3 text-ppa-gray">
                      {r.email ? (
                        <a
                          href={`mailto:${r.email}`}
                          className="hover:text-ppa-brass-dark transition-colors"
                        >
                          {r.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className="px-3 py-3 text-ppa-gray text-xs whitespace-nowrap"
                      title={r.attribution?.referer || ""}
                    >
                      {summarizeAttribution(r.attribution)}
                    </td>
                    <td className="px-5 lg:px-6 py-3 text-ppa-gray max-w-md">
                      <DetailCell record={r} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function TypeBadge({ type }: { type: "quote" | "contact" }) {
  if (type === "quote") {
    return (
      <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ppa-white bg-ppa-brass rounded-sm">
        Q
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ppa-white rounded-sm"
      style={{ backgroundColor: CONTACT_COLOR }}
    >
      C
    </span>
  );
}

function DetailCell({ record }: { record: LeadRecord }) {
  if (record.type === "quote") {
    const bits: string[] = [];
    if (record.airframe) bits.push(record.airframe);
    if (record.service) bits.push(serviceLabel(record.service));
    if (record.timeline) bits.push(timelineLabel(record.timeline));
    if (record.attachments && record.attachments > 0) {
      bits.push(`${record.attachments} attachment${record.attachments === 1 ? "" : "s"}`);
    }
    return (
      <span className="line-clamp-2 break-words">
        {bits.length ? bits.join(" · ") : "—"}
      </span>
    );
  }
  return (
    <span className="line-clamp-2 break-words italic">
      {record.messagePreview || "—"}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-ppa-white border border-ppa-border p-5 animate-pulse"
          >
            <div className="h-3 w-24 bg-ppa-border mb-3" />
            <div className="h-8 w-16 bg-ppa-border" />
          </div>
        ))}
      </div>
      <div className="bg-ppa-white border border-ppa-border p-5 lg:p-6 mb-8 animate-pulse">
        <div className="h-4 w-40 bg-ppa-border mb-4" />
        <div className="h-[260px] bg-ppa-light" />
      </div>
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
    </>
  );
}
