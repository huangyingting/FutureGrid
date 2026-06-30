"use client";

import { useLanguage } from "./LanguageProvider";
import { messages, type Messages } from "./messages";

type Namespace = keyof Messages["en"];

/** Returns a `t(key, vars?)` translator for the given namespace. */
export function useT(namespace: Namespace) {
  const { locale } = useLanguage();

  return function t(key: string, vars?: Record<string, string | number>): string {
    const nsDict = (messages[locale]?.[namespace] ?? messages.en[namespace]) as
      Record<string, string>;
    const enDict = messages.en[namespace] as Record<string, string>;
    const str = nsDict[key] ?? enDict[key] ?? key;

    if (!vars) return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
  };
}

/** Convenience hook that returns only the active locale. */
export function useLocale() {
  return useLanguage().locale;
}
