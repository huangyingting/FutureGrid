# Scout — History

**Project:** FutureGrid (Next.js 16, React 19). AI career-impact dashboard.
**Requested by:** huangyingting

## Learnings

- Data landscape spans 16 authoritative sources: US/UK/EU/Canada/Australia/International (BLS, O*NET, IMF, OECD, ILO, Anthropic, JRC, etc.)
- Frey & Osborne (2013) predates LLMs; task-classification methodology outdated for modern AI exposure.
- Real-usage metrics (Anthropic EI observed_exposure) outweigh survey/annotation-based indices for contemporary AI-risk mapping.

**2026-06-30 (Round 3 — Real-Data Integration):** Cataloged 16 authoritative data sources with license + recency ratings. Recommended Anthropic Economic Index (CC-BY, 756 occ, 194 countries, real Claude-usage metric) as primary AI-exposure driver, paired with BLS Employment Projections + OEWS (public domain) and O*NET 28.1 (CC-BY 4.0) for skills/tasks. Research fed Tank's build-data-snapshot.mjs pipeline. Multi-country context sourced from IMF/OECD/ILO. ✅ RESEARCH COMPLETE.