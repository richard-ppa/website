// Cloudflare Pages Function — handles POST to /careers
//
// Mirrors functions/quote.ts: Turnstile + honeypot, magic-byte file checks,
// R2 stage → async VirusTotal scan → HMAC-signed download links in admin email.
// Differences from quote:
//   - Accepts .pdf / .doc / .docx (not Excel)
//   - Max 2 files, 10MB each, 20MB total (resume + optional supporting doc)
//   - Routes to careers@ppa.aero
//   - Records the lead under type "contact" with recipient "Careers" so it
//     surfaces in the existing admin /admin/leads stream without schema churn
//   - No claim-URL panel (career inbox doesn't need multi-claimer routing)

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
  LEADS_KV?: KVNamespace;
}

interface PagesContext<E> {
  request: Request;
  env: E;
  waitUntil(promise: Promise<unknown>): void;
}
type PagesHandler<E> = (context: PagesContext<E>) => Response | Promise<Response>;

const FROM_ADDRESS = "Plane Place Aviation Careers <noreply@app.ppa.aero>";
const TO_ADDRESS = "careers@ppa.aero";
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"] as const;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB per file
const MAX_FILES = 2; // resume + optional supporting doc
const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20MB total
const VT_POLL_MAX_ATTEMPTS = 12; // 12 × 2s = 24s
const VT_POLL_INTERVAL_MS = 2000;
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const ROLE_LABELS: Record<string, string> = {
  technician: "Airframe Technician",
  inspection: "Inspection & QC",
  avionics: "Avionics",
  advisor: "Service Advisor",
  parts: "Parts & Logistics",
  ops: "Ops & Admin",
  other: "Not sure / Other",
};

const AIRFRAME_LABELS: Record<string, string> = {
  hawker: "Hawker",
  citation: "Citation",
  challenger: "Challenger",
  multiple: "Multiple",
  unsure: "Not sure",
};

