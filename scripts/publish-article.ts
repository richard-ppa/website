/**
 * publish-article.ts — flip an article in Supabase from draft to published.
 *
 * Equivalent to clicking the Publish button in the admin CMS, but runnable
 * from the command line. Useful when you want to publish + deploy in a
 * single shell command rather than navigating the admin UI.
 *
 * Run:
 *   npx tsx --env-file-if-exists=.env.local scripts/publish-article.ts <slug>
 * Example:
 *   npx tsx --env-file-if-exists=.env.local scripts/publish-article.ts challenger-300-350-maintenance-guide
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[publish-article] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const slug = process.argv[2];
if (!slug) {
  console.error("[publish-article] Usage: publish-article.ts <slug>");
  process.exit(1);
}

async function main() {
  const now = new Date().toISOString();
  const url = `${SUPABASE_URL}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      status: "published",
      published: true,
      published_at: now,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Publish failed: ${res.status} ${res.statusText}\n${txt}`);
  }
  const data = (await res.json()) as Array<{
    id: string;
    slug: string;
    title: string;
    status: string;
    published: boolean;
    published_at: string;
  }>;
  if (data.length === 0) {
    throw new Error(`No article with slug "${slug}"`);
  }
  const row = data[0];
  console.log(`[publish-article] Published.`);
  console.log(`  slug:         ${row.slug}`);
  console.log(`  id:           ${row.id}`);
  console.log(`  title:        ${row.title}`);
  console.log(`  status:       ${row.status}`);
  console.log(`  published_at: ${row.published_at}`);
}

main().catch((e) => {
  console.error("[publish-article] Failed:", e);
  process.exit(1);
});
