import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import it from "./locales/it/translation.json";
import en from "./locales/en/translation.json";
import itNavbar from "../locales/it/navbar.json";
import enNavbar from "../locales/en/navbar.json";
import itHome from "../locales/it/home.json";
import enHome from "../locales/en/home.json";

i18n.use(initReactI18next).init({
  resources: {
    it: {
      translation: it,
      navbar: itNavbar,
      home: itHome,
    },
    en: {
      translation: en,
      navbar: enNavbar,
      home: enHome,
    },
  },

  ns: ["translation", "navbar", "home"],
  defaultNS: "translation",

  lng: "it",
  fallbackLng: "it",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;