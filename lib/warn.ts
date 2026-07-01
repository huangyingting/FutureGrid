import warnData from "@/data/warn-notices.json";

// ─── WARN mass-layoff notices (California EDD) ───────────────────────────────
// Company-level government layoff filings. Kept in its own module (not
// lib/data.ts) so the snapshot only ships in the Recent-Layoffs route chunk.

export interface WarnNotice {
  company: string;
  county: string | null;
  city: string | null;
  employees: number;
  noticeDate: string | null; // ISO "YYYY-MM-DD"
  effectiveDate: string | null;
  layoffType: string | null;
  state: string; // 2-letter, e.g. "CA"
  stateName: string; // e.g. "California"
}

export interface WarnMonth {
  month: string; // "YYYY-MM"
  notices: number;
  employees: number;
}

export interface WarnDateRange {
  earliest: string | null;
  latest: string | null;
}

export interface WarnStateStat {
  state: string;
  stateName: string;
  notices: number;
  employees: number;
  dateRange: WarnDateRange;
}

export interface WarnSummary {
  total: number;
  totalEmployees: number;
  dateRange: WarnDateRange;
  byState: WarnStateStat[];
  byMonth: WarnMonth[];
  byType: { type: string; notices: number; employees: number }[];
  topEmployers: { company: string; employees: number; notices: number; state: string }[];
}

export interface WarnSource {
  state: string;
  stateName: string;
  name: string;
  publisher: string;
  url: string;
  license: string;
}

export interface WarnData {
  generatedAt: string;
  coverage: string;
  sources: WarnSource[];
  notices: WarnNotice[];
  summary: WarnSummary;
}

const data = warnData as unknown as WarnData;

export function getWarnData(): WarnData {
  return data;
}

export function getWarnCoverage(): string {
  return data.coverage;
}

export function getWarnSources(): WarnSource[] {
  return data.sources;
}

/** Per-state totals (from the full pre-trim set), sorted by employees desc. */
export function getWarnByState(): WarnStateStat[] {
  return data.summary.byState;
}

export function getWarnSummary(): WarnSummary {
  return data.summary;
}

/** All notices (already sorted most-recent-first in the snapshot). */
export function getWarnNotices(): WarnNotice[] {
  return data.notices;
}

/** The most recent N notices. */
export function getRecentWarnNotices(limit = 25): WarnNotice[] {
  return data.notices.slice(0, limit);
}

/** Notices + affected employees aggregated by county (for a map / ranking). */
export function getWarnByCounty(): { county: string; notices: number; employees: number }[] {
  const map = new Map<string, { notices: number; employees: number }>();
  for (const n of data.notices) {
    const key = n.county ?? "Unknown";
    const e = map.get(key) ?? { notices: 0, employees: 0 };
    e.notices += 1;
    e.employees += n.employees;
    map.set(key, e);
  }
  return [...map.entries()]
    .map(([county, v]) => ({ county, ...v }))
    .sort((a, b) => b.employees - a.employees);
}
