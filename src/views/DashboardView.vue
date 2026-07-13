<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import '../styles/DashboardView.css'

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

const companyCountLabel = computed(
  () => `${companies.value.length} entreprise${companies.value.length > 1 ? 's' : ''}`
)

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-CA')
}

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
      .eq('owner_id', currentUser.id)
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
          owner_id: user.value.id,
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
  <main class="dashboard-pro-page">
    <section class="dashboard-pro-shell">
      <header class="dashboard-pro-topbar reveal">
        <div class="dashboard-pro-heading">
          <p class="dashboard-pro-kicker">Gestovia</p>
          <h1 class="dashboard-pro-title">
            Bonjour{{ firstName ? `, ${firstName}` : '' }}
          </h1>
          <p class="dashboard-pro-subtitle">
            Gérez vos entreprises, accédez aux dossiers clients et suivez votre activité depuis une interface centralisée.
          </p>
        </div>

        <div class="dashboard-pro-topbar-actions">
          <div class="dashboard-pro-pill">
            {{ companyCountLabel }}
          </div>
          <button class="dashboard-ghost-btn" type="button" @click="handleLogout">
            Se déconnecter
          </button>
        </div>
      </header>

      <section class="dashboard-pro-grid">
        <aside class="dashboard-create-panel reveal-delay-1">
          <div class="panel-head">
            <p class="panel-kicker">Nouvelle entreprise</p>
            <h2>Créer un espace</h2>
            <p>
              Ajoutez une structure pour commencer à enregistrer vos clients, leurs transactions et leurs documents.
            </p>
          </div>

          <form class="dashboard-create-stack" @submit.prevent="createCompany">
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

            <button class="dashboard-primary-btn" type="submit" :disabled="creating">
              {{ creating ? 'Création...' : 'Créer l’entreprise' }}
            </button>
          </form>

          <p v-if="successMessage" class="message-success">
            {{ successMessage }}
          </p>

          <p v-if="errorMessage" class="message-error">
            {{ errorMessage }}
          </p>
        </aside>

        <section class="dashboard-list-panel reveal-delay-2">
          <div class="list-panel-head">
            <div>
              <p class="panel-kicker">Entreprises</p>
              <h2>Vos espaces de travail</h2>
            </div>
            <div class="list-panel-meta">
              {{ companyCountLabel }}
            </div>
          </div>

          <div v-if="loading" class="dashboard-pro-empty">
            <p>Chargement de vos entreprises...</p>
          </div>

          <div v-else-if="companies.length === 0" class="dashboard-pro-empty">
            <h3>Aucune entreprise</h3>
            <p>Créez votre première entreprise pour démarrer votre espace de gestion.</p>
          </div>

          <div v-else class="dashboard-table-shell">
            <table class="dashboard-company-table">
              <thead>
                <tr>
                  <th>Entreprise</th>
                  <th>Date de création</th>
                  <th>Statut</th>
                  <th class="align-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="company in companies" :key="company.id">
                  <td>
                    <div class="company-cell">
                      <span class="company-cell-dot"></span>
                      <div>
                        <strong>{{ company.name }}</strong>
                        <span>ID : {{ company.id }}</span>
                      </div>
                    </div>
                  </td>
                  <td>{{ formatDate(company.created_at) }}</td>
                  <td>
                    <span class="status-badge">Active</span>
                  </td>
                  <td class="align-right">
                    <button
                      class="dashboard-row-btn"
                      type="button"
                      @click="openCompany(company.id)"
                    >
                      Ouvrir
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </section>
  </main>
</template>