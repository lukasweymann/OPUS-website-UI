// components/NotFoundDashboard/NotFoundDashboard.jsx
import s from "./NotFound.module.css";

export default function NotFoundDashboard() {
  return (
    <section className={s.wrap} role="status" aria-live="polite">
      <div className={s.rule} aria-hidden="true" />
      <h2 className={s.title}>
        We&apos;re sorry, no comparison data was found. Please try another
        evaluation metric or language pair.
      </h2>
      <div className={s.rule} aria-hidden="true" />
    </section>
  );
}
