<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()

const user = ref(null)
const firstName = ref('')
const lastName = ref('')
const companies = ref([])
const companyName = ref('')
const loading = ref(true)
const creating = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const loadUserAndCompanies = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const {
      data: { user: currentUser },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) throw userError
    if (!currentUser) {
  user.value = { id: 'demo-user' }
  firstName.value = 'Demo'
  lastName.value = 'User'
  companies.value = []
  loading.value = false
  return
}

    user.value = currentUser
    firstName.value = currentUser.user_metadata?.first_name || ''
    lastName.value = currentUser.user_metadata?.last_name || ''

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    companies.value = data || []
  } catch (error) {
    errorMessage.value = error.message || 'Impossible de charger les données.'
  } finally {
    loading.value = false
  }
}

const createCompany = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  if (!companyName.value.trim()) {
    errorMessage.value = 'Veuillez saisir le nom de l’entreprise.'
    return
  }

  if (!user.value) {
    errorMessage.value = 'Utilisateur non connecté.'
    return
  }

  creating.value = true

  try {
    const { data, error } = await supabase
      .from('companies')
      .insert([
        {
          user_id: user.value.id,
          name: companyName.value.trim(),
        },
      ])
      .select()

    if (error) throw error

    if (data && data.length > 0) {
      companies.value = [data[0], ...companies.value]
    }

    successMessage.value = 'Entreprise créée avec succès.'
    companyName.value = ''
  } catch (error) {
    errorMessage.value = error.message || 'Erreur lors de la création de l’entreprise.'
  } finally {
    creating.value = false
  }
}

const openCompany = (companyId) => {
  router.push(`/company/${companyId}`)
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

onMounted(() => {
  loadUserAndCompanies()
})
</script>

<template>
  <main class="dashboard-page">
    <section class="dashboard-shell">
      <header class="dashboard-topbar">
        <div>
          <p class="dashboard-eyebrow">Gestovia</p>
          <h1 class="dashboard-title">
            Bienvenue{{ firstName ? `, ${firstName}` : '' }}
          </h1>
          <p class="dashboard-subtitle">
            Gérez vos entreprises et accédez à vos dossiers depuis votre espace sécurisé.
          </p>
        </div>

        <button class="btn btn-secondary" type="button" @click="handleLogout">
          Se déconnecter
        </button>
      </header>

      <section class="dashboard-hero-card">
        <div class="dashboard-hero-copy">
          <span class="section-badge">Espace entreprise</span>
          <h2 class="dashboard-section-title">Créez et gérez vos structures</h2>
          <p class="dashboard-section-text">
            Ajoutez une entreprise pour commencer à enregistrer vos clients,
            leurs transactions et leurs documents associés.
          </p>
        </div>

        <form class="dashboard-create-form" @submit.prevent="createCompany">
          <div class="field-group">
            <label for="companyName" class="field-label">Nom de l’entreprise</label>
            <input
              id="companyName"
              v-model="companyName"
              class="input"
              type="text"
              placeholder="Ex. Gestovia Transport"
              required
            />
          </div>

          <button class="btn" type="submit" :disabled="creating">
            {{ creating ? 'Création...' : 'Créer une entreprise' }}
          </button>
        </form>

        <p v-if="successMessage" class="message-success">
          {{ successMessage }}
        </p>

        <p v-if="errorMessage" class="message-error">
          {{ errorMessage }}
        </p>
      </section>

      <section class="dashboard-list-section">
        <div class="dashboard-list-header">
          <div>
            <span class="section-badge">Vos entreprises</span>
            <h2 class="dashboard-section-title">Liste de vos espaces</h2>
          </div>

          <div class="dashboard-counter">
            {{ companies.length }} entreprise{{ companies.length > 1 ? 's' : '' }}
          </div>
        </div>

        <div v-if="loading" class="dashboard-empty-state">
          <p>Chargement de vos entreprises...</p>
        </div>

        <div v-else-if="companies.length === 0" class="dashboard-empty-state">
          <h3>Aucune entreprise pour le moment</h3>
          <p>
            Commencez par créer votre première entreprise pour structurer votre activité sur Gestovia.
          </p>
        </div>

        <div v-else class="company-grid">
          <article
            v-for="company in companies"
            :key="company.id"
            class="company-card"
          >
            <div class="company-card-head">
              <span class="company-badge">Entreprise</span>
            </div>

            <h3 class="company-name">{{ company.name }}</h3>

            <p class="company-meta">
              Créée le
              {{ new Date(company.created_at).toLocaleDateString('fr-CA') }}
            </p>

            <button
              class="btn btn-secondary"
              type="button"
              @click="openCompany(company.id)"
            >
              Ouvrir l’espace
            </button>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>