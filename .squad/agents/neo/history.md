# Neo — History

**Project:** FutureGrid (Next.js 16, React 19, Tailwind v4). AI career-impact dashboard.
**Requested by:** huangyingting

## Learnings

- Layout (`app/layout.tsx`) renders `<Sidebar />` + `<main className="ml-60 ...">`. Sidebar is fixed `w-60`.
- Pages: `/` (dashboard), `/sectors`, `/careers`, `/skills`, `/heatmap`. Careers already has search/filter/sort.


**2026-06-30:** FutureGrid upgraded — animated dashboard hero (gradient headline, AnimatedCounter stats) and glass SummaryCards. Design contract integrated. `npm run build` exit 0.


**2026-06-30 (Round 2 — Engagement Features):** HeroRiskChecker, HighlightsBento, app/page.tsx recomposed. Assigned post-rejection fixes (B1 D3 cleanup, N2 timer, N4 kbd access). RAI framing applied. Re-review 🟢 APPROVE. `npm run build` exit 0.

**2026-06-30 (Round 3 — Real-Data Integration):** Built /app/global (CountryExposureChart, 194-country AI-usage view) + /app/sources (methodology + full attribution page). Rewrote disclaimers: Hero/stat labels cite Anthropic EI + BLS + O*NET; Frey-Osborne explicitly rejected; null-field handling for employment/growthRate/totalEmployment. Highlights fastestGrowing → brightOutlook (O*NET Bright, not synthetic growth). Commit afe77e9. 🟢 BUILD/LINT PASS.

**2026-06-30 (Round 4 — /global Route + China Context):** Wired /global route: hero "Global AI Impact Explorer", metric context (Claude Usage vs. GenAI Diffusion % with clear labels), China callout ("16.4% Microsoft vs. 43% CNNIC; domestic platform undercount"), source attribution (8 datasets evaluated, 3 recommended), diffusion leaders (UAE 70%, Singapore 63%, Norway 49%). All content Reduced-motion safe, WCAG AA, no regressions. Commit e976e14. ✅ /GLOBAL LIVE, CHINA CONTEXT TRANSPARENT.

