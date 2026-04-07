import Link from "next/link";
import SyntheticBanner from "../components/Synthetic/Banner/Banner";
import s from "./page.module.css";
import { callLangpairsService } from "@/lib/langpairsServiceClient";

export const revalidate = 86400; // 24h ISR-ish cache; adjust if needed

export default async function SyntheticPage() {
  const collections = await callLangpairsService({ mode: "collections" });
  const items = collections?.collections ?? [];

  const released = items.flatMap((c) => {
    const name = c?.name;
    const versions = Array.isArray(c?.versions) ? c.versions : [];
    return versions.map((v) => ({
      key: `${name}-${v}`,
      name,
      version: v,
      href: `/synthetic/${name}/${v}`,
    }));
  });

  return (
    <main className={s.page}>
      <SyntheticBanner />

      <section className={s.shell}>
        <div className={s.header}>
          <h1 className={s.h1}>synOPUS</h1>
          <p className={s.lead}>
            synOPUS is a new edition that provides synthetic data sets — data
            that has (partially) been generated, for example, by translating
            text into other languages using machine translation tools or large
            language models. We used several tools to compile the current
            collection. All pre-processing is done automatically. No manual
            corrections have been carried out.
          </p>
        </div>

        <div className={s.grid}>
          <section className={`${s.card} ${s.cardPad}`}>
            <div className={s.cardHead}>
              <h2 className={s.h2}>Released datasets</h2>
              <span className={s.badge}>{released.length}</span>
            </div>

            {released.length === 0 ? (
              <p className={s.muted}>No releases found.</p>
            ) : (
              <ul className={s.list}>
                {released.map((r) => (
                  <li key={r.key} className={s.row}>
                    <Link href={r.href} className={s.item}>
                      <span className={s.name}>{r.name}</span>
                      <span className={s.pill}>{r.version}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={`${s.card} ${s.cardPad}`}>
            <h2 className={s.h2}>SynOPUS tools</h2>
            <ul className={s.tools}>
              <li>
                <a
                  className={s.ext}
                  href="https://opus.nlpl.eu/synthetic/explore/"
                  target="_blank"
                  rel="noreferrer"
                >
                  synOPUS Explorer
                </a>
              </li>
              <li>
                <a
                  className={s.ext}
                  href="https://pypi.org/project/opustools/"
                  target="_blank"
                  rel="noreferrer"
                >
                  OpusTools
                </a>
              </li>
              <li>
                <a
                  className={s.ext}
                  href="https://github.com/Helsinki-NLP/OpusFilter"
                  target="_blank"
                  rel="noreferrer"
                >
                  OpusFilter
                </a>
              </li>
              <li>
                <a
                  className={s.ext}
                  href="https://github.com/Helsinki-NLP/OPUS-MT"
                  target="_blank"
                  rel="noreferrer"
                >
                  OPUS-MT
                </a>
              </li>
              <li>
                <a
                  className={s.ext}
                  href="https://github.com/Helsinki-NLP/OPUS-CAT"
                  target="_blank"
                  rel="noreferrer"
                >
                  OPUS-CAT
                </a>
              </li>
              <li>
                <a
                  className={s.ext}
                  href="https://github.com/Helsinki-NLP/Tatoeba-Challenge"
                  target="_blank"
                  rel="noreferrer"
                >
                  The Tatoeba Translation Challenge
                </a>
              </li>
            </ul>

            <p className={s.note}>
              All responses are available via HTTP endpoints and can be used
              from curl, Python, JavaScript, or any HTTP client.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
