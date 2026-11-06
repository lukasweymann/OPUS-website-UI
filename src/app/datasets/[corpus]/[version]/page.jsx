import CorpusReleasePage, { SKIP } from "../CorpusReleasePage";
import { callPythonReadData } from "@/lib/pythonClient";

export const dynamicParams = true;

export async function generateStaticParams() {
  const response = await callPythonReadData({ versions: "True" });
  const releases = Array.isArray(response?.versions) ? response.versions : [];
  return releases
    .filter((release) => !release.latest && release.corpus && release.version && !SKIP.has(release.corpus.toLowerCase()))
    .map(({ corpus, version }) => ({ corpus, version }));
}

export default async function CorpusVersionPage({ params }) {
  const { corpus, version } = await params;
  return <CorpusReleasePage corpus={corpus} requestedVersion={version} />;
}
