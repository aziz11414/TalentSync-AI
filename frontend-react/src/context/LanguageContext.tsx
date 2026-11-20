import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Locale } from "../i18n/translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (path: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("talentsync_lang");
    if (saved === "en" || saved === "fr") {
      return saved;
    }
    return "fr";
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("talentsync_lang", newLocale);
  };

  const toggleLocale = () => {
    setLocale(locale === "fr" ? "en" : "fr");
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (path: string, fallback?: string): string => {
    const keys = path.split(".");
    let current: any = translations[locale];

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to french if key is missing in selected locale
        let frCurrent: any = translations.fr;
        for (const frKey of keys) {
          if (frCurrent && typeof frCurrent === "object" && frKey in frCurrent) {
            frCurrent = frCurrent[frKey];
          } else {
            frCurrent = undefined;
            break;
          }
        }
        return typeof frCurrent === "string" ? frCurrent : fallback || path;
      }
    }

    return typeof current === "string" ? current : fallback || path;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
