import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import en from "./locales/en.json";
import te from "./locales/te.json";
import ta from "./locales/ta.json";
import hi from "./locales/hi.json";
import ml from "./locales/ml.json";

// RTL languages configuration
const rtlLanguages = ["ar", "he", "ur", "fa"]; // Arabic, Hebrew, Urdu, Persian

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      te: { translation: te },
      ta: { translation: ta },
      hi: { translation: hi },
      ml: { translation: ml },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

// Handle RTL direction changes
i18n.on("languageChanged", (lng) => {
  const dir = rtlLanguages.includes(lng) ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lng);
});

// Set initial direction
const initialDir = rtlLanguages.includes(i18n.language) ? "rtl" : "ltr";
document.documentElement.setAttribute("dir", initialDir);

export default i18n;
export { rtlLanguages };
