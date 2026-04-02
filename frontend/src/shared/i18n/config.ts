import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import authEn from '@/shared/i18n/locales/en/auth.json'
import aboutEn from '@/shared/i18n/locales/en/about.json'
import commonEn from '@/shared/i18n/locales/en/common.json'
import coursesEn from '@/shared/i18n/locales/en/courses.json'
import homeEn from '@/shared/i18n/locales/en/home.json'
import profileEn from '@/shared/i18n/locales/en/profile.json'
import supportEn from '@/shared/i18n/locales/en/support.json'
import teacherEn from '@/shared/i18n/locales/en/teacher.json'
import authRu from '@/shared/i18n/locales/ru/auth.json'
import aboutRu from '@/shared/i18n/locales/ru/about.json'
import commonRu from '@/shared/i18n/locales/ru/common.json'
import coursesRu from '@/shared/i18n/locales/ru/courses.json'
import homeRu from '@/shared/i18n/locales/ru/home.json'
import profileRu from '@/shared/i18n/locales/ru/profile.json'
import supportRu from '@/shared/i18n/locales/ru/support.json'
import teacherRu from '@/shared/i18n/locales/ru/teacher.json'

export const APP_LANGUAGE_STORAGE_KEY = 'linglify:language:v1'

const resources = {
  ru: {
    common: commonRu,
    auth: authRu,
    courses: coursesRu,
    home: homeRu,
    profile: profileRu,
    support: supportRu,
    about: aboutRu,
    teacher: teacherRu,
  },
  en: {
    common: commonEn,
    auth: authEn,
    courses: coursesEn,
    home: homeEn,
    profile: profileEn,
    support: supportEn,
    about: aboutEn,
    teacher: teacherEn,
  },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'en'],
    nonExplicitSupportedLngs: true,
    ns: ['common', 'auth', 'home', 'courses', 'profile', 'support', 'about', 'teacher'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: APP_LANGUAGE_STORAGE_KEY,
    },
  })

const syncHtmlLang = (language: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language
  }
}

i18n.on('initialized', () => {
  syncHtmlLang(i18n.language || 'ru')
})

i18n.on('languageChanged', language => {
  syncHtmlLang(language)
})

export default i18n
