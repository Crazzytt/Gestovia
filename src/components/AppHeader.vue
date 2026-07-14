<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import AuthModal from './AuthModal.vue'

const router = useRouter()
const isAuthenticated = ref(false)
const authOpen = ref(false)
const authMode = ref('login')

let authSubscription = null

const goHome = async () => {
  if (router.currentRoute.value.path !== '/') {
    await router.push('/')
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openAuth = (mode = 'login') => {
  authMode.value = mode
  authOpen.value = true
}

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  isAuthenticated.value = !!user

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    isAuthenticated.value = !!session?.user
  })
  authSubscription = data.subscription
})

onUnmounted(() => {
  authSubscription?.unsubscribe()
})
</script>

<template>
  <header class="home-header">
    <div class="home-container home-nav">
      <a href="/" class="brand brand-dark" @click.prevent="goHome">
        <div class="brand-mark">GS</div>
        <span class="brand-text">Gestovia</span>
      </a>

      <nav class="nav-actions">
        <RouterLink v-if="isAuthenticated" to="/dashboard" class="nav-link">
          Tableau de bord
        </RouterLink>
        <button
          v-else
          type="button"
          class="nav-link auth-trigger"
          @click="openAuth('login')"
        >
          Connexion
        </button>
      </nav>
    </div>
  </header>

  <AuthModal
    v-model:mode="authMode"
    :open="authOpen"
    @close="authOpen = false"
  />
</template>
