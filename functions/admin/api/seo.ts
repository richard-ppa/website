// Cloudflare Pages Function — GET /admin/api/seo
// Returns Google Search Console performance data for the last 28 days.
// Requires GSC_SERVICE_ACCOUNT_KEY (JSON string) and GSC_PROPERTY env vars.

interface Env {
  GSC_SERVICE_ACCOUNT_KEY?: string; // JSON string of Google service account credentials
  GSC_PROPERTY?: string; // e.g. "https://ppa.aero/" or "sc-domain:ppa.aero"
}

interface PagesContext<E> {
  request: Request;
  env: E;
}
type PagesHandler<E> = (context: PagesContext<E>) => Response | Promise<Response>;

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

interface GscRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

interface GscResponse {
  rows?: GscRow[];
}

interface SeoSummary {
  totalClicks: number;
  totalImpressions: number;
  avgPosition: number;
  avgCtr: number;
  topQueries: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
  topPages: Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }>;
  daily: Array<{ date: string; clicks: number; impressions: number }>;
}

// ---- Utilities ----

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function base64UrlEncode(input: ArrayBuffer | string): string {
  let bytes: Uint8Array;
  if (typeof input === "string") {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = new Uint8Array(input);
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// Decode a PEM-formatted PKCS8 private key into raw bytes for crypto.subtle.importKey.
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleaned = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function signJwt(serviceAccount: ServiceAccountKey, scope: string): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope,
    aud: serviceAccount.token_uri || "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // Newlines may be escaped as \n in env-var JSON — normalise.
  const pem = serviceAccount.private_key.replace(/\\n/g, "\n");
  const keyData = pemToArrayBuffer(pem);

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

async function getAccessToken(serviceAccount: ServiceAccountKey): Promise<string> {
  const jwt = await signJwt(serviceAccount, "https://www.googleapis.com/auth/webmasters.readonly");
  const tokenUrl = serviceAccount.token_uri || "https://oauth2.googleapis.com/token";

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`token exchange failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("token exchange returned no access_token");
  }
  return data.access_token;
}

async function gscQuery(
  property: string,
  accessToken: string,
  body: Record<string, unknown>
): Promise<GscResponse> {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    property
  )}/searchAnalytics/query`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`gsc query failed: ${res.status} ${text}`);
  }

  return (await res.json()) as GscResponse;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ---- Handler ----

export const onRequestGet: PagesHandler<Env> = async ({ env }) => {
  const { GSC_SERVICE_ACCOUNT_KEY, GSC_PROPERTY } = env;

  if (!GSC_SERVICE_ACCOUNT_KEY || !GSC_PROPERTY) {
    return jsonResponse({ error: "gsc-not-configured" }, 503);
  }

  try {
    const serviceAccount: ServiceAccountKey = JSON.parse(GSC_SERVICE_ACCOUNT_KEY);

    if (!serviceAccount.client_email || !serviceAccount.private_key) {
      throw new Error("service account JSON missing client_email or private_key");
    }

    const accessToken = await getAccessToken(serviceAccount);

    // Date range: last 28 days, ending yesterday (GSC data has ~2 day lag,
    // but request format only requires endDate inclusive — Google returns what it has).
    const end = new Date();
    end.setUTCDate(end.getUTCDate() - 1);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 27);
    const startDate = isoDate(start);
    const endDate = isoDate(end);

    const baseBody = {
      startDate,
      endDate,
      dataState: "all",
    };

    // Three parallel queries: queries, pages, and daily totals.
    const [queryRes, pageRes, dailyRes] = await Promise.all([
      gscQuery(GSC_PROPERTY, accessToken, {
        ...baseBody,
        dimensions: ["query"],
        rowLimit: 20,
      }),
      gscQuery(GSC_PROPERTY, accessToken, {
        ...baseBody,
        dimensions: ["page"],
        rowLimit: 20,
      }),
      gscQuery(GSC_PROPERTY, accessToken, {
        ...baseBody,
        dimensions: ["date"],
        rowLimit: 1000,
      }),
    ]);

    const topQueries = (queryRes.rows ?? []).map((r) => ({
      query: r.keys?.[0] ?? "",
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      ctr: r.ctr ?? 0,
      position: r.position ?? 0,
    }));

    const topPages = (pageRes.rows ?? []).map((r) => ({
      page: r.keys?.[0] ?? "",
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      ctr: r.ctr ?? 0,
      position: r.position ?? 0,
    }));

    const daily = (dailyRes.rows ?? [])
      .map((r) => ({
        date: r.keys?.[0] ?? "",
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Aggregate site-wide totals from the daily series (most accurate breakdown).
    let totalClicks = 0;
    let totalImpressions = 0;
    for (const row of daily) {
      totalClicks += row.clicks;
      totalImpressions += row.impressions;
    }

    // For weighted avg position/ctr, sum across query rows weighted by impressions.
    // Fall back to dailyRes if query rows truncated.
    let weightedPositionNumerator = 0;
    let weightedPositionDenominator = 0;
    for (const r of dailyRes.rows ?? []) {
      const imp = r.impressions ?? 0;
      const pos = r.position ?? 0;
      weightedPositionNumerator += pos * imp;
      weightedPositionDenominator += imp;
    }
    const avgPosition =
      weightedPositionDenominator > 0 ? weightedPositionNumerator / weightedPositionDenominator : 0;
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;

    const summary: SeoSummary = {
      totalClicks,
      totalImpressions,
      avgPosition,
      avgCtr,
      topQueries,
      topPages,
      daily,
    };

    return jsonResponse(summary, 200, { "cache-control": "private, max-age=300" });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[admin/api/seo] gsc-fetch-failed:", detail);
    return jsonResponse({ error: "gsc-fetch-failed", detail }, 503);
  }
};
