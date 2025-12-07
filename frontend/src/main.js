import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupAxiosInterceptors } from './utils/auth'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

setupAxiosInterceptors()

createApp(App).use(router).mount('#app')