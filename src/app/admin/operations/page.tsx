"use client";

import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "@/components/admin/PageHeader";
import { SetupRequired } from "@/components/admin/SetupRequired";
import { Stat, StatGrid } from "@/components/admin/Stat";

interface EmailRecord {
  id: string;
  to: string;
  subject: string;
  createdAt: string;
  status: string;
}

interface OperationsSummary {
  email: {
    configured: boolean;
    last50: EmailRecord[];
    counts: { delivered: number; bounced: number; complained: number; sent: number; other: number };
    deliveryRate: number;
    error?: string;
  };
  storage: {
    configured: boolean;
    totalFiles: number;
    totalBytes: number;
    lastUploadAt: string | null;
    byExtension: Array<{ extension: string; count: number; bytes: number }>;
    error?: string;
  };
}

type FetchState =
  | { kind: "loading" }
  | { kind: "setup" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: OperationsSummary };

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  return `${(b / 1024 ** 3).toFixed(2)} GB`;
}

function formatPercent(x: number): string {
  return `${(x * 100).toFixed(1)}%`;
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.floor(day / 365);
  return `${yr}y ago`;
}

function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "delivered") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (s === "bounced") return "bg-red-50 text-red-800 border-red-200";
  if (s === "complained") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-ppa-light text-ppa-gray border-ppa-border";
}

export default function OperationsPage() {
  const [state, setState] = useState<FetchState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/admin/api/operations", { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 503) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          if (body.error === "operations-not-configured") {
            setState({ kind: "setup" });
            return;
          }
          setState({ kind: "error", message: body.error || "Service unavailable" });
          return;
        }
        if (!res.ok) {
          setState({ kind: "error", message: `Request failed: ${res.status}` });
          return;
        }
        const data = (await res.json()) as OperationsSummary;
        setState({ kind: "ready", data });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setState({ kind: "error", message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="System health"
        title="Operations"
        description="Email delivery and file storage. Live data."
      />

      {state.kind === "loading" && (
        <div className="text-sm text-ppa-muted">Loading operations data…</div>
      )}

      {state.kind === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-900 p-5 text-sm">
          Failed to load operations data: {state.message}
        </div>
      )}

      {state.kind === "setup" && (
        <SetupRequired
          title="Operations data not available"
          description="The operations dashboard surfaces Resend email logs and R2 storage stats. At least one of these bindings/env vars must be configured."
          steps={[
            "RESEND_API_KEY env var should already exist (set during quote form setup)",
            "QUOTE_FILES R2 binding should already exist (set during R2 configuration)",
            "If both are missing, the dashboard isn't useful — verify they're set in Cloudflare Pages → Settings",
            "If only one exists, the page will partially populate",
          ]}
        />
      )}

      {state.kind === "ready" && <OperationsView data={state.data} />}
    </PageContainer>
  );
}

