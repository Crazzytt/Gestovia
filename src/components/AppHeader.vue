<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()
const menuOpen = ref(false)
const user = ref(null)
const session = ref(null)
const menuRef = ref(null)
let authListener = null

const isLoggedIn = computed(() => !!session.value)

const fullName = computed(() => {
  const meta = user.value?.user_metadata || {}
  const firstName = meta.first_name || meta.firstname || ''
  const lastName = meta.last_name || meta.lastname || ''
  const combined = `${firstName} ${lastName}`.trim()

  if (combined) return combined
  if (meta.full_name) return meta.full_name
  return user.value?.email || 'Utilisateur'
})

async function loadAuth() {
  const {
    data: { session: currentSession },
  } = await supabase.auth.getSession()

  session.value = currentSession
  user.value = currentSession?.user ?? null
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function handleClickOutside(event) {
  if (!menuRef.value) return
  if (!menuRef.value.contains(event.target)) {
    closeMenu()
  }
}

async function handleLogout() {
  closeMenu()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Erreur de déconnexion :', error.message)
    return
  }

  session.value = null
  user.value = null
  router.replace('/')
}

onMounted(async () => {
  await loadAuth()

  const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
    session.value = newSession
    user.value = newSession?.user ?? null

    if (!newSession) {
      closeMenu()
    }
  })

  authListener = data

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  authListener?.subscription?.unsubscribe?.()
  authListener?.unsubscribe?.()
})
</script>

<template>
  <header class="home-header">
    <div class="home-container">
      <nav class="home-nav">
        <div class="nav-left">
          <RouterLink to="/" class="brand brand-dark">
            <span class="brand-mark">GS</span>
            <span class="brand-text">Gestovia</span>
          </RouterLink>
        </div>

        <div class="nav-actions">
          <RouterLink v-if="!isLoggedIn" to="/login" class="auth-trigger">
            Connexion
          </RouterLink>

          <div
            v-else
            ref="menuRef"
            class="header-user-menu"
            :class="{ 'is-open': menuOpen }"
          >
            <button
              type="button"
              class="header-user-trigger"
              @click.stop="toggleMenu"
              aria-haspopup="menu"
              :aria-expanded="menuOpen ? 'true' : 'false'"
            >
              <span class="header-user-avatar">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                    fill="currentColor"
                  />
                </svg>
              </span>

              <span class="header-user-name">{{ fullName }}</span>

              <svg class="header-user-caret" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0l-4.25-4.51a.75.75 0 0 1 .02-1.06Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <div v-if="menuOpen" class="header-user-dropdown" role="menu">
              <button type="button" class="header-user-item is-danger" @click="handleLogout">
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>