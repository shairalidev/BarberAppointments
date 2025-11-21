import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Appointments from '../views/Appointments.vue'
import Admin from '../views/Admin.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/appointments', name: 'Appointments', component: Appointments },
  { path: '/admin', name: 'Admin', component: Admin }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router