import Image from "next/image";
import notFoundImg from "@/../public/img/notfound.svg";

import CorporaTable from "@/app/components/CorporaSearchTable/Table";
import s from "./page.module.css";

import { callPythonReadData } from "@/lib/pythonClient";
import { languagePairName } from "../../../../hooks/hooks";

export const revalidate = 900;

function parsePair(param = "") {
  // expected: "en-es&de-fr" style? Your code uses split("&")[0], [1]
  const parts = String(param).split("%26");
  const origin = (parts[0] ?? "").replace(/-/g, "_");
  const target = (parts[1] ?? "").replace(/-/g, "_");
  return { origin, target };
}

function pctLabelForMono(sourceValue) {
  return `txt ${String(sourceValue).replace(/-/g, "_")}`;
}

export default async function CorpusResultPage({ params }) {
  const { langpair } = await params;

  const { origin, target } = parsePair(langpair);

  const corporaList = await callPythonReadData({
    source: origin,
    target,
  });

  const langPair = languagePairName([origin, target]);

  const corpora = Array.isArray(corporaList?.corpora)
    ? corporaList.corpora
    : [];

  const keyOf = (x) => `${x.corpus}__${x.version}`;
  const monoDefaultLabel = pctLabelForMono(langPair?.[0]?.value ?? origin);

  const grouped = new Map();

  for (const el of corpora) {
    if (!el?.corpus || !el?.version) continue;

    const key = keyOf(el);
    let g = grouped.get(key);

    if (!g) {
      g = {
        corpus: el.corpus,
        version: el.version,
        bilingualFormats: [],
        monoFormats: [],
        defaultFormat: [],
        monoDefaultFormat: [],
        representative: el, // will be replaced if we see moses
        hasMoses: el.preprocessing === "moses",
      };
      grouped.set(key, g);
    }

    const isBilingual = Boolean(el.source && el.target);

    if (isBilingual) {
      const fmt = { format: el.preprocessing, url: el.url };
      g.bilingualFormats.push(fmt);

      if (el.preprocessing === "moses") {
        g.defaultFormat = [fmt];
        g.representative = el;
        g.hasMoses = true;
      } else if (!g.hasMoses) {
        g.representative = el;
      }
    } else if (!el.target) {
      // mono labeling rules
      let label = `${el.preprocessing} ${el.source}`;
      if (el.preprocessing === "mono") {
        if (String(el.url || "").includes("txt")) label = `txt ${el.source}`;
        else if (String(el.url || "").includes("tok"))
          label = `tok ${el.source}`;
      }

      const monoEntry = { format: label, url: el.url };
      g.monoFormats.push(monoEntry);

      if (label === monoDefaultLabel) {
        g.monoDefaultFormat = [monoEntry];
      }
    }
  }

  const rows = Array.from(grouped.values()).map((g) => {
    const rep = g.representative;
    return {
      corpus: g.corpus,
      version: g.version,
      src: rep.source,
      trg: rep.target,
      latest: rep.latest,
      format: rep.preprocessing,
      sents: rep["alignment_pairs"],
      srcTokens: rep["source_tokens"],
      trgTokens: rep["target_tokens"],
      bilingualFormats: g.bilingualFormats,
      monoFormats: g.monoFormats,
      defaultFormat: g.defaultFormat,
      monoDefaultFormat: g.monoDefaultFormat,
    };
  });

  // Preserve original semantics
  const data = rows.filter((r) => r.format === "moses");

  const srcLabel = langPair?.[0]?.label ?? origin;
  const trgLabel = langPair?.[1]?.label ?? target;

  return (
    <main className={s.page}>
      {data.length === 0 ? (
        <section className={s.empty}>
          <h1 className={s.h1}>No results found for your search.</h1>
          <Image className={s.emptyImg} src={notFoundImg} alt="" priority />
        </section>
      ) : (
        <>
          <h1 className={s.h1}>
            Resources for {srcLabel} – {trgLabel}{" "}
            <span className={s.count}>({data.length} found)</span>
          </h1>
          <CorporaTable tableData={data} langPair={langPair} />
        </>
      )}
    </main>
  );
}
