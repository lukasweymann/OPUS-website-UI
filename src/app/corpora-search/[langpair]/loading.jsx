import s from "./page.module.css";

export default function Loading() {
  return (
    <main className={s.page}>
      <div className={s.skelTitle} />
      <div className={s.skelBox} />
      <div className={s.skelBox} />
      <div className={s.skelBox} />
    </main>
  );
}
