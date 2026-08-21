"use client";

import { useMemo, useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import Partners from "@/app/components/Partners/Partners";
import { toast } from "@/app/components/ui/Toast/toast";
import s from "./page.module.css";

const SITEKEY = "dfde40f9-7ab1-4256-8e66-3a218a095d21";

export default function ContactPage() {
  const [status, setStatus] = useState("Submit");
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [note, setNote] = useState(""); // success/info text

  const captchaRef = useRef(null);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const urlRef = useRef(null);
  const msgRef = useRef(null);

  const disabled = useMemo(
    () => !token || status === "Sending…",
    [token, status],
  );

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setNote("");

    const name = nameRef.current?.value?.trim() || "";
    const email = emailRef.current?.value?.trim() || "";
    const url = urlRef.current?.value?.trim() || "";
    const message = msgRef.current?.value?.trim() || "";

    if (!token) {
      setErr("You must verify the captcha.");
      return;
    }
    if (!name || !email) {
      setErr("Name and email are required.");
      return;
    }

    setStatus("Sending…");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          url,
          message,
          captchaToken: token,
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok || payload?.status !== "SUCCESS") {
        throw new Error(payload?.error || `Request failed (${res.status})`);
      }

      setStatus("Sent");
      setNote("Your contribution was sent successfully.");
      toast.success("Contribution sent successfully");

      // reset fields
      if (nameRef.current) nameRef.current.value = "";
      if (emailRef.current) emailRef.current.value = "";
      if (urlRef.current) urlRef.current.value = "";
      if (msgRef.current) msgRef.current.value = "";

      // reset captcha token + widget
      setToken("");
      captchaRef.current?.resetCaptcha?.();

      // return button text to normal after a bit
      window.setTimeout(() => setStatus("Submit"), 2500);
    } catch (e2) {
      setStatus("Submit");
      toast.error("Contribution could not be sent");
      setErr("Something went wrong sending your message. Please try again.");
    }
  }

  return (
    <>
      <main className={s.wrap}>
        <section className={s.card}>
          <header className={s.head}>
            <h1 className={s.h1}>
              Contribute to <span className={s.brand}>OPUS</span>
            </h1>
            <p className={s.p}>
              Comments on datasets? Errors spotted? New corpora we could add?
              Suggestions? We appreciate feedback and contributions. Leave a
              message and we’ll get back to you.
            </p>
          </header>

          <form className={s.form} onSubmit={submit}>
            <div className={s.grid}>
              <label className={s.field}>
                <span className={s.label}>
                  Name <span className={s.req}>*</span>
                </span>
                <input
                  ref={nameRef}
                  name="name"
                  type="text"
                  minLength={2}
                  required
                  className={s.input}
                  placeholder="Your name"
                />
              </label>

              <label className={s.field}>
                <span className={s.label}>
                  Email <span className={s.req}>*</span>
                </span>
                <input
                  ref={emailRef}
                  name="email"
                  type="email"
                  required
                  className={s.input}
                  placeholder="you@domain.com"
                />
              </label>

              <label className={s.fieldWide}>
                <span className={s.label}>Dataset URL</span>
                <input
                  ref={urlRef}
                  name="url"
                  type="url"
                  className={s.input}
                  placeholder="https://…"
                />
              </label>

              <label className={s.fieldWide}>
                <span className={s.label}>Message</span>
                <textarea
                  ref={msgRef}
                  name="message"
                  required
                  className={s.textarea}
                  rows={6}
                  placeholder="Tell us what you found / propose…"
                />
              </label>
            </div>

            {(err || note) && (
              <p
                className={`${s.msg} ${err ? s.msgErr : s.msgOk}`}
                role={err ? "alert" : "status"}
              >
                {err || note}
              </p>
            )}

            <div className={s.actions}>
              <div className={s.captcha}>
                <HCaptcha
                  ref={captchaRef}
                  sitekey={SITEKEY}
                  onVerify={(t) => {
                    setToken(t);
                    setErr("");
                  }}
                  onExpire={() => setToken("")}
                />
              </div>

              <button type="submit" className={s.btn} disabled={disabled}>
                {status}
              </button>
            </div>
          </form>
        </section>
      </main>

      <section className={s.contrib}>
        <div className={s.contribCard}>
          <h3 className={s.h3}>
            Speaking of contributing… a big THANK YOU to everyone making this
            place possible.
          </h3>
          <p className={s.p2}>
            This project has gained life through the contribution of different
            entities including:
          </p>
          <Partners />
        </div>
      </section>
    </>
  );
}
