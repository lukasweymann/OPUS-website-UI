import RouteSkeleton, {
  Block,
  Chart,
  Controls,
  Line,
  Split,
  Table,
} from "../components/ui/RouteSkeleton/RouteSkeleton";

export default function MTLoading() {
  return (
    <RouteSkeleton label="Loading dashboard">
      <Block>
        <Line width="26%" />
        <Controls count={3} />
      </Block>
      <Block>
        <Split
          left={
            <>
              <Line width="36%" />
              <Chart bars={14} />
            </>
          }
          right={
            <>
              <Line width="30%" />
              <Table rows={8} columns={4} />
            </>
          }
        />
      </Block>
    </RouteSkeleton>
  );
}
