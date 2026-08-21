import RouteSkeleton, {
  Block,
  Controls,
  Line,
  Samples,
} from "../../components/ui/RouteSkeleton/RouteSkeleton";

export default function CompareLoading() {
  return (
    <RouteSkeleton label="Loading comparison">
      <Block>
        <Line width="38%" />
        <Line width="78%" />
        <Line width="68%" />
      </Block>
      <Block>
        <Controls count={4} />
      </Block>
      <Block>
        <Samples rows={7} />
      </Block>
    </RouteSkeleton>
  );
}
