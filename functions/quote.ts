// Cloudflare Pages Function — handles POST to /quote
//
// Sync phase (user waits):
//  1. Validate Turnstile token
//  2. Honeypot + required-field checks
//  3. Validate each file (extension, magic bytes, size, sanitized filename)
//  4. Upload clean-pending files to R2 (held privately; URL never shared yet)
//  5. Redirect user to /quote/thank-you immediately
//
// Async phase (ctx.waitUntil — runs after response is returned):
//  6. Scan each file with VirusTotal
//  7. If any malicious: delete from R2, send admin alert email
//  8. Otherwise: build HMAC-signed download URLs, send normal admin email
//  9. Record lead in KV
//
// Customer experience: ~2-4s submit instead of 15+s. Email arrives 10-15s
// after the redirect. No download URLs leak before scan completes because the
// URLs are only generated post-scan and only included in the admin email.

interface R2PutOptions {
  httpMetadata?: {
    contentType?: string;
    contentDisposition?: string;
  };
  customMetadata?: Record<string, string>;
}
interface R2Bucket {
  put(key: string, value: ArrayBuffer | ReadableStream | string, options?: R2PutOptions): Promise<unknown>;
  get(key: string): Promise<unknown>;
  delete(key: string): Promise<void>;
}

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<unknown>;
}

interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  VIRUSTOTAL_API_KEY: string;
  FILE_SIGNING_SECRET: string;
  QUOTE_FILES: R2Bucket;
  LEADS_KV?: KVNamespace; // Optional — admin dashboard tracking
}

interface PagesContext<E> {
  request: Request;
  env: E;
  waitUntil(promise: Promise<unknown>): void;
}
type PagesHandler<E> = (context: PagesContext<E>) => Response | Promise<Response>;

const FROM_ADDRESS = "Plane Place Aviation Quotes <noreply@app.ppa.aero>";
const TO_ADDRESS = "quotes@ppa.aero";
const ALLOWED_EXTENSIONS = ["pdf", "xls", "xlsx"] as const;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB per file
const MAX_FILES = 5;
const MAX_TOTAL_BYTES = 25 * 1024 * 1024; // 25MB total
const VT_POLL_MAX_ATTEMPTS = 12; // 12 × 2s = 24s
const VT_POLL_INTERVAL_MS = 2000;
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

// Mirror of src/lib/quoteFormLabels.ts — kept inline so this Pages Function
// bundles cleanly without cross-package imports. Update both if you change.
const SERVICE_LABELS: Record<string, string> = {
  scheduled: "Scheduled Maintenance / Phase Inspection",
  ppi: "Pre-Purchase Inspection",
  aog: "AOG / Emergency Service",
  structural: "Structural Repair",
  avionics: "Avionics",
  management: "Maintenance Management",
  other: "Other",
};
const TIMELINE_LABELS: Record<string, string> = {
  asap: "ASAP / AOG",
  "30days": "Within 30 days",
  "60days": "Within 60 days",
  "90days": "Within 90 days",
  planning: "Just planning ahead",
};
const serviceLabel = (v: string): string => (v ? SERVICE_LABELS[v] ?? v : "");
const timelineLabel = (v: string): string => (v ? TIMELINE_LABELS[v] ?? v : "");

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeFilename(name: string): string {
  // Strip path separators, control chars, leading dots; trim length
  const cleaned = name
    .replace(/[/\\]/g, "_")
    .replace(/[\x00-\x1f]/g, "")
    .replace(/^\.+/, "")
    .trim();
  return cleaned.length > 100 ? cleaned.slice(0, 100) : cleaned || "file";
}

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx + 1).toLowerCase();
}

// Magic-byte check — verifies file content matches its claimed extension
function checkMagicBytes(bytes: Uint8Array, ext: string): boolean {
  if (bytes.length < 8) return false;
  if (ext === "pdf") {
    // %PDF-
    return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
  }
  if (ext === "xls") {
    // OLE compound document: D0 CF 11 E0 A1 B1 1A E1
    return (
      bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0 &&
      bytes[4] === 0xa1 && bytes[5] === 0xb1 && bytes[6] === 0x1a && bytes[7] === 0xe1
    );
  }
  if (ext === "xlsx") {
    // ZIP archive: PK\x03\x04 (XLSX is a zip)
    return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
  }
  return false;
}

function uuidv4(): string {
  return crypto.randomUUID();
}

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
  // URL-safe base64
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function buildSignedUrl(origin: string, fileId: string, secret: string): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS;
  const sig = await hmacSign(`${fileId}|${expires}`, secret);
  return `${origin}/files/${fileId}?expires=${expires}&signature=${sig}`;
}

