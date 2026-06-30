"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useT } from "@/lib/i18n/useT";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const t = useT("common");

  return (
    <div
      role="group"
      aria-label={t("langSwitchLabel")}
      className="flex items-center gap-0.5"
    >
      <button
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        aria-label={t("switchToEn")}
        className={`px-1.5 py-0.5 rounded text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors ${
          locale === "en"
            ? "text-violet-500 dark:text-violet-400"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
        }`}
      >
        EN
      </button>
      <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700 text-[10px] select-none">
        |
      </span>
      <button
        onClick={() => setLocale("zh")}
        aria-pressed={locale === "zh"}
        aria-label={t("switchToZh")}
        className={`px-1.5 py-0.5 rounded text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors ${
          locale === "zh"
            ? "text-violet-500 dark:text-violet-400"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
        }`}
      >
        中文
      </button>
    </div>
  );
}
