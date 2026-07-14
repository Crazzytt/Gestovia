<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()
const isAuthenticated = ref(false)

let authSubscription = null

const goHome = async () => {
  if (router.currentRoute.value.path !== '/') {
    await router.push('/')
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <a href="/" class="nav-link" @click.prevent="goHome">Accueil</a>
        <RouterLink v-if="isAuthenticated" to="/dashboard" class="nav-link">
          Tableau de bord
        </RouterLink>
        <template v-else>
          <RouterLink to="/login" class="nav-link">Connexion</RouterLink>
          <RouterLink to="/login" class="btn btn-small">Demander un accès</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>
