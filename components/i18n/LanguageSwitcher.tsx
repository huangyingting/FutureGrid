"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useT } from "@/lib/i18n/useT";

function IconGlobe() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/** Single toggle that shows the current language and flips to the other on click. */
export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const t = useT("common");

  const next = locale === "en" ? "zh" : "en";
  const label = locale === "en" ? "EN" : "中文";
  const actionLabel = next === "zh" ? t("switchToZh") : t("switchToEn");

  return (
    <button
      onClick={() => setLocale(next)}
      aria-label={actionLabel}
      title={actionLabel}
      className="flex items-center gap-1 px-1.5 py-1 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors"
    >
      <IconGlobe />
      <span className="leading-none">{label}</span>
    </button>
  );
}
