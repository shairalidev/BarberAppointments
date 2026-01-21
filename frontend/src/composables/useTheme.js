import { ref, watch, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'

const isDark = useStorage('theme-dark', true)

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  const setTheme = (dark) => {
    isDark.value = dark
  }

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark-theme')
      document.documentElement.setAttribute('data-bs-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark-theme')
      document.documentElement.setAttribute('data-bs-theme', 'light')
    }
  }

  watch(isDark, applyTheme, { immediate: true })

  onMounted(() => {
    applyTheme()
  })

  return {
    isDark,
    toggleTheme,
    setTheme
  }
}