import RouteSkeleton, {
  Block,
  Controls,
  Line,
  List,
} from "../../components/ui/RouteSkeleton/RouteSkeleton";

export default function ReleaseHistoryLoading() {
  return (
    <RouteSkeleton label="Loading release history">
      <Block>
        <Line width="30%" />
        <Controls count={3} />
      </Block>
      <Block>
        <List rows={8} />
      </Block>
    </RouteSkeleton>
  );
}
