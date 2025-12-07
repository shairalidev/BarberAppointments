import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Appointments from '../views/Appointments.vue'
import Admin from '../views/Admin.vue'
import { isAuthenticated } from '../utils/auth'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/appointments', name: 'Appointments', component: Appointments },
  { 
    path: '/admin', 
    name: 'Admin', 
    component: Admin,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ path: '/', replace: true })
  } else {
    next()
  }
})

export default router