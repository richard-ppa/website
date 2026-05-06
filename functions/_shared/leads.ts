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
