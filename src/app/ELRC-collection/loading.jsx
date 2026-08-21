import RouteSkeleton, {
  Block,
  Controls,
  Line,
  Table,
} from "../components/ui/RouteSkeleton/RouteSkeleton";

export default function CollectionLoading() {
  return (
    <RouteSkeleton label="Loading collection">
      <Block>
        <Line width="32%" />
        <Line width="58%" />
        <Controls count={3} />
      </Block>
      <Block>
        <Table rows={8} columns={3} />
      </Block>
    </RouteSkeleton>
  );
}
