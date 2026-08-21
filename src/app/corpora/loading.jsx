import RouteSkeleton, {
  Block,
  Controls,
  Line,
  Table,
} from "../components/ui/RouteSkeleton/RouteSkeleton";

export default function CorporaLoading() {
  return (
    <RouteSkeleton label="Loading corpora">
      <Block>
        <Line width="34%" />
        <Line width="62%" />
        <Controls count={3} />
      </Block>
      <Block>
        <Line width="24%" />
        <Table rows={8} columns={3} />
      </Block>
    </RouteSkeleton>
  );
}
