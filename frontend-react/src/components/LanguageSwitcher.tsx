import { useLanguage } from "../context/LanguageContext";
import { GlobeIcon } from "./Icons";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`lang-switcher-pill ${className}`}
      role="group"
      aria-label="Sélecteur de langue / Language selector"
    >
      <div className="lang-globe-icon" aria-hidden="true">
        <GlobeIcon width="14" height="14" />
      </div>
      <button
        type="button"
        className={`lang-option-btn ${locale === "fr" ? "active" : ""}`}
        onClick={() => setLocale("fr")}
        aria-pressed={locale === "fr"}
        title="Passer en Français"
      >
        FR
      </button>
      <span className="lang-divider" aria-hidden="true">/</span>
      <button
        type="button"
        className={`lang-option-btn ${locale === "en" ? "active" : ""}`}
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        title="Switch to English"
      >
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;
