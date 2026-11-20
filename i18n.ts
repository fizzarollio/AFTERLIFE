import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ru from "./locales/ru.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import de from "./locales/de.json";
import pt from "./locales/pt.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import ar from "./locales/ar.json";

void i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    ru: { translation: ru }, en: { translation: en }, fr: { translation: fr },
    es: { translation: es }, de: { translation: de }, pt: { translation: pt },
    zh: { translation: zh }, ja: { translation: ja }, ko: { translation: ko },
    ar: { translation: ar },
  },
  fallbackLng: "en",
  supportedLngs: ["ru", "en", "fr", "es", "de", "pt", "zh", "ja", "ko", "ar"],
  interpolation: { escapeValue: false },
  detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
});
export default i18n;