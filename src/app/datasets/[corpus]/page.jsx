import CorpusReleasePage, { SKIP } from "./CorpusReleasePage";
import { callPythonReadData } from "@/lib/pythonClient";

export const dynamicParams = true;

export async function generateStaticParams() {
  const corporaResponse = await callPythonReadData({ corpora: "True" });
  const corpora = Array.isArray(corporaResponse?.corpora)
    ? corporaResponse.corpora
    : [];

  return corpora
    .map((c) => String(c))
    .filter((c) => !SKIP.has(c.toLowerCase()))
    .map((corpus) => ({ corpus }));
}

export default async function CorpusPage({ params }) {
  const { corpus } = await params;
  return <CorpusReleasePage corpus={corpus} />;
}