interface VTAnalysisStats {
  malicious: number;
  suspicious: number;
  undetected: number;
  harmless: number;
  failure: number;
  "type-unsupported": number;
  timeout: number;
}
interface VTAnalysisResult {
  attributes: {
    status: "queued" | "in-progress" | "completed";
    stats?: VTAnalysisStats;
  };
}

type ScanResult = { ok: true } | { ok: false; reason: string };

async function scanWithVirusTotal(
  fileBytes: ArrayBuffer,
  filename: string,
  apiKey: string
): Promise<ScanResult> {
  // Upload file
  const form = new FormData();
  form.append("file", new Blob([fileBytes]), filename);

  let analysisId: string;
  try {
    const upload = await fetch("https://www.virustotal.com/api/v3/files", {
      method: "POST",
      headers: { "x-apikey": apiKey },
      body: form,
    });
    if (!upload.ok) {
      return { ok: false, reason: `vt-upload-${upload.status}` };
    }
    const json = (await upload.json()) as { data?: { id?: string } };
    analysisId = json.data?.id || "";
    if (!analysisId) return { ok: false, reason: "vt-no-analysis-id" };
  } catch {
    return { ok: false, reason: "vt-upload-failed" };
  }

  // Poll for completion
  for (let i = 0; i < VT_POLL_MAX_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, VT_POLL_INTERVAL_MS));
    try {
      const res = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
        headers: { "x-apikey": apiKey },
      });
      if (!res.ok) continue;
      const json = (await res.json()) as { data?: VTAnalysisResult };
      const data = json.data;
      if (!data) continue;
      if (data.attributes.status === "completed") {
        const stats = data.attributes.stats;
        if (!stats) return { ok: false, reason: "vt-no-stats" };
        if (stats.malicious > 0 || stats.suspicious > 0) {
          return { ok: false, reason: "virus-detected" };
        }
        return { ok: true };
      }
    } catch {
      continue;
    }
  }
  return { ok: false, reason: "vt-timeout" };
}

async function verifyTurnstile(token: string, secret: string, remoteIp: string): Promise<boolean> {
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: remoteIp }),
    });
    if (!res.ok) {
      console.error("Turnstile siteverify HTTP error", res.status, await res.text().catch(() => ""));
      return false;
    }
    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    if (data.success !== true) {
      console.error("Turnstile validation failed", { errorCodes: data["error-codes"] });
    }
    return data.success === true;
  } catch (e) {
    console.error("Turnstile siteverify threw", e);
    return false;
  }
}

interface QuoteFields {
  name: string;
  company: string;
  email: string;
  phone: string;
  airframe: string;
  nnumber: string;
  service: string;
  timeline: string;
  details: string;
}

interface StagedFile {
  buf: ArrayBuffer;
  filename: string;
  fileId: string;
  r2Key: string;
  sizeBytes: number;
}

