// Lead tracking helpers — shared by quote.ts and contact.ts
//
// KV schema:
//   record:{uuid}   → JSON LeadRecord (90-day TTL)
//   index:recent    → JSON string[] of recent UUIDs (most recent first, capped at 100)
//   counter:total:{type}     → string (incrementing counter)
//   counter:daily:{type}:{YYYY-MM-DD} → string (counter for that day, 90-day TTL)
//
// Where {type} is "quote" or "contact"

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: { name: string; expiration?: number }[];
    list_complete: boolean;
    cursor?: string;
  }>;
}

export type LeadType = "quote" | "contact";

export interface LeadAttribution {
  /** HTTP Referer header — the page URL the form was submitted from. May include UTM params. */
  referer?: string;
  /** User-Agent header (truncated). */
  userAgent?: string;
  /** UTM parameters parsed from the Referer URL's query string. */
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  /** Google Ads click ID (for paid search attribution). */
  gclid?: string;
}

export interface LeadRecord {
  id: string;
  type: LeadType;
  ts: string; // ISO timestamp
  name: string;
  company: string;
  email: string;
  phone: string;
  // Quote-specific
  airframe?: string;
  service?: string;
  timeline?: string;
  attachments?: number;
  // Contact-specific
  messagePreview?: string;
  recipient?: string; // Founder name when message was sent direct
  // Attribution — where this lead came from. Captured server-side from
  // request headers when the form was submitted. Best-effort: a user with
  // a Referer-stripping browser, or hitting the form via direct URL paste,
  // produces no attribution data.
  attribution?: LeadAttribution;
}

// ─── Source-block email rendering ─────────────────────────────────────────
// Shared by quote.ts and contact.ts so the admin emails (and the future
// /admin/leads detail view) format attribution identically.

function escapeAttrHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function summarizeChannel(a?: LeadAttribution): string {
  if (!a) return "Unknown";
  if (a.utm?.source || a.utm?.medium) {
    const parts: string[] = [];
    if (a.utm.source) parts.push(a.utm.source);
    if (a.utm.medium) parts.push(a.utm.medium);
    return parts.join(" / ");
  }
  if (a.gclid) return "Google Ads (paid)";
  if (!a.referer) return "Direct (no referrer)";
  try {
    const u = new URL(a.referer);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "ppa.aero" || host === "www.ppa.aero") return `Internal page (${u.pathname})`;
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

export function landingPageOf(a?: LeadAttribution): string | undefined {
  if (!a?.referer) return undefined;
  try {
    const u = new URL(a.referer);
    if (u.hostname.replace(/^www\./, "") === "ppa.aero") return u.pathname + u.search;
    return undefined;
  } catch {
    return undefined;
  }
}

export function buildSourceBlockHtml(a?: LeadAttribution): string {
  if (!a) return "";
  const channel = summarizeChannel(a);
  const landing = landingPageOf(a);
  const rows: Array<[string, string]> = [["Channel", channel]];
  if (landing) rows.push(["Landing page", `https://ppa.aero${landing}`]);
  if (a.utm) {
    const tags: string[] = [];
    if (a.utm.source) tags.push(`source=${a.utm.source}`);
    if (a.utm.medium) tags.push(`medium=${a.utm.medium}`);
    if (a.utm.campaign) tags.push(`campaign=${a.utm.campaign}`);
    if (a.utm.content) tags.push(`content=${a.utm.content}`);
    if (a.utm.term) tags.push(`term=${a.utm.term}`);
    if (tags.length) rows.push(["UTM tags", tags.join(" · ")]);
  }
  if (a.gclid) rows.push(["Google Ads click ID", `${a.gclid} (keyword in Google Ads dashboard)`]);
  if (a.referer && !landing) rows.push(["Referrer", a.referer]);

  const trs = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#4b5563;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;width:140px;">${escapeAttrHtml(
          k
        )}</td><td style="padding:6px 0;color:#111827;font-size:14px;word-break:break-all;">${escapeAttrHtml(v)}</td></tr>`
    )
    .join("");

  return `<div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;">
            <div style="color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Source</div>
            <table style="width:100%;border-collapse:collapse;"><tbody>${trs}</tbody></table>
            <div style="margin-top:10px;color:#6b7280;font-size:11px;font-style:italic;line-height:1.5;">
              Organic search keywords aren&apos;t retrievable per-quote (Google strips them since 2011).
              For Google / organic leads, check Search Console for queries that landed on the page above.
            </div>
          </div>`;
}

export function buildSourceBlockText(a?: LeadAttribution): string {
  if (!a) return "";
  const channel = summarizeChannel(a);
  const landing = landingPageOf(a);
  const lines: string[] = [`Channel: ${channel}`];
  if (landing) lines.push(`Landing page: https://ppa.aero${landing}`);
  if (a.utm) {
    const tags: string[] = [];
    if (a.utm.source) tags.push(`source=${a.utm.source}`);
    if (a.utm.medium) tags.push(`medium=${a.utm.medium}`);
    if (a.utm.campaign) tags.push(`campaign=${a.utm.campaign}`);
    if (a.utm.content) tags.push(`content=${a.utm.content}`);
    if (a.utm.term) tags.push(`term=${a.utm.term}`);
    if (tags.length) lines.push(`UTM tags: ${tags.join(" · ")}`);
  }
  if (a.gclid) lines.push(`Google Ads click ID: ${a.gclid} (keyword in Google Ads dashboard)`);
  if (a.referer && !landing) lines.push(`Referrer: ${a.referer}`);
  return `\n\nSource\n${lines.join("\n")}\n\nOrganic search keywords aren't retrievable per-quote (Google strips them since 2011). For Google / organic leads, check Search Console for queries that landed on the page above.`;
}

