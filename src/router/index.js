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
  {
    path: '/company/:id',
    redirect: (to) => `/companies/${to.params.id}`,
  },
  {
    path: '/companies/:id',
    name: 'company',
    component: CompanyView,
    meta: { requiresAuth: true, layout: 'marketing' },
  },
  {
    path: '/companies/:companyId/clients/:clientId',
    name: 'client-detail',
    component: () => import('../views/ClientDetailView.vue'),
    meta: { requiresAuth: true, layout: 'marketing' },
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

const DEV_BYPASS_AUTH = false

router.beforeEach(async (to) => {
  if (DEV_BYPASS_AUTH) {
    return true
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthenticated = !!session

  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login'
  }

  if (to.path === '/login' && isAuthenticated) {
    return '/dashboard'
  }

  return true
})

export default router