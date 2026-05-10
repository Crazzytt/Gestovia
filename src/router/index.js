import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import CompanyView from '../views/CompanyView.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/company/:id', name: 'company', component: CompanyView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthenticated = !!user

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  if (to.path === '/login' && isAuthenticated) {
    next('/dashboard')
    return
  }

  next()
})

export default router