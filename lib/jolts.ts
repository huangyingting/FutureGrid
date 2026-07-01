import joltsData from "@/data/jolts.json";

// ─── BLS JOLTS (Job Openings and Labor Turnover Survey) ──────────────────────
// Government layoffs & discharges, hires, quits, openings, total separations —
// national monthly 2001–2025 + by industry supersector. Kept in its own module
// (not lib/data.ts) so the ~1MB snapshot only ships in the Labor-Market-Pulse
// route chunk, not the shared bundle.

export interface JoltsPoint {
  date: string; // "YYYY-MM"
  value: number;
}

export interface JoltsIndustry {
  code: string;
  name: string;
  layoffsLevel: JoltsPoint[];
  layoffsRate: JoltsPoint[];
  latest: {
    date: string;
    LDL: number;
    LDR: number;
    JOL: number;
    QUL: number;
    HIL: number;
  };
}

export interface JoltsSource {
  name: string;
  publisher: string;
  survey: string;
  url: string;
  license: string;
  note?: string;
}

export interface JoltsData {
  generatedAt: string;
  source: JoltsSource;
  national: { series: Record<string, JoltsPoint[]> };
  industries: JoltsIndustry[];
}

const data = joltsData as unknown as JoltsData;

/** Human-readable labels + descriptions for each JOLTS data element. */
export const JOLTS_ELEMENTS: Record<
  string,
  { label: string; kind: "level" | "rate"; element: string }
> = {
  LDL: { label: "Layoffs & discharges", kind: "level", element: "LD" },
  LDR: { label: "Layoffs & discharges rate", kind: "rate", element: "LD" },
  JOL: { label: "Job openings", kind: "level", element: "JO" },
  JOR: { label: "Job openings rate", kind: "rate", element: "JO" },
  QUL: { label: "Quits", kind: "level", element: "QU" },
  QUR: { label: "Quits rate", kind: "rate", element: "QU" },
  HIL: { label: "Hires", kind: "level", element: "HI" },
  HIR: { label: "Hires rate", kind: "rate", element: "HI" },
  TSL: { label: "Total separations", kind: "level", element: "TS" },
  TSR: { label: "Total separations rate", kind: "rate", element: "TS" },
};

export function getJoltsData(): JoltsData {
  return data;
}

export function getJoltsSource(): JoltsSource {
  return data.source;
}

/** A national monthly series by key (e.g. "LDL"), ascending by date. */
export function getJoltsSeries(key: string): JoltsPoint[] {
  return data.national.series[key] ?? [];
}

/** Latest month's value for every national series, plus the month string. */
export function getJoltsLatestNational(): { date: string; values: Record<string, number> } {
  const values: Record<string, number> = {};
  let date = "";
  for (const [key, series] of Object.entries(data.national.series)) {
    if (series.length) {
      const last = series[series.length - 1];
      values[key] = last.value;
      date = last.date;
    }
  }
  return { date, values };
}

/** Industries sorted by latest layoffs & discharges (level), largest first. */
export function getJoltsIndustriesByLayoffs(): JoltsIndustry[] {
  return [...data.industries].sort((a, b) => (b.latest?.LDL ?? 0) - (a.latest?.LDL ?? 0));
}

/** Peak layoffs & discharges month in the national history (e.g. the 2020 spike). */
export function getJoltsLayoffsPeak(): JoltsPoint | null {
  const s = getJoltsSeries("LDL");
  if (!s.length) return null;
  return s.reduce((max, p) => (p.value > max.value ? p : max), s[0]);
}
