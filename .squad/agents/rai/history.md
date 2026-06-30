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