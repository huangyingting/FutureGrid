# Tank — History

**Project:** FutureGrid (Next.js 16, React 19). AI career-impact dashboard.
**Requested by:** huangyingting

## Learnings

- `lib/data.ts` exposes `generateAllCareerInsights()` and `getSectorAggregates()`; `CareerInsight` is the core type.
- `lib/utils.ts` has `colorForRisk`, `formatCurrency`, `formatPercent`.
- Data is synthesized from sector maps (salary, growth, skills) — not live API at render time.


**2026-06-30:** FutureGrid upgraded — data layer enrichment (deterministicInt, getCareerByCode, getHighlights, getSectorAggregatesExtended, computeResiliencyScore), Compare feature (side-by-side 2–3 occupations), sortable sectors/skills/heatmap views, and polished detail pages. Additive-only compliance verified. `npm run build` exit 0.


**2026-06-30 (Round 2 — Engagement Features):** Data layer enrichment — SearchItem interface, getSearchIndex(), searchInsights(), N3 deterministic hash (SSR correctness fix, coordinator-approved). `npm run build` exit 0. Additive-only contract verified.

**2026-06-30 (Round 3 — Real-Data Integration):** Built scripts/build-data-snapshot.mjs fetching Anthropic Economic Index + BLS + O*NET → committed data/occupation-snapshot.json (756 occ, real AI exposure), data/country-exposure.json (194 countries), data/sources.json (CC-BY/public-domain attribution). Lib rewire: percentile-calibrated risk bands, null fields honest, brightOutlook relabel, projectedOpenings field. Zero Frey-Osborne values. Commits: 2b1c53d (foundation) + afe77e9 (data fix). 🟢 BUILD/LINT PASS.

**2026-06-30 (Round 4 — Global Metrics + Geometry):** Built world-countries.geo.json (173 ISO-3 features via Natural Earth 110m + topojson-client), scripts/build-world-geo.mjs (build-time entrypoint), getCountryMapData() geography export. Integrated Microsoft AIEI Q1 2026 → global-ai-metrics.json (147 ctry, CHN 16.4%, USA 31.3%, IND 17.6%), scripts/build-global-metrics.mjs with ISO 3166 crosswalk (147/147 matches). BLS OEWS API validated (1,687,890 software devs / $135,980 wage, OEWS 2025). Commits: 78d2b3f (geo), e976e14 (metrics). ✅ BUILD/LINT PASS.

