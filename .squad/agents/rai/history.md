# Rai — History

**Project:** FutureGrid (Next.js 16, React 19, Tailwind v4). AI career-impact dashboard.
**Requested by:** huangyingting

## Learnings

- Automation risk data sourced from Frey & Osborne (2013) research model — probabilistic estimates, not official forecasts.
- Employment figures synthesized (deterministic hash); placeholder data pending real BLS integration.
- Methodology attribution present in sidebar footer; additional transparency layer (disclaimer) recommended.

**2026-06-30:** FutureGrid RAI audit completed — 3 advisory findings (real-time claim, synthetic employment labeling, methodology transparency) all addressed. Hero reworded, stat labels updated, "About this data" disclaimer added. 🟡 YELLOW (no blockers). All safe checks pass: no secrets, no PII, no stigma.


**2026-06-30 (Round 2 — Engagement Features):** RAI audit → 🟡 YELLOW (3 advisory findings, all fixed). F1 hero "Research-based estimates", F2 stat "Est. Employment", F3 "About this data" disclaimer. No secrets/PII/stigma. Safe for production.

**2026-06-30 (Round 3 — Real-Data Integration):** Completed licensing audit: BLS (public domain), O*NET (CC-BY 4.0), Anthropic EI (CC-BY) — all freely redistributable. Verified: zero Frey-Osborne values in snapshot, all probabilities = AEI observed_exposure. Data sources.json + /sources page provide comprehensive attribution. Methodology disclaimers cite Anthropic EI + BLS + O*NET, reject Frey-Osborne. 🟢 GREEN (zero compliance/safety issues).
## 2026-07-01T13:43Z — RAI review: WARN Pressure Index (/labor)

Verdict: Yellow (non-blocking). Reviewed components/labor/WarnPressureView.tsx, labor i18n EN/ZH, scripts/build-state-labor.mjs, lib/state-labor.ts, data/state-labor.json, and targeted WARN Pressure tests.

Findings: User-facing copy consistently frames the index as descriptive/association/coverage-only and includes non-causal caveats. Ranked scope is limited to current machine-readable WARN states; not-ranked states remain visible with coverage context. No causal or stigmatizing blocker found. Targeted tests passed: `npm run test:run -- tests/components/WarnPressureView.test.tsx tests/warn-pressure.test.ts --reporter=dot` (2 files, 7 tests).

Recommendations: Consider replacing the data/script methodology phrase “WARN notices caused labor-market changes” with causality-free wording in future updates, and consider softening “Highest pressure” to “Highest index score” or similar to reduce over-interpretation.


## 2026-07-01T13:19:30.034+00:00 — WARN Pressure Index RAI follow-up

Rai's Yellow/non-blocking review found the WARN Pressure Index descriptive and coverage-aware, with no blocker. Neo applied the recommended softer wording and causality-free methodology copy before Trinity's final APPROVE.

## 2026-07-01T19:56:49Z — RAI focused re-review: WARN manual/HTML/CSV expansion

Verdict: Green.

Scope: Re-reviewed post-fix WARN expansion for IN, MD, NC, PA, VA plus pressure-ranking eligibility/provenance safeguards. Checked scripts/build-warn.mjs, scripts/build-state-labor.mjs, data/warn-notices.json, data/state-labor.json, and WARN regression tests.

Validation:
- `npm run test:run -- tests/warn-data.test.ts tests/warn-pressure.test.ts` passed: 17/17.
- `git --no-pager diff --check -- . ':!.squad'` passed.
- Snapshot checks confirmed IN/MD/NC/VA are live parsed feeds with notice-date ranges; PA has 244 parsed records with null noticeDate/dateRange and is not rank eligible.
- Global WARN date/source sanity check found no noticeDate before 2010 or after generated date, no pre-2010 effectiveDate, and no notices without source metadata.

Material findings: none blocking. PA treatment is acceptable because effectiveDate is disclosed as non-provenance and excluded from pressure ranking. VA provenance uses stable page URL only and no hard-coded timestamped CSV URL.

Non-blocking recommendation: consider future adapter hardening so MD archive URL failures can degrade by page instead of failing the whole state, but this is not a shipping blocker for the current snapshot.

## 2026-07-01T19:21:52.741+00:00 — Manual WARN adapter RAI/data-quality closeout

Rai's initial Yellow review caveats were resolved by PA rank exclusion, stable VA provenance, and date plausibility filtering. Final re-review returned Green for the WARN manual adapter snapshot.

