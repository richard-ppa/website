// Cloudflare Pages Function — handles POST to /quote
//
// Flow:
//  1. Validate Turnstile token (server-side)
//  2. Honeypot + required-field checks
//  3. Validate each file (extension, magic bytes, size, sanitized filename)
//  4. Scan each file with VirusTotal (synchronous polling, ~25s budget)
//  5. Upload clean files to R2 with UUID keys
//  6. Build HMAC-signed download URLs (30-day expiry)
//  7. Send email via Resend with download links (NOT attachments)

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
  let b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
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

async function scanWithVirusTotal(
  fileBytes: ArrayBuffer,
  filename: string,
  apiKey: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
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
    if (!res.ok) return false;
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
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

  // Honeypot
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return Response.redirect(new URL("/quote/thank-you", url).toString(), 303);
  }

  // Turnstile validation
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

  const name = get("name");
  const company = get("company");
  const email = get("email");
  const phone = get("phone");
  const airframe = get("airframe");
  const nnumber = get("nnumber");
  const service = get("service");
  const timeline = get("timeline");
  const details = get("details");

  if (!name || !email || !phone || !airframe || !service) {
    return errorRedirect("missing-fields");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

  // Validate, scan, upload
  type ProcessedFile = {
    fileId: string;
    filename: string;
    sizeBytes: number;
    downloadUrl: string;
  };
  const processed: ProcessedFile[] = [];

  for (const file of realFiles) {
    // Per-file size
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

    // VirusTotal scan
    const scan = await scanWithVirusTotal(buf, safeName, env.VIRUSTOTAL_API_KEY);
    if (!scan.ok) {
      console.error("VirusTotal scan failed", scan.reason, safeName);
      if (scan.reason === "virus-detected") return errorRedirect("virus-detected");
      return errorRedirect("scan-failed");
    }

    // Upload to R2
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
          uploaderName: name.slice(0, 200),
          uploaderEmail: email.slice(0, 200),
          uploaderCompany: company.slice(0, 200),
          uploadedAt: new Date().toISOString(),
        },
      });
    } catch {
      return errorRedirect("storage-failed");
    }

    const downloadUrl = await buildSignedUrl(url.origin, fileId, env.FILE_SIGNING_SECRET);
    processed.push({ fileId, filename: safeName, sizeBytes: file.size, downloadUrl });
  }

  // Build email
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

  const formatBytes = (b: number): string => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const attachmentsBlock =
    processed.length > 0
      ? `<div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;">
           <div style="color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Attachments (${processed.length}) — virus-scanned, expire in 30 days</div>
           <ul style="margin:0;padding:0;list-style:none;">
             ${processed
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

  const text =
    `New Quote Request\n\n` +
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    (details ? `\n\nAdditional Details:\n${details}` : "") +
    (processed.length > 0
      ? `\n\nAttachments (${processed.length}) — virus-scanned, expire in 30 days:\n${processed
          .map((p) => `- ${p.filename} (${formatBytes(p.sizeBytes)})\n  ${p.downloadUrl}`)
          .join("\n")}`
      : "");

  let resendRes: Response;
  try {
    resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [TO_ADDRESS],
        reply_to: email,
        subject: `Quote Request: ${name}${company ? ` (${company})` : ""} — ${airframe}`,
        html,
        text,
      }),
    });
  } catch {
    return errorRedirect("send-failed");
  }

  if (!resendRes.ok) {
    const body = await resendRes.text();
    console.error("Resend API error", resendRes.status, body);
    return errorRedirect("send-failed");
  }

  // Write to KV for admin dashboard (best-effort, don't fail submission if this fails)
  if (env.LEADS_KV) {
    try {
      const { recordLead } = await import("./_shared/leads");
      await recordLead(env.LEADS_KV, {
        id: uuidv4(),
        type: "quote",
        ts: new Date().toISOString(),
        name,
        company,
        email,
        phone,
        airframe,
        service,
        timeline,
        attachments: processed.length,
      });
    } catch (e) {
      console.error("Lead tracking write failed", e);
    }
  }

  return Response.redirect(new URL("/quote/thank-you", url).toString(), 303);
};
