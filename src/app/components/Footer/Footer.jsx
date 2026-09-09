import s from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.cols}>
          <section className={s.col}>
            <h3 className={s.h3}>Tools</h3>

            <nav className={s.nav} aria-label="Tools">
              <a
                className={s.link}
                href="https://pypi.org/project/opustools/"
                target="_blank"
                rel="noreferrer"
              >
                Opus Tools
              </a>
              <a
                className={s.link}
                href="https://pypi.org/project/opusfilter/"
                target="_blank"
                rel="noreferrer"
              >
                Opus Filter
              </a>
              <a
                className={s.link}
                href="https://github.com/Helsinki-NLP/OpusDistillery"
                target="_blank"
                rel="noreferrer"
              >
                OPUS Distillery
              </a>
            </nav>
          </section>

          <section className={s.col}>
            <h3 className={s.h3}>Query</h3>

            <nav className={s.nav} aria-label="Query tools">
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
                href="https://opus.nlpl.eu/legacy/lex.php"
                target="_blank"
                rel="noreferrer"
              >
                Opus Wordalign
              </a>
              <a
                className={s.link}
                href="https://opus.nlpl.eu/explore/"
                target="_blank"
                rel="noreferrer"
              >
                Opus Explorer
              </a>
            </nav>
          </section>

          <section className={s.col}>
            <h3 className={s.h3}>Translation</h3>

            <nav className={s.nav} aria-label="Translation tools">
              <a
                className={s.link}
                href="https://github.com/Helsinki-NLP/OpusTranslate"
                target="_blank"
                rel="noreferrer"
              >
                OpusTranslate MobileApp
              </a>
              <a
                className={s.link}
                href="https://github.com/Helsinki-NLP/OPUS-MT-app"
                target="_blank"
                rel="noreferrer"
              >
                OpusTranslate DesktopApp
              </a>
              <a
                className={s.link}
                href="https://helsinki-nlp.github.io/OPUS-CAT/"
                target="_blank"
                rel="noreferrer"
              >
                OPUS-CAT
              </a>
            </nav>
          </section>
        </div>

        <aside className={s.meta}>
          <a className={s.cta} href="/contact">
            Contribute to OPUS
          </a>
          <a
            className={s.legacy}
            href="https://opus.nlpl.eu/legacy/"
            target="_blank"
            rel="noreferrer"
          >
            Opus Legacy
          </a>
          <a
            className={s.github}
            href="https://github.com/Helsinki-NLP/OPUS"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </aside>
      </div>
    </footer>
  );
}
