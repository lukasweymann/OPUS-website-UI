import SamplePage from "@/app/components/Sample/SamplePage";

export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const readyParams = await params;

  return <SamplePage params={readyParams} base={process.env.SAMPLE_BASE} />;
}
