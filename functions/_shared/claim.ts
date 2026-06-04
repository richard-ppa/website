// Claim helpers — sign/verify per-recipient claim URLs for part-request emails.
//
// Each named recipient (Jillian, Wilbert) gets a personalized HMAC-signed URL
// in the quote email. Clicking it lands on /claim where they confirm they're
// handling the request; the system records the claim in KV and notifies the
// rest of the team. URLs expire after 30 days.

// Members of the quotes@ppa.aero distribution list. They all receive every
// quote email (regardless of service category) and all get personalized claim
// links to coordinate who's responding.
export const CLAIMERS = {
  tristan: { email: "tristan@ppa.aero", name: "Tristan" },
  travis: { email: "travis@ppa.aero", name: "Travis" },
  "ron-larson": { email: "ron@ppa.aero", name: "Ron Larson" },
  "ron-reiling": { email: "rr@ppa.aero", name: "Ron Reiling" },
  james: { email: "james@ppa.aero", name: "James" },
} as const;

export type ClaimerKey = keyof typeof CLAIMERS;

// Display order for claim links in the email (kept stable regardless of object
// iteration order).
export const CLAIMER_KEYS: readonly ClaimerKey[] = [
  "tristan",
  "travis",
  "ron-larson",
  "ron-reiling",
  "james",
];

// Recipients of the claim-notification email — same as who got the original
// quote email. quotes@ is a distribution list that fans out to all 5 members.
export const QUOTE_NOTIFY = ["quotes@ppa.aero"] as const;

const CLAIM_URL_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

async function hmacSign(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function buildClaimUrl(
  origin: string,
  leadId: string,
  claimer: ClaimerKey,
  secret: string
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + CLAIM_URL_TTL_SECONDS;
  const sig = await hmacSign(`${leadId}|${claimer}|${exp}`, secret);
  return `${origin}/claim?lead=${leadId}&who=${claimer}&exp=${exp}&sig=${sig}`;
}

export type VerifyResult =
  | { ok: true; claimer: ClaimerKey }
  | { ok: false; reason: "missing-params" | "unknown-claimer" | "bad-exp" | "expired" | "bad-sig" };

export async function verifyClaimParams(
  leadId: string,
  claimer: string,
  exp: string,
  sig: string,
  secret: string
): Promise<VerifyResult> {
  if (!leadId || !claimer || !exp || !sig) return { ok: false, reason: "missing-params" };
  if (!(claimer in CLAIMERS)) return { ok: false, reason: "unknown-claimer" };
  const expNum = parseInt(exp, 10);
  if (!Number.isFinite(expNum)) return { ok: false, reason: "bad-exp" };
  if (expNum < Math.floor(Date.now() / 1000)) return { ok: false, reason: "expired" };
  const expectedSig = await hmacSign(`${leadId}|${claimer}|${exp}`, secret);
  if (expectedSig !== sig) return { ok: false, reason: "bad-sig" };
  return { ok: true, claimer: claimer as ClaimerKey };
}

export interface ClaimRecord {
  who: ClaimerKey;
  name: string;
  email: string;
  ts: string; // ISO timestamp
}

export function claimKey(leadId: string): string {
  return `claim:${leadId}`;
}
