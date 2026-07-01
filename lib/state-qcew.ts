import stateQcewData from "@/data/state-qcew.json";

// ─── QCEW Baseline Ladder (BLS QCEW × state WARN pressure) ──────────────────
// Route-specific data helper for /labor's Employment & Wage Baseline module.

export interface QcewCodeLabel {
  code: string;
  label: string;
}

export interface StateQcewSource {
  name: string;
  publisher: string;
  url: string;
  endpointPattern: string;
  license: string;
  year: number;
  yearsTried: number[];
  verifiedColumns: string[];
  note: string;
}

export interface StateQcewMethodology {
  qcewSelection: string;
  wageFields: string;
  warnJoin: string;
  rateFormula: string;
  denominatorNote: string;
}

export interface StateQcewAttempt {
  year: number;
  statesWithEmployment: number;
  missingStates: string[];
}

export interface StateQcewSummary {
  qcewYear: number;
  totalJurisdictions: number;
  statesWithQcewData: number;
  privateOwnershipStates: number;
  allOwnershipFallbackStates: number;
  fallbackStates: string[];
  statesWithBaselineRate: number;
  rankedStates: number;
  highestBaselineState: string | null;
  highestBaselineRate: number | null;
  warnWindowMonths: number;
  warnWindowStart: string | null;
  warnWindowEnd: string | null;
  stateLaborGeneratedAt: string | null;
  candidateYearAttempts: StateQcewAttempt[];
}

export interface StateQcewSourceRow {
  areaFips: string | null;
  ownCode: string | null;
  industryCode: string | null;
  aggregationLevelCode: string | null;
  sizeCode: string | null;
  year: number | null;
  quarter: string | null;
  disclosureCode: string | null;
  annualAverageEstablishments: number | null;
  totalAnnualWages: number | null;
  annualAverageEmploymentSource: string | null;
  averageAnnualPaySource: string | null;
  averageWeeklyWageSource: string | null;
  usedAllOwnershipFallback: boolean;
  derivedAnnualAverageEmployment: boolean;
}

export interface StateQcewBaselineState {
  state: string;
  stateName: string;
  fips: string;
  qcewYear: number;
  ownership: QcewCodeLabel | null;
  industry: QcewCodeLabel;
  annualAverageEmployment: number | null;
  averageAnnualPay: number | null;
  averageWeeklyWage: number | null;
  warnEmployees12m: number | null;
  warnNotices12m: number | null;
  warnEmployeesPer10kQcewEmployment: number | null;
  lausLaborForce: number | null;
  warnPressureRank: number | null;
  warnPressureScore: number | null;
  rankEligible: boolean;
  dataQualityNotes: string[];
  sourceRow: StateQcewSourceRow | null;
}

export interface StateQcewData {
  generatedAt: string;
  source: StateQcewSource;
  methodology: StateQcewMethodology;
  summary: StateQcewSummary;
  states: StateQcewBaselineState[];
}

const data = stateQcewData as unknown as StateQcewData;

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRankedBaselineState(state: StateQcewBaselineState): boolean {
  return state.rankEligible && isFiniteNumber(state.warnEmployeesPer10kQcewEmployment);
}

export function getStateQcewData(): StateQcewData {
  return data;
}

export function getStateQcewSource(): StateQcewSource {
  return {
    ...data.source,
    yearsTried: [...data.source.yearsTried],
    verifiedColumns: [...data.source.verifiedColumns],
  };
}

export function getQcewBaselineStates(): StateQcewBaselineState[] {
  return [...data.states].sort((a, b) => {
    const aRanked = isRankedBaselineState(a);
    const bRanked = isRankedBaselineState(b);
    if (aRanked && bRanked) {
      return (
        (b.warnEmployeesPer10kQcewEmployment ?? 0) - (a.warnEmployeesPer10kQcewEmployment ?? 0) ||
        a.stateName.localeCompare(b.stateName)
      );
    }
    if (aRanked !== bRanked) return aRanked ? -1 : 1;
    return a.stateName.localeCompare(b.stateName);
  });
}

export function getQcewBaselineTopStates(limit = 10): StateQcewBaselineState[] {
  return getQcewBaselineStates()
    .filter(isRankedBaselineState)
    .slice(0, limit);
}

export function getQcewBaselineSummary(): StateQcewSummary {
  return {
    ...data.summary,
    fallbackStates: [...data.summary.fallbackStates],
    candidateYearAttempts: data.summary.candidateYearAttempts.map((attempt) => ({
      ...attempt,
      missingStates: [...attempt.missingStates],
    })),
  };
}
