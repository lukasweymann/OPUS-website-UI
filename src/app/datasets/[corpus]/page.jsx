import CorpusReleasePage from "./CorpusReleasePage";
import { callPythonReadData } from "@/lib/pythonClient";
import { isExcludedCorpus } from "@/lib/corpusExclusions";

export const dynamicParams = true;

export async function generateStaticParams() {
  const corporaResponse = await callPythonReadData({ corpora: "True" });
  const corpora = Array.isArray(corporaResponse?.corpora)
    ? corporaResponse.corpora
    : [];

  return corpora
    .map((c) => String(c))
    .filter((c) => !isExcludedCorpus(c))
    .map((corpus) => ({ corpus }));
}

export default async function CorpusPage({ params }) {
  const { corpus } = await params;
  return <CorpusReleasePage corpus={corpus} />;
}
