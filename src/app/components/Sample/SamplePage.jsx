import { notFound } from "next/navigation";
import { safeParseSample } from "@/lib/helpers/safeParseSample";

import SampleClient from "@/app/datasets/[corpus]/[version]/[langpair]/sample/SampleClient";
import SampleNotFound from "@/app/datasets/[corpus]/[version]/[langpair]/sample/SampleNotFound";

export const dynamic = "force-dynamic";

async function fetchIfOk(url) {
  try {
    const res = await fetch(url, {
      headers: { Accept: "text/html" },
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, text: null };
    return { ok: true, text: await res.text() };
  } catch {
    return { ok: false, text: null };
  }
}

function parseLangpair(langpair) {
  let raw = String(langpair);
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // Keep the original value if it is not a valid encoded component.
  }

  const parts = raw.includes("&") ? raw.split("&") : raw.split("-");
  if (parts.length !== 2) return null;

  const [src, trg] = parts.map((p) => p.trim().replaceAll("-", "_"));
  if (!src || !trg) return null;

  return { src, trg };
}

export default async function SamplePage({
  params,
  base,
  buildUrls,
  mode = "normal",
}) {
  const { corpus, version, langpair } = params || {};
  if (!corpus || !version || !langpair) notFound();
  if (!base) notFound();

  const parsed = parseLangpair(langpair);
  if (!parsed) notFound();

  const { src, trg } = parsed;

  const makeUrls =
    buildUrls ??
    (({ base, corpus, version, src, trg }) => ({
      primaryUrl: `${base}/${corpus}/${version}/${src}-${trg}_sample.html`,
      secondaryUrl: `${base}/${corpus}/${version}/${trg}-${src}_sample.html`,
    }));

  const { primaryUrl, secondaryUrl } = makeUrls({
    base,
    corpus,
    version,
    src,
    trg,
  });

  const first = await fetchIfOk(primaryUrl);

  let html = null;
  let backwardsLanguageId = false;

  if (first.ok) {
    html = first.text;
  } else {
    const second = await fetchIfOk(secondaryUrl);
    if (second.ok) {
      html = second.text;
      backwardsLanguageId = true;
    }
  }

  if (!html) {
    return (
      <SampleNotFound
        corpus={corpus}
        version={version}
        langpair={langpair}
        mode={mode}
      />
    );
  }

  const { sampleData, secondModality } = safeParseSample(html);

  if (!sampleData?.length) {
    return (
      <SampleNotFound
        corpus={corpus}
        version={version}
        langpair={langpair}
        mode={mode}
      />
    );
  }

  return (
    <SampleClient
      corpus={corpus}
      version={version}
      langpair={langpair}
      sampleData={sampleData}
      secondModality={secondModality}
      backwardsLanguageId={backwardsLanguageId}
      mode={mode}
    />
  );
}