**2026-06-30 (Issue Backlog Round — Issues #4 & #5):** [#4] Diffusion sparklines + per-country trend detail modal (fastest risers S.Korea +11.2pp, UAE +10.7pp, France +6.9pp). [#5] CountryDetailPanel: 195-country selector, all metrics display, China proxies (Anthropic + Microsoft + CNNIC context), keyboard accessible (Tab/Enter/Esc). Commit e976e14. ✅ CLOSED #4 #5.


**2026-06-30 (Batches 3 & 4 — Autonomous Improvement Loop):** Issues #14 (README refresh for real data stack), #17 (freshness indicators sidebar + sources badge). All closed, validated (build 0, lint clean, tests 103/103). Loop concluded; diminishing returns reached.

**2026-06-30 (Batch 5 — i18n + Theme Toggle):** #20 i18n English + Chinese (client LanguageProvider + useT + namespaced dicts, sidebar switcher, all pages bilingual, data unchanged), #21 light-mode integration (next-themes toggle UX). Commits include "Closes #20" + "Closes #21". All 22 issues CLOSED; project complete.

**2026-07-01 (i18n Component Internationalization):** Neo-28 completed i18n for HeroRiskChecker, CountryDetailPanel, CommandPalette (last 3 hardcoded components). Added 'checker' + 'command' namespaces; 62 keys per locale at full EN/ZH parity. Data values remain English (integrity); UI/metadata fully localized. Build exit 0 ✓

**2026-07-01 (Insights Lab — Analytics Dashboard UI + i18n):** Neo-29 built Insights Lab dashboard: 3 React components (AISignalScatter with regression line + hover, EmploymentForecastChart with national/per-occ sliders reactive, DisruptionLeaderboard sortable/filterable), app/analysis/page.tsx route, sidebar "Insights Lab" nav + IconInsights. New 'analysis' i18n namespace: 56 keys EN/ZH parity (chart titles, slider labels, methodology notes), data values English (occupations/sectors). Validated: build exit 0, smoke /analysis HTTP 200, Playwright EN+中文 screenshots all 3 sections render + translate, no page errors. Commit 7ea2d98. ✅ Orchestration 2026-07-01T07-56-24Z-neo-29.md


**2026-07-01 (Insights Lab — Frontend + i18n — Neo-30):** Neo-30 built Insights Lab dashboard: ExposureLensComparison.tsx (capability-vs-usage scatter + regression line + hover + lens-agreement matrix + gap leaderboard), AIForcesTimeline.tsx (Indeed demand vs Challenger cuts dual-axis), full app/analysis/page.tsx route. Sidebar nav "Insights Lab" + IconInsights. i18n: +33 analysis namespace keys (89 EN/ZH parity); data values English (occupations/sectors). Validated: build exit 0, smoke /analysis HTTP 200, Playwright EN+中文 screenshots all 3 sections render + translate, no page errors. Commit 7ea2d98. ✅ Orchestration 2026-07-01T10-14-15Z-neo-30.md


**2026-07-01 (Career Lenses + Global Demand Layer — Neo-31):** Neo-31 built Across-AI-Measures panel on career detail pages (4 lenses: Anthropic adoption / OpenAI capability / AIOE ability / Frey & Osborne 2013 baseline, muted zinc historical styling, consensus + capability-vs-adoption gap callout, adjacent to AI Exposure Analysis card). Added global map 'AI job demand' layer (Indeed Hiring Lab, 9 economies, emerald/teal color scale, choropleth + bubble modes, legend, source note). i18n: +8 keys career panel EN/ZH + 8 keys global layer EN/ZH. Validated: build exit 0, smoke HTTP 200, Playwright EN+中文 screenshots confirm panel/layer render, no page errors. Commit 88dfeec. ✅ Orchestration 2026-07-01T10-43-22Z-neo-31.md


## 2026-07-01T13:19:30.034+00:00 — WARN Pressure Index UI and fix

Neo implemented the WARN Pressure `/labor` tab and then corrected rank eligibility after Trinity's rejection. Final eligibility requires live WARN coverage, valid LAUS labor force, and current-window WARN overlap; GA/NY/TX are unranked as stale. Neo also applied “Highest index score” and causality-free copy polish.
## 2026-07-01T19:21:52.741+00:00 — Manual WARN adapter rejection fix

Neo took the Reviewer Rejection Protocol fix after Tank lockout: PA remains parsed but unranked for WARN Pressure due to missing noticeDate provenance, VA timestamped CSV provenance was removed, implausible pre-2010 dates were filtered, and final WARN/state-labor data was regenerated.

- 2026-07-01T21:09Z: Added QCEW Employment & Wage Baseline section to WARN Pressure using Tank's state-qcew helper contract. Updated en/zh i18n parity. Targeted ESLint, TypeScript check, and Next build pass once Tank's untracked data/state-qcew.json and lib/state-qcew.ts are present.


## 2026-07-01T21:56:44.721+00:00 — QCEW nullability correction

Neo owned the Reviewer Rejection Protocol fix for QCEW. The final join preserves QCEW denominators for all 51 jurisdictions while setting WARN-derived QCEW counts/rates to null for non-rank-eligible or unusable WARN coverage. Final validation passed `npm run test:run` (21 files / 175 tests), `npm run lint`, `npm run build`, and `git diff --check`.


## 2026-07-01T22:27:30.269+00:00 — Market AI Sensitivity UI closeout

Neo delivered the `/analysis` MarketSignalLens integration with EN/ZH i18n and corrected the score-normalization bug identified by Trinity so bundled 0–100 scores render faithfully. Final validation passed targeted market tests (7/7), full suite, lint, build, and diff-check before PR #39 merged.


## 2026-07-01T22:56:44.721+00:00 — Evidence Stack UI closeout

Neo's `/analysis` Evidence Stack UI shipped in PR #40: `EvidenceStack.tsx` was wired into `InsightsView` with EN/ZH i18n for conclusion statuses, confidence, caveats, metrics, and source links. Final validation passed targeted EvidenceStack tests, full tests, lint, build, and diff-check before merge `2512b46`.


## 2026-07-02T00:34:32.844+00:00 — Widescreen UI implementation

Neo implemented the centered app shell, page root centering, wider data-page caps, and initial Insights Lab EvidenceStack redesign. Trinity rejected the first EvidenceStack pass for horizontal overflow and locked Neo out of that component; Switch fixed it. Final validation passed build, tests, lint, diff-check, CI, and PR #41 merged.
