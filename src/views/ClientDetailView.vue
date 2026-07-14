<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import '../styles/ClientDetailView.css'

const route = useRoute()
const router = useRouter()

const companyId = route.params.companyId
const clientId = route.params.clientId

const loading = ref(true)
const pageReady = ref(false)
const company = ref(null)
const client = ref(null)
const errorMessage = ref('')
const pieceIdentiteUrl = ref('')
const contratSigneUrl = ref('')

const pageTitle = computed(() =>
  client.value
    ? `${client.value.prenom} ${client.value.nom} - Détail client`
    : 'Détail client',
)

const clientInitials = computed(() => {
  if (!client.value) return '?'
  const first = (client.value.prenom || '').charAt(0)
  const last = (client.value.nom || '').charAt(0)
  return `${first}${last}`.toUpperCase() || '?'
})

const infoCards = computed(() => {
  if (!client.value) return []
  return [
    { label: 'Nom', value: client.value.nom || '-' },
    { label: 'Prénom', value: client.value.prenom || '-' },
    { label: 'Date de transaction', value: formatDate(client.value.date_transaction) },
    { label: 'Montant', value: `${formatMoney(client.value.montant)} $` },
    { label: 'Marchandise', value: client.value.marchandise || '-' },
    { label: 'Poids', value: `${formatMoney(client.value.poids)} kg` },
  ]
})

const documents = computed(() => {
  const items = []
  if (pieceIdentiteUrl.value) {
    items.push({
      key: 'id',
      mark: 'ID',
      title: 'Pièce d’identité',
      hint: 'Document sécurisé · Ouvrir',
      href: pieceIdentiteUrl.value,
    })
  }
  if (contratSigneUrl.value) {
    items.push({
      key: 'ct',
      mark: 'CT',
      title: 'Contrat signé',
      hint: 'Document sécurisé · Ouvrir',
      href: contratSigneUrl.value,
    })
  }
  return items
})

const goToCompany = () => {
  router.push(`/companies/${companyId}`)
}

const editClient = () => {
  router.push(`/companies/${companyId}?edit=${clientId}`)
}

const formatMoney = (value) =>
  new Intl.NumberFormat('fr-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const fetchCompany = async () => {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', companyId)
    .single()

  if (error) throw error
  company.value = data
}

const fetchClient = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('company_id', companyId)
    .single()

  if (error) throw error
  client.value = data
}

const buildSignedUrl = async (filePath) => {
  if (!filePath) return ''

  const { data, error } = await supabase.storage
    .from('client-documents')
    .createSignedUrl(filePath, 3600)

  if (error) {
    throw error
  }

  return data?.signedUrl || ''
}

const loadSignedUrls = async () => {
  pieceIdentiteUrl.value = client.value?.piece_identite_path
    ? await buildSignedUrl(client.value.piece_identite_path)
    : ''

  contratSigneUrl.value = client.value?.contrat_signe_path
    ? await buildSignedUrl(client.value.contrat_signe_path)
    : ''
}

onMounted(async () => {
  try {
    loading.value = true
    await Promise.all([fetchCompany(), fetchClient()])
    await loadSignedUrls()
    document.title = pageTitle.value
  } catch (error) {
    errorMessage.value = error.message || 'Impossible de charger le dossier client.'
  } finally {
    loading.value = false
    await nextTick()
    requestAnimationFrame(() => {
      pageReady.value = true
    })
  }
})
</script>

