"use client";

import { useParams } from "next/navigation";
import { generateAllCareerInsights, getOnetEnrichment, getSectorAggregatesExtended, computeResiliencyScore, getOccupationTrend } from "@/lib/data";
import OccupationTrendChart from "@/components/charts/OccupationTrendChart";
import { colorForRisk, formatCurrency } from "@/lib/utils";
import PredictiveChart from "@/components/charts/PredictiveChart";
import Link from "next/link";
import { useMemo } from "react";
import { useT } from "@/lib/i18n/useT";

export default function CareerDetailPage() {
  const params = useParams();
  const t = useT("careers");
  const code = decodeURIComponent(params.code as string);

  const allInsights = useMemo(() => generateAllCareerInsights(), []);
  const career = allInsights.find((i) => i.occupationCode === code);
  const allInsightCodes = useMemo(
    () => new Set(allInsights.map((insight) => insight.occupationCode)),
    [allInsights],
  );
  const onet = useMemo(() => getOnetEnrichment(code), [code]);
  const sectorAgg = useMemo(
    () => getSectorAggregatesExtended().find((s) => s.sector === career?.sectorName),
    [career],
  );
  const trend = useMemo(() => getOccupationTrend(code), [code]);

  if (!career) {
    return (
      <div className="space-y-4">
        <Link href="/careers" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
          &larr; {t("backToCareers")}
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{t("careerNotFound")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("noDataAvailable", { code })}</p>
      </div>
    );
  }

  const riskColor = colorForRisk(career.automationRisk);
  const resiliency = computeResiliencyScore(career.automationProbability);

  return (
    <div className="space-y-8 max-w-[1400px]">
      <Link
        href="/careers"
        className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white inline-block transition-colors"
      >
        &larr; {t("backToCareers")}
      </Link>

      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">
            {career.occupationName}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            {career.sectorName} &middot; SOC {career.occupationCode}
          </p>
        </div>
        <div className="shrink-0">
          <span
            className="inline-block px-4 py-2 rounded-lg text-base font-bold"
            style={{
              backgroundColor: `${riskColor}22`,
              color: riskColor,
            }}
          >
            {t("aiExposureBadge", { pct: (career.automationProbability * 100).toFixed(1), risk: career.automationRisk })}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            value: formatCurrency(career.medianSalary),
            label: t("labelMedianAnnualSalary"),
            className: "text-zinc-900 dark:text-white",
          },
          {
            value: career.outlook === "Bright" ? t("outlookBright") : t("outlookAverage"),
            label: t("labelOnetOutlook"),
            className: career.outlook === "Bright" ? "text-green-700 dark:text-green-400" : "text-zinc-600 dark:text-zinc-400",
          },
          {
            value: career.projectedOpenings != null ? career.projectedOpenings.toLocaleString() : "—",
            label: t("labelProjAnnualOpenings"),
            className: "text-zinc-900 dark:text-white",
          },
          ...(career.totalEmployment != null
            ? [
                {
                  value: career.totalEmployment.toLocaleString(),
                  label: t("labelEmploymentOews"),
                  className: "text-zinc-900 dark:text-white",
                },
              ]
            : []),
          {
            value: `${resiliency}`,
            label: t("labelAIResiliencyScore"),
            className: "text-cyan-700 dark:text-cyan-400",
            suffix: "/100",
          },
        ].map(({ value, label, className, suffix }) => (
          <div
            key={label}
            className="glass bg-white/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-center"
          >
            <div className={`text-2xl font-bold ${className}`}>
              {value}
              {suffix && (
                <span className="text-sm text-zinc-500 font-normal">{suffix}</span>
              )}
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500 italic -mt-4">
        {t("dataNote")}{" "}
        <Link href="/sources" className="underline underline-offset-2 hover:text-zinc-400">
          {t("seeSourcesLink")}
        </Link>
        .
      </p>

      {/* Risk analysis + skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass bg-white/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">{t("sectionAIExposureAnalysis")}</h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-zinc-600 dark:text-zinc-400">{t("labelAIExposure")}</span>
                <span className="font-semibold" style={{ color: riskColor }}>
                  {(career.automationProbability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${career.automationProbability * 100}%`,
                    backgroundColor: riskColor,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-zinc-600 dark:text-zinc-400">{t("labelAIResiliency")}</span>
                <span className="font-semibold text-cyan-400">{resiliency}/100</span>
              </div>
              <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${resiliency}%`,
                    background: "linear-gradient(90deg, #8b5cf6, #22d3ee)",
                  }}
                />
              </div>
            </div>
            <div className="pt-2 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">{t("labelExposureBand")}</span>
                <span style={{ color: riskColor }} className="font-semibold">
                  {career.automationRisk}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">{t("labelSectorAvgExposure")}</span>
                <span className="text-zinc-900 dark:text-white">
                  {sectorAgg ? `${(sectorAgg.avgRisk * 100).toFixed(1)}%` : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass bg-white/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">{t("sectionTopSkills")}</h2>
          <div className="space-y-2.5">
            {career.skills.map((skill, idx) => (
              <div key={skill} className="flex items-center gap-3">
                <span className="text-xs font-bold text-zinc-600 w-5 tabular-nums">
                  {idx + 1}.
                </span>
                <span
                  className="flex-1 px-3 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700/20 text-sm text-violet-800 dark:text-violet-200"
                >
                  {skill}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {onet && (
        <div className="glass bg-white/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-6">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
              {t("onetProfileLabel")}
            </p>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{t("onetWhatThisWorkInvolves")}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
              {onet.description}
            </p>
            {onet.sampleTitles.length > 0 && (
              <p className="text-xs text-zinc-500 mt-3">
                {t("commonTitlesLabel")} {onet.sampleTitles.slice(0, 6).join(", ")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-3">{t("sectionRepresentativeTasks")}</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                {onet.tasks.slice(0, 5).map((task) => (
                  <li key={task.id} className="flex gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <span>{task.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-3">{t("sectionDetailedWorkActivities")}</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                {onet.detailedWorkActivities.slice(0, 5).map((activity) => (
                  <li key={activity.id} className="flex gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>{activity.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {onet.technologySkills.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-3">{t("sectionToolsAndTechnologies")}</h3>
                <div className="flex flex-wrap gap-2">
                  {onet.technologySkills.slice(0, 10).map((tech) => (
                    <span
                      key={`${tech.category}-${tech.name}`}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-700 dark:text-zinc-300"
                      title={tech.category}
                    >
                      {tech.name}
                      {tech.hot && <span className="text-orange-400"> · hot</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {onet.relatedOccupations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-3">{t("sectionRelatedOccupations")}</h3>
                <div className="flex flex-wrap gap-2">
                  {onet.relatedOccupations.slice(0, 8).map((related) => {
                    const chip = (
                      <span className="px-2.5 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700/25 text-xs text-violet-800 dark:text-violet-200">
                        {related.title}
                        {related.brightOutlook && <span className="text-green-400"> · Bright</span>}
                      </span>
                    );
                    return allInsightCodes.has(related.code) ? (
                      <Link key={related.onetCode} href={`/careers/${related.code}`} className="hover:opacity-80 transition-opacity">
                        {chip}
                      </Link>
                    ) : (
                      <span key={related.onetCode}>{chip}</span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Predictive chart */}
      <div className="glass bg-white/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          {t("sectionEmploymentProjections")}
        </h2>
        <PredictiveChart selectedSector={career.sectorName} />
      </div>

      {/* Employment & wage trend */}
      <div className="glass bg-white/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gradient mb-1">
          {t("sectionEmploymentWageTrend")}
        </h2>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
          {t("blsOewsPeriod")}
        </p>
        <hr className="divider-glow mb-5" />
        {trend.length >= 2 ? (
          <OccupationTrendChart code={code} />
        ) : (
          <p className="text-sm text-zinc-500 italic">
            {t("limitedHistoricalData")}
          </p>
        )}
        <p className="text-xs text-zinc-500 mt-4">
          {t("sourceOews")}{" "}
          <Link href="/sources" className="underline underline-offset-2 hover:text-zinc-400">
            {t("seeSourcesLink")}
          </Link>
          .
        </p>
      </div>

      {/* Sector comparison table */}
      <div className="glass bg-white/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">{t("sectionSectorComparison")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                <th className="text-left py-3 px-4">{t("colMetric")}</th>
                <th className="text-right py-3 px-4">{t("colThisCareer")}</th>
                <th className="text-right py-3 px-4">{t("colSectorAverage")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200/60 dark:border-zinc-800/50">
                <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{t("labelAIExposure")}</td>
                <td className="py-3 px-4 text-right" style={{ color: riskColor }}>
                  {(career.automationProbability * 100).toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-right text-zinc-900 dark:text-white">
                  {sectorAgg ? `${(sectorAgg.avgRisk * 100).toFixed(1)}%` : "N/A"}
                </td>
              </tr>
              <tr className="border-b border-zinc-200/60 dark:border-zinc-800/50">
                <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{t("labelOutlook")}</td>
                <td
                  className={`py-3 px-4 text-right font-medium ${
                    career.outlook === "Bright" ? "text-green-400" : "text-zinc-400"
                  }`}
                >
                  {career.outlook === "Bright" ? t("outlookBright") : t("outlookAverage")}
                </td>
                <td className="py-3 px-4 text-right text-zinc-900 dark:text-white">
                  {sectorAgg ? `${(sectorAgg.brightShare * 100).toFixed(0)}% Bright` : "N/A"}
                </td>
              </tr>
              <tr className="border-b border-zinc-200/60 dark:border-zinc-800/50">
                <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{t("labelMedianSalary")}</td>
                <td className="py-3 px-4 text-right text-zinc-900 dark:text-white font-medium">
                  {formatCurrency(career.medianSalary)}
                </td>
                <td className="py-3 px-4 text-right text-zinc-500">N/A</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{t("labelAIResiliency")}</td>
                <td className="py-3 px-4 text-right text-cyan-700 dark:text-cyan-400 font-bold">
                  {resiliency}/100
                </td>
                <td className="py-3 px-4 text-right text-zinc-500">N/A</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
