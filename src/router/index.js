import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import CompanyView from '../views/CompanyView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { layout: 'marketing' } },
  { path: '/login', name: 'login', component: LoginView, meta: { layout: 'marketing' } },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, layout: 'marketing' },
  },

  // Ancienne route conservée pour compatibilité
  {
    path: '/company/:id',
    redirect: (to) => `/companies/${to.params.id}`,
  },

  // Route entreprise principale
  {
    path: '/companies/:id',
    name: 'company',
    component: CompanyView,
    meta: { requiresAuth: true },
  },

  // Route détail client
  {
    path: '/companies/:companyId/clients/:clientId',
    name: 'client-detail',
    component: () => import('../views/ClientDetailView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

const DEV_BYPASS_AUTH = true

router.beforeEach(async (to, from, next) => {
  if (DEV_BYPASS_AUTH) {
    next()
    return
  }

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
