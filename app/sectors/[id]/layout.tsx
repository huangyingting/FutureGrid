import { getSectorAggregatesExtended } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSectorAggregatesExtended().map((sector) => ({
    id: sector.sector,
  }));
}

export default function SectorDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}