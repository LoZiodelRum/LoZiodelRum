import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import it from "./locales/it/translation.json";
import en from "./locales/en/translation.json";
import itNavbar from "../locales/it/navbar.json";
import enNavbar from "../locales/en/navbar.json";
import itHome from "../locales/it/home.json";
import enHome from "../locales/en/home.json";
import itCommunity from "../locales/it/community.json";
import enCommunity from "../locales/en/community.json";
import itDrink from "../locales/it/drink.json";
import enDrink from "../locales/en/drink.json";

i18n.use(initReactI18next).init({
  resources: {
    it: {
      translation: it,
      navbar: itNavbar,
      home: itHome,
      community: itCommunity,
      drink: itDrink,
    },
    en: {
      translation: en,
      navbar: enNavbar,
      home: enHome,
      community: enCommunity,
      drink: enDrink,
    },
  },

  ns: ["translation", "navbar", "home", "community", "drink"],
  defaultNS: "translation",

  lng: "it",
  fallbackLng: "it",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;