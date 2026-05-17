/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ja from './locales/ja.json'
import ru from './locales/ru.json'
import vi from './locales/vi.json'
import zh from './locales/zh.json'

export const resources = {
  en,
  zh,
  fr,
  ru,
  ja,
  vi,
} as const

// Supported language codes for URL query parameter validation
const SUPPORTED_LANGS = ['en', 'zh', 'fr', 'ru', 'ja', 'vi'] as const

// Check if URL has ?lng= query parameter and return the value
function getLngFromUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined
  const params = new URLSearchParams(window.location.search)
  const lng = params.get('lng')
  if (lng && SUPPORTED_LANGS.includes(lng as typeof SUPPORTED_LANGS[number])) {
    return lng
  }
  return undefined
}

// Sync document lang attribute with current i18n language
function syncDocumentLang(lng: string): void {
  if (typeof document === 'undefined') return
  const lang = lng === 'zh' ? 'zh-CN' : lng
  document.documentElement.lang = lang
}

// Custom language detector that checks URL query parameter first
const urlLanguageDetector = {
  name: 'urlLanguageDetector',
  lookup(options?: { order?: string[]; caches?: string[] }) {
    const urlLng = getLngFromUrl()
    if (urlLng) {
      return urlLng
    }
    return undefined
  },
  cacheUserLanguage(lng: string, options?: { caches?: string[] }) {
    const caches = options?.caches ?? ['localStorage']
    if (caches.includes('localStorage') && typeof localStorage !== 'undefined') {
      localStorage.setItem('i18nextLng', lng)
    }
  },
}

i18n
  .use(urlLanguageDetector)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh', 'fr', 'ru', 'ja', 'vi'],
    load: 'languageOnly', // Convert zh-CN -> zh
    nsSeparator: false, // Allow literal colons in keys (e.g., URLs, labels)
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lng',
      caches: ['localStorage'],
    },
  })

// Sync document lang attribute on language change
i18n.on('languageChanged', (lng) => {
  syncDocumentLang(lng)
})

// Set initial document lang attribute
const currentLng = i18n.language || 'en'
syncDocumentLang(currentLng)

export default i18n
