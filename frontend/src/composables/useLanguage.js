import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const currentLocale = ref(localStorage.getItem('locale') || 'de')

export function useLanguage() {
  const { locale } = useI18n()

  const setLanguage = (lang) => {
    currentLocale.value = lang
    locale.value = lang
    localStorage.setItem('locale', lang)
  }

  const toggleLanguage = () => {
    const newLang = currentLocale.value === 'de' ? 'en' : 'de'
    setLanguage(newLang)
  }

  // Sync with i18n locale
  watch(currentLocale, (newLocale) => {
    locale.value = newLocale
  }, { immediate: true })

  return {
    currentLocale,
    setLanguage,
    toggleLanguage
  }
}