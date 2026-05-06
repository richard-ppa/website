// Cloudflare Pages Function — GET /admin/api/traffic
// Returns last-28-day visitor analytics from the Cloudflare GraphQL Analytics API.

interface Env {
  CLOUDFLARE_API_TOKEN?: string; // Secret
  CLOUDFLARE_ACCOUNT_ID?: string; // Plain
  CLOUDFLARE_ZONE_ID?: string; // Plain
}

interface PagesContext<E> {
  request: Request;
  env: E;
}
type PagesHandler<E> = (context: PagesContext<E>) => Response | Promise<Response>;

interface TrafficSummary {
  totalPageViews: number;
  totalUniques: number;
  totalRequests: number;
  daily: Array<{ date: string; pageViews: number; uniques: number }>;
  // Top-N data is last 24 hours due to Cloudflare free-plan adaptive endpoint limit
  topPagesWindow: "24h";
  topPages: Array<{ path: string; views: number }>;
  topCountries: Array<{ country: string; views: number }>;
  topReferrers: Array<{ referrer: string; views: number }>;
}

const GRAPHQL_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, max-age=300",
      ...(init?.headers || {}),
    },
  });
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function gql<T>(token: string, query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudflare GraphQL HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors && json.errors.length) {
    throw new Error(`Cloudflare GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  if (!json.data) {
    throw new Error("Cloudflare GraphQL returned no data");
  }
  return json.data;
}

interface DailyResp {
  viewer: {
    zones: Array<{
      httpRequests1dGroups: Array<{
        dimensions: { date: string };
        sum: { pageViews: number; requests: number };
        uniq: { uniques: number };
      }>;
    }>;
  };
}

const DAILY_QUERY = /* GraphQL */ `
  query GetDaily($zoneTag: String!, $start: Date!, $end: Date!) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        httpRequests1dGroups(
          limit: 100
          filter: { date_geq: $start, date_leq: $end }
          orderBy: [date_ASC]
        ) {
          dimensions {
            date
          }
          sum {
            pageViews
            requests
          }
          uniq {
            uniques
          }
        }
      }
    }
  }
`;

interface AdaptiveGroup {
  count: number;
  sum?: { visits?: number };
  dimensions: Record<string, string>;
}

interface AdaptiveResp {
  viewer: {
    zones: Array<{
      topPages?: AdaptiveGroup[];
      topCountries?: AdaptiveGroup[];
      topReferrers?: AdaptiveGroup[];
    }>;
  };
}

// Top-N queries use httpRequestsAdaptiveGroups. We split into one query per dimension
// using aliases so a single round-trip is enough.
const ADAPTIVE_QUERY = /* GraphQL */ `
  query GetAdaptive($zoneTag: String!, $start: String!, $end: String!) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        topPages: httpRequestsAdaptiveGroups(
          limit: 20
          filter: {
            datetime_geq: $start
            datetime_leq: $end
            requestSource: "eyeball"

          }
          orderBy: [count_DESC]
        ) {
          count
          dimensions {
            metric: clientRequestPath
          }
        }
        topCountries: httpRequestsAdaptiveGroups(
          limit: 10
          filter: {
            datetime_geq: $start
            datetime_leq: $end
            requestSource: "eyeball"

          }
          orderBy: [count_DESC]
        ) {
          count
          dimensions {
            metric: clientCountryName
          }
        }
      }
    }
  }
`;

export const onRequestGet: PagesHandler<Env> = async ({ env }) => {
  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_ZONE_ID) {
    return jsonResponse(
      { error: "cloudflare-analytics-not-configured" },
      { status: 503, headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const zoneTag = env.CLOUDFLARE_ZONE_ID;
  const token = env.CLOUDFLARE_API_TOKEN;

  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 27); // inclusive 28-day window for daily totals
  const startDate = isoDate(start);
  const endDate = isoDate(end);
  // Adaptive endpoint on free plan is limited to 1-day windows.
  // Use last 24h for top pages/countries/referrers.
  const adaptiveStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const adaptiveEnd = now.toISOString();

  try {
    const [dailyData, adaptiveData] = await Promise.all([
      gql<DailyResp>(token, DAILY_QUERY, {
        zoneTag,
        start: startDate,
        end: endDate,
      }),
      gql<AdaptiveResp>(token, ADAPTIVE_QUERY, {
        zoneTag,
        start: adaptiveStart,
        end: adaptiveEnd,
      }),
    ]);

    const dailyGroups = dailyData.viewer.zones[0]?.httpRequests1dGroups ?? [];

    const daily = dailyGroups.map((g) => ({
      date: g.dimensions.date,
      pageViews: g.sum?.pageViews ?? 0,
      uniques: g.uniq?.uniques ?? 0,
    }));

    let totalPageViews = 0;
    let totalUniques = 0;
    let totalRequests = 0;
    for (const g of dailyGroups) {
      totalPageViews += g.sum?.pageViews ?? 0;
      totalUniques += g.uniq?.uniques ?? 0;
      totalRequests += g.sum?.requests ?? 0;
    }

    const zone = adaptiveData.viewer.zones[0];
    const topPages = (zone?.topPages ?? []).map((g) => ({
      path: g.dimensions.metric || "(unknown)",
      views: g.count,
    }));
    const topCountries = (zone?.topCountries ?? []).map((g) => ({
      country: g.dimensions.metric || "(unknown)",
      views: g.count,
    }));
    const summary: TrafficSummary = {
      totalPageViews,
      totalUniques,
      totalRequests,
      daily,
      topPagesWindow: "24h",
      topPages,
      topCountries,
      topReferrers: [], // not available on free Cloudflare plan
    };

    return jsonResponse(summary);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("traffic.ts: cloudflare analytics fetch failed", detail);
    return jsonResponse(
      { error: "cloudflare-analytics-fetch-failed", detail },
      { status: 503, headers: { "Cache-Control": "private, no-store" } }
    );
  }
};
