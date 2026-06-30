import HeatmapView from "@/components/heatmap/HeatmapView";
import { getSectorAggregatesExtended } from "@/lib/data";

export default function HeatmapPage() {
  const sectors = getSectorAggregatesExtended();
  return <HeatmapView sectors={sectors} />;
}
