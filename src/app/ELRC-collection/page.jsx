import { CorporaList } from "@/assets/helpers";
import Collection from "../components/Collection/Collection";

export default async function CorporaPage() {
  const cleanCorpora = await CorporaList(true, "elrc");

  return <Collection cleanCorpora={cleanCorpora} />;
}
