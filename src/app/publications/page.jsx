import Publication from "../components/Publication/Publication";
import s from "./page.module.css";
import yaml from "js-yaml";

async function getPublications() {
  const base = process.env.BASE_REPO;
  if (!base) return [];

  const res = await fetch(`${base}/info/publications.yaml`);

  if (!res.ok) return [];

  const text = await res.text();
  const parsed = yaml.load(text);
  return parsed?.PUBLICATIONS ?? [];
}

export default async function PublicationsPage() {
  const pubs = await getPublications();

  const main = pubs.filter((p) => p?.main);
  const all = [...pubs].sort(
    (a, b) => Number(b?.date ?? 0) - Number(a?.date ?? 0)
  );

  return (
    <main className={s.page}>
      <div className={s.container}>
        <header className={s.head}>
          <h1 className={s.h1}>
            <span>OPUS</span> Publications
          </h1>

          <section className={s.cite}>
            <p className={s.lead}>
              If you use OPUS resources, please cite the following publication:
            </p>

            <div className={s.stack}>
              {main.map((pub) => (
                <Publication
                  key={pub.id ?? `${pub.title}-${pub.date}`}
                  ident={pub.id}
                  name={pub.title}
                  description={pub.where}
                  authors={pub.authors}
                  date={pub.date}
                  pdf={pub.pdf}
                  bibtex={pub.bibtex}
                />
              ))}
            </div>
          </section>
        </header>

        <hr className={s.rule} />

        <section className={s.grid} aria-label="All publications">
          {all.map((pub) => (
            <Publication
              key={pub.id ?? `${pub.title}-${pub.date}`}
              ident={pub.id}
              name={pub.title}
              description={pub.where}
              authors={pub.authors}
              date={pub.date}
              pdf={pub.pdf}
              bibtex={pub.bibtex}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