## 2026-07-01T22:05:50Z — Final RAI/data-quality review: QCEW nullability + WARN expansion

Verdict: Green.

Scope: Reviewed QCEW Employment & Wage Baseline data/source/UI and manual WARN adapter expansion after the nullability fix. Checked scripts/build-state-qcew.mjs, lib/state-qcew.ts, components/labor/WarnPressureView.tsx, labor i18n copy, scripts/build-warn.mjs, scripts/build-state-labor.mjs, data/state-qcew.json, data/state-labor.json, data/warn-notices.json, and targeted tests.

Validation:
- `npm run test:run -- tests/qcew-data.test.ts tests/warn-data.test.ts tests/warn-pressure.test.ts tests/components/WarnPressureView.test.tsx --reporter=dot` passed: 25/25.
- Ad hoc snapshot check confirmed 51 QCEW jurisdictions, positive QCEW employment/wage context, 9 ranked/non-null baseline-rate rows, 0 nullability violations for non-rank-eligible rows, and 51 WARN coverage metadata rows.

Material findings: none. QCEW denominator context remains available for all jurisdictions while WARN-derived QCEW counts/rates are null, not zero, whenever WARN coverage is not rank-eligible. UI copy frames QCEW as descriptive denominator/wage context and avoids causal or predictive claims. WARN manual/live expansion preserves source provenance and excludes stale, manual-only, or undated feeds from ranking.


## 2026-07-01T21:56:44.721+00:00 — QCEW/WARN final RAI closeout

Rai's final RAI/data-quality verdict was Green. QCEW is framed as descriptive denominator/wage context, not causal evidence; PA remains unranked without noticeDate provenance; and non-rank-eligible WARN states expose null WARN-derived QCEW fields rather than false zeros.

## 2026-07-01T22:43Z — RAI/financial-safety review: Market AI Sensitivity

Verdict: Green — no blockers.

Scope: Market-implied AI sensitivity feature using sector ETF historical prices and AI exposure. Reviewed `components/insights/MarketSignalLens.tsx`, `lib/market-signals.ts`, `scripts/build-market-signals.mjs`, `data/market-ai-signals.json`, market-signal i18n, and targeted tests.

Validation: `npm run test:run -- tests/market-signals.test.ts tests/components/MarketSignalLens.test.tsx --reporter=dot` passed (6/6).

Findings: Rendered market UI frames the feature as descriptive historical sector-ETF proxy analysis, non-advisory, not prediction, and not causal proof. No buy/sell guidance, ETF return forecast, or causal claim that AI drove ETF returns found in the reviewed UI flow. Source/data caveats disclose Yahoo Finance chart JSON as public unauthenticated but unofficial/undocumented/change-prone and document coarse hand-authored occupation-to-ETF mapping.

Material recommendations: none.

## 2026-07-01T22:50Z — Final RAI re-review: Market AI Sensitivity score normalization

Verdict: Green — no blockers.

Scope: Re-reviewed Market AI Sensitivity after the UI score-normalization fix. Checked `components/insights/MarketSignalLens.tsx`, `data/market-ai-signals.json`, `lib/market-signals.ts`, market-signal i18n, and regression tests.

Validation: `npm run test:run -- tests/market-signals.test.ts tests/components/MarketSignalLens.test.tsx` passed (7/7).

Findings: The UI now preserves bundled 0–100 `marketAiSensitivityScore` values without multiplying sub-1 scores by 100; XLE/XLU render 0.6 rather than 60.0. Copy remains descriptive/non-advisory/non-predictive/non-causal and discloses Yahoo Finance chart JSON as unofficial/undocumented/change-prone. No buy/sell guidance, investment advice, return prediction, or causal claim found.

Material recommendations: none.


## 2026-07-01T22:27:30.269+00:00 — Market AI Sensitivity RAI closeout

Rai's final review was Green after confirming the lens stays descriptive, non-advisory, non-predictive, and non-causal; discloses Yahoo Finance chart JSON caveats; avoids buy/sell language; and preserves corrected 0–100 score rendering. PR #39 merged after full validation.


## 2026-07-01T22:56:44.721+00:00 — Evidence Stack RAI closeout

Rai's Evidence Stack review was Green. The feature frames source-family agreement as descriptive, directional evidence with caveats and provenance links, and avoids causal displacement, prediction, guarantee, individual-worker ranking, and financial-advice language. PR #40 merged after full validation.