function buildQuoteEmailHtml(fields: QuoteFields, attachments: Array<{ filename: string; sizeBytes: number; downloadUrl: string }>, banner?: string): string {
  const formatBytes = (b: number): string => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const rows: Array<[string, string]> = [
    ["Name", fields.name],
    ["Company", fields.company || "—"],
    ["Email", fields.email],
    ["Phone", fields.phone],
    ["Aircraft", fields.airframe],
    ["N-Number", fields.nnumber || "—"],
    ["Service Needed", serviceLabel(fields.service)],
    ["Timeline", fields.timeline ? timelineLabel(fields.timeline) : "—"],
  ];

  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 16px 8px 0;color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;width:140px;">${escapeHtml(
          k
        )}</td><td style="padding:8px 0;color:#111827;font-size:15px;">${escapeHtml(v)}</td></tr>`
    )
    .join("");

  const detailsBlock = fields.details
    ? `<div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;">
         <div style="color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Additional Details</div>
         <div style="color:#111827;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(fields.details)}</div>
       </div>`
    : "";

  const attachmentsBlock =
    attachments.length > 0
      ? `<div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;">
           <div style="color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Attachments (${attachments.length}) — virus-scanned, expire in 30 days</div>
           <ul style="margin:0;padding:0;list-style:none;">
             ${attachments
               .map(
                 (p) =>
                   `<li style="margin-bottom:10px;padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;">
                      <div style="font-size:14px;color:#111827;font-weight:500;">${escapeHtml(p.filename)}</div>
                      <div style="font-size:12px;color:#6b7280;margin-top:2px;">${formatBytes(p.sizeBytes)}</div>
                      <a href="${escapeHtml(p.downloadUrl)}" style="display:inline-block;margin-top:6px;color:#b45309;font-size:13px;text-decoration:underline;">Download file</a>
                    </li>`
               )
               .join("")}
           </ul>
         </div>`
      : "";

  const bannerBlock = banner
    ? `<div style="margin:0 0 16px 0;padding:12px 16px;background:#fef3c7;border:1px solid #fcd34d;color:#78350f;font-size:13px;line-height:1.5;">${escapeHtml(banner)}</div>`
    : "";

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 24px;">
    <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;">
      ${bannerBlock}
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;font-weight:600;margin-bottom:8px;">New Quote Request</div>
      <h1 style="margin:0 0 24px 0;font-size:24px;color:#111827;">${escapeHtml(fields.name)}${
        fields.company ? ` — ${escapeHtml(fields.company)}` : ""
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
}

function buildQuoteEmailText(fields: QuoteFields, attachments: Array<{ filename: string; sizeBytes: number; downloadUrl: string }>, banner?: string): string {
  const formatBytes = (b: number): string => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };
  const rows: Array<[string, string]> = [
    ["Name", fields.name],
    ["Company", fields.company || "—"],
    ["Email", fields.email],
    ["Phone", fields.phone],
    ["Aircraft", fields.airframe],
    ["N-Number", fields.nnumber || "—"],
    ["Service Needed", serviceLabel(fields.service)],
    ["Timeline", fields.timeline ? timelineLabel(fields.timeline) : "—"],
  ];
  return (
    (banner ? `${banner}\n\n` : "") +
    `New Quote Request\n\n` +
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    (fields.details ? `\n\nAdditional Details:\n${fields.details}` : "") +
    (attachments.length > 0
      ? `\n\nAttachments (${attachments.length}) — virus-scanned, expire in 30 days:\n${attachments
          .map((p) => `- ${p.filename} (${formatBytes(p.sizeBytes)})\n  ${p.downloadUrl}`)
          .join("\n")}`
      : "")
  );
}

async function sendEmail(env: Env, subject: string, html: string, text: string, replyTo: string): Promise<void> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [TO_ADDRESS],
        reply_to: replyTo,
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("Resend API error", res.status, body);
    }
  } catch (e) {
    console.error("Resend API threw", e);
  }
}

async function processSubmission(
  env: Env,
  origin: string,
  fields: QuoteFields,
  staged: StagedFile[]
): Promise<void> {
  // Scan files (if any)
  const scanResults: ScanResult[] = [];
  if (staged.length > 0) {
    if (!env.VIRUSTOTAL_API_KEY) {
      console.error("VIRUSTOTAL_API_KEY not configured — skipping scan");
      // Treat as inconclusive: send email but flag
      for (let i = 0; i < staged.length; i++) scanResults.push({ ok: false, reason: "no-api-key" });
    } else {
      const results = await Promise.all(
        staged.map((f) => scanWithVirusTotal(f.buf, f.filename, env.VIRUSTOTAL_API_KEY))
      );
      scanResults.push(...results);
    }
  }

  // Any malicious file? Reject the whole submission.
  const malicious = scanResults
    .map((r, i) => ({ r, file: staged[i] }))
    .filter((x) => !x.r.ok && (x.r as { reason: string }).reason === "virus-detected");

  if (malicious.length > 0) {
    // Delete every staged file (including any that scanned clean) — we're rejecting the whole submission.
    await Promise.all(
      staged.map((f) =>
        env.QUOTE_FILES.delete(f.r2Key).catch((e) => {
          console.error("R2 delete failed", f.r2Key, e);
        })
      )
    );
    const subject = `[REJECTED — malicious file] Quote submission from ${fields.name}`;
    const banner =
      `WARNING: One or more attachments were flagged as malicious by VirusTotal and have been deleted from storage. ` +
      `Files: ${malicious.map((m) => m.file.filename).join(", ")}. The customer was shown a success page; you may want to follow up directly.`;
    const html = buildQuoteEmailHtml(fields, [], banner);
    const text = buildQuoteEmailText(fields, [], banner);
    await sendEmail(env, subject, html, text, fields.email);
    return;
  }

  // No virus detected — proceed. Build download URLs for the email.
  const attachments = await Promise.all(
    staged.map(async (f) => ({
      filename: f.filename,
      sizeBytes: f.sizeBytes,
      downloadUrl: await buildSignedUrl(origin, f.fileId, env.FILE_SIGNING_SECRET),
    }))
  );

  // If scan had non-virus failures (timeout, api error), flag the email so admin knows
  const inconclusiveCount = scanResults.filter((r) => !r.ok).length;
  const banner =
    inconclusiveCount > 0
      ? `Note: ${inconclusiveCount} attachment scan${inconclusiveCount === 1 ? "" : "s"} did not complete (${scanResults
          .filter((r) => !r.ok)
          .map((r) => (r as { reason: string }).reason)
          .join(", ")}). Files were uploaded but VirusTotal could not confirm they are clean — review before opening.`
      : undefined;

  const subject = `Quote Request: ${fields.name}${fields.company ? ` (${fields.company})` : ""} — ${fields.airframe}`;
  const html = buildQuoteEmailHtml(fields, attachments, banner);
  const text = buildQuoteEmailText(fields, attachments, banner);
  await sendEmail(env, subject, html, text, fields.email);

  // Record lead
  if (env.LEADS_KV) {
    try {
      const { recordLead } = await import("./_shared/leads");
      await recordLead(env.LEADS_KV, {
        id: uuidv4(),
        type: "quote",
        ts: new Date().toISOString(),
        name: fields.name,
        company: fields.company,
        email: fields.email,
        phone: fields.phone,
        airframe: fields.airframe,
        service: fields.service,
        timeline: fields.timeline,
        attachments: staged.length,
      });
    } catch (e) {
      console.error("Lead tracking write failed", e);
    }
  }
}

export const onRequestPost: PagesHandler<Env> = async (ctx) => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const errorRedirect = (code: string, detail?: string) => {
    const target = new URL("/quote", url);
    target.searchParams.set("error", code);
    if (detail) target.searchParams.set("detail", detail);
    return Response.redirect(target.toString(), 303);
  };

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorRedirect("invalid-request");
  }

  // Honeypot
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return Response.redirect(new URL("/quote/thank-you", url).toString(), 303);
  }

  // Turnstile validation (sync — must reject bots before we do anything else)
  const turnstileToken = formData.get("cf-turnstile-response");
  if (typeof turnstileToken !== "string" || !turnstileToken) {
    return errorRedirect("turnstile-failed");
  }
  const remoteIp = request.headers.get("CF-Connecting-IP") || "";
  const turnstileOk = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, remoteIp);
  if (!turnstileOk) return errorRedirect("turnstile-failed");

  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v.trim() : "";
  };

  const fields: QuoteFields = {
    name: get("name"),
    company: get("company"),
    email: get("email"),
    phone: get("phone"),
    airframe: get("airframe"),
    nnumber: get("nnumber"),
    service: get("service"),
    timeline: get("timeline"),
    details: get("details"),
  };

  if (!fields.name || !fields.email || !fields.phone || !fields.airframe || !fields.service) {
    return errorRedirect("missing-fields");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return errorRedirect("invalid-email");
  }

  // Process attachments
  const rawFiles = formData.getAll("attachments") as File[];
  const realFiles = rawFiles.filter((f) => f instanceof File && f.size > 0);

  if (realFiles.length > MAX_FILES) {
    return errorRedirect("too-many-files");
  }

  let totalBytes = 0;
  for (const f of realFiles) totalBytes += f.size;
  if (totalBytes > MAX_TOTAL_BYTES) {
    return errorRedirect("attachments-too-large");
  }

  // Validate + upload each file synchronously. Scan happens in waitUntil.
  const staged: StagedFile[] = [];
  for (const file of realFiles) {
    if (file.size > MAX_FILE_BYTES) {
      return errorRedirect("file-too-large");
    }

    const safeName = sanitizeFilename(file.name);
    const ext = getExtension(safeName);
    if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
      return errorRedirect("file-type-not-allowed");
    }

    const buf = await file.arrayBuffer();
    const head = new Uint8Array(buf.slice(0, 8));
    if (!checkMagicBytes(head, ext)) {
      return errorRedirect("file-magic-mismatch");
    }

    const fileId = uuidv4();
    const r2Key = `attachments/${fileId}`;
    try {
      await env.QUOTE_FILES.put(r2Key, buf, {
        httpMetadata: {
          contentType: file.type || "application/octet-stream",
          contentDisposition: `attachment; filename="${safeName}"`,
        },
        customMetadata: {
          originalFilename: safeName,
          uploaderName: fields.name.slice(0, 200),
          uploaderEmail: fields.email.slice(0, 200),
          uploaderCompany: fields.company.slice(0, 200),
          uploadedAt: new Date().toISOString(),
        },
      });
    } catch {
      return errorRedirect("storage-failed");
    }

    staged.push({ buf, filename: safeName, fileId, r2Key, sizeBytes: file.size });
  }

  // Defer scan + email + KV write so the customer doesn't wait on VirusTotal.
  ctx.waitUntil(processSubmission(env, url.origin, fields, staged));

  return Response.redirect(new URL("/quote/thank-you", url).toString(), 303);
};
