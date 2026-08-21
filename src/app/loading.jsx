import s from "./loading.module.css";

function Line({ width = "100%" }) {
  return <span className={s.line} style={{ "--w": width }} />;
}

export default function Loading() {
  return (
    <main className={s.wrap} aria-busy="true" aria-label="Loading page">
      <section className={s.panel}>
        <Line width="34%" />
        <Line width="62%" />
        <div className={s.grid}>
          <span />
          <span />
          <span />
        </div>
      </section>
      <section className={s.panel}>
        <Line width="24%" />
        <Line width="78%" />
        <Line width="66%" />
      </section>
    </main>
  );
}
