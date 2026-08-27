import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptTranslation from './locales/pt.json';
import enTranslation from './locales/en.json';
import deTranslation from './locales/de.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            'pt-BR': { translation: ptTranslation },
            pt: { translation: ptTranslation },
            en: { translation: enTranslation },
            de: { translation: deTranslation }
        },
        fallbackLng: 'pt-BR',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;