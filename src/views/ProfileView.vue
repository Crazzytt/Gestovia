<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import Header from '../components/AppHeader.vue'
import Footer from '../components/AppFooter.vue'

const router = useRouter()

const loading = ref(true)
const savingProfile = ref(false)
const savingPassword = ref(false)
const deletingAccount = ref(false)

const user = ref(null)
const firstName = ref('')
const lastName = ref('')
const email = ref('')

const newPassword = ref('')
const confirmPassword = ref('')
const deleteConfirmation = ref('')

const successMessage = ref('')
const errorMessage = ref('')

const canDeleteAccount = computed(() => deleteConfirmation.value === 'SUPPRIMER')

async function loadProfile() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const {
      data: { user: currentUser },
      error,
    } = await supabase.auth.getUser()

    if (error) throw error
    if (!currentUser) {
      router.replace('/login')
      return
    }

    user.value = currentUser
    email.value = currentUser.email || ''
    firstName.value = currentUser.user_metadata?.first_name || ''
    lastName.value = currentUser.user_metadata?.last_name || ''
  } catch (error) {
    errorMessage.value = error.message || 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
}

async function updateProfile() {
  successMessage.value = ''
  errorMessage.value = ''

  savingProfile.value = true

  try {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName.value.trim(),
        last_name: lastName.value.trim(),
      },
    })

    if (error) throw error

    user.value = data.user
    successMessage.value = 'Informations mises à jour avec succès.'
  } catch (error) {
    errorMessage.value = error.message || 'Erreur lors de la mise à jour du profil.'
  } finally {
    savingProfile.value = false
  }
}

async function updatePassword() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!newPassword.value || !confirmPassword.value) {
    errorMessage.value = 'Veuillez remplir les deux champs du mot de passe.'
    return
  }

  if (newPassword.value.length < 6) {
    errorMessage.value = 'Le mot de passe doit contenir au moins 6 caractères.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  savingPassword.value = true

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    if (error) throw error

    newPassword.value = ''
    confirmPassword.value = ''
    successMessage.value = 'Mot de passe mis à jour avec succès.'
  } catch (error) {
    errorMessage.value = error.message || 'Erreur lors du changement de mot de passe.'
  } finally {
    savingPassword.value = false
  }
}

async function deleteAccount() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!canDeleteAccount.value) {
    errorMessage.value = 'Tapez SUPPRIMER pour confirmer.'
    return
  }

  deletingAccount.value = true

  try {
    errorMessage.value =
      'La suppression du compte doit être reliée à une fonction serveur sécurisée.'
  } catch (error) {
    errorMessage.value = error.message || 'Erreur lors de la suppression du compte.'
  } finally {
    deletingAccount.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="profile-layout">
    <Header />

    <main class="profile-page">
      <section class="profile-shell">
        <div class="profile-topbar">
          <RouterLink to="/" class="profile-back-link">
            ← Retour à l’accueil
          </RouterLink>
        </div>

        <header class="profile-header">
          <p class="profile-kicker">Compte</p>
          <h1>Profil utilisateur</h1>
          <p class="profile-subtitle">
            Gérez vos informations personnelles, votre sécurité et les options de votre compte.
          </p>
        </header>

        <div v-if="successMessage" class="message-success">{{ successMessage }}</div>
        <div v-if="errorMessage" class="message-error">{{ errorMessage }}</div>

        <div v-if="loading" class="profile-panel">
          <p>Chargement du profil...</p>
        </div>

        <template v-else>
          <section class="profile-panel">
            <div class="profile-panel-head">
              <h2>Informations personnelles</h2>
              <p>Modifiez les informations affichées sur votre compte.</p>
            </div>

            <div class="profile-form-grid">
              <label class="profile-field">
                <span>Prénom</span>
                <input v-model="firstName" type="text" placeholder="Votre prénom" />
              </label>

              <label class="profile-field">
                <span>Nom</span>
                <input v-model="lastName" type="text" placeholder="Votre nom" />
              </label>

              <label class="profile-field profile-field-full">
                <span>Adresse email</span>
                <input :value="email" type="email" disabled />
              </label>
            </div>

            <div class="profile-actions">
              <button class="primary-btn" type="button" :disabled="savingProfile" @click="updateProfile">
                {{ savingProfile ? 'Enregistrement...' : 'Enregistrer les modifications' }}
              </button>
            </div>
          </section>

          <section class="profile-panel">
            <div class="profile-panel-head">
              <h2>Sécurité</h2>
              <p>Changez votre mot de passe pour sécuriser votre accès.</p>
            </div>

            <div class="profile-form-grid">
              <label class="profile-field">
                <span>Nouveau mot de passe</span>
                <input v-model="newPassword" type="password" placeholder="Nouveau mot de passe" />
              </label>

              <label class="profile-field">
                <span>Confirmer le mot de passe</span>
                <input v-model="confirmPassword" type="password" placeholder="Confirmez le mot de passe" />
              </label>
            </div>

            <div class="profile-actions">
              <button class="primary-btn" type="button" :disabled="savingPassword" @click="updatePassword">
                {{ savingPassword ? 'Mise à jour...' : 'Modifier le mot de passe' }}
              </button>
            </div>
          </section>

          <section class="profile-panel danger-zone">
            <div class="profile-panel-head">
              <h2>Suppression du compte</h2>
              <p>Cette action est sensible. Tapez <strong>SUPPRIMER</strong> pour confirmer.</p>
            </div>

            <div class="profile-form-grid">
              <label class="profile-field profile-field-full">
                <span>Confirmation</span>
                <input
                  v-model="deleteConfirmation"
                  type="text"
                  placeholder="Tapez SUPPRIMER"
                />
              </label>
            </div>

            <div class="profile-actions">
              <button
                class="danger-btn"
                type="button"
                :disabled="deletingAccount || !canDeleteAccount"
                @click="deleteAccount"
              >
                {{ deletingAccount ? 'Suppression...' : 'Supprimer mon compte' }}
              </button>
            </div>
          </section>
        </template>
      </section>
    </main>

    <Footer />
  </div>
</template>