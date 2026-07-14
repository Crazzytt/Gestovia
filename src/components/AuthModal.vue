<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'login' },
  /** `modal` = overlay ; `page` = carte sur /login */
  variant: {
    type: String,
    default: 'modal',
    validator: (value) => ['modal', 'page'].includes(value),
  },
})

const emit = defineEmits(['close', 'update:mode'])

const router = useRouter()
const isPage = computed(() => props.variant === 'page')
const isVisible = computed(() => isPage.value || props.open)
const fieldId = (name) => `auth-${props.variant}-${name}`

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const message = ref('')
const errorMessage = ref('')

const isSignup = computed({
  get: () => props.mode === 'signup',
  set: (value) => emit('update:mode', value ? 'signup' : 'login'),
})

const title = computed(() => (isSignup.value ? 'S’inscrire' : 'Se connecter'))
const description = computed(() =>
  isSignup.value
    ? 'Créez votre compte pour gérer plusieurs entreprises, vos clients et vos documents.'
    : 'Accédez à votre espace pour gérer vos entreprises, vos clients et vos documents.',
)

const resetFeedback = () => {
  message.value = ''
  errorMessage.value = ''
}

const resetForm = () => {
  firstName.value = ''
  lastName.value = ''
  email.value = ''
  password.value = ''
  loading.value = false
  resetFeedback()
}

const close = () => {
  resetForm()
  emit('close')
}

const onOverlayClick = () => {
  if (!isPage.value) close()
}

const onKeydown = (event) => {
  if (!isPage.value && event.key === 'Escape' && props.open) close()
}

watch(
  () => props.open,
  (isOpen) => {
    if (isPage.value) return
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (isOpen) resetFeedback()
  },
)

watch(
  () => props.mode,
  () => {
    resetFeedback()
  },
)

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (!isPage.value) document.body.style.overflow = ''
})

const handleSubmit = async () => {
  loading.value = true
  resetFeedback()

  try {
    if (isSignup.value) {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: firstName.value,
            last_name: lastName.value,
          },
        },
      })

      if (error) throw error

      message.value =
        'Compte créé avec succès. Vérifiez votre email pour confirmer votre accès.'
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })

      if (error) throw error

      if (isPage.value) resetForm()
      else close()

      router.push('/dashboard')
    }
  } catch (error) {
    errorMessage.value = error.message || 'Une erreur est survenue.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body" :disabled="isPage">
    <div
      v-if="isVisible"
      :class="isPage ? 'auth-page-root' : 'auth-modal-overlay'"
      @click.self="onOverlayClick"
    >
      <div
        class="auth-modal"
        :class="{ 'login-standalone-card': isPage }"
        :role="isPage ? 'region' : 'dialog'"
        :aria-modal="isPage ? undefined : true"
        :aria-label="title"
      >
        <div class="auth-modal-top">
          <RouterLink v-if="isPage" to="/" class="brand brand-dark">
            <div class="brand-mark">GS</div>
            <span class="brand-text">Gestovia</span>
          </RouterLink>
          <div v-else class="brand brand-dark">
            <div class="brand-mark">GS</div>
            <span class="brand-text">Gestovia</span>
          </div>

          <button
            v-if="!isPage"
            type="button"
            class="auth-modal-close"
            aria-label="Fermer"
            @click="close"
          >
            ×
          </button>
        </div>

        <div class="auth-modal-body">
          <component :is="isPage ? 'h1' : 'h2'" class="auth-modal-title">
            {{ title }}
          </component>
          <p class="auth-modal-text">{{ description }}</p>

          <form class="auth-modal-form" @submit.prevent="handleSubmit">
            <div v-if="isSignup" class="name-grid">
              <div class="field-group">
                <label :for="fieldId('first-name')" class="auth-label">Prénom</label>
                <input
                  :id="fieldId('first-name')"
                  v-model="firstName"
                  class="input auth-input"
                  type="text"
                  placeholder="Jean"
                  autocomplete="given-name"
                  required
                />
              </div>

              <div class="field-group">
                <label :for="fieldId('last-name')" class="auth-label">Nom</label>
                <input
                  :id="fieldId('last-name')"
                  v-model="lastName"
                  class="input auth-input"
                  type="text"
                  placeholder="Dupont"
                  autocomplete="family-name"
                  required
                />
              </div>
            </div>

            <div class="field-group">
              <label :for="fieldId('email')" class="auth-label">Adresse e-mail</label>
              <input
                :id="fieldId('email')"
                v-model="email"
                class="input auth-input"
                type="email"
                placeholder="vous@entreprise.com"
                autocomplete="email"
                required
              />
            </div>

            <div class="field-group">
              <label :for="fieldId('password')" class="auth-label">Mot de passe</label>
              <input
                :id="fieldId('password')"
                v-model="password"
                class="input auth-input"
                type="password"
                placeholder="••••••••"
                minlength="6"
                :autocomplete="isSignup ? 'new-password' : 'current-password'"
                required
              />
              <button
                v-if="!isSignup"
                type="button"
                class="auth-forgot"
                disabled
                title="Bientôt disponible"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <button class="btn btn-block auth-submit" type="submit" :disabled="loading">
              {{
                loading
                  ? 'Veuillez patienter...'
                  : isSignup
                    ? 'Créer mon compte →'
                    : 'Se connecter →'
              }}
            </button>
          </form>

          <p v-if="message" class="message-success">{{ message }}</p>
          <p v-if="errorMessage" class="message-error">{{ errorMessage }}</p>

          <div class="auth-or">
            <span>ou</span>
          </div>

          <p class="auth-switch">
            <template v-if="isSignup">
              Vous avez déjà un compte ?
              <button type="button" class="auth-switch-link" @click="isSignup = false">
                Se connecter
              </button>
            </template>
            <template v-else>
              Vous n’avez pas encore de compte ?
              <button type="button" class="auth-switch-link" @click="isSignup = true">
                S’inscrire
              </button>
            </template>
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
