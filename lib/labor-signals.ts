import aiDemandData from "@/data/ai-demand.json";
import aiLayoffData from "@/data/ai-layoffs.json";

export interface DemandPoint { month: string; share: number; }
export interface DemandSeries { country: string; points: DemandPoint[]; }
export interface AIDemand { countries: string[]; series: DemandSeries[]; latest: { country: string; share: number }[]; }
export interface LayoffPoint { month: string; cuts: number; }
export interface AILayoffs { monthly: LayoffPoint[]; annual: { year: number; cuts: number }[]; note: string; }
export interface CountryAIDemand { country: string; iso3: string; latestShare: number; series: { month: string; share: number }[]; }

type AIDemandJson = { countries: string[]; series: DemandSeries[]; latest: { country: string; share: number }[] };
type AILayoffJson = { monthly: LayoffPoint[]; annual: { year: number; cuts: number }[]; note: string };

const ISO3_BY_COUNTRY: Record<string, string> = {
  US: "USA",
  CA: "CAN",
  GB: "GBR",
  AU: "AUS",
  DE: "DEU",
  FR: "FRA",
  IE: "IRL",
  IT: "ITA",
  NL: "NLD",
};

let _aiDemandCache: AIDemand | null = null;
let _aiLayoffCache: AILayoffs | null = null;
let _countryAIDemandCache: CountryAIDemand[] | null = null;

export function getAIDemandSeries(): AIDemand {
  if (!_aiDemandCache) {
    const data = aiDemandData as AIDemandJson;
    _aiDemandCache = {
      countries: [...data.countries],
      series: data.series.map((series) => ({
        country: series.country,
        points: series.points
          .filter((point) => isFiniteNumber(point.share))
          .map((point) => ({ month: point.month, share: point.share })),
      })),
      latest: data.latest
        .filter((point) => isFiniteNumber(point.share))
        .map((point) => ({ country: point.country, share: point.share })),
    };
  }
  return cloneAIDemand(_aiDemandCache);
}

export function getAILayoffSeries(): AILayoffs {
  if (!_aiLayoffCache) {
    const data = aiLayoffData as AILayoffJson;
    _aiLayoffCache = {
      monthly: data.monthly
        .filter((point) => isFiniteNumber(point.cuts))
        .map((point) => ({ month: point.month, cuts: Math.round(point.cuts) })),
      annual: data.annual
        .filter((point) => isFiniteNumber(point.year) && isFiniteNumber(point.cuts))
        .map((point) => ({ year: Math.round(point.year), cuts: Math.round(point.cuts) })),
      note: data.note,
    };
  }
  return cloneAILayoffs(_aiLayoffCache);
}

export function getCountryAIDemand(): CountryAIDemand[] {
  if (!_countryAIDemandCache) {
    _countryAIDemandCache = getAIDemandSeries().series
      .map((countrySeries) => {
        const series = countrySeries.points.map((point) => ({ month: point.month, share: point.share }));
        const latestShare = series[series.length - 1]?.share ?? 0;
        return {
          country: countrySeries.country,
          iso3: ISO3_BY_COUNTRY[countrySeries.country],
          latestShare,
          series,
        };
      })
      .filter((country): country is CountryAIDemand => Boolean(country.iso3))
      .sort((a, b) => b.latestShare - a.latestShare || a.country.localeCompare(b.country));
  }
  return cloneCountryAIDemand(_countryAIDemandCache);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function cloneAIDemand(data: AIDemand): AIDemand {
  return {
    countries: [...data.countries],
    series: data.series.map((series) => ({
      country: series.country,
      points: series.points.map((point) => ({ ...point })),
    })),
    latest: data.latest.map((point) => ({ ...point })),
  };
}

function cloneAILayoffs(data: AILayoffs): AILayoffs {
  return {
    monthly: data.monthly.map((point) => ({ ...point })),
    annual: data.annual.map((point) => ({ ...point })),
    note: data.note,
  };
}

function cloneCountryAIDemand(data: CountryAIDemand[]): CountryAIDemand[] {
  return data.map((country) => ({
    country: country.country,
    iso3: country.iso3,
    latestShare: country.latestShare,
    series: country.series.map((point) => ({ ...point })),
  }));
}
