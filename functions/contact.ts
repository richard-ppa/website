// Cloudflare Pages Function — handles POST to /contact
// Receives the "Send Us a Message" form, sends via Resend.
// On success: 303 redirect to /contact/thank-you
// On error: 303 redirect to /contact?error=...

interface Env {
  RESEND_API_KEY: string;
}

interface PagesContext<E> {
  request: Request;
  env: E;
}
type PagesHandler<E> = (context: PagesContext<E>) => Response | Promise<Response>;

const FROM_ADDRESS = "Plane Place Aviation Contact <noreply@app.ppa.aero>";
const TO_ADDRESS = "info@ppa.aero";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const onRequestPost: PagesHandler<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const errorRedirect = (code: string) => {
    const target = new URL("/contact", url);
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
    return Response.redirect(new URL("/contact/thank-you", url).toString(), 303);
  }

  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v.trim() : "";
  };

  const name = get("name");
  const company = get("company");
  const email = get("email");
  const phone = get("phone");
  const message = get("message");

  if (!name || !email || !message) {
    return errorRedirect("missing-fields");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorRedirect("invalid-email");
  }

  const rows: Array<[string, string]> = [
    ["Name", name],
    ["Company", company || "—"],
    ["Email", email],
    ["Phone", phone || "—"],
  ];

  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 16px 8px 0;color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;width:120px;">${escapeHtml(
          k
        )}</td><td style="padding:8px 0;color:#111827;font-size:15px;">${escapeHtml(v)}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 24px;">
    <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;font-weight:600;margin-bottom:8px;">New Contact Message</div>
      <h1 style="margin:0 0 24px 0;font-size:24px;color:#111827;">${escapeHtml(name)}${
        company ? ` — ${escapeHtml(company)}` : ""
      }</h1>
      <table style="width:100%;border-collapse:collapse;">
        <tbody>${tableRows}</tbody>
      </table>
      <div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;">
        <div style="color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Message</div>
        <div style="color:#111827;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</div>
      </div>
    </div>
    <div style="margin-top:16px;text-align:center;color:#9ca3af;font-size:12px;">
      Submitted via the contact form on <a href="https://ppa.aero/contact" style="color:#9ca3af;">ppa.aero/contact</a>
    </div>
  </div>
</body></html>`;

  const text =
    `New Contact Message\n\n` +
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    `\n\nMessage:\n${message}`;

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
        subject: `Contact: ${name}${company ? ` (${company})` : ""}`,
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

  return Response.redirect(new URL("/contact/thank-you", url).toString(), 303);
};
