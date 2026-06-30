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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
