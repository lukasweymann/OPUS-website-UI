import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const HCAPTCHA_VERIFY_URL = "https://hcaptcha.com/siteverify";

const LIMITS = {
  name: 200,
  email: 320,
  url: 2048,
  message: 5000,
};

function errorResponse(error, status = 400) {
  return NextResponse.json({ status: "ERROR", error }, { status });
}

function methodNotAllowed() {
  return errorResponse("Method not allowed", 405);
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isHttpUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function withLineBreaks(value) {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br />");
}

function validateBody(body) {
  if (!body || typeof body !== "object") {
    return { error: "Invalid JSON body" };
  }

  const name = cleanString(body.name);
  const email = cleanString(body.email);
  const url = cleanString(body.url);
  const message = cleanString(body.message);
  const captchaToken = cleanString(body.captchaToken);

  if (!name || !email || !message) {
    return { error: "Name, email, and message are required" };
  }
  if (name.length > LIMITS.name) return { error: "Name is too long" };
  if (email.length > LIMITS.email) return { error: "Email is too long" };
  if (url.length > LIMITS.url) return { error: "URL is too long" };
  if (message.length > LIMITS.message) return { error: "Message is too long" };
  if (!isEmail(email)) return { error: "Email is invalid" };
  if (!isHttpUrl(url)) return { error: "URL is invalid" };

  return { data: { name, email, url, message, captchaToken } };
}

async function verifyCaptcha(captchaToken) {
  const secret = cleanString(process.env.OPUS_HCAPTCHA_SECRET);
  const isProduction = process.env.NODE_ENV === "production";

  if (!secret) {
    if (isProduction) {
      return {
        ok: false,
        status: 500,
        error: "Captcha verification is not configured",
      };
    }
    return { ok: true };
  }

  if (!captchaToken) {
    return {
      ok: false,
      status: 400,
      error: "Captcha verification is required",
    };
  }

  const body = new URLSearchParams({
    secret,
    response: captchaToken,
  });

  let response;
  try {
    response = await fetch(HCAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 502,
      error: "Captcha verification failed",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: 502,
      error: "Captcha verification failed",
    };
  }

  const result = await response.json().catch(() => null);
  if (!result?.success) {
    return {
      ok: false,
      status: 400,
      error: "Captcha verification failed",
    };
  }

  return { ok: true };
}

function getMailConfig() {
  const host = cleanString(process.env.OPUS_EMAIL_SERVER);
  const user = cleanString(process.env.OPUS_EMAIL_USER);
  const pass = cleanString(process.env.OPUS_EMAIL_PASSWORD);
  const to = cleanString(process.env.OPUS_EMAIL_RECEIVER);

  if (!host || !user || !pass || !to) {
    return { error: "Email service is not configured" };
  }

  const port = Number(process.env.OPUS_EMAIL_PORT || 587);
  const secure = process.env.OPUS_EMAIL_SECURE === "true";
  const allowInvalidTls =
    process.env.OPUS_EMAIL_TLS_REJECT_UNAUTHORIZED === "false";

  return {
    config: {
      from: user,
      to,
      transport: {
        host,
        port: Number.isFinite(port) ? port : 587,
        secure,
        auth: { user, pass },
        ...(allowInvalidTls ? { tls: { rejectUnauthorized: false } } : {}),
      },
    },
  };
}

function buildMail({ name, email, url, message }, { from, to }) {
  const displayUrl = url || "Not provided";
  const escapedName = escapeHtml(name);
  const escapedEmail = escapeHtml(email);
  const escapedUrl = escapeHtml(displayUrl);
  const escapedMessage = withLineBreaks(message);

  return {
    from,
    to,
    replyTo: email,
    subject: `OPUS website contribution form from ${email}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `URL: ${displayUrl}`,
      "",
      "Message:",
      message,
    ].join("\n"),
    html: `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f7fb;color:#111827;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background:#f4f7fb;">
      <tr>
        <td align="center" style="padding:28px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;border-collapse:collapse;background:#ffffff;border:1px solid #d8e0ec;border-radius:10px;overflow:hidden;">
            <tr>
              <td style="padding:22px 24px;background:#111827;color:#ffffff;">
                <div style="font-size:12px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:#a7b7d8;font-weight:700;">OPUS contribution form</div>
                <h1 style="margin:6px 0 0;font-size:22px;line-height:1.25;font-weight:700;">New website contribution</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 24px 8px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:0 0 14px;font-size:12px;line-height:1.4;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;font-weight:700;width:120px;vertical-align:top;">Name</td>
                    <td style="padding:0 0 14px;font-size:15px;line-height:1.5;color:#111827;font-weight:700;vertical-align:top;">${escapedName}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 14px;font-size:12px;line-height:1.4;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;font-weight:700;width:120px;vertical-align:top;">Email</td>
                    <td style="padding:0 0 14px;font-size:15px;line-height:1.5;color:#111827;vertical-align:top;"><a href="mailto:${escapedEmail}" style="color:#4f46e5;text-decoration:none;">${escapedEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 14px;font-size:12px;line-height:1.4;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;font-weight:700;width:120px;vertical-align:top;">Dataset URL</td>
                    <td style="padding:0 0 14px;font-size:15px;line-height:1.5;color:#111827;vertical-align:top;">${url ? `<a href="${escapedUrl}" style="color:#4f46e5;text-decoration:none;">${escapedUrl}</a>` : escapedUrl}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 24px;">
                <div style="padding:18px 18px 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                  <div style="margin:0 0 10px;font-size:12px;line-height:1.4;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;font-weight:700;">Message</div>
                  <div style="font-size:15px;line-height:1.65;color:#111827;">${escapedMessage}</div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const validation = validateBody(body);

  if (validation.error) {
    return errorResponse(validation.error, 400);
  }

  const captcha = await verifyCaptcha(validation.data.captchaToken);
  if (!captcha.ok) {
    return errorResponse(captcha.error, captcha.status);
  }

  const mailConfig = getMailConfig();
  if (mailConfig.error) {
    return errorResponse(mailConfig.error, 500);
  }

  const transporter = nodemailer.createTransport(mailConfig.config.transport);
  const mail = buildMail(validation.data, mailConfig.config);

  try {
    await transporter.sendMail(mail);
    return NextResponse.json({ status: "SUCCESS" }, { status: 200 });
  } catch {
    return errorResponse("Email could not be sent", 502);
  }
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
