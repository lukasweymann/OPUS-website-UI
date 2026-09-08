import Link from "next/link";
import s from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.cols}>
          <section className={s.col}>
            <Link href="/OPUS-Tools" className={s.headLink}>
              <h3 className={s.h3}>Tools & Info</h3>
            </Link>

            <nav className={s.nav} aria-label="Tools and info">
              <a
                className={s.link}
                href="https://opus.nlpl.eu/opusapi/"
                target="_blank"
                rel="noreferrer"
              >
                Opus API
              </a>
              <a
                className={s.link}
                href="https://github.com/hplt-project/OpusTrainer"
                target="_blank"
                rel="noreferrer"
              >
                <span className={s.mono}>Opus</span> Trainer
              </a>
              <a
                className={s.link}
                href="https://github.com/hplt-project/OpusCleaner"
                target="_blank"
                rel="noreferrer"
              >
                <span className={s.mono}>Opus</span> Cleaner
              </a>
              <a
                className={s.link}
                href="https://opus.nlpl.eu/legacy/lex.php"
                target="_blank"
                rel="noreferrer"
              >
                <span className={s.mono}>Opus</span> Wordalign
              </a>
              <a
                className={s.link}
                href="https://github.com/Helsinki-NLP/OpusFilter"
                target="_blank"
                rel="noreferrer"
              >
                Opus Filter
              </a>
              <a
                className={s.link}
                href="https://github.com/Helsinki-NLP/OPUS-translator"
                target="_blank"
                rel="noreferrer"
              >
                Opus Translator
              </a>

              <div className={s.social}>
                <a
                  className={`${s.link} ${s.pill}`}
                  href="https://github.com/Helsinki-NLP/OPUS"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </div>
            </nav>
          </section>

          <section className={s.col}>
            <nav className={s.nav} aria-label="More tools">
              <a
                className={s.link}
                href="https://opus.nlpl.eu/bin/opuscqp.pl"
                target="_blank"
                rel="noreferrer"
              >
                Opus Query
              </a>
              <a
                className={s.link}
                href="https://github.com/Helsinki-NLP/OpusTools"
                target="_blank"
                rel="noreferrer"
              >
                Opus Tools (Python Package)
              </a>
              <a
                className={s.link}
                href="https://github.com/Helsinki-NLP/OpusTools-perl"
                target="_blank"
                rel="noreferrer"
              >
                Opus Tools (Perl Package)
              </a>
              <a
                className={s.link}
                href="https://github.com/thammegowda/mtdata"
                target="_blank"
                rel="noreferrer"
              >
                MT-Data
              </a>
              <a
                className={s.link}
                href="https://github.com/robertostling/eflomal"
                target="_blank"
                rel="noreferrer"
              >
                Eflomal Word Aligner
              </a>

              <Link href="/contact" className={s.cta}>
                Contribute to OPUS
              </Link>

              <p className={s.note}>
                Icons by{" "}
                <a
                  className={s.link}
                  href="https://lucide.dev/license"
                  target="_blank"
                  rel="noreferrer"
                >
                  Lucide
                </a>
              </p>
            </nav>
          </section>
        </div>

        <aside className={s.meta}>
          <a
            className={s.legacy}
            href="https://opus.nlpl.eu/legacy/"
            target="_blank"
            rel="noreferrer"
          >
            Opus Legacy
          </a>
        </aside>
      </div>
    </footer>
  );
}
