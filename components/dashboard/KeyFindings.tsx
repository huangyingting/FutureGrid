"use client";

import { useMemo } from "react";
import Link from "next/link";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import {
  getWorkforceExposure,
  getTotalWorkforce,
  getDiffusionRisers,
  generateAllCareerInsights,
} from "@/lib/data";
import { useT } from "@/lib/i18n/useT";

interface StatCard {
  id: string;
  numericValue: number;
  decimals: number;
  prefix: string;
  suffix: string;
  labelKey: string;
  captionKey: string;
  captionVars?: Record<string, string | number>;
  href: string;
  accentColor: string;
  durationMs: number;
}

export default function KeyFindings() {
  const t = useT("keyfindings");

  const cards = useMemo((): StatCard[] => {
    const exposure = getWorkforceExposure();
    const total = getTotalWorkforce();
    const risers = getDiffusionRisers(1);
    const insights = generateAllCareerInsights();
    const riser = risers[0] ?? null;

    const result: StatCard[] = [
      {
        id: "high-exposure-share",
        numericValue: exposure.highExposureShare * 100,
        decimals: 1,
        prefix: "",
        suffix: "%",
        labelKey: "card1Label",
        captionKey: "card1Caption",
        href: "/explore",
        accentColor: "#ef4444",
        durationMs: 1600,
      },
      {
        id: "total-workforce",
        numericValue: total / 1_000_000,
        decimals: 1,
        prefix: "",
        suffix: "M",
        labelKey: "card2Label",
        captionKey: "card2Caption",
        href: "/careers",
        accentColor: "#8b5cf6",
        durationMs: 1800,
      },
    ];

    if (riser) {
      result.push({
        id: "top-riser",
        numericValue: riser.delta,
        decimals: 1,
        prefix: "+",
        suffix: "pp",
        labelKey: "card3Label",
        captionKey: "card3Caption",
        captionVars: { country: riser.name },
        href: "/global",
        accentColor: "#22c55e",
        durationMs: 1600,
      });
    }

    result.push({
      id: "occupations-count",
      numericValue: insights.length,
      decimals: 0,
      prefix: "",
      suffix: "+",
      labelKey: "card4Label",
      captionKey: "card4Caption",
      href: "/careers",
      accentColor: "#f59e0b",
      durationMs: 1400,
    });

    return result;
  }, []);

  return (
    <section aria-labelledby="key-findings-heading" className="space-y-4">
      <div>
        <h2
          id="key-findings-heading"
          className="text-xl font-bold tracking-tight text-gradient"
        >
          {t("bandHeading")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("bandSubhead")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="glass glass-hover block p-5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080d]"
            style={{
              boxShadow: `0 0 0 1px ${card.accentColor}22, 0 4px 24px ${card.accentColor}15`,
            }}
          >
            {/* Accent dot + arrow */}
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: card.accentColor,
                  boxShadow: `0 0 6px 2px ${card.accentColor}55`,
                }}
                aria-hidden="true"
              />
              <span
                className="text-zinc-400 dark:text-zinc-600 text-xs"
                aria-hidden="true"
              >
                →
              </span>
            </div>

            {/* Animated number */}
            <AnimatedCounter
              value={card.numericValue}
              decimals={card.decimals}
              prefix={card.prefix}
              suffix={card.suffix}
              durationMs={card.durationMs}
              className="block text-4xl font-extrabold tracking-tight text-gradient tabular-nums leading-none"
            />

            {/* Label */}
            <p className="mt-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-snug">
              {t(card.labelKey)}
            </p>

            {/* Caption */}
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t(card.captionKey, card.captionVars)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
