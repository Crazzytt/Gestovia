<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const isSignup = ref(false)
const message = ref('')
const errorMessage = ref('')

const handleSubmit = async () => {
  loading.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    if (isSignup.value) {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          emailRedirectTo: 'http://localhost:5173/dashboard',
          data: {
            first_name: firstName.value,
            last_name: lastName.value,
          },
        },
      })

      if (error) throw error

      message.value = 'Compte créé avec succès. Vérifiez votre email pour confirmer votre accès.'
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })

      if (error) throw error

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
  <main class="login-page">
    <section class="login-shell">
      <div class="login-grid" :class="{ 'signup-mode': isSignup }">
        <aside class="login-side-panel">
          <div class="login-side-content">
            <span class="section-badge section-badge-dark">
              {{ isSignup ? 'Création de compte' : 'Espace sécurisé' }}
            </span>

            <h1 class="login-side-title">
              {{
                isSignup
                  ? 'Créez votre espace professionnel.'
                  : 'Connectez-vous à votre espace de gestion.'
              }}
            </h1>

            <p class="login-side-text">
              {{
                isSignup
                  ? 'Configurez votre compte pour gérer plusieurs entreprises, organiser vos clients et centraliser vos documents.'
                  : 'Accédez à vos entreprises, vos dossiers clients et vos contrats dans une interface structurée et sécurisée.'
              }}
            </p>

            <ul class="login-side-list">
              <li>Gestion multi-entreprises</li>
              <li>Dossiers clients détaillés</li>
              <li>Archivage des documents sensibles</li>
            </ul>
          </div>
        </aside>

        <section class="login-form-panel">
          <div class="login-form-card">
            <span class="form-kicker">
              {{ isSignup ? 'Inscription' : 'Connexion' }}
            </span>

            <h2 class="login-form-title">
              {{ isSignup ? 'Créer votre compte' : 'Connexion sécurisée' }}
            </h2>

            <p class="login-form-text">
              {{
                isSignup
                  ? 'Renseignez vos informations pour activer votre espace.'
                  : 'Saisissez vos identifiants pour accéder à votre tableau de bord.'
              }}
            </p>

            <form class="form-grid" @submit.prevent="handleSubmit">
              <div v-if="isSignup" class="name-grid">
                <div class="field-group">
                  <label for="firstName" class="field-label">Prénom</label>
                  <input
                    id="firstName"
                    v-model="firstName"
                    class="input"
                    type="text"
                    placeholder="Jean"
                    required
                  />
                </div>

                <div class="field-group">
                  <label for="lastName" class="field-label">Nom</label>
                  <input
                    id="lastName"
                    v-model="lastName"
                    class="input"
                    type="text"
                    placeholder="Dupont"
                    required
                  />
                </div>
              </div>

              <div class="field-group">
                <label for="email" class="field-label">Adresse email</label>
                <input
                  id="email"
                  v-model="email"
                  class="input"
                  type="email"
                  placeholder="vous@entreprise.com"
                  required
                />
              </div>

              <div class="field-group">
                <label for="password" class="field-label">Mot de passe</label>
                <input
                  id="password"
                  v-model="password"
                  class="input"
                  type="password"
                  placeholder="••••••••"
                  minlength="6"
                  required
                />
              </div>

              <button class="btn btn-block" type="submit" :disabled="loading">
                {{
                  loading
                    ? 'Veuillez patienter...'
                    : isSignup
                      ? 'Créer mon compte'
                      : 'Se connecter'
                }}
              </button>
            </form>

            <p v-if="message" class="message-success">
              {{ message }}
            </p>

            <p v-if="errorMessage" class="message-error">
              {{ errorMessage }}
            </p>

            <div class="auth-divider">
              <span>{{ isSignup ? 'Déjà inscrit ?' : 'Nouveau sur la plateforme ?' }}</span>
            </div>

            <button
              type="button"
              class="btn btn-secondary btn-block"
              @click="isSignup = !isSignup"
            >
              {{ isSignup ? 'Retour à la connexion' : 'Créer un compte' }}
            </button>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>