import { createI18n } from 'vue-i18n'
import en from './locales/en.js'
import de from './locales/de.js'

const messages = {
  en,
  de
}

const i18n = createI18n({
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages,
  legacy: false,
  globalInjection: true
})

export default i18n