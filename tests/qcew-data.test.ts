import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const US_JURISDICTIONS = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
} as const;

const STATE_QCEW_JSON = path.join(process.cwd(), "data/state-qcew.json");
const STATE_QCEW_MODULE = path.join(process.cwd(), "lib/state-qcew.ts");
const STATE_LABOR_JSON = path.join(process.cwd(), "data/state-labor.json");
const PACKAGE_JSON = path.join(process.cwd(), "package.json");
const PLAUSIBLE_QCEW_YEARS = new Set([2025, 2024, 2023]);

type UnknownRecord = Record<string, unknown>;
type HelperFunction = (limit?: number) => unknown;

function record(value: unknown, label: string): UnknownRecord {
  expect(value, `${label} should be an object`).toBeTruthy();
  expect(typeof value, `${label} should be an object`).toBe("object");
  expect(Array.isArray(value), `${label} should not be an array`).toBe(false);
  return value as UnknownRecord;
}

function optionalRecord(value: unknown): UnknownRecord | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : undefined;
}

function statesFrom(value: unknown, label: string): UnknownRecord[] {
  if (Array.isArray(value)) return value.map((item, index) => record(item, `${label}[${index}]`));

  const data = record(value, label);
  const states =
    data.states ??
    data.jurisdictions ??
    data.stateQcew ??
    data.qcewStates ??
    data.employmentWageBaseline ??
    data.baselineStates;
  expect(Array.isArray(states), `${label} should expose a states/jurisdictions array`).toBe(true);
  return (states as unknown[]).map((item, index) => record(item, `${label}.states[${index}]`));
}