const roleLabel = (v: string): string => (v ? ROLE_LABELS[v] ?? v : "");
const airframeLabel = (v: string): string => (v ? AIRFRAME_LABELS[v] ?? v : "");

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeFilename(name: string): string {
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

// Magic-byte check — verifies file content matches its claimed extension.
// PDF: %PDF-     ; DOC: OLE compound document ; DOCX: ZIP archive (PK\x03\x04)
function checkMagicBytes(bytes: Uint8Array, ext: string): boolean {
  if (bytes.length < 8) return false;
  if (ext === "pdf") {
    return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
  }
  if (ext === "doc") {
    return (
      bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0 &&
      bytes[4] === 0xa1 && bytes[5] === 0xb1 && bytes[6] === 0x1a && bytes[7] === 0xe1
    );
  }
  if (ext === "docx") {
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

interface CareerFields {
  name: string;
  email: string;
  phone: string;
  role: string;
  airframe: string;
  note: string;
}

interface StagedFile {
  buf: ArrayBuffer;
  filename: string;
  fileId: string;
  r2Key: string;
  sizeBytes: number;
  kind: "resume" | "supporting";
}

import {
  buildSourceBlockHtml,
  buildSourceBlockText,
  type LeadAttribution,
} from "./_shared/leads";

function buildEmailHtml(
  fields: CareerFields,
  attachments: Array<{ filename: string; sizeBytes: number; downloadUrl: string; kind: "resume" | "supporting" }>,
  banner?: string,
  attribution?: LeadAttribution
): string {
  const formatBytes = (b: number): string => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const rows: Array<[string, string]> = [
    ["Name", fields.name],
    ["Email", fields.email],
    ["Phone", fields.phone || "—"],
    ["Role of interest", fields.role ? roleLabel(fields.role) : "—"],
    ["Airframe focus", fields.airframe ? airframeLabel(fields.airframe) : "—"],
  ];

  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 16px 8px 0;color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;width:160px;">${escapeHtml(
          k
        )}</td><td style="padding:8px 0;color:#111827;font-size:15px;">${escapeHtml(v)}</td></tr>`
    )
    .join("");

  const noteBlock = fields.note
    ? `<div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;">
         <div style="color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Note</div>
         <div style="color:#111827;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(fields.note)}</div>
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
                      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:600;margin-bottom:4px;">${p.kind === "resume" ? "Resume" : "Supporting document"}</div>
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
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;font-weight:600;margin-bottom:8px;">New Application</div>
      <h1 style="margin:0 0 24px 0;font-size:24px;color:#111827;">${escapeHtml(fields.name)}</h1>
      <table style="width:100%;border-collapse:collapse;">
        <tbody>${tableRows}</tbody>
      </table>
      ${noteBlock}
      ${attachmentsBlock}
      ${buildSourceBlockHtml(attribution)}
    </div>
    <div style="margin-top:16px;text-align:center;color:#9ca3af;font-size:12px;">
      Submitted via the careers form on <a href="https://ppa.aero/careers" style="color:#9ca3af;">ppa.aero/careers</a>
    </div>
  </div>
</body></html>`;
}

function buildEmailText(
  fields: CareerFields,
  attachments: Array<{ filename: string; sizeBytes: number; downloadUrl: string; kind: "resume" | "supporting" }>,
  banner?: string,
  attribution?: LeadAttribution
): string {
  const formatBytes = (b: number): string => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };
  const rows: Array<[string, string]> = [
    ["Name", fields.name],
    ["Email", fields.email],
    ["Phone", fields.phone || "—"],
    ["Role of interest", fields.role ? roleLabel(fields.role) : "—"],
    ["Airframe focus", fields.airframe ? airframeLabel(fields.airframe) : "—"],
  ];
  return (
    (banner ? `${banner}\n\n` : "") +
    `New Application\n\n` +
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    (fields.note ? `\n\nNote:\n${fields.note}` : "") +
    (attachments.length > 0
      ? `\n\nAttachments (${attachments.length}) — virus-scanned, expire in 30 days:\n${attachments
          .map((p) => `- [${p.kind === "resume" ? "Resume" : "Supporting"}] ${p.filename} (${formatBytes(p.sizeBytes)})\n  ${p.downloadUrl}`)
          .join("\n")}`
      : "") +
    buildSourceBlockText(attribution)
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
      console.error("Resend API error (careers)", res.status, body);
    }
  } catch (e) {
    console.error("Resend API threw (careers)", e);
  }
}

async function processSubmission(
  env: Env,
  origin: string,
  fields: CareerFields,
  staged: StagedFile[],
  attribution: unknown
): Promise<void> {
  const leadId = uuidv4();

  const scanResults: ScanResult[] = [];
  if (staged.length > 0) {
    if (!env.VIRUSTOTAL_API_KEY) {
      console.error("VIRUSTOTAL_API_KEY not configured — skipping scan (careers)");
      for (let i = 0; i < staged.length; i++) scanResults.push({ ok: false, reason: "no-api-key" });
    } else {
      const results = await Promise.all(
        staged.map((f) => scanWithVirusTotal(f.buf, f.filename, env.VIRUSTOTAL_API_KEY))
      );
      scanResults.push(...results);
    }
  }

  const malicious = scanResults
    .map((r, i) => ({ r, file: staged[i] }))
    .filter((x) => !x.r.ok && (x.r as { reason: string }).reason === "virus-detected");

  if (malicious.length > 0) {
    await Promise.all(
      staged.map((f) =>
        env.QUOTE_FILES.delete(f.r2Key).catch((e) => {
          console.error("R2 delete failed (careers)", f.r2Key, e);
        })
      )
    );
    const subject = `[REJECTED — malicious file] Application from ${fields.name}`;
    const banner =
      `WARNING: One or more attachments were flagged as malicious by VirusTotal and have been deleted from storage. ` +
      `Files: ${malicious.map((m) => m.file.filename).join(", ")}. The candidate was shown a success page; follow up directly if you want to give them a chance to resubmit.`;
    const html = buildEmailHtml(fields, [], banner, attribution as LeadAttribution | undefined);
    const text = buildEmailText(fields, [], banner, attribution as LeadAttribution | undefined);
    await sendEmail(env, subject, html, text, fields.email);
    return;
  }

  const attachments = await Promise.all(
    staged.map(async (f) => ({
      filename: f.filename,
      sizeBytes: f.sizeBytes,
      downloadUrl: await buildSignedUrl(origin, f.fileId, env.FILE_SIGNING_SECRET),
      kind: f.kind,
    }))
  );

  const inconclusiveCount = scanResults.filter((r) => !r.ok).length;
  const banner =
    inconclusiveCount > 0
      ? `Note: ${inconclusiveCount} attachment scan${inconclusiveCount === 1 ? "" : "s"} did not complete (${scanResults
          .filter((r) => !r.ok)
          .map((r) => (r as { reason: string }).reason)
          .join(", ")}). Files were uploaded but VirusTotal could not confirm they are clean — review before opening.`
      : undefined;

  // Surface in /admin/leads without schema churn: record as a contact-type
  // lead with recipient "Careers". The cover-note preview (truncated) and a
  // one-line role/airframe summary go into messagePreview so the dashboard
  // table row carries useful context.
  if (env.LEADS_KV) {
    try {
      const { recordLead } = await import("./_shared/leads");
      const summaryLine = [
        fields.role ? `Role: ${roleLabel(fields.role)}` : null,
        fields.airframe ? `Airframe: ${airframeLabel(fields.airframe)}` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      const messagePreview = [summaryLine, fields.note]
        .filter(Boolean)
        .join("\n\n")
        .slice(0, 400);
      await recordLead(env.LEADS_KV, {
        id: leadId,
        type: "contact",
        ts: new Date().toISOString(),
        name: fields.name,
        company: "",
        email: fields.email,
        phone: fields.phone,
        messagePreview,
        recipient: "Careers",
        attachments: staged.length,
        attribution: attribution as ReturnType<
          typeof import("./_shared/leads").extractAttribution
        >,
      });
    } catch (e) {
      console.error("Lead tracking write failed (careers)", e);
    }
  }

  const subject = `Application: ${fields.name}${fields.role ? ` — ${roleLabel(fields.role)}` : ""}`;
  const html = buildEmailHtml(fields, attachments, banner, attribution as LeadAttribution | undefined);
  const text = buildEmailText(fields, attachments, banner, attribution as LeadAttribution | undefined);
  await sendEmail(env, subject, html, text, fields.email);
}

export const onRequestPost: PagesHandler<Env> = async (ctx) => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const errorRedirect = (code: string, detail?: string) => {
    const target = new URL("/careers", url);
    target.searchParams.set("error", code);
    if (detail) target.searchParams.set("detail", detail);
    // Keep the apply-form anchor in the bounce so the error banner shows above the form
    target.hash = "apply";
    return Response.redirect(target.toString(), 303);
  };

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorRedirect("invalid-request");
  }

  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return Response.redirect(new URL("/careers/thank-you", url).toString(), 303);
  }

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

  const fields: CareerFields = {
    name: get("name"),
    email: get("email"),
    phone: get("phone"),
    role: get("role"),
    airframe: get("airframe"),
    note: get("note"),
  };

  if (!fields.name || !fields.email) {
    return errorRedirect("missing-fields");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return errorRedirect("invalid-email");
  }

  // Process files: require a resume, allow one optional supporting doc
  const resumeRaw = formData.get("resume");
  const supportingRaw = formData.get("supporting");
  const resume = resumeRaw instanceof File && resumeRaw.size > 0 ? resumeRaw : null;
  const supporting = supportingRaw instanceof File && supportingRaw.size > 0 ? supportingRaw : null;

  if (!resume) {
    return errorRedirect("careers-resume-required");
  }

  const realFiles: Array<{ file: File; kind: "resume" | "supporting" }> = [{ file: resume, kind: "resume" }];
  if (supporting) realFiles.push({ file: supporting, kind: "supporting" });

  if (realFiles.length > MAX_FILES) {
    return errorRedirect("careers-too-many-files");
  }

  let totalBytes = 0;
  for (const f of realFiles) totalBytes += f.file.size;
  if (totalBytes > MAX_TOTAL_BYTES) {
    return errorRedirect("careers-attachments-too-large");
  }

  const staged: StagedFile[] = [];
  for (const { file, kind } of realFiles) {
    if (file.size > MAX_FILE_BYTES) {
      return errorRedirect("file-too-large");
    }

    const safeName = sanitizeFilename(file.name);
    const ext = getExtension(safeName);
    if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
      return errorRedirect("careers-file-type-not-allowed");
    }

    const buf = await file.arrayBuffer();
    const head = new Uint8Array(buf.slice(0, 8));
    if (!checkMagicBytes(head, ext)) {
      return errorRedirect("file-magic-mismatch");
    }

    const fileId = uuidv4();
    // Reuse the QUOTE_FILES bucket under the same `attachments/` prefix so the
    // existing /files/[id] signed-URL endpoint serves these without changes.
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
          uploadedAt: new Date().toISOString(),
          source: "careers",
          kind,
        },
      });
    } catch {
      return errorRedirect("storage-failed");
    }

    staged.push({ buf, filename: safeName, fileId, r2Key, sizeBytes: file.size, kind });
  }

  const { extractAttribution } = await import("./_shared/leads");
  const attribution = extractAttribution(request);

  ctx.waitUntil(processSubmission(env, url.origin, fields, staged, attribution));

  return Response.redirect(new URL("/careers/thank-you", url).toString(), 303);
};
