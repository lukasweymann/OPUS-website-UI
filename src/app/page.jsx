import Link from "next/link";
import { load as yamlLoad } from "js-yaml";
import { ArrowRight, FileArchive } from "lucide-react";

import Banner from "./components/Banner/Banner";
import Partners from "./components/Partners/Partners";
import News from "./components/News/News";
import SizesTable from "./components/SizesTable/SizesTable";
import { removeLanguage } from "../../hooks/hooks";
import { callPythonReadData } from "@/lib/pythonClient";

import s from "./page.module.css";

export const metadata = {
  title: "OPUS - Corpora",
  description: "The biggest corpora collection on the web.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const revalidate = 50000;

async function fetchText(url) {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) {
    throw new Error(`Fetch failed (${res.status}) for ${url}`);
  }
  return res.text();
}

async function getHomeData() {
  const { languages: rawLanguages } = await callPythonReadData({
    languages: "True",
  });
  const yamlText = await fetchText(
    "https://raw.githubusercontent.com/lukasweymann/OPUS/refs/heads/patch-1/info/news.yaml",
  );
  const corpora = await callPythonReadData({
    preprocessing: "xml",
    version: "latest",
  });
  const corporaNames = await callPythonReadData({
    corpora: "True",
    version: "latest",
  });

  const yamlToJson = yamlLoad(yamlText);

  // 1) Languages
  const cleanLanguages = rawLanguages.filter(
    (num) => !/\d/.test(num) && !removeLanguage.includes(num),
  );

  // 2) Corpora names & totals
  const totalCorporaCount = corporaNames.corpora.length;

  const cleanCorpora = corpora.corpora.filter(
    (corpus) =>
      !corpus.corpus.toLowerCase().includes("elrc") &&
      !corpus.corpus.toLowerCase().includes("elra"),
  );

  const cleanCorporaNames = corporaNames.corpora.filter(
    (corpus) =>
      !corpus.toLowerCase().includes("elrc") &&
      !corpus.toLowerCase().includes("elra"),
  );
  const totalCleanCorpora = cleanCorporaNames.length;

  // 3) Pre-index corpora totals by corpus name
  const byCorpus = new Map(); // name -> { sentences, version }
  for (const c of corpora.corpora) {
    const entry = byCorpus.get(c.corpus);
    const pairs = Number(c.alignment_pairs) || 0;
    if (entry) {
      entry.sentences += pairs;
      entry.version = c.version;
    } else {
      byCorpus.set(c.corpus, { sentences: pairs, version: c.version || "" });
    }
  }

  // 4) Build corporaNamesObjects
  const corporaNamesObjects = cleanCorporaNames.map((corpusName) => {
    const hit = byCorpus.get(corpusName);
    return {
      corpusName,
      sentences: hit ? hit.sentences : 0,
      percentage: 0,
      corpusLabelMobile: "",
      version: hit ? hit.version : "",
    };
  });

  // 5) Totals
  const total = corpora.corpora.reduce(
    (sum, c) => sum + (Number(c.alignment_pairs) || 0),
    0,
  );
  const totalCorporaFiltered = cleanCorpora.reduce(
    (sum, x) => sum + (Number(x.alignment_pairs) || 0),
    0,
  );

  // 6) Percentages + mobile labels
  for (const obj of corporaNamesObjects) {
    const perc = total > 0 ? obj.sentences / total : 0;
    obj.percentage = perc;
    obj.corpusLabelMobile = `${obj.corpusName}: %${perc.toFixed(5)}`;
  }

  // 7) Sort
  const biggestDatasets = [...corporaNamesObjects].sort(
    (a, b) => b.percentage - a.percentage,
  );

  // 8) Same metric as before
  const biggestDatasetsPercentage = (totalCorporaFiltered / total) * 100;

  return {
    cleanLanguages,
    totalCorporaCount,
    total,
    totalCleanCorpora,
    biggestDatasetsPercentage,
    biggestDatasets,
    yamlToJson,
  };
}

export default async function Home() {
  const {
    cleanLanguages,
    totalCorporaCount,
    total,
    totalCleanCorpora,
    biggestDatasetsPercentage,
    biggestDatasets,
    yamlToJson,
  } = await getHomeData();

  return (
    <main className={s.page}>
      <div className={s.container}>
        <Banner languageList={cleanLanguages}>
          {yamlToJson && <News news={yamlToJson.NEWS} />}
        </Banner>

        <section className={s.overview}>
          <div className={s.summary}>
            <h2>An overview of the OPUS collection</h2>

            <div className={s.kpis}>
              <p>
                <Link href="/corpora" className={s.kpiLink}>
                  <span>{totalCorporaCount.toLocaleString("en-US")}</span>{" "}
                  corpora
                </Link>
              </p>
              <p>
                <span>{total.toLocaleString("en-US")}</span> total sentence
                pairs
              </p>
              <p>
                <span>{cleanLanguages.length}</span> languages available
              </p>

              <p className={s.note}>
                This table displays <span>{totalCleanCorpora}</span> corpora,
                which make up a total{" "}
                <span>{biggestDatasetsPercentage.toFixed(2)}%</span> of the
                entire <span>OPUS</span> collection
              </p>

              <Link href="/download-formats" className={s.formatLink}>
                <FileArchive size={17} strokeWidth={1.8} aria-hidden="true" />
                <span>
                  Download formats
                  <small>XML, Moses, TMX, plain text, and frequency files</small>
                </span>
                <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <SizesTable corpora={biggestDatasets} />
        </section>

        <section className={s.partners}>
          <h2>Funding and Support</h2>
          <Partners />
        </section>
      </div>
    </main>
  );
}
