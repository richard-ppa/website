// Cloudflare Pages Function — handles POST to /quote
// Receives the form submission, builds an email, sends via Resend.
// On success: 303 redirect to /quote/thank-you
// On error: 303 redirect to /quote?error=...

interface Env {
  RESEND_API_KEY: string;
}

// Inline type defs so we don't need @cloudflare/workers-types installed
interface PagesContext<E> {
  request: Request;
  env: E;
}
type PagesHandler<E> = (context: PagesContext<E>) => Response | Promise<Response>;

const FROM_ADDRESS = "Plane Place Aviation Quotes <noreply@app.ppa.aero>";
const TO_ADDRESS = "quotes@ppa.aero";
const MAX_TOTAL_BYTES = 25 * 1024 * 1024; // 25MB total — Resend cap is 40MB, leave headroom

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bufferToBase64(buf: ArrayBuffer): string {
  // Cloudflare Workers runtime supports btoa on binary strings
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const onRequestPost: PagesHandler<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const errorRedirect = (code: string) => {
    const target = new URL("/quote", url);
    target.searchParams.set("error", code);
    return Response.redirect(target.toString(), 303);
  };

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorRedirect("invalid-request");
  }

  // Honeypot — bots often fill hidden fields
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    // Pretend success so the bot doesn't retry
    return Response.redirect(new URL("/quote/thank-you", url).toString(), 303);
  }

  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v.trim() : "";
  };

  const name = get("name");
  const company = get("company");
  const email = get("email");
  const phone = get("phone");
  const airframe = get("airframe");
  const nnumber = get("nnumber");
  const service = get("service");
  const timeline = get("timeline");
  const details = get("details");

  // Required fields
  if (!name || !email || !phone || !airframe || !service) {
    return errorRedirect("missing-fields");
  }

  // Basic email shape check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorRedirect("invalid-email");
  }

  // Build attachment list
  const files = formData.getAll("attachments") as File[];
  const attachments: Array<{ filename: string; content: string }> = [];
  let totalBytes = 0;

  for (const file of files) {
    if (!(file instanceof File)) continue;
    if (file.size === 0) continue;
    totalBytes += file.size;
    if (totalBytes > MAX_TOTAL_BYTES) {
      return errorRedirect("attachments-too-large");
    }
    const buf = await file.arrayBuffer();
    attachments.push({
      filename: file.name,
      content: bufferToBase64(buf),
    });
  }

  // Build email — plain HTML table, easy to scan
  const rows: Array<[string, string]> = [
    ["Name", name],
    ["Company", company || "—"],
    ["Email", email],
    ["Phone", phone],
    ["Aircraft", airframe],
    ["N-Number", nnumber || "—"],
    ["Service Needed", service],
    ["Timeline", timeline || "—"],
  ];

  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 16px 8px 0;color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;width:140px;">${escapeHtml(
          k
        )}</td><td style="padding:8px 0;color:#111827;font-size:15px;">${escapeHtml(v)}</td></tr>`
    )
    .join("");

  const detailsBlock = details
    ? `<div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;">
         <div style="color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Additional Details</div>
         <div style="color:#111827;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(details)}</div>
       </div>`
    : "";

  const attachmentsBlock =
    attachments.length > 0
      ? `<div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;">
           <div style="color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Attachments (${attachments.length})</div>
           <ul style="margin:0;padding-left:20px;color:#111827;font-size:14px;">
             ${attachments.map((a) => `<li>${escapeHtml(a.filename)}</li>`).join("")}
           </ul>
         </div>`
      : "";

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 24px;">
    <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;font-weight:600;margin-bottom:8px;">New Quote Request</div>
      <h1 style="margin:0 0 24px 0;font-size:24px;color:#111827;">${escapeHtml(name)}${
        company ? ` — ${escapeHtml(company)}` : ""
      }</h1>
      <table style="width:100%;border-collapse:collapse;">
        <tbody>${tableRows}</tbody>
      </table>
      ${detailsBlock}
      ${attachmentsBlock}
    </div>
    <div style="margin-top:16px;text-align:center;color:#9ca3af;font-size:12px;">
      Submitted via the quote form on <a href="https://ppa.aero/quote" style="color:#9ca3af;">ppa.aero/quote</a>
    </div>
  </div>
</body></html>`;

  // Plain-text fallback
  const text =
    `New Quote Request\n\n` +
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    (details ? `\n\nAdditional Details:\n${details}` : "") +
    (attachments.length > 0
      ? `\n\nAttachments:\n${attachments.map((a) => `- ${a.filename}`).join("\n")}`
      : "");

  // Send via Resend
  const resendBody: Record<string, unknown> = {
    from: FROM_ADDRESS,
    to: [TO_ADDRESS],
    reply_to: email,
    subject: `Quote Request: ${name}${company ? ` (${company})` : ""} — ${airframe}`,
    html,
    text,
  };
  if (attachments.length > 0) {
    resendBody.attachments = attachments;
  }

  let resendRes: Response;
  try {
    resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendBody),
    });
  } catch {
    return errorRedirect("send-failed");
  }

  if (!resendRes.ok) {
    // Log to Cloudflare Workers console so we can debug from the dashboard
    const body = await resendRes.text();
    console.error("Resend API error", resendRes.status, body);
    return errorRedirect("send-failed");
  }

  return Response.redirect(new URL("/quote/thank-you", url).toString(), 303);
};
