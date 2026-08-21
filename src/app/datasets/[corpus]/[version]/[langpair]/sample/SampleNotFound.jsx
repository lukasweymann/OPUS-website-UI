import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import notFoundImg from "@/../public/img/notfound.svg";

import s from "./SampleNotFound.module.css";
import { languagePairName } from "../../../../../../../hooks/hooks";

function splitLangpair(langpair = "") {
  let raw = String(langpair);
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // Keep the original value if it is not a valid encoded component.
  }

  return raw.includes("&") ? raw.split("&") : raw.split("-");
}

export default function SampleNotFound({ corpus, langpair, version, mode }) {
  const backHref =
    mode === "synth"
      ? `/synthetic/${encodeURIComponent(corpus)}/${version}`
      : `/datasets/${encodeURIComponent(corpus)}`;

  const languagePairFormatted = languagePairName(splitLangpair(langpair));

  return (
    <section className={s.wrap} role="status" aria-live="polite">
      <div className={s.card}>
        <div className={s.head}>
          <h1 className={s.h1}>
            {languagePairFormatted?.length === 2 ? (
              <>
                No samples for{" "}
                <span className={s.em}>
                  {languagePairFormatted[0].label} –{" "}
                  {languagePairFormatted[1].label}
                </span>{" "}
                in{" "}
                <Link className={s.link} href={backHref}>
                  {corpus}
                </Link>{" "}
                ({version}) were found.
              </>
            ) : (
              <>
                No samples were found for this dataset.
                {corpus ? (
                  <>
                    {" "}
                    Back to{" "}
                    <Link className={s.link} href={backHref}>
                      {corpus}
                    </Link>
                    {version ? <> ({version})</> : null}.
                  </>
                ) : null}
              </>
            )}
          </h1>
          <p className={s.p}>
            This can happen when a sample file hasn’t been generated for that
            pair/version yet.
          </p>
        </div>

        <div className={s.body}>
          <Image
            src={notFoundImg}
            alt="No sample found"
            height={220}
            className={s.img}
            priority={false}
          />

          <Link className={s.cta} href={backHref}>
            Back to the dataset <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