function stringFrom(scopes: UnknownRecord[], keys: string[], label: string): string {
  for (const scope of scopes) {
    for (const key of keys) {
      const value = scope[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  throw new Error(`${label} should expose one of: ${keys.join(", ")}`);
}

function optionalStringFrom(scopes: UnknownRecord[], keys: string[]): string | undefined {
  for (const scope of scopes) {
    for (const key of keys) {
      const value = scope[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return undefined;
}

function optionalNumberFrom(
  scopes: UnknownRecord[],
  keys: string[],
  label: string,
  options: { integer?: boolean; min?: number } = {},
): number | undefined {
  for (const scope of scopes) {
    for (const key of keys) {
      const value = scope[key];
      if (value == null) continue;
      expect(typeof value, `${label} should be numeric when present`).toBe("number");
      if (typeof value !== "number") return undefined;
      expect(Number.isFinite(value), `${label} should be finite`).toBe(true);
      if (options.integer) expect(Number.isInteger(value), `${label} should be an integer`).toBe(true);
      if (options.min !== undefined) expect(value, `${label} should be >= ${options.min}`).toBeGreaterThanOrEqual(options.min);
      return value;
    }
  }
  return undefined;
}

function optionalBooleanFrom(scopes: UnknownRecord[], keys: string[]): boolean | undefined {
  for (const scope of scopes) {
    for (const key of keys) {
      const value = scope[key];
      if (typeof value === "boolean") return value;
    }
  }
  return undefined;
}

function yearFrom(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/\b(20\d{2})\b/);
    if (match) return Number(match[1]);
  }
  return undefined;
}

function qcewOf(row: UnknownRecord): UnknownRecord {
  return (
    optionalRecord(row.qcew) ??
    optionalRecord(row.qcewBaseline) ??
    optionalRecord(row.employmentWageBaseline) ??
    optionalRecord(row.baseline) ??
    row
  );
}

function qcewScopes(row: UnknownRecord): UnknownRecord[] {
  const qcew = qcewOf(row);
  return [
    optionalRecord(row.qcewLatest),
    optionalRecord(qcew.latest),
    optionalRecord(row.latest),
    qcew,
    optionalRecord(row.metrics),
    row,
  ].filter(Boolean) as UnknownRecord[];
}

function warnOf(row: UnknownRecord): UnknownRecord {
  return optionalRecord(row.warn) ?? optionalRecord(row.warnMetrics) ?? optionalRecord(row.warnPressure) ?? row;
}

function sourceRecords(snapshot: UnknownRecord): UnknownRecord[] {
  const metadata = optionalRecord(snapshot.metadata) ?? {};
  const candidates = [
    optionalRecord(snapshot.source),
    optionalRecord(snapshot.qcewSource),
    optionalRecord(snapshot.baselineSource),
    optionalRecord(metadata.source),
  ].filter(Boolean) as UnknownRecord[];

  if (Array.isArray(snapshot.sources)) {
    candidates.push(...snapshot.sources.map((source, index) => record(source, `sources[${index}]`)));
  }

  expect(candidates.length, "state-qcew snapshot should include source metadata").toBeGreaterThan(0);
  return candidates;
}

function codeOf(row: UnknownRecord): keyof typeof US_JURISDICTIONS {
  const code = stringFrom([row], ["state", "stateCode", "code"], "state code");
  expect(Object.keys(US_JURISDICTIONS), `${code} should be a U.S. state/DC code`).toContain(code);
  return code as keyof typeof US_JURISDICTIONS;
}

function nameOf(row: UnknownRecord): string {
  return stringFrom([row], ["stateName", "name"], "state name");
}

function qcewYearOf(row: UnknownRecord, snapshot: UnknownRecord): number {
  const summary = optionalRecord(snapshot.summary) ?? {};
  const year =
    qcewScopes(row)
      .map((scope) => yearFrom(scope.year) ?? yearFrom(scope.qcewYear) ?? yearFrom(scope.annualYear) ?? yearFrom(scope.referenceYear) ?? yearFrom(scope.period))
      .find((candidate) => candidate !== undefined) ??
    yearFrom(row.year) ??
    yearFrom(row.qcewYear) ??
    yearFrom(summary.qcewYear) ??
    yearFrom(summary.latestQcewYear) ??
    yearFrom(snapshot.qcewYear) ??
    yearFrom(snapshot.latestQcewYear);

  expect(year, `${codeOf(row)} should expose a QCEW reference year`).toBeDefined();
  return year as number;
}

function qcewEmploymentOf(row: UnknownRecord): number | undefined {
  return optionalNumberFrom(
    qcewScopes(row),
    [
      "annualAverageEmployment",
      "averageAnnualEmployment",
      "avgAnnualEmployment",
      "averageEmployment",
      "employmentAnnualAverage",
      "annualAvgEmployment",
      "qcewPrivateEmployment",
      "qcewEmployment",
      "privateEmployment",
      "denominatorEmployment",
      "employment",
    ],
    `${codeOf(row)} QCEW employment`,
    { integer: true, min: 0 },
  );
}
function qcewWageOf(row: UnknownRecord): number | undefined {
  return optionalNumberFrom(
    qcewScopes(row),
    [
      "totalAnnualWages",
      "annualWages",
      "totalWages",
      "qcewWages",
      "privateAnnualWages",
      "averageAnnualPay",
      "avgAnnualPay",
      "annualPay",
      "averageWeeklyWage",
      "avgWeeklyWage",
      "weeklyWage",
      "wages",
    ],
    `${codeOf(row)} QCEW wage/pay`,
    { min: 0 },
  );
}

function warnEmployeesOf(row: UnknownRecord): number | undefined {
  const warn = warnOf(row);
  return optionalNumberFrom(
    [optionalRecord(row.warnWindow), warn, optionalRecord(row.metrics)].filter(Boolean) as UnknownRecord[],
    ["affectedEmployees", "warnAffectedEmployees", "warnEmployees12m", "warnEmployees", "employees12m", "employees"],
    `${codeOf(row)} WARN affected employees`,
    { integer: true, min: 0 },
  );
}

function warnRatePer10kQcewOf(row: UnknownRecord): number | undefined {
  const warn = warnOf(row);
  return optionalNumberFrom(
    [...qcewScopes(row), warn],
    [
      "warnEmployeesPer10kQcewPrivateEmployment",
      "warnEmployeesPer10kPrivateEmployment",
      "warnAffectedEmployeesPer10kQcewEmployment",
      "warnEmployeesPer10kQcewEmployment",
      "warnPer10kQcewEmployment",
      "warnRatePer10kQcewEmployment",
      "warnRatePer10kEmployment",
      "warnEmployeesPer10kEmployment",
      "affectedEmployeesPer10kQcewEmployment",
    ],
    `${codeOf(row)} WARN per-10k QCEW employment`,
    { min: 0 },
  );
}

function qcewAvailable(row: UnknownRecord): boolean {
  const available = optionalBooleanFrom(
    qcewScopes(row),
    ["available", "qcewAvailable", "hasQcewBaseline", "recordsIncluded"],
  );
  if (available !== undefined) return available;

  const status = optionalStringFrom(qcewScopes(row), ["status", "availability", "qcewStatus"]);
  return !status || !/unavailable|missing|failed/i.test(status);
}

function unavailableReason(row: UnknownRecord): string | undefined {
  return optionalStringFrom(qcewScopes(row), ["reason", "notes", "missingReason", "unavailableReason", "error"]);
}

function hasPrivateContext(scopes: UnknownRecord[]): boolean {
  if (/private/i.test(JSON.stringify(scopes))) return true;

  return scopes.some((scope) => {
    const code = scope.ownershipCode ?? scope.ownCode ?? scope.ownership;
    return code === 5 || code === "5";
  });
}

function hasAllIndustriesContext(scopes: UnknownRecord[]): boolean {
  const text = JSON.stringify(scopes);
  if (/all[-_\s]*industr(?:y|ies)/i.test(text)) return true;

  return scopes.some((scope) => {
    const code = scope.industryCode ?? scope.industry;
    return code === 10 || code === "10";
  });
}

function expectPrivateAllIndustriesContext(row: UnknownRecord, snapshot: UnknownRecord): void {
  const metadata = optionalRecord(snapshot.metadata) ?? {};
  const summary = optionalRecord(snapshot.summary) ?? {};
  const denominator = optionalRecord(snapshot.denominator) ?? {};
  const scopes = [...qcewScopes(row), metadata, summary, denominator, ...sourceRecords(snapshot)];

  expect(hasPrivateContext(scopes), `${codeOf(row)} should declare private ownership as the QCEW denominator`).toBe(true);
  expect(hasAllIndustriesContext(scopes), `${codeOf(row)} should declare all-industries as the QCEW denominator`).toBe(true);
}

function validateSourceMetadata(snapshot: UnknownRecord): void {
  const sources = sourceRecords(snapshot);
  const sourceText = JSON.stringify(sources);
  expect(sourceText, "QCEW source metadata should identify QCEW").toMatch(/qcew|quarterly census/i);
  expect(sourceText, "QCEW source metadata should identify BLS").toMatch(/bureau of labor statistics|\bbls\b/i);

  const sourceUrl = optionalStringFrom(sources, ["url", "sourceUrl", "href", "downloadUrl", "apiUrl"]);
  expect(sourceUrl, "QCEW source metadata should include a URL").toBeTruthy();
  expect(sourceUrl ?? "", "QCEW source URL should be a BLS/public data URL").toMatch(/^https?:\/\/.+/i);
}

async function importStateQcewModule(): Promise<UnknownRecord> {
  expect(existsSync(STATE_QCEW_MODULE), "Expected lib/state-qcew.ts to export QCEW baseline helpers").toBe(true);
  return import(/* @vite-ignore */ pathToFileURL(STATE_QCEW_MODULE).href) as Promise<UnknownRecord>;
}

function helperFrom(module: UnknownRecord, names: string[], label: string): HelperFunction {
  for (const name of names) {
    const value = module[name];
    if (typeof value === "function") return value as HelperFunction;
  }
  throw new Error(`${label} should export one of: ${names.join(", ")}`);
}

function rowsWithRates(rows: UnknownRecord[]): UnknownRecord[] {
  return rows.filter((row) => warnRatePer10kQcewOf(row) !== undefined);
}

function sortedByWarnRate(rows: UnknownRecord[]): UnknownRecord[] {
  return [...rows].sort((a, b) => {
    const rateDiff = (warnRatePer10kQcewOf(b) ?? -1) - (warnRatePer10kQcewOf(a) ?? -1);
    return rateDiff || nameOf(a).localeCompare(nameOf(b));
  });
}

function hasOwnKey(row: UnknownRecord, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(row, key);
}

function loadStateQcewSnapshot(): UnknownRecord {
  expect(existsSync(STATE_QCEW_JSON), "Expected data/state-qcew.json snapshot").toBe(true);
  return record(JSON.parse(readFileSync(STATE_QCEW_JSON, "utf8")), "state-qcew snapshot");
}

function loadStateLaborSnapshot(): UnknownRecord {
  expect(existsSync(STATE_LABOR_JSON), "Expected data/state-labor.json snapshot").toBe(true);
  return record(JSON.parse(readFileSync(STATE_LABOR_JSON, "utf8")), "state-labor snapshot");
}

function rowsByCode(rows: UnknownRecord[]): Map<string, UnknownRecord> {
  return new Map(rows.map((row) => [codeOf(row), row]));
}

function hasUnusableWarnCoverage(row: UnknownRecord): boolean {
  const coverage = optionalRecord(row.warnCoverage);
  return row.rankEligible === false || coverage?.recordsIncluded === false;
}

function expectExplicitNull(row: UnknownRecord, key: string, label: string): void {
  expect(hasOwnKey(row, key), `${label} should expose ${key}`).toBe(true);
  expect(row[key], `${label} should keep unknown WARN-derived ${key} null, not zero`).toBeNull();
}

describe("state QCEW employment and wage baseline", () => {
  it("declares the build:state-qcew package script", () => {
    const pkg = record(JSON.parse(readFileSync(PACKAGE_JSON, "utf8")), "package.json");
    const scripts = record(pkg.scripts, "package.json scripts");
    const script = scripts["build:state-qcew"];

    expect(typeof script, "package.json should define scripts.build:state-qcew").toBe("string");
    expect((script as string).trim(), "build:state-qcew should point at a QCEW builder").toMatch(/qcew/i);
  });

  it("stores 50 states plus DC with sourced private/all-industries QCEW metrics", () => {
    expect(existsSync(STATE_QCEW_JSON), "Expected data/state-qcew.json snapshot").toBe(true);

    const snapshot = record(JSON.parse(readFileSync(STATE_QCEW_JSON, "utf8")), "state-qcew snapshot");
    const states = statesFrom(snapshot, "state-qcew snapshot");
    expect(states).toHaveLength(51);
    validateSourceMetadata(snapshot);

    const seen = new Set<string>();
    let rowsWithPositiveQcewValues = 0;
    let rowsWithDerivedWarnRate = 0;

    for (const row of states) {
      const code = codeOf(row);
      expect(seen.has(code), `${code} should appear once`).toBe(false);
      seen.add(code);
      expect(nameOf(row)).toBe(US_JURISDICTIONS[code]);
      expect(PLAUSIBLE_QCEW_YEARS.has(qcewYearOf(row, snapshot)), `${code} QCEW year should be 2025, 2024, or 2023`).toBe(true);
      expectPrivateAllIndustriesContext(row, snapshot);

      const employment = qcewEmploymentOf(row);
      const wage = qcewWageOf(row);
      const warnEmployees = warnEmployeesOf(row);
      const warnRate = warnRatePer10kQcewOf(row);

      if (!qcewAvailable(row)) {
        expect(employment ?? 0, `${code} unavailable QCEW rows should not carry fake employment`).toBe(0);
        expect(wage ?? 0, `${code} unavailable QCEW rows should not carry fake wage/pay values`).toBe(0);
        expect(warnRate ?? 0, `${code} unavailable QCEW rows should not carry fake WARN-per-10k rates`).toBe(0);
        expect(unavailableReason(row), `${code} unavailable QCEW rows should explain the missing public data`).toBeTruthy();
        continue;
      }

      expect(employment, `${code} available QCEW row should expose annual average employment`).toBeGreaterThan(0);
      expect(wage, `${code} available QCEW row should expose wage/pay context`).toBeGreaterThan(0);
      rowsWithPositiveQcewValues += 1;

      if (warnEmployees !== undefined && employment !== undefined) {
        expect(warnRate, `${code} should expose WARN affected employees per 10k QCEW employment`).toBeDefined();
        const expectedRate = (warnEmployees / employment) * 10_000;
        expect(Math.abs((warnRate ?? 0) - expectedRate), `${code} WARN per-10k QCEW employment should be derived from WARN employees and QCEW employment`).toBeLessThanOrEqual(
          Math.max(0.02, expectedRate * 0.001),
        );
        rowsWithDerivedWarnRate += 1;
      }
    }

    expect(seen).toEqual(new Set(Object.keys(US_JURISDICTIONS)));
    expect(rowsWithPositiveQcewValues, "QCEW public data should cover nearly all state/DC jurisdictions").toBeGreaterThanOrEqual(50);
    expect(rowsWithDerivedWarnRate, "At least one jurisdiction should expose derived WARN-per-10k QCEW employment").toBeGreaterThan(0);
  });

  it("keeps WARN-derived QCEW fields null for states with unusable WARN coverage", () => {
    const laborSnapshot = loadStateLaborSnapshot();
    const qcewSnapshot = loadStateQcewSnapshot();
    const unusableWarnRows = statesFrom(laborSnapshot, "state-labor snapshot").filter(hasUnusableWarnCoverage);
    const qcewRowsByCode = rowsByCode(statesFrom(qcewSnapshot, "state-qcew snapshot"));

    expect(unusableWarnRows.length, "state-labor should include WARN coverage that is not rank-eligible").toBeGreaterThan(0);
    expect(unusableWarnRows.map(codeOf), "Alabama should be covered by the unusable WARN regression set").toContain("AL");

    for (const laborRow of unusableWarnRows) {
      const code = codeOf(laborRow);
      const qcewRow = qcewRowsByCode.get(code);
      expect(qcewRow, `${code} should still have a matching QCEW baseline row`).toBeDefined();
      const row = qcewRow as UnknownRecord;

      expect(qcewEmploymentOf(row), `${code} should keep positive QCEW employment even when WARN coverage is unknown`).toBeGreaterThan(0);
      expect(qcewWageOf(row), `${code} should keep positive QCEW wage/pay context even when WARN coverage is unknown`).toBeGreaterThan(0);
      expectExplicitNull(row, "warnEmployees12m", code);
      expectExplicitNull(row, "warnNotices12m", code);
      expectExplicitNull(row, "warnEmployeesPer10kQcewEmployment", code);
    }
  });

  it("summarizes only known non-null QCEW WARN baseline rates", () => {
    const snapshot = loadStateQcewSnapshot();
    const summary = record(snapshot.summary, "state-qcew summary");
    const states = statesFrom(snapshot, "state-qcew snapshot");
    const knownRateRows = states.filter((row) => {
      expect(hasOwnKey(row, "warnEmployeesPer10kQcewEmployment"), `${codeOf(row)} should expose the QCEW WARN rate field`).toBe(true);
      const rate = row.warnEmployeesPer10kQcewEmployment;
      expect(rate === null || typeof rate === "number", `${codeOf(row)} QCEW WARN rate should be numeric or null`).toBe(true);
      return rate !== null;
    });
    const totalJurisdictions = typeof summary.totalJurisdictions === "number" ? summary.totalJurisdictions : states.length;

    expect(summary.statesWithBaselineRate, "statesWithBaselineRate should count only non-null QCEW WARN rates").toBe(knownRateRows.length);
    expect(summary.statesWithBaselineRate, "statesWithBaselineRate should not count every jurisdiction when WARN coverage is unknown").toBeLessThan(totalJurisdictions);
  });

  it("exports helpers that return sorted QCEW baseline states and top states", async () => {
    const stateQcewModule = await importStateQcewModule();
    const getData = helperFrom(
      stateQcewModule,
      ["getStateQcewData", "getQcewBaselineData", "getEmploymentWageBaselineData"],
      "state QCEW data helper",
    );
    const getStates = helperFrom(
      stateQcewModule,
      ["getStateQcewStates", "getQcewBaselineStates", "getWarnQcewBaselineStates", "getEmploymentWageBaselineStates"],
      "state QCEW state-list helper",
    );
    const getTopStates = helperFrom(
      stateQcewModule,
      ["getStateQcewTopStates", "getQcewBaselineTopStates", "getWarnQcewBaselineTopStates", "getTopQcewBaselineStates"],
      "state QCEW top-state helper",
    );

    expect(statesFrom(getData(), "QCEW baseline data helper")).toHaveLength(51);

    const states = statesFrom(getStates(), "QCEW baseline state helper");
    expect(states).toHaveLength(51);

    const unknownRateCodes = new Set(
      states
        .filter((row) => {
          expect(hasOwnKey(row, "warnEmployeesPer10kQcewEmployment"), `${codeOf(row)} should expose the QCEW WARN rate field`).toBe(true);
          return row.warnEmployeesPer10kQcewEmployment === null;
        })
        .map(codeOf),
    );
    expect(unknownRateCodes.size, "QCEW helpers should preserve unknown WARN rates as null").toBeGreaterThan(0);

    const ratedStates = rowsWithRates(states);
    expect(ratedStates.length, "QCEW helpers should expose derived WARN-per-10k rates").toBeGreaterThan(0);
    const expectedTop = sortedByWarnRate(ratedStates).slice(0, Math.min(5, ratedStates.length));
    const topFive = statesFrom(getTopStates(5), "QCEW baseline top-state helper");
    const topStates = statesFrom(getTopStates(51), "QCEW baseline top-state helper full limit");

    expect(topFive).toHaveLength(expectedTop.length);
    expect(topFive.map(codeOf)).toEqual(expectedTop.map(codeOf));
    expect(topStates.some((row) => unknownRateCodes.has(codeOf(row))), "QCEW top-state helper should exclude unknown/null-rate states").toBe(false);
    for (let index = 1; index < topFive.length; index += 1) {
      expect(warnRatePer10kQcewOf(topFive[index]), `${codeOf(topFive[index])} top states should be sorted by WARN per-10k QCEW employment`).toBeLessThanOrEqual(
        warnRatePer10kQcewOf(topFive[index - 1]) ?? 0,
      );
    }
  });
});
