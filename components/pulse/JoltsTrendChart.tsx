"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import * as d3 from "d3";
import { useT } from "@/lib/i18n/useT";
import {
  getJoltsSeries,
  getJoltsLayoffsPeak,
  type JoltsPoint,
} from "@/lib/jolts";

// ── NBER recession periods ─────────────────────────────────────────────────────

const RECESSIONS = [
  { start: "2001-03", end: "2001-11" },
  { start: "2007-12", end: "2009-06" },
  { start: "2020-02", end: "2020-04" },
] as const;

const RECESSION_LABEL_BANDS = [
  { start: "2001-03", end: "2001-11" },
  { start: "2007-12", end: "2009-06" },
] as const;

const parseMonth = d3.timeParse("%Y-%m");

// ── Types ──────────────────────────────────────────────────────────────────────

interface ParsedPoint {
  date: Date;
  value: number;
  raw: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  cw: number;
  date: string;
  layoffs: number;
  hires: number | null;
}

// ── Dimensions ─────────────────────────────────────────────────────────────────

const W = 760;
const H = 300;
const M = { top: 28, right: 24, bottom: 44, left: 64 };

// ── Component ──────────────────────────────────────────────────────────────────

export default function JoltsTrendChart() {
  const t = useT("pulse");

  const svgRef       = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { resolvedTheme } = useTheme();
  const isDark = (resolvedTheme ?? "dark") !== "light";

  const [showHires, setShowHires] = useState(false);
  const [tooltip, setTooltip]     = useState<TooltipState>({
    visible: false, x: 0, y: 0, cw: W, date: "", layoffs: 0, hires: null,
  });

  // ── Data ────────────────────────────────────────────────────────────────────

  const layoffsSeries = useMemo(() => getJoltsSeries("LDL"), []);
  const hiresSeries   = useMemo(() => getJoltsSeries("HIL"), []);
  const peak          = useMemo(() => getJoltsLayoffsPeak(), []);

  const hiresMap = useMemo(() => {
    const m = new Map<string, number>();
    hiresSeries.forEach((p: JoltsPoint) => m.set(p.date, p.value));
    return m;
  }, [hiresSeries]);

  // ── Labels (in effect deps to re-render on locale change) ──────────────────

  const labelRecession = t("legendRecession");
  const labelCovidPeak = t("chartPeakAnnotation");
  const labelAxisDate  = t("chartAxisDate");
  const labelAxisLevel = t("chartAxisLevel");

  // ── D3 render ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const svgEl       = svgRef.current;
    const containerEl = containerRef.current;
    if (!svgEl || !containerEl || layoffsSeries.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const svg     = d3.select<SVGSVGElement, unknown>(svgEl);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${W} ${H}`);

    // Theme colours
    const axisText   = isDark ? "#71717a" : "#52525b";
    const axisLine   = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    const gridColor  = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
    const recFill    = isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.045)";
    const recLabel   = isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)";

    // Parse data
    const parsed: ParsedPoint[] = layoffsSeries
      .map((p: JoltsPoint) => ({ date: parseMonth(p.date)!, value: p.value, raw: p.date }))
      .filter((p) => p.date != null);

    const parsedHires: ParsedPoint[] = hiresSeries
      .map((p: JoltsPoint) => ({ date: parseMonth(p.date)!, value: p.value, raw: p.date }))
      .filter((p) => p.date != null);

    // Scales
    const xExtent  = d3.extent(parsed, (d) => d.date) as [Date, Date];
    const xScale   = d3.scaleTime().domain(xExtent).range([M.left, W - M.right]);
    const allVals  = showHires
      ? [...parsed.map((d) => d.value), ...parsedHires.map((d) => d.value)]
      : parsed.map((d) => d.value);
    const maxY     = d3.max(allVals) ?? 11000;
    const yScale   = d3.scaleLinear()
      .domain([0, maxY * 1.08]).range([H - M.bottom, M.top]).nice();

    // ── Recession bands ────────────────────────────────────────────────────────
    RECESSIONS.forEach(({ start, end }) => {
      const x0 = parseMonth(start);
      const x1 = parseMonth(end);
      if (!x0 || !x1) return;
      svg.append("rect")
        .attr("x",      xScale(x0))
        .attr("y",      M.top)
        .attr("width",  Math.max(0, xScale(x1) - xScale(x0)))
        .attr("height", H - M.top - M.bottom)
        .attr("fill",   recFill)
        .attr("pointer-events", "none");
    });

    // Recession text on the two wider bands
    RECESSION_LABEL_BANDS.forEach(({ start, end }) => {
      const x0 = parseMonth(start);
      const x1 = parseMonth(end);
      if (!x0 || !x1) return;
      svg.append("text")
        .attr("x",           (xScale(x0) + xScale(x1)) / 2)
        .attr("y",           M.top + 9)
        .attr("text-anchor", "middle")
        .attr("fill",        recLabel)
        .attr("font-size",   "7.5px")
        .attr("font-style",  "italic")
        .attr("pointer-events", "none")
        .text(labelRecession);
    });

    // ── Horizontal grid lines ──────────────────────────────────────────────────
    svg.selectAll<SVGLineElement, d3.NumberValue>(".hgrid")
      .data(yScale.ticks(5)).join("line").attr("class", "hgrid")
      .attr("x1", M.left).attr("x2", W - M.right)
      .attr("y1", (v) => yScale(+v)).attr("y2", (v) => yScale(+v))
      .attr("stroke", gridColor).attr("stroke-dasharray", "3,3")
      .attr("pointer-events", "none");

    // ── Generators ────────────────────────────────────────────────────────────
    const areaGen = d3.area<ParsedPoint>()
      .x((d) => xScale(d.date))
      .y0(H - M.bottom).y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const lineGen = d3.line<ParsedPoint>()
      .x((d) => xScale(d.date)).y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // ── Gradient defs ──────────────────────────────────────────────────────────
    const defs = svg.append("defs");

    function makeGradient(id: string, color: string, opTop: number) {
      const g = defs.append("linearGradient")
        .attr("id", id).attr("x1", "0").attr("y1", "0")
        .attr("x2", "0").attr("y2", "1");
      g.append("stop").attr("offset", "0%")
        .attr("stop-color", color).attr("stop-opacity", opTop);
      g.append("stop").attr("offset", "100%")
        .attr("stop-color", color).attr("stop-opacity", 0.01);
    }

    makeGradient("ldl-grad", isDark ? "#f87171" : "#ef4444", isDark ? 0.35 : 0.20);
    if (showHires) makeGradient("hil-grad", isDark ? "#60a5fa" : "#3b82f6", isDark ? 0.20 : 0.12);

    // ── Hires overlay (rendered beneath layoffs) ───────────────────────────────
    if (showHires && parsedHires.length > 0) {
      svg.append("path").datum(parsedHires)
        .attr("fill", "url(#hil-grad)").attr("d", areaGen);

      svg.append("path").datum(parsedHires)
        .attr("fill", "none")
        .attr("stroke", isDark ? "#60a5fa" : "#2563eb")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5,3")
        .attr("d", lineGen);
    }

    // ── Layoffs area & line ────────────────────────────────────────────────────
    svg.append("path").datum(parsed)
      .attr("fill", "url(#ldl-grad)").attr("d", areaGen);

    const layoffsPath = svg.append("path")
      .datum(parsed)
      .attr("fill", "none")
      .attr("stroke", isDark ? "#f87171" : "#dc2626")
      .attr("stroke-width", 2)
      .attr("d", lineGen);

    if (!reduced) {
      const len = (layoffsPath.node() as SVGPathElement | null)?.getTotalLength() ?? 0;
      if (len > 0) {
        layoffsPath
          .attr("stroke-dasharray", `${len} ${len}`)
          .attr("stroke-dashoffset", len)
          .transition().duration(1400).ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
      }
    }

    // ── COVID peak annotation ──────────────────────────────────────────────────
    if (peak) {
      const peakDate = parseMonth(peak.date);
      if (peakDate) {
        const px = xScale(peakDate);
        svg.append("line")
          .attr("x1", px).attr("x2", px)
          .attr("y1", M.top).attr("y2", H - M.bottom)
          .attr("stroke",         isDark ? "#fbbf24" : "#d97706")
          .attr("stroke-width",   1.5)
          .attr("stroke-dasharray", "4,3")
          .attr("pointer-events", "none");

        svg.append("text")
          .attr("x",           px + 4)
          .attr("y",           Math.max(M.top + 8, yScale(peak.value) - 4))
          .attr("fill",        isDark ? "#fbbf24" : "#d97706")
          .attr("font-size",   "9px")
          .attr("font-weight", "500")
          .attr("pointer-events", "none")
          .text(labelCovidPeak);
      }
    }

    // ── Axes ──────────────────────────────────────────────────────────────────
    const gXAxis = svg.append("g").attr("transform", `translate(0,${H - M.bottom})`);
    gXAxis.call(d3.axisBottom(xScale).ticks(8).tickSize(0));
    gXAxis.select(".domain").attr("stroke", axisLine);
    gXAxis.selectAll("text").attr("fill", axisText).attr("font-size", "10px").attr("dy", "1.3em");

    const gYAxis = svg.append("g").attr("transform", `translate(${M.left},0)`);
    gYAxis.call(
      d3.axisLeft(yScale).ticks(5)
        .tickFormat((v) => d3.format(".2~s")(+v * 1000)),
    );
    gYAxis.select(".domain").attr("stroke", axisLine);
    gYAxis.selectAll(".tick line").attr("stroke", axisLine);
    gYAxis.selectAll("text").attr("fill", axisText).attr("font-size", "10px");

    // Axis labels
    svg.append("text")
      .attr("x",           M.left + (W - M.left - M.right) / 2)
      .attr("y",           H - 4)
      .attr("text-anchor", "middle")
      .attr("fill",        axisText).attr("font-size", "10px")
      .text(labelAxisDate);

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x",           -(M.top + (H - M.top - M.bottom) / 2))
      .attr("y",           16)
      .attr("text-anchor", "middle")
      .attr("fill",        axisText).attr("font-size", "10px")
      .text(labelAxisLevel);

    // ── Mouse overlay for tooltip ──────────────────────────────────────────────
    const bisect = d3.bisector((d: ParsedPoint) => d.date).left;

    svg.append("rect")
      .attr("x",      M.left).attr("y", M.top)
      .attr("width",  W - M.left - M.right)
      .attr("height", H - M.top - M.bottom)
      .attr("fill",   "transparent")
      .attr("cursor", "crosshair")
      .on("mousemove", (event: MouseEvent) => {
        const svgRect = svgEl.getBoundingClientRect();
        const xInSvg  = ((event.clientX - svgRect.left) / svgRect.width) * W;
        const xDate   = xScale.invert(xInSvg);
        const i       = bisect(parsed, xDate);
        const d0      = parsed[i - 1];
        const d1      = parsed[i];
        if (!d0 && !d1) return;
        const nearest = !d1 ? d0 : !d0 ? d1
          : Math.abs(xDate.getTime() - d0.date.getTime()) <= Math.abs(xDate.getTime() - d1.date.getTime())
            ? d0 : d1;
        const cRect   = containerEl.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: event.clientX - cRect.left,
          y: event.clientY - cRect.top,
          cw: containerEl.clientWidth,
          date: nearest.raw,
          layoffs: nearest.value,
          hires: hiresMap.get(nearest.raw) ?? null,
        });
      })
      .on("mouseleave", () => setTooltip((p) => ({ ...p, visible: false })));

    // ── Cleanup ────────────────────────────────────────────────────────────────
    return () => { d3.select(svgEl).selectAll("*").interrupt(); };
  }, [layoffsSeries, hiresSeries, hiresMap, showHires, isDark, peak,
      labelRecession, labelCovidPeak, labelAxisDate, labelAxisLevel]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Controls */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setShowHires((v) => !v)}
          aria-pressed={showHires}
          className={`h-7 px-3 rounded-full text-[11px] font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
            showHires
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
          }`}
        >
          {t("chartToggleHires")}
        </button>
      </div>

      {/* Chart — role="img" wrapper with sr-only summary */}
      <div role="img" aria-label={t("srTrendSummary")} className="w-full">
        <svg ref={svgRef} className="w-full h-auto" style={{ minHeight: 180 }} />
        <p className="sr-only">{t("srTrendSummary")}</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 select-none pointer-events-none">
        <span className="flex items-center gap-1.5">
          <span
            className="w-6 shrink-0 rounded-full"
            style={{ height: 2, background: isDark ? "#f87171" : "#dc2626" }}
          />
          {t("legendLayoffs")}
        </span>
        {showHires && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-6 shrink-0 rounded-full"
              style={{ height: 2, background: isDark ? "#60a5fa" : "#2563eb" }}
            />
            {t("legendHires")}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span
            className="w-4 h-3 rounded shrink-0"
            style={{ background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)" }}
          />
          {t("legendRecession")}
        </span>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="pointer-events-none absolute z-50 rounded-xl border px-3 py-2.5 text-xs"
          style={{
            left:                 tooltip.x > tooltip.cw * 0.60 ? tooltip.x - 164 : tooltip.x + 12,
            top:                  tooltip.y,
            transform:            "translateY(-50%)",
            background:           isDark ? "rgba(9,9,11,0.93)"    : "rgba(255,255,255,0.96)",
            backdropFilter:       "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderColor:          isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)",
            minWidth:             148,
            boxShadow:            isDark ? "0 4px 24px rgba(0,0,0,0.55)" : "0 4px 16px rgba(0,0,0,0.10)",
          }}
        >
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">
            {tooltip.date}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">{t("tooltipLayoffs")}</span>
              <span className="font-medium" style={{ color: isDark ? "#f87171" : "#dc2626" }}>
                {tooltip.layoffs.toLocaleString()}K
              </span>
            </div>
            {tooltip.hires != null && showHires && (
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">{t("tooltipHires")}</span>
                <span className="font-medium" style={{ color: isDark ? "#60a5fa" : "#2563eb" }}>
                  {tooltip.hires.toLocaleString()}K
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
