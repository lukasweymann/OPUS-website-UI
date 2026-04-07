import s from "./News.module.css";

export default function News({ news = [] }) {
  return (
    <details className={s.news}>
      <summary className={s.toggle} aria-controls="news-list">
        <span className={s.count}>{news.length}</span>
        <span className={s.labelClosed}>News</span>
        <span className={s.labelOpen}>Close news</span>
        <span aria-hidden="true" className={s.caret}>
          ▾
        </span>
      </summary>

      <div id="news-list" className={s.list}>
        {news.map((n, i) => (
          <article key={i} className={s.card}>
            <p
              className={s.title}
              dangerouslySetInnerHTML={{ __html: n.name }}
            />
            <p className={s.date}>{n["release_date"]}</p>
          </article>
        ))}
      </div>
    </details>
  );
}
