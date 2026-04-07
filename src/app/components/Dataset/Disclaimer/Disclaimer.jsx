import s from "./Disclaimer.module.css";

export default function CorpusDisclaimer() {
  return (
    <section className={s.notice} aria-label="Disclaimer and take down policy">
      <header className={s.head}>
        <span className={s.dot} aria-hidden="true" />
        <h3 className={s.title}>Disclaimer</h3>
      </header>

      <ul className={s.list}>
        <li>
          We do not own any of the text from which the data has been extracted.
        </li>
        <li>
          We only offer files that we believe we are free to redistribute. If
          any doubt occurs about the legality of any of our file downloads we
          will take them off right away after contacting us.
        </li>
      </ul>

      <header className={s.head}>
        <span className={s.dot} aria-hidden="true" />
        <h3 className={s.title}>Notice and take down policy</h3>
      </header>

      <p className={s.p}>
        Notice: Should you consider that our data contains material that is
        owned by you and should therefore not be reproduced here, please:
      </p>

      <ul className={s.list}>
        <li>
          Clearly identify yourself, with detailed contact data such as an
          address, telephone number or email address at which you can be
          contacted.
        </li>
        <li>Clearly identify the copyrighted work claimed to be infringed.</li>
        <li>
          Clearly identify the material that is claimed to be infringing and
          information reasonably sufficient to allow us to locate the material.
        </li>
        <li>
          And contact the OPUS project at:{" "}
          <span className={s.mono}>opus-project at helsinki.fi</span>.
        </li>
      </ul>

      <p className={s.p}>
        Take down: We will comply to legitimate requests by removing the
        affected sources from the next release of the corpus.
      </p>
    </section>
  );
}