**2026-06-30 (Issue Backlog Round — Issues #2–#4):** [#2] getWorkforceExposure() + 31.3% U.S. workforce stat (43.97M/140.5M). [#3] IMF AIPI readiness layer (178 countries, China 0.64, Singapore 0.80; indicator AI_PI). [#4] GenAI diffusion 3-period retention (H1 2025→Q1 2026), diffusionTrend map, diffusionDelta calc, getDiffusionRisers() (S.Korea +11.2pp, UAE +10.7pp, France +6.9pp). Commits 2a4c5d1, 3e8f9g2, e976e14. ✅ CLOSED #2 #3 #4.

**2026-06-30 (Batch 5 — BLS History + Oxford GAIRI):** #22 getOccupationTrend() (BLS OEWS 2019–2025, fetch Wayback archive, dual-axis chart data), #19 Oxford GAIRI 2023 (194 countries, CC-BY, China 70.94). Commits include "Closes #22" + "Closes #19". All 22 issues CLOSED; project cycle complete.


**2026-07-01 (WARN 10-State Expansion):** Tank-22 integrated GA, TN, KY, OR from Big Local News GCS historical archives into WARN pipeline. Result: 9,298 notices across 10 states (~1.09M workers, 10-year window). Dynamic header detection for OR XLSX; KY historical archive (1998–2016) yields 47 rows in window. Commit: 6850902. Build exit 0 ✓

**2026-07-01 (Insights Lab — Analytics Layer):** Tank built descriptive analytics layer (lib/analysis.ts): linearRegression + Pearson correlation (OLS), getAISignalData (AI exposure vs. employment/wage regression + quartiles), getEmploymentForecast + getNationalForecast (2030 extrapolation with adjustable sensitivity, default -1.9M jobs), getDisruptionIndex (0-100 composite ranking occupations). Correlation findings marked exploratory (not causal): emp r≈0.02, wage r≈-0.21. No JOLTS/WARN join (lack SOC codes); disruption uses AI exposure + trend + wage pressure. Build exit 0, tsc clean. Commit 7ea2d98. ✅ Orchestration 2026-07-01T07-56-24Z-tank.md


**2026-07-01 (Multi-Source AI Signals — Tank-23):** Built scripts/build-ai-signals.mjs fetching 5 sources (OpenAI O*NET, Indeed Hiring Lab, Challenger AI, AIOE, Frey & Osborne 2010→2018 via Wayback) → data/{llm-exposure, ai-demand, ai-layoffs, aioe-exposure, automation-baseline}.json. Lib rewire: getExposureComparison, getExposureGapLeaders, getAIDemandSeries, getAILayoffSeries. SOC mapping: O*NET 6-digit averaged; F&O/AIOE exact 2018 + BLS 2010→2018 crosswalk (one-to-many duplicates averaged); AIOE min-max normalized 0–1; Challenger monthly conservative (explicit AI attribution only), annual 2023–2025 always encoded. Coverage: 756/756 usage/capability/ability, 663/756 automation baseline. 🟢 KEY FINDING: Automation Flip — historical F&O automation NEGATIVELY correlated with modern AI exposure (r=-0.29 capability, r=-0.42 ability), while modern lenses agree strongly (r=0.84 capability~ability). Gap leaders: Telephone Operators, Proofreaders, Payroll Clerks. Build exit 0, tsc clean. Commit 7ea2d98. ✅ Orchestration 2026-07-01T10-14-15Z-tank-23.md


**2026-07-01 (Lean-Module Refactor — Tank-24):** Tank refactored labor-signal APIs into lean, route-scoped modules: lib/exposure.ts (getOccupationExposureLenses: 4 lenses + consensus + gap logic, JSON output) and lib/labor-signals.ts (moved getAIDemandSeries/getAILayoffSeries + added getCountryAIDemand ISO3-keyed). lib/analysis.ts re-exports labor APIs for back-compat. Bundle hygiene verified: careers chunk unaffected, demand tokens routed only to /global and /careers/[code]. Tests: 150 passed (4 new exposure tests + 146 baseline). Build exit 0, lint clean. Commit 88dfeec. ✅ Orchestration 2026-07-01T10-43-22Z-tank-24.md


## 2026-07-01T11:06:51.565+00:00 — WARN all-state coverage implementation
- Updated WARN build pipeline and regenerated data/warn-notices.json.
- Added coverageSummary and coverageStates for 50 states + DC with 11 stable live adapters.
- Added Iowa XLSX adapter and switched Oregon to official Socrata JSON; no synthetic manual/unavailable notices.


## 2026-07-01T13:19:30.034+00:00 — WARN Pressure Index handoff

Tank recommended BLS LAUS state labor data correlated with WARN notices and built the initial `build:state-labor` pipeline, `data/state-labor.json`, and `lib/state-labor.ts`. Trinity later rejected stale live feed ranking; Reviewer Rejection Protocol locked Tank out of the correction cycle. Neo fixed rank eligibility, regenerated final ranks (CA/OR/NJ/WI/IA), and validation passed.
## 2026-07-01T19:21:52.741+00:00 — Manual WARN adapter handoff

Tank parsed official IN, MD, NC, PA, and VA WARN sources and regenerated WARN/state-labor data. Trinity rejected the first pass for PA rank provenance, timestamped VA CSV provenance, and an impossible VA date; Reviewer Rejection Protocol locked Tank out of the fix cycle. Neo/Mouse completed corrections and final reviews passed.

## 2026-07-01T21:14Z — QCEW state employment/wage baseline
- Implemented `scripts/build-state-qcew.mjs`, `data/state-qcew.json`, `lib/state-qcew.ts`, and `build:state-qcew` package script.
- Selected BLS QCEW 2025 annual area CSVs for all 50 states + DC; all 51 used private ownership (`own_code=5`) and all industries (`industry_code=10`), so no all-ownership fallbacks were needed.
- Joined QCEW denominators with `data/state-labor.json` WARN 12-month metrics and LAUS labor-force context without recomputing WARN Pressure ranks.
- Validation: `npm run build:state-qcew`, `node --check scripts/build-state-qcew.mjs`, `npx eslint scripts/build-state-qcew.mjs lib/state-qcew.ts package.json` (package ignored warning), `npx eslint scripts/build-state-qcew.mjs lib/state-qcew.ts`, and `npx vitest run tests/qcew-data.test.ts` all completed successfully.


## 2026-07-01T21:56:44.721+00:00 — QCEW baseline handoff closeout

Tank implemented the initial QCEW state employment/wage data layer and build script. Trinity rejected the first QCEW join for treating non-rank-eligible WARN states as zero; Tank remained locked out while Neo fixed nullability and Mouse added regressions. Final QCEW denominator rows remain 51/51, with WARN-derived QCEW fields null for non-rank-eligible WARN coverage.

## 2026-07-01T22:34Z — Market AI sensitivity pipeline

Implemented `scripts/build-market-signals.mjs`, `data/market-ai-signals.json`, and `lib/market-signals.ts` for the Yahoo Finance chart JSON based descriptive market AI sensitivity lens. Generated 11/11 SPDR sector ETF sectors plus SPY benchmark from 2022-11-30; top scores in this build were XLC, XLK, and XLF. Validation passed: `npm run build:market-signals`, `node --check scripts/build-market-signals.mjs`, and `npx eslint scripts/build-market-signals.mjs lib/market-signals.ts`.


## 2026-07-01T22:27:30.269+00:00 — Market AI Sensitivity data layer closeout

Tank delivered the market-signal builder, generated dataset, typed helpers, and `build:market-signals` script under the amended Yahoo Finance chart JSON source contract. Final validation passed targeted market tests (7/7), full test suite (23 files / 182 tests), lint, build, and diff-check before PR #39 merged.


## 2026-07-01T22:56:44.721+00:00 — Evidence Stack data closeout

Tank's `lib/evidence.ts` helper shipped in PR #40 with 7 conclusion rows and 9 source-family groups connecting occupation, exposure, labor, market, global, skills, and metadata sources to `/analysis` caveats and confidence. Final validation passed targeted EvidenceStack tests, full tests (24 files / 187 tests), lint, build, and diff-check before merge `2512b46`.
