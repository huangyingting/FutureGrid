# Squad Decisions

## Active Decisions

### FutureGrid Round 2 — Engagement Features (2026-06-30)

**Requested by:** huangyingting  
**Status:** Approved (🟢 Trinity re-review), advisory notes (🟡 Rai)  
**Scope:** Command palette (⌘K), hero risk-checker (personal search), RiskGauge (animated radial gauge), Highlights bento, Sector bubble chart (D3 scatter), data layer enrichment

#### Marquee Features
1. **⌘K Command Palette (Switch)** — global spotlight search (Cmd/Ctrl+K) over occupations/sectors/skills. Keyboard nav (↑/↓/Enter/Esc), focus trap, glass styling, reduced-motion safe.
2. **"Is your job at risk?" Hero Checker (Neo)** — as-you-type search box with live occupations + animated RiskGauge display (personal-relevance hook).
3. **Animated RiskGauge (Switch)** — reusable circular SVG gauge (0–100%, color-graded green→amber→orange→red). IntersectionObserver-triggered, RAF animation, accessible (`role="img"` + `aria-label`).
4. **Highlights Bento (Neo + Tank)** — ranked 4-card grid (Most at-risk / Fastest-growing / Most resilient / Highest-paid). Surfaces `getHighlights()` data via mini bars + links.
5. **Sector Bubble Chart (Switch)** — interactive D3 scatter (x=risk, y=growth, size=employment, color=risk-band). Hover tooltip, click→sector detail. Entrance animation (staggered), keyboard-accessible via `sr-only` links.

#### Data Contract (Tank, ADDITIVE-ONLY)
- **Interface:** `SearchItem { type: "occupation"|"sector"|"skill"; label; sublabel?; href; risk? }`
- **getSearchIndex()** — memoized flat index of all careers (href `/careers/{code}`, risk=automationProbability*100), sectors (href `/sectors/{name}`), skills (href `/skills`).
- **searchInsights(query, limit=8)** — ranked case-insensitive match (prefix → word-start → substring). Used by hero checker.
- **N3 Approval (Coordinator)** — Tank's `Math.random()→deterministicInt(FNV-1a)` in `generateAllCareerInsights()` is a correctness fix for SSR hydration; signatures unchanged, additive-only spirit preserved.

#### Reviewer Notes
- **Trinity Rejection (B1 D3 Cleanup):** Initial SectorScatterChart had D3 transitions not cancelled on unmount. Neo fixed via `svg.selectAll("*").interrupt()` on all cleanup paths. Re-review 🟢 APPROVE.
- **Trinity Non-blocking (N1/N2/N4):** CommandPalette reduced-motion anti-pattern → fixed via `useState` lazy init. HeroRiskChecker onBlur timer → tracked in useRef + cleared on unmount. SectorScatterChart keyboard access → added `sr-only` sector link list.
- **Rai Advisories (Yellow, All Fixed):** (F1) hero reworded "Research-based estimates"; (F2) stat label "Est. Employment"; (F3) "About this data" disclaimer added (Frey & Osborne basis, synthetic data note). No secrets/PII/stigma found.

#### Verification
- `npm run build` exit 0; 12 static routes.
- `npx eslint app components lib` exit 0.
- All routes HTTP 200; no hydration errors.
- WCAG AA contrast + focus-visible verified; reduced-motion respected everywhere.
- No Round 1 regression (Sidebar drawer, primitives, chart cleanup all intact).

---

### FutureGrid Upgrade — Design & Data Layer (2026-06-30)

**Requested by:** huangyingting  
**Status:** Approved (🟢 Trinity), advisory only (🟡 Rai)  
**Scope:** Design system, UI primitives, explorer UX, data layer, charts, responsive shell

