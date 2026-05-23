import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import it from "./locales/it/translation.json";
import en from "./locales/en/translation.json";
import bg from "./locales/bg/translation.json";
import itNavbar from "../locales/it/navbar.json";
import enNavbar from "../locales/en/navbar.json";
import bgNavbar from "../locales/bg/navbar.json";
import itHome from "../locales/it/home.json";
import enHome from "../locales/en/home.json";
import bgHome from "../locales/bg/home.json";
import itCommunity from "../locales/it/community.json";
import enCommunity from "../locales/en/community.json";
import bgCommunity from "../locales/bg/community.json";
import itDrink from "../locales/it/drink.json";
import enDrink from "../locales/en/drink.json";
import bgDrink from "../locales/bg/drink.json";
import itCommon from "../locales/it/common.json";
import enCommon from "../locales/en/common.json";
import bgCommon from "../locales/bg/common.json";

const LANGUAGE_STORAGE_KEY = "drinkwise-language";
const SUPPORTED_LANGUAGES = ["it", "en", "bg"] as const;

function normalizeLanguage(input?: string | null): (typeof SUPPORTED_LANGUAGES)[number] {
  const short = String(input || "it").toLowerCase().split(/[-_]/)[0];
  if (SUPPORTED_LANGUAGES.includes(short as (typeof SUPPORTED_LANGUAGES)[number])) {
    return short as (typeof SUPPORTED_LANGUAGES)[number];
  }
  return "it";
}

function detectInitialLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored) return normalizeLanguage(stored);
  } catch {
    // Ignore storage errors and fallback to runtime/browser detection.
  }

  if (typeof navigator !== "undefined") {
    const candidates = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language];
    for (const candidate of candidates) {
      const normalized = normalizeLanguage(candidate);
      if (normalized !== "it" || String(candidate || "").toLowerCase().startsWith("it")) {
        return normalized;
      }
    }
  }

  if (typeof document !== "undefined") {
    return normalizeLanguage(document.documentElement.lang);
  }

  return "it";
}

i18n.use(initReactI18next).init({
  resources: {
    it: {
      translation: it,
      navbar: itNavbar,
      home: itHome,
      community: itCommunity,
      drink: itDrink,
      common: itCommon,
    },
    en: {
      translation: en,
      navbar: enNavbar,
      home: enHome,
      community: enCommunity,
      drink: enDrink,
      common: enCommon,
    },
    bg: {
      translation: bg,
      navbar: bgNavbar,
      home: bgHome,
      community: bgCommunity,
      drink: bgDrink,
      common: bgCommon,
    },
  },

  ns: ["translation", "navbar", "home", "community", "drink", "common"],
  defaultNS: "translation",
  supportedLngs: [...SUPPORTED_LANGUAGES],
  nonExplicitSupportedLngs: true,
  load: "languageOnly",

  lng: detectInitialLanguage(),
  fallbackLng: "it",

  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  const normalized = normalizeLanguage(lng);
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  } catch {
    // Ignore storage errors.
  }

  if (normalized !== lng) {
    void i18n.changeLanguage(normalized);
  }
});

export default i18n;