function OperationsView({ data }: { data: OperationsSummary }) {
  const { email, storage } = data;
  const total =
    email.counts.delivered +
    email.counts.bounced +
    email.counts.complained +
    email.counts.sent +
    email.counts.other;

  const deliveryRatePositive = email.deliveryRate >= 0.95;

  return (
    <>
      {/* Email section */}
      <section className="mb-14">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
          <div>
            <h2 className="font-display text-2xl text-ppa-black">
              Email delivery — last 50
            </h2>
            <p className="text-sm text-ppa-gray font-light mt-1">
              Resend transactional email events. Delivery rate target ≥ 95%.
            </p>
          </div>
        </div>

        {!email.configured ? (
          <div className="bg-ppa-white border border-ppa-border p-5 text-sm text-ppa-gray">
            RESEND_API_KEY not configured — email metrics unavailable.
          </div>
        ) : email.error ? (
          <div className="bg-red-50 border border-red-200 text-red-900 p-5 text-sm mb-5">
            Resend API error: {email.error}
          </div>
        ) : (
          <>
            <StatGrid>
              <Stat
                label="Delivered"
                value={email.counts.delivered}
                hint={total > 0 ? formatPercent(email.counts.delivered / total) : "0%"}
                delta={{
                  value: `Rate ${formatPercent(email.deliveryRate)}`,
                  positive: deliveryRatePositive,
                }}
              />
              <Stat
                label="Bounced"
                value={email.counts.bounced}
                hint={total > 0 ? formatPercent(email.counts.bounced / total) : "0%"}
                delta={
                  email.counts.bounced > 0
                    ? { value: "Investigate bounces", positive: false }
                    : undefined
                }
              />
              <Stat
                label="Complained"
                value={email.counts.complained}
                hint={total > 0 ? formatPercent(email.counts.complained / total) : "0%"}
                delta={
                  email.counts.complained > 0
                    ? { value: "Review content/list", positive: false }
                    : undefined
                }
              />
              <Stat
                label="Total"
                value={total}
                hint={`${email.counts.sent} sent · ${email.counts.other} other`}
              />
            </StatGrid>

            <div className="bg-ppa-white border border-ppa-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-ppa-light/60 border-b border-ppa-border">
                    <tr className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ppa-muted">
                      <th className="text-left px-4 py-3 w-[140px]">Date</th>
                      <th className="text-left px-4 py-3 w-[220px]">To</th>
                      <th className="text-left px-4 py-3">Subject</th>
                      <th className="text-left px-4 py-3 w-[120px]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {email.last50.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-ppa-muted"
                        >
                          No emails returned by Resend.
                        </td>
                      </tr>
                    )}
                    {email.last50.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-ppa-border last:border-0 hover:bg-ppa-light/40"
                      >
                        <td className="px-4 py-3 text-ppa-gray tabular-nums whitespace-nowrap">
                          {formatDateTime(row.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-ppa-black font-mono text-[12px]">
                          {truncate(row.to, 32)}
                        </td>
                        <td className="px-4 py-3 text-ppa-black">
                          {truncate(row.subject, 80)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${statusBadgeClass(row.status)}`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Storage section */}
      <section>
        <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
          <div>
            <h2 className="font-display text-2xl text-ppa-black">
              R2 attachment storage
            </h2>
            <p className="text-sm text-ppa-gray font-light mt-1">
              Quote-form attachments stored in the QUOTE_FILES bucket.
            </p>
          </div>
        </div>

        {!storage.configured ? (
          <div className="bg-ppa-white border border-ppa-border p-5 text-sm text-ppa-gray">
            QUOTE_FILES R2 binding not configured — storage metrics unavailable.
          </div>
        ) : storage.error ? (
          <div className="bg-red-50 border border-red-200 text-red-900 p-5 text-sm mb-5">
            R2 list error: {storage.error}
          </div>
        ) : (
          <>
            <StatGrid>
              <Stat label="Total files" value={storage.totalFiles} />
              <Stat label="Total size" value={formatBytes(storage.totalBytes)} />
              <Stat
                label="Last upload"
                value={formatRelative(storage.lastUploadAt)}
                hint={
                  storage.lastUploadAt
                    ? formatDateTime(storage.lastUploadAt)
                    : "No uploads yet"
                }
              />
              <Stat
                label="File types"
                value={storage.byExtension.length}
                hint="Distinct extensions"
              />
            </StatGrid>

            <div className="bg-ppa-white border border-ppa-border">
              <div className="px-5 py-4 border-b border-ppa-border">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-muted">
                  By file type
                </div>
              </div>
              <div className="p-5">
                {storage.byExtension.length === 0 ? (
                  <div className="text-sm text-ppa-muted">No files in bucket.</div>
                ) : (
                  <ExtensionBars items={storage.byExtension} />
                )}
              </div>
            </div>

            <p className="text-xs text-ppa-muted mt-4">
              Files retained per bucket lifecycle policy (recommended: 90 days).
            </p>
          </>
        )}
      </section>
    </>
  );
}

function ExtensionBars({
  items,
}: {
  items: Array<{ extension: string; count: number; bytes: number }>;
}) {
  const maxCount = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const widthPct = (item.count / maxCount) * 100;
        return (
          <li key={item.extension} className="flex items-center gap-4 text-sm">
            <div className="w-20 font-mono text-[12px] uppercase text-ppa-gray tabular-nums">
              .{item.extension}
            </div>
            <div className="flex-1 relative h-6 bg-ppa-light border border-ppa-border overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-ppa-brass/30 border-r border-ppa-brass"
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <div className="w-16 text-right tabular-nums text-ppa-black">
              {item.count}
            </div>
            <div className="w-24 text-right tabular-nums text-ppa-gray">
              {formatBytes(item.bytes)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
