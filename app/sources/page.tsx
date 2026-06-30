import SourcesView from "@/components/sources/SourcesView";
import { getDataSources } from "@/lib/data";

export default function SourcesPage() {
  const { generatedAt, sources, note } = getDataSources();

  const snapshotDate = (() => {
    try {
      const d = new Date(generatedAt);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return null;
    }
  })();

  return (
    <SourcesView
      generatedAt={generatedAt}
      snapshotDate={snapshotDate}
      sources={sources}
      note={note ?? null}
    />
  );
}
