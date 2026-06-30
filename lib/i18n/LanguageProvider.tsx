"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "./types";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  setLocale: () => {},
});

function detectInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem("fg-locale");
    if (stored === "en" || stored === "zh") return stored;
    if (navigator.language.toLowerCase().startsWith("zh")) return "zh";
  } catch {
    // localStorage or navigator unavailable (SSR guard)
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start with "en" for SSR/SSG — client effect corrects immediately.
  const [locale, setLocaleState] = useState<Locale>("en");

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setLocaleState(detectInitialLocale()); }, []);

  // Sync html[lang] whenever locale changes.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(next: Locale) {
    setLocaleState(next);
    try {
      localStorage.setItem("fg-locale", next);
    } catch {
      // ignore write errors in restricted contexts
    }
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
