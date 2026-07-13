<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import '../styles/ClientDetailView.css'

const route = useRoute()
const router = useRouter()

const companyId = route.params.companyId
const clientId = route.params.clientId

const loading = ref(true)
const company = ref(null)
const client = ref(null)
const errorMessage = ref('')
const pieceIdentiteUrl = ref('')
const contratSigneUrl = ref('')

const pageTitle = computed(() =>
  client.value
    ? `${client.value.prenom} ${client.value.nom} - Détail client`
    : 'Détail client'
)

const goBack = () => {
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
  return new Date(value).toLocaleDateString('fr-CA')
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
  }
})
</script>

<template>
  <main class="client-detail-page">
    <section class="client-detail-shell">
      <header class="client-detail-topbar">
        <div class="client-detail-heading">
          <button class="back-link" type="button" @click="goBack">
            Retour
          </button>

          <p class="detail-kicker">Entreprise</p>
          <h1>{{ company?.name || 'Chargement...' }}</h1>

          <template v-if="client">
            <p class="client-name-line">
              {{ client.prenom }} {{ client.nom }}
            </p>
          </template>
        </div>

        <div class="client-detail-actions" v-if="client">
          <button class="primary-btn" type="button" @click="editClient">
            Modifier
          </button>
        </div>
      </header>

      <p v-if="loading" class="detail-info">Chargement du dossier...</p>
      <p v-if="errorMessage" class="message-error">{{ errorMessage }}</p>

      <template v-if="!loading && client">
        <section class="detail-meta-row">
          <span>Date : {{ formatDate(client.date_transaction) }}</span>
          <span>Montant : {{ formatMoney(client.montant) }} $</span>
          <span>Poids : {{ formatMoney(client.poids) }} kg</span>
        </section>

        <section class="detail-section">
          <h2>Informations générales</h2>

          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Nom</span>
              <strong>{{ client.nom || '-' }}</strong>
            </div>

            <div class="detail-item">
              <span class="detail-label">Prénom</span>
              <strong>{{ client.prenom || '-' }}</strong>
            </div>

            <div class="detail-item">
              <span class="detail-label">Date de transaction</span>
              <strong>{{ formatDate(client.date_transaction) }}</strong>
            </div>

            <div class="detail-item">
              <span class="detail-label">Montant</span>
              <strong>{{ formatMoney(client.montant) }} $</strong>
            </div>

            <div class="detail-item">
              <span class="detail-label">Marchandise</span>
              <strong>{{ client.marchandise || '-' }}</strong>
            </div>

            <div class="detail-item">
              <span class="detail-label">Poids</span>
              <strong>{{ formatMoney(client.poids) }} kg</strong>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <h2>Documents</h2>

          <div class="document-list">
            <a
              v-if="pieceIdentiteUrl"
              class="document-link"
              :href="pieceIdentiteUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ouvrir la pièce d’identité
            </a>

            <a
              v-if="contratSigneUrl"
              class="document-link"
              :href="contratSigneUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ouvrir le contrat signé
            </a>

            <p
              v-if="!pieceIdentiteUrl && !contratSigneUrl"
              class="detail-info"
            >
              Aucun document disponible.
            </p>
          </div>
        </section>
      </template>
    </section>
  </main>
</template>