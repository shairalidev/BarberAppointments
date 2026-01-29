import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { setupAxiosInterceptors } from './utils/auth'
import emojiSafeI18n from './utils/emojiSafeI18n'
import safeTextDirective from './utils/safeTextDirective'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './assets/toast-custom.css'
import './assets/theme.css'
import './assets/modal-responsive.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import * as bootstrap from 'bootstrap'

window.bootstrap = bootstrap

setupAxiosInterceptors()

const app = createApp(App)
app.config.globalProperties.$bootstrap = bootstrap

// Register emoji safety directive
app.directive('safe-text', safeTextDirective)

const toastOptions = {
  position: 'top-right',
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__slideBlurred',
  maxToasts: 3,
  newestOnTop: true
}

app.use(router)
   .use(i18n)
   .use(emojiSafeI18n, { replace: true, debug: process.env.NODE_ENV === 'development' })
   .use(Toast, toastOptions)
   .mount('#app')