import RouteSkeleton, {
  Block,
  Line,
  List,
} from "../components/ui/RouteSkeleton/RouteSkeleton";

export default function PublicationsLoading() {
  return (
    <RouteSkeleton label="Loading publications">
      <Block>
        <Line width="26%" />
        <Line width="54%" />
      </Block>
      <Block>
        <List rows={8} />
      </Block>
    </RouteSkeleton>
  );
}
