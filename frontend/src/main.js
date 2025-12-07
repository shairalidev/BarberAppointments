import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupAxiosInterceptors } from './utils/auth'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './assets/toast-custom.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

setupAxiosInterceptors()

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

createApp(App).use(router).use(Toast, toastOptions).mount('#app')