#### Vision: "Eye-catching + Substantive"
FutureGrid is a **refined future-grid aesthetic** with deep near-black background, neon brand gradients (violet → cyan), glassmorphism, glows, and motion — while remaining accessible (WCAG AA) and respecting `prefers-reduced-motion`. Substance: interactive Compare feature, sorted sector/skill views, styled charts, mobile-responsive shell.

#### Visual Design Contract (Switch)
- **Brand palette:** `--brand-violet: #8b5cf6`, `--brand-cyan: #22d3ee`, risk colors (green/yellow/orange/red). Surface: `#07080d` (near-black).
- **CSS utilities in `app/globals.css`:** `.text-gradient` (violet→cyan), `.glass` (translucent + blur), `.glass-hover` (lift + glow), `.card-glow` (pulsing ring), `.brand-grad`, `.divider-glow`, animation keyframes (fade-up, fade-in, float, shimmer) all respect `prefers-reduced-motion`.
- **UI primitives in `components/ui/`:** `GridBackground` (fixed animated grid canvas, DPR-aware, static under reduced-motion); `AnimatedCounter` (scroll-triggered numeric counter, IntersectionObserver-based); `Reveal` (fade-up on scroll, immediate under reduced-motion).
- **Shell (`components/dashboard/Sidebar.tsx`):** inline stroke SVGs (Dashboard, Sectors, Careers, Skills, Heatmap icons), active-state brand accent, mobile drawer with focus management and Escape key support.

#### Data Layer Rules (Tank)
- **Additive-only policy:** Do not change or remove: `generateAllCareerInsights()`, `getSectorAggregates()`, `CareerInsight` fields, `colorForRisk`, `formatCurrency`, `formatPercent`.
- **New exports:** `deterministicInt()` (FNV-1a hash replaces `Math.random()` for stable employment counts); `getCareerByCode(code)` (single-career lookup); `getHighlights(topN?)` (ranked career lists); `getSectorAggregatesExtended()` (with `avgSalary`, `totalEmployment`); `computeResiliencyScore(automationProbability)`.

#### Features (Tank)
- **Compare occupations:** Select 2–3 careers, render side-by-side table (AI Risk, Growth, Salary, Employment, Resiliency, Skills). Sticky bottom bar when ≥1 selected.
- **Sortable views:** Sectors (Risk/Growth/Size/Salary), Skills (Safest/Most at Risk/Highest Pay/Fastest Growth), Heatmap (sector cards with hover tooltips).
- **Polished UX:** empty states, result counts, loading states, glass styling, brand gradients, fade-up animations.

#### Charts & Mobile (Switch 2nd task)
- **Themed charts:** D3 (JobImpact, SkillTransition, Heatmap) + Chart.js (CareerTrend, PredictiveImpact) use brand gradients, entrance animations, glass tooltips, reduced-motion safe.
- **Mobile responsive:** sidebar collapses to drawer/top bar under `lg` breakpoint; main content uses responsive margins.