<template>
  <main class="detail-pro-page" :class="{ 'is-ready': pageReady }">
    <div class="detail-orbit" aria-hidden="true"></div>
    <div class="detail-orbit detail-orbit--b" aria-hidden="true"></div>

    <section class="detail-pro-shell">
      <header class="detail-page-intro detail-reveal detail-reveal--1">
        <button class="detail-back-btn" type="button" @click="goToCompany">
          <span class="detail-back-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8l5 5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          Retour
        </button>

        <h1 class="detail-page-title">
          <template v-if="client">{{ client.prenom }} {{ client.nom }}</template>
          <template v-else>{{ loading ? 'Chargement...' : 'Détail client' }}</template>
        </h1>
        <p class="detail-page-subtitle">
          <template v-if="company?.name">
            Dossier client · {{ company.name }}
          </template>
          <template v-else>
            Consultez les informations et documents de ce dossier client.
          </template>
        </p>
      </header>

      <p v-if="errorMessage" class="detail-inline-msg error detail-reveal detail-reveal--1">
        {{ errorMessage }}
      </p>

      <div v-if="loading" class="detail-main-panel detail-reveal detail-reveal--2">
        <div class="detail-empty">
          <div class="detail-loading-dots" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <p>Chargement du dossier...</p>
        </div>
      </div>

      <template v-else-if="client">
        <section class="detail-hero-panel detail-reveal detail-reveal--2">
          <div class="detail-hero-main">
            <span class="detail-avatar">{{ clientInitials }}</span>
            <div class="detail-hero-copy">
              <p class="detail-hero-badge">Dossier client</p>
              <h2>{{ client.prenom }} {{ client.nom }}</h2>
              <p>{{ company?.name || 'Entreprise' }}</p>
            </div>
          </div>

          <div class="detail-toolbar-actions">
            <button class="detail-primary-btn" type="button" @click="editClient">
              Modifier
            </button>
          </div>
        </section>

        <section class="detail-kpi-grid detail-reveal detail-reveal--3">
          <article
            class="detail-kpi-card"
            style="--card-delay: 0ms"
          >
            <span class="detail-kpi-label">Date</span>
            <strong class="detail-kpi-value">{{ formatDate(client.date_transaction) }}</strong>
          </article>
          <article
            class="detail-kpi-card"
            style="--card-delay: 60ms"
          >
            <span class="detail-kpi-label">Montant</span>
            <strong class="detail-kpi-value">{{ formatMoney(client.montant) }} $</strong>
          </article>
          <article
            class="detail-kpi-card"
            style="--card-delay: 120ms"
          >
            <span class="detail-kpi-label">Poids</span>
            <strong class="detail-kpi-value">{{ formatMoney(client.poids) }} kg</strong>
          </article>
          <article
            class="detail-kpi-card"
            style="--card-delay: 180ms"
          >
            <span class="detail-kpi-label">Marchandise</span>
            <strong class="detail-kpi-value">{{ client.marchandise || '-' }}</strong>
          </article>
        </section>

        <section class="detail-main-panel detail-reveal detail-reveal--4">
          <div class="detail-section-head">
            <h2>Informations générales</h2>
            <p>Données enregistrées pour ce client.</p>
          </div>

          <div class="detail-info-grid">
            <article
              v-for="(card, index) in infoCards"
              :key="card.label"
              class="detail-info-card"
              :style="{ '--card-delay': `${index * 55}ms` }"
            >
              <span class="detail-info-label">{{ card.label }}</span>
              <strong class="detail-info-value">{{ card.value }}</strong>
            </article>
          </div>
        </section>

        <section class="detail-main-panel detail-reveal detail-reveal--5">
          <div class="detail-section-head">
            <h2>Documents</h2>
            <p>Pièces jointes sécurisées du dossier.</p>
          </div>

          <div v-if="documents.length" class="detail-doc-grid">
            <a
              v-for="(doc, index) in documents"
              :key="doc.key"
              class="detail-doc-card"
              :href="doc.href"
              target="_blank"
              rel="noopener noreferrer"
              :style="{ '--card-delay': `${index * 80}ms` }"
            >
              <span class="detail-doc-mark" aria-hidden="true">{{ doc.mark }}</span>
              <div class="detail-doc-copy">
                <strong>{{ doc.title }}</strong>
                <span class="detail-doc-hint">{{ doc.hint }}</span>
              </div>
              <span class="detail-doc-arrow" aria-hidden="true">↗</span>
            </a>
          </div>

          <div v-else class="detail-empty detail-empty--soft">
            <p>Aucun document disponible pour ce dossier.</p>
          </div>
        </section>
      </template>
    </section>
  </main>
</template>
