import RouteSkeleton, {
  Block,
  Chart,
  Controls,
  Line,
  Split,
  Table,
} from "../../components/ui/RouteSkeleton/RouteSkeleton";

export default function CompareModelsLoading() {
  return (
    <RouteSkeleton label="Loading model comparison">
      <Block>
        <Line width="34%" />
        <Line width="64%" />
        <Controls count={4} />
      </Block>
      <Block>
        <Split
          left={
            <>
              <Line width="28%" />
              <Chart bars={16} />
            </>
          }
          right={
            <>
              <Line width="32%" />
              <Table rows={7} columns={4} />
            </>
          }
        />
      </Block>
    </RouteSkeleton>
  );
}
