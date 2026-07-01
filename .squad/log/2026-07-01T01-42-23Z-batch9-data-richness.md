# Batch 9: Data Richness — JOLTS + CA WARN + Growth Rate

**Date:** 2026-07-01  
**Issues shipped:** #35, #36, #37 (all CLOSED)  
**Commits:** 7aa0f49, da1c0e1, c6523bd → origin/main  
**Status:** ✅ COMPLETE (121 tests, all 11 routes smoke-test GREEN)

## Scope Delivered

### Data Pipelines (Tank)
- `scripts/build-jolts.mjs` → `data/jolts.json` (1.1 MB, 10 national series + 21 industries, 300 months 2001–2025)
- `scripts/build-warn.mjs` → `data/warn-notices.json` (0.5 MB, 1,588 CA notices, 81,400 employees, 2025-01 → 2026-06)

### New Routes
- `/pulse` — Labor Market Pulse page (D3 trend + industry charts, NBER recession shading, COVID spike annotation)
- `/layoffs` — Recent Mass Layoffs page (CA WARN, D3 combo chart, searchable table of 1,588 notices)

### Growth Rate & Library Loaders (Coordinator)
- Growth rate computed: annualized CAGR from OEWS 2019–2025 employmentHistory
- Library loaders: `lib/jolts.ts`, `lib/warn.ts` (route-specific, not in shared lib/data.ts)

### i18n Expansion (Neo, Switch)
- 82 new i18n keys: pulse (36) + layoffs (46), all mirrored en/zh
- Namespaces registered in `lib/i18n/messages/index.ts`

## Key Decisions

1. **CA-only labeling:** No federal WARN API exists; CA EDD is authoritative state source
2. **Bundle hygiene:** Large snapshots (~1.6 MB) stay in route-specific loaders, not shared lib
3. **Authentic growth rates:** Derived from OEWS historical data (CAGR 2019–2025) vs. unaccessible projections

## Outcome

✅ Two new routes fully functional, bilingual, accessible (WCAG AA)  
✅ Two data pipelines reliable (BLS JOLTS API, CA EDD Excel fetch)  
✅ Zero regressions to existing 9 routes; CI clean (lint + tests + smoke)
