import RouteSkeleton, {
  Block,
  Chart,
  Controls,
  Line,
  Table,
} from "../../../components/ui/RouteSkeleton/RouteSkeleton";

export default function SyntheticCorpusLoading() {
  return (
    <RouteSkeleton label="Loading synthetic corpus">
      <Block>
        <Line width="36%" />
        <Line width="64%" />
        <Controls count={2} />
      </Block>
      <Block>
        <Line width="28%" />
        <Chart bars={18} />
      </Block>
      <Block>
        <Line width="32%" />
        <Table rows={7} columns={4} />
      </Block>
    </RouteSkeleton>
  );
}
