<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import '../styles/DashboardView.css'

const router = useRouter()

const user = ref(null)
const firstName = ref('')
const companies = ref([])
const companyName = ref('')
const loading = ref(true)
const creating = ref(false)
const pageReady = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const companyCountLabel = computed(
  () => `${companies.value.length} entreprise${companies.value.length > 1 ? 's' : ''}`,
)

const welcomeTitle = computed(() =>
  firstName.value ? `Bonjour, ${firstName.value}` : 'Tableau de bord',
)

const latestCompany = computed(() => companies.value[0] || null)

const dashboardStats = computed(() => [
  {
    label: 'Entreprises',
    value: companies.value.length,
    hint: companies.value.length > 0 ? 'structures enregistrées' : 'aucune structure',
  },
  {
    label: 'Dernière création',
    value: latestCompany.value ? latestCompany.value.name : '-',
    hint: latestCompany.value ? formatDate(latestCompany.value.created_at) : 'aucune date',
  },
  {
    label: 'Compte',
    value: user.value && user.value.id !== 'demo-user' ? 'Actif' : 'Démo',
    hint: user.value && user.value.id !== 'demo-user' ? 'session authentifiée' : 'mode démonstration',
  },
])

const recentCompanies = computed(() => companies.value.slice(0, 3))

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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
      companies.value = []
      loading.value = false
      return
    }

    user.value = currentUser
    firstName.value = currentUser.user_metadata?.first_name || ''

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
      companies.value = [{ ...data[0], _justCreated: true }, ...companies.value]
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
  router.push(`/companies/${companyId}`)
}

onMounted(async () => {
  await loadUserAndCompanies()
  await nextTick()
  requestAnimationFrame(() => {
    pageReady.value = true
  })
})
</script>

<template>
  <main class="dashboard-pro-page" :class="{ 'is-ready': pageReady }">
    <div class="dashboard-orbit" aria-hidden="true"></div>
    <div class="dashboard-orbit dashboard-orbit--b" aria-hidden="true"></div>

    <section class="dashboard-pro-shell">
      <header class="dashboard-page-intro dash-reveal dash-reveal--1">
        <div>
          <p class="dashboard-page-kicker">Espace de gestion</p>
          <h1 class="dashboard-page-title">{{ welcomeTitle }}</h1>
          <p class="dashboard-page-subtitle">
            Centralisez vos entreprises et accédez rapidement à leurs dossiers clients.
          </p>
        </div>
      </header>

      <section class="dashboard-summary-grid dash-reveal dash-reveal--2">
        <article
          v-for="stat in dashboardStats"
          :key="stat.label"
          class="dashboard-stat-card"
        >
          <span class="dashboard-stat-label">{{ stat.label }}</span>
          <strong class="dashboard-stat-value">{{ stat.value }}</strong>
          <span class="dashboard-stat-hint">{{ stat.hint }}</span>
        </article>
      </section>

      <section class="dashboard-overview-grid dash-reveal dash-reveal--3">
        <article class="dashboard-highlight-card">
          <span class="dashboard-card-kicker">Vue d’ensemble</span>
          <h2>Votre activité est prête à être structurée</h2>
          <p>
            Utilisez cet espace pour piloter vos sociétés, retrouver rapidement les créations récentes
            et lancer la gestion de chaque dossier depuis une interface claire.
          </p>

          <div class="dashboard-highlight-meta">
            <div>
              <span>Total enregistré</span>
              <strong>{{ companyCountLabel }}</strong>
            </div>
            <div>
              <span>Dernière mise à jour</span>
              <strong>{{ latestCompany ? formatDate(latestCompany.created_at) : '-' }}</strong>
            </div>
          </div>
        </article>

        <article class="dashboard-side-card">
          <span class="dashboard-card-kicker">Activité récente</span>
          <h2>Derniers ajouts</h2>

          <ul v-if="recentCompanies.length" class="dashboard-mini-list" role="list">
            <li v-for="company in recentCompanies" :key="company.id">
              <strong>{{ company.name }}</strong>
              <span>Ajoutée le {{ formatDate(company.created_at) }}</span>
            </li>
          </ul>

          <p v-else class="dashboard-side-empty">
            Aucune activité récente pour le moment.
          </p>
        </article>
      </section>

      <section class="dashboard-main-panel dash-reveal dash-reveal--4">
        <div class="dashboard-toolbar">
          <div class="dashboard-toolbar-title">
            <h2>Entreprises</h2>
            <span class="list-panel-meta" :key="companyCountLabel">{{ companyCountLabel }}</span>
          </div>

          <form class="dashboard-create-bar" @submit.prevent="createCompany">
            <label class="visually-hidden" for="companyName">Nom de l’entreprise</label>
            <input
              id="companyName"
              v-model="companyName"
              class="input dashboard-input"
              type="text"
              placeholder="Nom de la nouvelle entreprise"
              required
            />
            <button class="dashboard-primary-btn" type="submit" :disabled="creating">
              <span>{{ creating ? 'Création...' : 'Ajouter' }}</span>
            </button>
          </form>
        </div>

        <Transition name="dash-message" mode="out-in">
          <p v-if="successMessage" key="ok" class="message-success toolbar-message">
            {{ successMessage }}
          </p>
          <p v-else-if="errorMessage" key="err" class="message-error toolbar-message">
            {{ errorMessage }}
          </p>
        </Transition>

        <Transition name="dash-fade" mode="out-in">
          <div v-if="loading" key="loading" class="dashboard-pro-empty">
            <div class="dashboard-loading-dots" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
            <p>Chargement de vos entreprises...</p>
          </div>

          <div v-else-if="companies.length === 0" key="empty" class="dashboard-pro-empty">
            <div class="dashboard-empty-icon" aria-hidden="true"></div>
            <h3>Aucune entreprise pour le moment</h3>
            <p>Ajoutez votre première structure ci-dessus pour démarrer.</p>
          </div>

          <div v-else key="list">
            <TransitionGroup
              name="dash-row"
              tag="ul"
              class="dashboard-company-list"
              role="list"
            >
              <li
                v-for="(company, index) in companies"
                :key="company.id"
                class="dashboard-company-item"
                :class="{ 'is-new': company._justCreated }"
                :style="{ '--row-delay': `${index * 55}ms` }"
              >
                <div class="company-cell">
                  <span class="company-cell-mark">
                    {{ company.name.charAt(0).toUpperCase() }}
                  </span>

                  <div>
                    <strong>{{ company.name }}</strong>
                    <span>Créée le {{ formatDate(company.created_at) }}</span>
                  </div>
                </div>

                <span class="status-badge">Active</span>

                <button
                  class="dashboard-row-btn"
                  type="button"
                  @click="openCompany(company.id)"
                >
                  Ouvrir
                </button>
              </li>
            </TransitionGroup>
          </div>
        </Transition>
      </section>
    </section>
  </main>
</template>