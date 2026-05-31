import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import it from "./locales/it/translation.json";
import en from "./locales/en/translation.json";
import bg from "./locales/bg/translation.json";
import de from "./locales/de/translation.json";
import es from "./locales/es/translation.json";
import fr from "./locales/fr/translation.json";
import itNavbar from "../locales/it/navbar.json";
import enNavbar from "../locales/en/navbar.json";
import bgNavbar from "../locales/bg/navbar.json";
import deNavbar from "../locales/de/navbar.json";
import esNavbar from "../locales/es/navbar.json";
import frNavbar from "../locales/fr/navbar.json";
import itHome from "../locales/it/home.json";
import enHome from "../locales/en/home.json";
import bgHome from "../locales/bg/home.json";
import deHome from "../locales/de/home.json";
import esHome from "../locales/es/home.json";
import frHome from "../locales/fr/home.json";
import itCommunity from "../locales/it/community.json";
import enCommunity from "../locales/en/community.json";
import bgCommunity from "../locales/bg/community.json";
import deCommunity from "../locales/de/community.json";
import esCommunity from "../locales/es/community.json";
import frCommunity from "../locales/fr/community.json";
import itDrink from "../locales/it/drink.json";
import enDrink from "../locales/en/drink.json";
import bgDrink from "../locales/bg/drink.json";
import deDrink from "../locales/de/drink.json";
import esDrink from "../locales/es/drink.json";
import frDrink from "../locales/fr/drink.json";
import itCommon from "../locales/it/common.json";
import enCommon from "../locales/en/common.json";
import bgCommon from "../locales/bg/common.json";
import deCommon from "../locales/de/common.json";
import esCommon from "../locales/es/common.json";
import frCommon from "../locales/fr/common.json";
import itAuth from "../locales/it/auth.json";
import enAuth from "../locales/en/auth.json";
import bgAuth from "../locales/bg/auth.json";
import deAuth from "../locales/de/auth.json";
import esAuth from "../locales/es/auth.json";
import frAuth from "../locales/fr/auth.json";
import itLounge from "../locales/it/lounge.json";
import enLounge from "../locales/en/lounge.json";
import bgLounge from "../locales/bg/lounge.json";
import deLounge from "../locales/de/lounge.json";
import esLounge from "../locales/es/lounge.json";
import frLounge from "../locales/fr/lounge.json";

const LANGUAGE_STORAGE_KEY = "drinkwise-language";
const SUPPORTED_LANGUAGES = ["it", "en", "de", "bg", "es", "fr"] as const;

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
      auth: itAuth,
      lounge: itLounge,
    },
    en: {
      translation: en,
      navbar: enNavbar,
      home: enHome,
      community: enCommunity,
      drink: enDrink,
      common: enCommon,
      auth: enAuth,
      lounge: enLounge,
    },
    bg: {
      translation: bg,
      navbar: bgNavbar,
      home: bgHome,
      community: bgCommunity,
      drink: bgDrink,
      common: bgCommon,
      auth: bgAuth,
      lounge: bgLounge,
    },
    de: {
      translation: de,
      navbar: deNavbar,
      home: deHome,
      community: deCommunity,
      drink: deDrink,
      common: deCommon,
      auth: deAuth,
      lounge: deLounge,
    },
    es: {
      translation: es,
      navbar: esNavbar,
      home: esHome,
      community: esCommunity,
      drink: esDrink,
      common: esCommon,
      auth: esAuth,
      lounge: esLounge,
    },
  },

  ns: ["translation", "navbar", "home", "community", "drink", "common", "auth", "lounge"],
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