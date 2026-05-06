// Cloudflare Pages Function — GET /admin/api/operations
// Returns email delivery (Resend) + R2 storage stats for the admin Operations page.

interface R2Object {
  key: string;
  size: number;
  uploaded: string; // ISO date
  customMetadata?: Record<string, string>;
}
interface R2ListResult {
  objects: R2Object[];
  truncated: boolean;
}
interface R2Bucket {
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<R2ListResult>;
}

interface Env {
  RESEND_API_KEY?: string;
  QUOTE_FILES?: R2Bucket;
}

interface PagesContext<E> {
  request: Request;
  env: E;
}
type PagesHandler<E> = (context: PagesContext<E>) => Response | Promise<Response>;

interface ResendEmail {
  id: string;
  to: string[] | string;
  from: string;
  subject: string;
  created_at: string;
  last_event: string;
}

interface ResendListResponse {
  data?: ResendEmail[];
  // Some Resend responses wrap data slightly differently; accept either.
  emails?: ResendEmail[];
}

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
    counts: {
      delivered: number;
      bounced: number;
      complained: number;
      sent: number;
      other: number;
    };
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

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function emptyEmail(configured: boolean, error?: string): OperationsSummary["email"] {
  return {
    configured,
    last50: [],
    counts: { delivered: 0, bounced: 0, complained: 0, sent: 0, other: 0 },
    deliveryRate: 0,
    ...(error ? { error } : {}),
  };
}

function emptyStorage(configured: boolean, error?: string): OperationsSummary["storage"] {
  return {
    configured,
    totalFiles: 0,
    totalBytes: 0,
    lastUploadAt: null,
    byExtension: [],
    ...(error ? { error } : {}),
  };
}

async function fetchResend(apiKey: string): Promise<OperationsSummary["email"]> {
  try {
    const res = await fetch("https://api.resend.com/emails?limit=50", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return emptyEmail(true, `resend api ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as ResendListResponse;
    const items = json.data ?? json.emails ?? [];

    const counts = { delivered: 0, bounced: 0, complained: 0, sent: 0, other: 0 };
    const last50: EmailRecord[] = items.slice(0, 50).map((e) => {
      const ev = (e.last_event || "").toLowerCase();
      if (ev === "delivered") counts.delivered++;
      else if (ev === "bounced") counts.bounced++;
      else if (ev === "complained") counts.complained++;
      else if (ev === "sent") counts.sent++;
      else counts.other++;

      const toStr = Array.isArray(e.to) ? e.to.join(", ") : (e.to ?? "");
      return {
        id: e.id,
        to: toStr,
        subject: e.subject ?? "",
        createdAt: e.created_at ?? "",
        status: ev || "unknown",
      };
    });

    const total =
      counts.delivered + counts.bounced + counts.complained + counts.sent + counts.other;
    const deliveryRate = total > 0 ? counts.delivered / total : 0;

    return {
      configured: true,
      last50,
      counts,
      deliveryRate,
    };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return emptyEmail(true, `resend fetch failed: ${detail}`);
  }
}

async function fetchR2(bucket: R2Bucket): Promise<OperationsSummary["storage"]> {
  try {
    const list = await bucket.list({ prefix: "attachments/", limit: 1000 });
    const objects = list.objects ?? [];

    let totalBytes = 0;
    let lastUploadAt: string | null = null;
    const extMap = new Map<string, { count: number; bytes: number }>();

    for (const obj of objects) {
      totalBytes += obj.size;
      if (!lastUploadAt || obj.uploaded > lastUploadAt) {
        lastUploadAt = obj.uploaded;
      }
      // Extract extension from key (lowercased, no leading dot).
      const dotIdx = obj.key.lastIndexOf(".");
      const slashIdx = obj.key.lastIndexOf("/");
      const ext =
        dotIdx > slashIdx && dotIdx >= 0
          ? obj.key.slice(dotIdx + 1).toLowerCase()
          : "(none)";
      const cur = extMap.get(ext) || { count: 0, bytes: 0 };
      cur.count += 1;
      cur.bytes += obj.size;
      extMap.set(ext, cur);
    }

    const byExtension = Array.from(extMap.entries())
      .map(([extension, v]) => ({ extension, count: v.count, bytes: v.bytes }))
      .sort((a, b) => b.count - a.count);

    return {
      configured: true,
      totalFiles: objects.length,
      totalBytes,
      lastUploadAt,
      byExtension,
    };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return emptyStorage(true, `r2 list failed: ${detail}`);
  }
}

export const onRequestGet: PagesHandler<Env> = async ({ env }) => {
  const hasResend = !!env.RESEND_API_KEY;
  const hasR2 = !!env.QUOTE_FILES;

  if (!hasResend && !hasR2) {
    return jsonResponse({ error: "operations-not-configured" }, 503);
  }

  const [email, storage] = await Promise.all([
    hasResend ? fetchResend(env.RESEND_API_KEY as string) : Promise.resolve(emptyEmail(false)),
    hasR2 ? fetchR2(env.QUOTE_FILES as R2Bucket) : Promise.resolve(emptyStorage(false)),
  ]);

  const summary: OperationsSummary = { email, storage };
  return jsonResponse(summary, 200, { "cache-control": "private, max-age=60" });
};
