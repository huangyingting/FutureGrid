"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import * as d3 from "d3";
import { useT } from "@/lib/i18n/useT";
import { getJoltsIndustriesByLayoffs, type JoltsIndustry } from "@/lib/jolts";

// Aggregate rows that double-count subordinate sectors
const EXCLUDE_CODES = new Set(["000000", "100000"]);

// ── Types ──────────────────────────────────────────────────────────────────────

interface BarDatum {
  code:  string;
  name:  string;
  value: number;
  ldl:   number;
  ldr:   number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  cw: number;
  name: string;
  ldl: number;
  ldr: number;
}

// ── Dimensions ─────────────────────────────────────────────────────────────────

const BAR_H   = 22;
const BAR_GAP = 5;
const M_L     = 192;
const M_R     = 70;
const M_T     = 16;
const M_B     = 40;
const W       = 600;

// ── Component ──────────────────────────────────────────────────────────────────

export default function JoltsIndustryChart() {
  const t = useT("pulse");

  const svgRef       = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { resolvedTheme } = useTheme();
  const isDark = (resolvedTheme ?? "dark") !== "light";

  const [mode, setMode] = useState<"level" | "rate">("level");
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, cw: W, name: "", ldl: 0, ldr: 0,
  });

  const industries = useMemo(
    () => getJoltsIndustriesByLayoffs().filter((i: JoltsIndustry) => !EXCLUDE_CODES.has(i.code)),
    [],
  );

  // x-axis label — changes with mode and locale; in effect deps
  const labelAxisX = mode === "level" ? t("chartIndustryAxisX") : t("chartIndustryAxisXRate");

  // ── D3 render ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const svgEl       = svgRef.current;
    const containerEl = containerRef.current;
    if (!svgEl || !containerEl || industries.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const svg     = d3.select<SVGSVGElement, unknown>(svgEl);
    svg.selectAll("*").remove();

    const H = M_T + industries.length * (BAR_H + BAR_GAP) - BAR_GAP + M_B;
    svg.attr("viewBox", `0 0 ${W} ${H}`);

    // Theme colours
    const axisText   = isDark ? "#71717a" : "#52525b";
    const axisLine   = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    const trackFill  = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
    const labelColor = isDark ? "#d4d4d8" : "#27272a";

    // Build & sort data
    const data: BarDatum[] = industries
      .map((ind) => ({
        code:  ind.code,
        name:  ind.name,
        value: mode === "level" ? (ind.latest?.LDL ?? 0) : (ind.latest?.LDR ?? 0),
        ldl:   ind.latest?.LDL ?? 0,
        ldr:   ind.latest?.LDR ?? 0,
      }))
      .sort((a, b) => b.value - a.value);

    // x scale
    const maxVal = d3.max(data, (d) => d.value) ?? 1;
    const xScale = d3.scaleLinear()
      .domain([0, maxVal * 1.08])
      .range([0, W - M_L - M_R]);

    // Sequential color scale by magnitude
    const colorScale = d3.scaleSequential(
      isDark ? d3.interpolateOranges : d3.interpolateOrRd,
    ).domain([0, maxVal]);

    // ── Bar groups ─────────────────────────────────────────────────────────────
    const groups = svg
      .selectAll<SVGGElement, BarDatum>(".ind-bar-group")
      .data(data, (d) => d.code)
      .join("g")
      .attr("class", "ind-bar-group")
      .attr("transform", (_, i) => `translate(0, ${M_T + i * (BAR_H + BAR_GAP)})`);

    // Track background
    groups.append("rect")
      .attr("x",      M_L).attr("y", 0)
      .attr("width",  W - M_L - M_R)
      .attr("height", BAR_H)
      .attr("rx",     3).attr("fill", trackFill);

    // Name label (left)
    groups.append("text")
      .attr("x",                 M_L - 6)
      .attr("y",                 BAR_H / 2)
      .attr("dominant-baseline", "middle")
      .attr("text-anchor",       "end")
      .attr("font-size",         "9.5px")
      .attr("fill",              labelColor)
      .text((d) => d.name.length > 30 ? d.name.substring(0, 29) + "…" : d.name);

    // Fill bar
    const bars = groups.append("rect")
      .attr("x",      M_L).attr("y", 0)
      .attr("height", BAR_H).attr("rx", 3)
      .attr("fill",         (d) => colorScale(d.value))
      .attr("fill-opacity", 0.82);

    if (!reduced) {
      bars.attr("width", 0)
        .transition().duration(600)
        .delay((_, i) => i * 40)
        .ease(d3.easeCubicOut)
        .attr("width", (d) => xScale(d.value));
    } else {
      bars.attr("width", (d) => xScale(d.value));
    }

    // Value label (right of bar)
    groups.append("text")
      .attr("x",                 (d) => M_L + xScale(d.value) + 5)
      .attr("y",                 BAR_H / 2)
      .attr("dominant-baseline", "middle")
      .attr("text-anchor",       "start")
      .attr("font-size",         "9px")
      .attr("fill",              axisText)
      .text((d) =>
        mode === "level" ? `${d.value.toLocaleString()}K` : `${d.value.toFixed(1)}%`,
      );

    // Mouse overlay per row (transparent hit area)
    groups.append("rect")
      .attr("x",      M_L).attr("y", 0)
      .attr("width",  W - M_L - M_R)
      .attr("height", BAR_H)
      .attr("fill",   "transparent")
      .attr("cursor", "pointer")
      .on("mousemove", (event: MouseEvent, d) => {
        const cRect = containerEl.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: event.clientX - cRect.left,
          y: event.clientY - cRect.top,
          cw: containerEl.clientWidth,
          name: d.name,
          ldl:  d.ldl,
          ldr:  d.ldr,
        });
      })
      .on("mouseleave", () => setTooltip((p) => ({ ...p, visible: false })));

    // ── x-axis ────────────────────────────────────────────────────────────────
    const gXAxis = svg.append("g")
      .attr("transform", `translate(${M_L}, ${H - M_B + 4})`);
    gXAxis.call(
      d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat((v) => mode === "level" ? `${+v}K` : `${+v}%`)
        .tickSize(0),
    );
    gXAxis.select(".domain").attr("stroke", axisLine);
    gXAxis.selectAll("text").attr("fill", axisText).attr("font-size", "9.5px").attr("dy", "1.2em");

    svg.append("text")
      .attr("x",           M_L + (W - M_L - M_R) / 2)
      .attr("y",           H - 4)
      .attr("text-anchor", "middle")
      .attr("fill",        axisText).attr("font-size", "9.5px")
      .text(labelAxisX);

    // ── Cleanup ────────────────────────────────────────────────────────────────
    return () => { d3.select(svgEl).selectAll("*").interrupt(); };
  }, [industries, mode, isDark, labelAxisX]);

  // ── Render ─────────────────────────────────────────────────────────────────

  // Tooltip label strings (used only in JSX, not in d3 effect)
  const labelLDL = t("tooltipLDL");
  const labelLDR = t("tooltipLDR");

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Mode toggle */}
      <div className="flex items-center gap-2 mb-3">
        {(["level", "rate"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`h-7 px-3 rounded-full text-[11px] font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              mode === m
                ? "bg-violet-600 border-violet-600 text-white"
                : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400"
            }`}
          >
            {m === "level" ? t("toggleLevel") : t("toggleRate")}
          </button>
        ))}
      </div>

      {/* Chart — role="img" wrapper with sr-only summary */}
      <div role="img" aria-label={t("srIndustrySummary")} className="w-full">
        <svg ref={svgRef} className="w-full h-auto" style={{ minHeight: 200 }} />
        <p className="sr-only">{t("srIndustrySummary")}</p>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="pointer-events-none absolute z-50 rounded-xl border px-3 py-2.5 text-xs"
          style={{
            left:                 tooltip.x > tooltip.cw * 0.60 ? tooltip.x - 172 : tooltip.x + 12,
            top:                  tooltip.y,
            transform:            "translateY(-50%)",
            background:           isDark ? "rgba(9,9,11,0.93)"    : "rgba(255,255,255,0.96)",
            backdropFilter:       "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderColor:          isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)",
            minWidth:             160,
            boxShadow:            isDark ? "0 4px 24px rgba(0,0,0,0.55)" : "0 4px 16px rgba(0,0,0,0.10)",
          }}
        >
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5 leading-tight">
            {tooltip.name}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">{labelLDL}</span>
              <span className="font-medium text-orange-500">
                {tooltip.ldl.toLocaleString()}K
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">{labelLDR}</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {tooltip.ldr.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
