import RouteSkeleton, {
  Block,
  Line,
  List,
  Split,
} from "../components/ui/RouteSkeleton/RouteSkeleton";

export default function SyntheticLoading() {
  return (
    <RouteSkeleton label="Loading synthetic corpora">
      <Block>
        <Line width="24%" />
        <Line width="68%" />
        <Line width="58%" />
      </Block>
      <Block>
        <Split
          left={
            <>
              <Line width="30%" />
              <List rows={7} />
            </>
          }
          right={
            <>
              <Line width="26%" />
              <List rows={4} />
            </>
          }
        />
      </Block>
    </RouteSkeleton>
  );
}
