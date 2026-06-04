import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./en";
import { tr } from "./tr";
import { detectInitialLocale } from "@/lib/locale";

void i18n.use(initReactI18next).init({
  resources: {
    en: { app: en },
    tr: { app: tr },
  },
  // Boot in the user's persisted choice, else their browser language (TR-first
  // for the target market), else English. (J7)
  lng: detectInitialLocale(),
  fallbackLng: "en",
  defaultNS: "app",
  interpolation: { escapeValue: false },
});

export default i18n;
