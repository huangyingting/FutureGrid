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