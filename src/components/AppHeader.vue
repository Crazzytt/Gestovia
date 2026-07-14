<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import AuthModal from './AuthModal.vue'

const router = useRouter()
const isAuthenticated = ref(false)
const displayName = ref('')
const authOpen = ref(false)
const authMode = ref('login')
const menuOpen = ref(false)
const menuRoot = ref(null)

let authSubscription = null

const userLabel = computed(() => displayName.value || 'Mon compte')

const goHome = async () => {
  menuOpen.value = false
  if (router.currentRoute.value.path !== '/') {
    await router.push('/')
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openAuth = (mode = 'login') => {
  authMode.value = mode
  authOpen.value = true
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

const handleLogout = async () => {
  closeMenu()
  await supabase.auth.signOut()
  await router.push('/')
}

const syncUser = (user) => {
  isAuthenticated.value = !!user
  if (!user) {
    displayName.value = ''
    menuOpen.value = false
    return
  }

  const first = user.user_metadata?.first_name || ''
  const last = user.user_metadata?.last_name || ''
  const full = `${first} ${last}`.trim()
  displayName.value = full || user.email?.split('@')[0] || 'Utilisateur'
}

const onDocumentClick = (event) => {
  if (!menuOpen.value || !menuRoot.value) return
  if (!menuRoot.value.contains(event.target)) closeMenu()
}

const onKeydown = (event) => {
  if (event.key === 'Escape') closeMenu()
}

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  syncUser(user)

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    syncUser(session?.user ?? null)
  })
  authSubscription = data.subscription

  document.addEventListener('click', onDocumentClick)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  authSubscription?.unsubscribe()
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <header class="home-header">
    <div class="home-container home-nav">
      <div class="nav-left">
        <a href="/" class="brand brand-dark" @click.prevent="goHome">
          <div class="brand-mark">GS</div>
          <span class="brand-text">Gestovia</span>
        </a>

        <nav class="nav-links" aria-label="Navigation principale">
          <RouterLink to="/" class="nav-link" @click="goHome">Accueil</RouterLink>
          <RouterLink
            v-if="isAuthenticated"
            to="/dashboard"
            class="nav-link"
          >
            Tableau de bord
          </RouterLink>
        </nav>
      </div>

      <div class="nav-actions">
        <div
          v-if="isAuthenticated"
          ref="menuRoot"
          class="header-user-menu"
          :class="{ 'is-open': menuOpen }"
        >
          <button
            type="button"
            class="header-user-trigger"
            :aria-expanded="menuOpen"
            aria-haspopup="menu"
            @click.stop="toggleMenu"
          >
            <span class="header-user-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.8" />
                <path
                  d="M5 19.5c1.2-3.2 3.5-5 7-5s5.8 1.8 7 5"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="header-user-name">{{ userLabel }}</span>
            <svg class="header-user-caret" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M3 4.5L6 7.5L9 4.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <div
            v-if="menuOpen"
            class="header-user-dropdown"
            role="menu"
          >
            <button
              type="button"
              class="header-user-item is-danger"
              role="menuitem"
              @click="handleLogout"
            >
              Se déconnecter
            </button>
          </div>
        </div>

        <button
          v-else
          type="button"
          class="nav-link auth-trigger"
          @click="openAuth('login')"
        >
          Connexion
        </button>
      </div>
    </div>
  </header>

  <AuthModal
    v-model:mode="authMode"
    :open="authOpen"
    @close="authOpen = false"
  />
</template>
