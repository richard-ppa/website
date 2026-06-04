// Cloudflare Pages Function — handles GET/POST /claim
//
// GET  /claim?lead=...&who=...&exp=...&sig=...
//   Verifies the HMAC link. If already claimed, shows who has it. Otherwise
//   renders a confirmation form for the named recipient.
//
// POST /claim?lead=...&who=...&exp=...&sig=...
//   Records the claim in KV (claim:{leadId}), sends a notification email to
//   the rest of the team, renders a success page. If somebody else has
//   already claimed, returns the "already claimed" view instead.
//
// Claim links are HMAC-signed with FILE_SIGNING_SECRET and expire after 30
// days — same secret used for quote-attachment download URLs.

import {
  CLAIMERS,
  QUOTE_NOTIFY,
  claimKey,
  verifyClaimParams,
  type ClaimRecord,
} from "./_shared/claim";

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  RESEND_API_KEY: string;
  FILE_SIGNING_SECRET: string;
  LEADS_KV?: KVNamespace;
}

interface PagesContext<E> {
  request: Request;
  env: E;
}
type PagesHandler<E> = (context: PagesContext<E>) => Response | Promise<Response>;

const FROM_ADDRESS = "Plane Place Aviation Quotes <noreply@app.ppa.aero>";
const CLAIM_RECORD_TTL = 60 * 60 * 24 * 90; // 90 days — matches lead record TTL

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface LeadSummary {
  customerName?: string;
  customerEmail?: string;
  company?: string;
  airframe?: string;
  service?: string;
}

async function loadLead(kv: KVNamespace, leadId: string): Promise<LeadSummary | null> {
  const raw = await kv.get(`record:${leadId}`);
  if (!raw) return null;
  try {
    const r = JSON.parse(raw) as {
      name?: string;
      email?: string;
      company?: string;
      airframe?: string;
      service?: string;
    };
    return {
      customerName: r.name,
      customerEmail: r.email,
      company: r.company,
      airframe: r.airframe,
      service: r.service,
    };
  } catch {
    return null;
  }
}

