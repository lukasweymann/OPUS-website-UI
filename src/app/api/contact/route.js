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
  const escapedMessage = escapeHtml(message).replaceAll("\n", "<br />");

  return {
    from,
    to,
    subject: `OPUS website contribution form from ${email}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `URL: ${url}`,
      "",
      "Message:",
      message,
    ].join("\n"),
    html: [
      `<p>Name: ${escapeHtml(name)}</p>`,
      `<p>Email: ${escapeHtml(email)}</p>`,
      `<p>URL: ${escapeHtml(url)}</p>`,
      `<p>Message: ${escapedMessage}</p>`,
    ].join(""),
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
