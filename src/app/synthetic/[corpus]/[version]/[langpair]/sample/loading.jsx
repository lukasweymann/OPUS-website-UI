import RouteSkeleton, {
  Block,
  Controls,
  Line,
  Samples,
} from "../../../../../components/ui/RouteSkeleton/RouteSkeleton";

export default function SyntheticSampleLoading() {
  return (
    <RouteSkeleton label="Loading synthetic sample">
      <Block>
        <Line width="46%" />
        <Line width="68%" />
        <Line width="32%" />
      </Block>
      <Block>
        <Controls count={2} />
        <Samples rows={6} />
      </Block>
    </RouteSkeleton>
  );
}