/**
 * Extract attribution data from a form-submission Request. Reads the Referer
 * header (gets the page URL the form was on, including any UTM params), the
 * User-Agent header (for debugging), and parses UTM / gclid from the Referer
 * URL's query string.
 */
export function extractAttribution(request: Request): LeadAttribution {
  const out: LeadAttribution = {};
  const referer = request.headers.get("referer") || undefined;
  if (referer) {
    out.referer = referer.slice(0, 500);
    try {
      const ref = new URL(referer);
      const utm: NonNullable<LeadAttribution["utm"]> = {};
      const s = ref.searchParams.get("utm_source");
      const m = ref.searchParams.get("utm_medium");
      const c = ref.searchParams.get("utm_campaign");
      const ct = ref.searchParams.get("utm_content");
      const t = ref.searchParams.get("utm_term");
      if (s) utm.source = s.slice(0, 100);
      if (m) utm.medium = m.slice(0, 100);
      if (c) utm.campaign = c.slice(0, 100);
      if (ct) utm.content = ct.slice(0, 100);
      if (t) utm.term = t.slice(0, 100);
      if (Object.keys(utm).length > 0) out.utm = utm;
      const gclid = ref.searchParams.get("gclid");
      if (gclid) out.gclid = gclid.slice(0, 200);
    } catch {
      /* malformed Referer — ignore parse error, keep raw string */
    }
  }
  const ua = request.headers.get("user-agent") || undefined;
  if (ua) out.userAgent = ua.slice(0, 300);
  return out;
}

const RECENT_LIST_KEY = "index:recent";
const RECENT_LIST_MAX = 100;
const RECORD_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days
const DAILY_TTL_SECONDS = 60 * 60 * 24 * 95; // 95 days (leave headroom)

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function recordLead(kv: KVNamespace, record: LeadRecord): Promise<void> {
  const ops: Promise<unknown>[] = [];

  // Store the record
  ops.push(
    kv.put(`record:${record.id}`, JSON.stringify(record), {
      expirationTtl: RECORD_TTL_SECONDS,
    })
  );

  // Increment total counter
  const totalKey = `counter:total:${record.type}`;
  const currentTotal = await kv.get(totalKey);
  const newTotal = (parseInt(currentTotal || "0", 10) + 1).toString();
  ops.push(kv.put(totalKey, newTotal));

  // Increment daily counter
  const day = todayUtc();
  const dayKey = `counter:daily:${record.type}:${day}`;
  const currentDay = await kv.get(dayKey);
  const newDay = (parseInt(currentDay || "0", 10) + 1).toString();
  ops.push(kv.put(dayKey, newDay, { expirationTtl: DAILY_TTL_SECONDS }));

  // Update recent list (atomicity is best-effort here)
  const recentRaw = await kv.get(RECENT_LIST_KEY);
  let recent: string[] = [];
  try {
    recent = recentRaw ? (JSON.parse(recentRaw) as string[]) : [];
  } catch {
    recent = [];
  }
  recent.unshift(record.id);
  if (recent.length > RECENT_LIST_MAX) recent = recent.slice(0, RECENT_LIST_MAX);
  ops.push(kv.put(RECENT_LIST_KEY, JSON.stringify(recent)));

  await Promise.all(ops);
}

export interface LeadsSummary {
  totalQuote: number;
  totalContact: number;
  daily: Array<{ date: string; quote: number; contact: number }>;
  recent: LeadRecord[];
}

export async function readLeadsSummary(kv: KVNamespace, days: number = 30): Promise<LeadsSummary> {
  // Totals
  const [quoteTotalRaw, contactTotalRaw] = await Promise.all([
    kv.get("counter:total:quote"),
    kv.get("counter:total:contact"),
  ]);
  const totalQuote = parseInt(quoteTotalRaw || "0", 10);
  const totalContact = parseInt(contactTotalRaw || "0", 10);

  // Build last N days
  const daily: Array<{ date: string; quote: number; contact: number }> = [];
  const dailyKeys: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    dailyKeys.push(`counter:daily:quote:${dateStr}`);
    dailyKeys.push(`counter:daily:contact:${dateStr}`);
    daily.push({ date: dateStr, quote: 0, contact: 0 });
  }
  const dailyValues = await Promise.all(dailyKeys.map((k) => kv.get(k)));
  for (let i = 0; i < days; i++) {
    daily[i].quote = parseInt(dailyValues[i * 2] || "0", 10);
    daily[i].contact = parseInt(dailyValues[i * 2 + 1] || "0", 10);
  }

  // Recent records
  const recentRaw = await kv.get(RECENT_LIST_KEY);
  let recentIds: string[] = [];
  try {
    recentIds = recentRaw ? (JSON.parse(recentRaw) as string[]) : [];
  } catch {
    recentIds = [];
  }
  const recentLimit = Math.min(recentIds.length, 50);
  const recentRecords = await Promise.all(
    recentIds.slice(0, recentLimit).map(async (id) => {
      const raw = await kv.get(`record:${id}`);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as LeadRecord;
      } catch {
        return null;
      }
    })
  );
  const recent = recentRecords.filter((r): r is LeadRecord => r !== null);

  return { totalQuote, totalContact, daily, recent };
}