// Build a mailto: URL pre-filled with the customer's address, a subject line
// tied to the request type, and a templated greeting with an editable
// "[Add your response here]" placeholder. Clicking opens whatever mail client
// is registered as the OS default (Outlook on most PPA workstations).
function buildReplyMailto(lead: LeadSummary | null, claimerName: string): string | null {
  if (!lead?.customerEmail) return null;
  const isPart = lead.service === "parts";
  const requestNoun = isPart ? "Part Request" : "Quote Request";
  const aircraftSuffix = lead.airframe ? ` (${lead.airframe})` : "";
  const subject = `Plane Place Aviation — Re: ${requestNoun}${aircraftSuffix}`;

  const firstName = (lead.customerName || "").trim().split(/\s+/)[0] || "there";
  const aircraftPhrase = lead.airframe
    ? `your ${lead.airframe} ${requestNoun.toLowerCase()}`
    : `your ${requestNoun.toLowerCase()}`;

  const body =
    `Hi ${firstName},\n\n` +
    `Thanks for reaching out to Plane Place Aviation regarding ${aircraftPhrase}.\n\n` +
    `[Add your response here]\n\n` +
    `Best,\n${claimerName}\nPlane Place Aviation\n`;

  return `mailto:${encodeURIComponent(lead.customerEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

function replyButtonBlock(lead: LeadSummary | null, claimerName: string): string {
  const mailto = buildReplyMailto(lead, claimerName);
  if (!mailto) return "";
  const customerName = lead?.customerName ? escapeHtml(lead.customerName) : "customer";
  return `<a class="reply-btn" href="${escapeHtml(mailto)}">Reply to ${customerName}</a>
          <p class="reply-hint">Opens a new email in your default mail app (Outlook on most workstations).</p>`;
}

function customerLine(lead: LeadSummary | null): string {
  if (!lead?.customerName) return "";
  const bits = [lead.customerName];
  if (lead.company) bits.push(`— ${lead.company}`);
  const airframe = lead.airframe ? ` (${lead.airframe})` : "";
  return `<p class="meta">Customer: ${escapeHtml(bits.join(" "))}${escapeHtml(airframe)}</p>`;
}

function renderPage(title: string, body: string, opts: { error?: boolean } = {}): Response {
  const accent = opts.error ? "#b91c1c" : "#b45309";
  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} — Plane Place Aviation</title>
<style>
  body { margin: 0; padding: 0; background: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; line-height: 1.6; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 64px 24px; }
  .card { background: #fff; border: 1px solid #e5e7eb; padding: 40px; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: ${accent}; font-weight: 600; margin-bottom: 12px; }
  h1 { font-size: 26px; margin: 0 0 16px; color: #111827; font-weight: 600; line-height: 1.25; }
  p { font-size: 15px; color: #374151; margin: 0 0 12px; }
  p.meta { font-size: 13px; color: #6b7280; margin-top: 16px; }
  form { margin: 24px 0 0; }
  button { background: ${accent}; color: #fff; border: none; padding: 14px 28px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; }
  button:hover { background: #92400e; }
  .cancel { display: inline-block; margin-left: 12px; color: #6b7280; font-size: 14px; text-decoration: none; vertical-align: middle; }
  .home { display: inline-block; margin-top: 24px; color: ${accent}; text-decoration: none; font-size: 14px; }
  .reply-btn { display: inline-block; margin-top: 28px; padding: 14px 28px; background: ${accent}; color: #fff; text-decoration: none; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .reply-btn:hover { background: #92400e; }
  .reply-hint { font-size: 12px; color: #6b7280; margin: 10px 0 0; }
</style>
</head><body>
<div class="wrap"><div class="card">${body}</div></div>
</body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

function invalidLinkPage(reason: string): Response {
  return renderPage(
    "Invalid link",
    `<div class="label">Link not valid</div>
     <h1>This claim link can't be used.</h1>
     <p>${escapeHtml(reason === "expired" ? "This link has expired. Claim links are valid for 30 days." : `Reason: ${reason}.`)}</p>
     <p>To coordinate with the team, reply directly to the original quote email.</p>
     <a class="home" href="https://ppa.aero/">Back to ppa.aero</a>`,
    { error: true }
  );
}

function alreadyClaimedPage(
  existing: ClaimRecord,
  lead: LeadSummary | null,
  viewerIsClaimer: boolean
): Response {
  const when = new Date(existing.ts).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  // If the viewer IS the claimer, show the reply button — they're probably
  // revisiting the link to send their reply.
  if (viewerIsClaimer) {
    return renderPage(
      "Already yours",
      `<div class="label">Confirmed</div>
       <h1>You've got this one.</h1>
       <p>Claimed ${escapeHtml(when)}. The team was notified at that time.</p>
       ${customerLine(lead)}
       ${replyButtonBlock(lead, existing.name)}
       <br><a class="home" href="https://ppa.aero/">Back to ppa.aero</a>`
    );
  }
  return renderPage(
    "Already claimed",
    `<div class="label">Already claimed</div>
     <h1>${escapeHtml(existing.name)} is on this one.</h1>
     <p>Claimed ${escapeHtml(when)}.</p>
     ${customerLine(lead)}
     <a class="home" href="https://ppa.aero/">Back to ppa.aero</a>`
  );
}

export const onRequestGet: PagesHandler<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const leadId = url.searchParams.get("lead") || "";
  const who = url.searchParams.get("who") || "";
  const exp = url.searchParams.get("exp") || "";
  const sig = url.searchParams.get("sig") || "";

  const verified = await verifyClaimParams(leadId, who, exp, sig, env.FILE_SIGNING_SECRET);
  if (!verified.ok) return invalidLinkPage(verified.reason);

  const claimer = CLAIMERS[verified.claimer];
  const lead = env.LEADS_KV ? await loadLead(env.LEADS_KV, leadId) : null;

  // Already claimed?
  if (env.LEADS_KV) {
    const existingRaw = await env.LEADS_KV.get(claimKey(leadId));
    if (existingRaw) {
      try {
        const existing = JSON.parse(existingRaw) as ClaimRecord;
        return alreadyClaimedPage(existing, lead, existing.who === verified.claimer);
      } catch {
        /* malformed, fall through to claim form */
      }
    }
  }

  const action = `/claim?lead=${encodeURIComponent(leadId)}&who=${encodeURIComponent(
    who
  )}&exp=${encodeURIComponent(exp)}&sig=${encodeURIComponent(sig)}`;

  return renderPage(
    "Claim part request",
    `<div class="label">Part request</div>
     <h1>${escapeHtml(claimer.name)}, ready to take this one?</h1>
     <p>Click confirm and the rest of the team will get an email letting them know you've got it.</p>
     ${customerLine(lead)}
     <form method="POST" action="${action}">
       <button type="submit">Confirm — I'm handling this</button>
       <a class="cancel" href="https://ppa.aero/">Cancel</a>
     </form>`
  );
};

export const onRequestPost: PagesHandler<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const leadId = url.searchParams.get("lead") || "";
  const who = url.searchParams.get("who") || "";
  const exp = url.searchParams.get("exp") || "";
  const sig = url.searchParams.get("sig") || "";

  const verified = await verifyClaimParams(leadId, who, exp, sig, env.FILE_SIGNING_SECRET);
  if (!verified.ok) return invalidLinkPage(verified.reason);

  const claimer = CLAIMERS[verified.claimer];

  if (!env.LEADS_KV) {
    return renderPage(
      "Tracking unavailable",
      `<div class="label">Storage offline</div>
       <h1>Couldn't record this claim.</h1>
       <p>Lead tracking storage isn't configured. Reply to the email to coordinate with the team manually.</p>
       <a class="home" href="https://ppa.aero/">Back to ppa.aero</a>`,
      { error: true }
    );
  }

  const ck = claimKey(leadId);
  const lead = await loadLead(env.LEADS_KV, leadId);

  const existingRaw = await env.LEADS_KV.get(ck);
  if (existingRaw) {
    try {
      const existing = JSON.parse(existingRaw) as ClaimRecord;
      // Same person re-confirming? Treat as success without re-notifying — and
      // still surface the reply-to-customer button.
      if (existing.who === verified.claimer) {
        return renderPage(
          "Already yours",
          `<div class="label">Confirmed</div>
           <h1>You've already claimed this one.</h1>
           <p>The team was notified when you first confirmed.</p>
           ${customerLine(lead)}
           ${replyButtonBlock(lead, claimer.name)}
           <br><a class="home" href="https://ppa.aero/">Back to ppa.aero</a>`
        );
      }
      // Someone else got there first.
      return alreadyClaimedPage(existing, lead, false);
    } catch {
      /* fall through and overwrite the malformed record */
    }
  }

  const record: ClaimRecord = {
    who: verified.claimer,
    name: claimer.name,
    email: claimer.email,
    ts: new Date().toISOString(),
  };
  await env.LEADS_KV.put(ck, JSON.stringify(record), { expirationTtl: CLAIM_RECORD_TTL });

  // Notify the team. Best-effort: a Resend failure shouldn't block the claim.
  try {
    await sendClaimNotification(env, claimer, lead);
  } catch (e) {
    console.error("Claim notification send failed", e);
  }

  return renderPage(
    "Got it",
    `<div class="label">Confirmed</div>
     <h1>You've got it, ${escapeHtml(claimer.name)}.</h1>
     <p>The rest of the team has been notified.</p>
     ${customerLine(lead)}
     ${replyButtonBlock(lead, claimer.name)}
     <br><a class="home" href="https://ppa.aero/">Back to ppa.aero</a>`
  );
};

async function sendClaimNotification(
  env: Env,
  claimer: { email: string; name: string },
  lead: LeadSummary | null
): Promise<void> {
  const isPart = lead?.service === "parts";
  const noun = isPart ? "part request" : "quote request";

  const customerLabel = lead?.customerName
    ? `${lead.customerName}${lead.company ? ` (${lead.company})` : ""}${
        lead.airframe ? ` — ${lead.airframe}` : ""
      }`
    : `the ${noun}`;

  const subject = `[Claimed by ${claimer.name}] ${
    isPart ? "Part request" : "Quote request"
  } — ${lead?.customerName ?? "details in original email"}`;

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#059669;font-weight:600;margin-bottom:8px;">Claimed</div>
      <h1 style="margin:0 0 16px;font-size:22px;color:#111827;font-weight:600;">${escapeHtml(
        claimer.name
      )} is handling ${escapeHtml(customerLabel)}.</h1>
      <p style="margin:0;font-size:14px;color:#4b5563;line-height:1.6;">No action needed from anyone else. ${escapeHtml(
        claimer.name
      )} will respond directly to the customer using the original quote email.</p>
    </div>
  </div>
</body></html>`;

  const text = `${claimer.name} is handling ${customerLabel}.\n\nNo action needed from anyone else. ${claimer.name} will respond directly to the customer using the original quote email.`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: QUOTE_NOTIFY,
      subject,
      html,
      text,
    }),
  });
  if (!res.ok) {
    console.error("Resend API error (claim notification)", res.status, await res.text().catch(() => ""));
  }
}