#### Accessibility & Quality
- **Reduced-motion:** All animations (CSS, Canvas, D3, Chart.js) respect `prefers-reduced-motion: reduce`.
- **Focus management:** Buttons have `focus-visible:ring-2 ring-violet-500`, aria-labels, compare toggles have `aria-pressed`.
- **Contrast:** Body text (#e4e4e7 on #07080d) ≈ 15.8:1; brand colors ≥5:1 (WCAG AA).
- **Build & Lint:** `npm run build` passes, `npx eslint` clean (pre-existing 5 errors in `.squad/templates/ralph-triage.js` unchanged).

#### Trinity Review Findings
**Non-blocking issues (addressed or accepted):**
- **Reveal.tsx L31–34:** Dead timer cleanup — timer escape; deferred to next iteration.
- **Sidebar.tsx L206–207:** Drawer transition not suppressed under reduced-motion — deferred to next iteration.
- **SkillTransitionChart bar widths:** Non-deterministic (pre-existing). Acceptable for illustrative chart.
- **HeatmapChart jitter:** `useMemo([], [])`-stable; acceptable.
- **Minor:** drawer focus trap, matchMedia memoization (clean-up opportunistic).

#### RAI Advisories (Rai — Yellow, non-blocking)
**Three methodological transparency gaps identified; fixes applied:**

- **F1 — "Real-time intelligence" inaccuracy:** Hero subtitle reworded to "Research-based estimates" (no longer claims live data).
- **F2 — Synthetic employment labeled "Current":** Relabeled stat card to "Est. Employment" with tooltip caveat: synthetic placeholder pending real BLS integration.
- **F3 — Methodology/limitations invisible:** Added persistent "About this data" disclaimer near hero stats disclosing: (a) Frey & Osborne (2013) research model basis, (b) probabilistic estimates (not official forecasts), (c) placeholder fields noted.

**Verified safe:** No secrets, no PII, no stigmatizing language.

---

### FutureGrid Round 3 — Real Data Integration (2026-06-30)

**Requested by:** huangyingting  
**Status:** Approved (🟢 Rai), Implemented & committed  
**Scope:** Replace dated Frey & Osborne (2013) with Anthropic Economic Index + BLS + O*NET real, authoritative, multi-country data

#### Research & Data Source Selection (Scout)
Scout cataloged authoritative data landscape with 16 sources across US, UK, EU, Canada, Australia. Recommendation adopted: 
- **Primary AI exposure:** Anthropic Economic Index (CC-BY, real Claude-usage AI-penetration metric, 756 occupations, 194 countries)
- **Employment & Growth:** BLS Employment Projections 2024–2034 (public domain, SOC-keyed, 800+ occupations) + OEWS May 2024 (public domain, wages/employment)
- **Skills & Tasks:** O*NET 28.1+ (CC-BY 4.0, 1000 SOC occupations, task/skill descriptors)
- **Multi-country context:** IMF AIOE 2024 (125 countries), OECD Employment Outlook 2023, ILO WESO 2025

#### Implementation (Tank)

**Build-time pipeline (`scripts/build-data-snapshot.mjs`):**
- Fetch Anthropic Economic Index (HuggingFace) job_exposure.csv → 756 occupations + `observed_exposure` (0–1 scale, real Claude-usage metric, NOT Frey-Osborne)
- Fetch BLS Employment Projections + OEWS May 2024 → SOC-keyed salary, employment, projections (daily automated refresh possible)
- Download O*NET zip → extract top 5 skills per SOC (CC-BY 4.0)
- Fetch AEI country-exposure data (194 countries, Aug 2025) → gdp_per_working_age_capita, usage index
- Robust CSV parser handling quoted fields; SOC join with 6-digit prefix normalization; graceful degradation for missing data
- Cache layer (`.data-cache/` gitignored); re-runs are fast

**Output snapshots (committed to repo):**
- `data/occupation-snapshot.json` (756 records): `socCode, title, sector, aiExposure (0–1), automationRisk, automationProbability (= aiExposure), medianSalary, employment (null, BLS SOC-level unavailable), growthRate (null, no authoritative per-SOC %), jobZone, brightOutlook, projectedOpenings, skills[]`
- `data/country-exposure.json` (194 countries): `iso3, name, usageIndex, usagePct, usageCount, gdpPerWorkingAgeCapita`
- `data/sources.json`: Full CC-BY/public domain/CC-BY 4.0 attribution; methodology citation (Anthropic EI + BLS + O*NET + context from IMF/OECD/ILO)

**Risk band calibration (percentile-based):**
- Analyzed AEI distribution (756 occupations); computed p55/p80/p92 thresholds
- **Very High:** > p92 (61 occ, ~8%)
- **High:** p80–p92 (90 occ, ~12%)
- **Medium:** p55–p80 (189 occ, ~25%)
- **Low:** ≤ p55 (416 occ, ~55%)
- Previous fixed thresholds (0.3/0.6/0.85) skewed distribution; new bands are informative across all tiers

**Library updates (additive-only, backward-compatible):**
- `lib/automation/index.ts`: Load `occupation-snapshot.json`, build AUTOMATION_SCORES map from real data. Preserve all existing exports (`getAutomationScore`, classifyRisk updated to percentile thresholds)
- `lib/data.ts`: New exports `getCountryExposure()`, `getDataSources()`, interfaces `CountryExposure`, `DataSource`, `DataSources`. Highlights renamed `fastestGrowing` → `brightOutlook` (O*NET Bright flag), add `brightShare` per sector
- NULL honesty: `employment` → null (BLS provides major-group totals only), `growthRate` → null (no authoritative per-SOC %), `totalEmployment` (sector) → null. NEW field `projectedOpenings` (BLS-EP annual openings, 671/756 occupations)

**Validation:**
- `npm run build` exit 0 (all routes built)
- `npx eslint` exit 0 (no errors)
- Sample occupations confirmed: Marketing Managers (aiExposure=0.3195, real salary), Data Entry Keyers (aiExposure=0.6707), Registered Nurses (aiExposure=0.0595), etc. — NO Frey-Osborne values
- 672/756 occupations with real salary, 684/756 with O*NET skills, 671/756 with projectedOpenings

---

### FutureGrid Data Fix: Nullable Fields + Bright Outlook Relabel (2026-06-30)

**Requested by:** huangyingting  
**Status:** Approved (🟢 Coordinator), Implemented & committed (afe77e9)  
**Scope:** Patch Tank's AI-exposure data integration: null honest fields, relabel "fastestGrowing" → "brightOutlook", calibrate risk bands, add projectedOpenings, update UI disclaimers

#### CareerInsight Schema (Final)
```typescript
interface CareerInsight {
  occupationCode: string;
  occupationName: string;
  automationRisk: "Low" | "Medium" | "High" | "Very High";
  automationProbability: number; // 0–1, = aiExposure (real Claude-usage metric)
  growthRate: number | null; // null (no authoritative per-SOC source)
  medianSalary: number; // 0 if unavailable
  totalEmployment: number | null; // null (BLS SOC-level not available)
  projectedOpenings: number | null; // BLS-EP annual openings (NEW)
  outlook: "Bright" | "Average"; // O*NET brightOutlook flag
  sectorName: string;
  skills: string[];
}
```

#### Highlights (Final)
- `mostAtRisk`: highest aiExposure
- `brightOutlook`: (renamed from `fastestGrowing`) O*NET Bright occupations ranked by exposure
- `mostResilient`: lowest aiExposure
- `highestPaid`: highest medianSalary

#### SectorAggregate (Extended)
- New: `brightShare` = fraction of Bright occupations in sector (real growth proxy)
- Nulled: `avgGrowth`, `totalEmployment` (no source data)

#### UI Updates
- **Neo** relabeled "automation risk" → "AI exposure" across all pages
- **Switch** relabeled chart titles; removed Frey & Osborne from footer credit
- **Disclaimers rewritten:** "Frey & Osborne basis" → cite Anthropic EI / BLS / O*NET; "synthetic data" → replaced with real sources note; "About this data" link to `/sources` page
- **Null safety:** All template renders check for null growthRate, totalEmployment, avgGrowth before display

#### Verification (Rai, Coordinator)
- `npm run build` exit 0
- `npx eslint` exit 0, no warnings
- All 9+ routes HTTP 200
- No hydration errors
- No regressions (prior UI features intact)
- 🟢 Rai: No PII, secrets, stigma; compliance with all disclaimers

#### Commits
- 2b1c53d: Foundation — build-data-snapshot.mjs, data/occupation-snapshot.json, data/country-exposure.json, data/sources.json, lib rewire
- afe77e9: Data fix — percentile calibration, null fields, brightOutlook relabel, /sources page, UI disclaimers

---

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
