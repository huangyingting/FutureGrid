import { describe, expect, it } from "vitest";
import { getOccupationExposureLenses } from "@/lib/exposure";
import { getCountryAIDemand } from "@/lib/labor-signals";

const nullablePctLenses = ["usage", "capability", "ability", "automation"] as const;

function expectPct(value: number): void {
  expect(Number.isFinite(value)).toBe(true);
  expect(value).toBeGreaterThanOrEqual(0);
  expect(value).toBeLessThanOrEqual(100);
}

function expectNullablePct(value: number | null): void {
  if (value == null) return;
  expectPct(value);
}

describe("getOccupationExposureLenses", () => {
  it("returns valid exposure lenses for Software Developers", () => {
    const lenses = getOccupationExposureLenses("15-1252");
    expect(lenses).not.toBeNull();
    if (!lenses) throw new Error("Expected Software Developers exposure lenses");

    expect(lenses.code).toBe("15-1252");
    expect(lenses.usage).not.toBeNull();
    expect(lenses.capability).not.toBeNull();
    expectPct(lenses.usage!);
    expectPct(lenses.capability!);

    if (lenses.capability != null && lenses.usage != null) {
      expect(lenses.gap).toBeCloseTo(lenses.capability - lenses.usage, 5);
    }

    expectNullablePct(lenses.consensus);
    for (const lens of nullablePctLenses) {
      expectNullablePct(lenses[lens]);
    }
  });

  it("shows high capability and a positive gap for a clerical role", () => {
    const lenses = getOccupationExposureLenses("43-9022");
    expect(lenses).not.toBeNull();
    if (!lenses) throw new Error("Expected Word Processors and Typists exposure lenses");

    expect(lenses.capability).not.toBeNull();
    expect(lenses.usage).not.toBeNull();
    expect(lenses.capability!).toBeGreaterThan(50);
    expect(lenses.capability!).toBeGreaterThan(lenses.usage!);
    expect(lenses.gap).toBeCloseTo(lenses.capability! - lenses.usage!, 5);
  });

  it("returns null for an unknown occupation code", () => {
    expect(getOccupationExposureLenses("00-0000")).toBeNull();
  });
});

describe("getCountryAIDemand", () => {
  it("returns sorted country AI demand series with valid shares", () => {
    const countries = getCountryAIDemand();

    expect(countries).toHaveLength(9);
    for (let index = 0; index < countries.length; index += 1) {
      const country = countries[index];

      expect(country.iso3).toHaveLength(3);
      expectPct(country.latestShare);
      expect(country.series.length).toBeGreaterThan(0);

      for (const point of country.series) {
        expectPct(point.share);
      }

      if (index > 0) {
        expect(country.latestShare).toBeLessThanOrEqual(countries[index - 1].latestShare);
      }
    }

    const us = countries.find((country) => country.country === "US");
    expect(us).toBeDefined();
    expect(us!.iso3).toBe("USA");
    expect(us!.latestShare).toBeGreaterThanOrEqual(4);
    expect(us!.latestShare).toBeLessThanOrEqual(8);
  });
});
