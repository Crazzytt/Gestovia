<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const route = useRoute()
const router = useRouter()

const companyId = route.params.id

const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const company = ref(null)
const clients = ref([])

const form = ref({
  first_name: '',
  last_name: '',
  transaction_date: '',
  amount: '',
  merchandise: '',
  merchandise_weight: '',
})

const idDocumentFile = ref(null)
const signedContractFile = ref(null)

const loadCompanyAndClients = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) throw userError
    if (!user) {
  company.value = { id: companyId, name: 'Entreprise démo' }
  clients.value = []
  loading.value = false
  return
}

    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('user_id', user.id)
      .single()

    if (companyError) throw companyError

    company.value = companyData

    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (clientsError) throw clientsError

    clients.value = clientsData || []
  } catch (error) {
    errorMessage.value = error.message || 'Impossible de charger les données.'
  } finally {
    loading.value = false
  }
}

const handleIdDocumentChange = (event) => {
  idDocumentFile.value = event.target.files[0] || null
}

const handleSignedContractChange = (event) => {
  signedContractFile.value = event.target.files[0] || null
}

const uploadFile = async (file, folder) => {
  if (!file) return null

  const fileExt = file.name.split('.').pop()
  const filePath = `${folder}/${companyId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${fileExt}`

  const { error } = await supabase.storage
    .from('client-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data } = supabase.storage
    .from('client-documents')
    .getPublicUrl(filePath)

  return data.publicUrl
}

const resetForm = () => {
  form.value = {
    first_name: '',
    last_name: '',
    transaction_date: '',
    amount: '',
    merchandise: '',
    merchandise_weight: '',
  }

  idDocumentFile.value = null
  signedContractFile.value = null
}

const createClient = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  if (
    !form.value.first_name ||
    !form.value.last_name ||
    !form.value.transaction_date ||
    !form.value.amount ||
    !form.value.merchandise ||
    !form.value.merchandise_weight
  ) {
    errorMessage.value = 'Veuillez remplir tous les champs obligatoires.'
    return
  }

  if (!idDocumentFile.value || !signedContractFile.value) {
    errorMessage.value = 'Veuillez ajouter la pièce d’identité et le contrat signé.'
    return
  }

  saving.value = true

  try {
    const idDocumentUrl = await uploadFile(idDocumentFile.value, 'id-documents')
    const signedContractUrl = await uploadFile(signedContractFile.value, 'signed-contracts')

    const payload = {
      company_id: companyId,
      first_name: form.value.first_name.trim(),
      last_name: form.value.last_name.trim(),
      transaction_date: form.value.transaction_date,
      amount: Number(form.value.amount),
      merchandise: form.value.merchandise.trim(),
      merchandise_weight: Number(form.value.merchandise_weight),
      id_document_url: idDocumentUrl,
      signed_contract_url: signedContractUrl,
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([payload])
      .select()

    if (error) throw error

    if (data && data.length > 0) {
      clients.value = [data[0], ...clients.value]
    }

    successMessage.value = 'Client ajouté avec succès.'
    resetForm()
  } catch (error) {
    errorMessage.value = error.message || 'Erreur lors de l’ajout du client.'
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push('/dashboard')
}
</script>

<template>
  <main class="company-page">
    <section class="company-shell">
      <header class="company-topbar">
        <div>
          <button class="back-link" type="button" @click="goBack">
            Retour au dashboard
          </button>

          <p class="dashboard-eyebrow">Gestovia</p>
          <h1 class="company-title">
            {{ company?.name || 'Espace entreprise' }}
          </h1>
          <p class="company-subtitle">
            Ajoutez et consultez les dossiers clients liés à cette entreprise.
          </p>
        </div>
      </header>

      <div v-if="loading" class="dashboard-empty-state">
        <p>Chargement de l’entreprise...</p>
      </div>

      <template v-else>
        <section class="company-form-card">
          <div class="company-section-head">
            <div>
              <span class="section-badge">Nouveau dossier</span>
              <h2 class="dashboard-section-title">Ajouter un client</h2>
              <p class="dashboard-section-text">
                Enregistrez les informations de transaction et téléversez les documents obligatoires.
              </p>
            </div>
          </div>

          <form class="client-form-grid" @submit.prevent="createClient">
            <div class="field-group">
              <label for="last_name" class="field-label">Nom</label>
              <input
                id="last_name"
                v-model="form.last_name"
                class="input"
                type="text"
                placeholder="Dupont"
                required
              />
            </div>

            <div class="field-group">
              <label for="first_name" class="field-label">Prénom</label>
              <input
                id="first_name"
                v-model="form.first_name"
                class="input"
                type="text"
                placeholder="Jean"
                required
              />
            </div>

            <div class="field-group">
              <label for="transaction_date" class="field-label">Date de transaction</label>
              <input
                id="transaction_date"
                v-model="form.transaction_date"
                class="input"
                type="date"
                required
              />
            </div>

            <div class="field-group">
              <label for="amount" class="field-label">Montant</label>
              <input
                id="amount"
                v-model="form.amount"
                class="input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div class="field-group client-form-full">
              <label for="merchandise" class="field-label">Marchandise</label>
              <input
                id="merchandise"
                v-model="form.merchandise"
                class="input"
                type="text"
                placeholder="Description de la marchandise"
                required
              />
            </div>

            <div class="field-group">
              <label for="merchandise_weight" class="field-label">Poids de la marchandise</label>
              <input
                id="merchandise_weight"
                v-model="form.merchandise_weight"
                class="input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                required
              />
            </div>

            <div class="field-group">
              <label for="id_document" class="field-label">Pièce d’identité</label>
              <input
                id="id_document"
                class="input file-input"
                type="file"
                accept="image/*,.pdf"
                @change="handleIdDocumentChange"
                required
              />
            </div>

            <div class="field-group client-form-full">
              <label for="signed_contract" class="field-label">Contrat signé</label>
              <input
                id="signed_contract"
                class="input file-input"
                type="file"
                accept="image/*,.pdf"
                @change="handleSignedContractChange"
                required
              />
            </div>

            <div class="client-form-actions client-form-full">
              <button class="btn" type="submit" :disabled="saving">
                {{ saving ? 'Enregistrement...' : 'Ajouter le client' }}
              </button>
            </div>
          </form>

          <p v-if="successMessage" class="message-success">
            {{ successMessage }}
          </p>

          <p v-if="errorMessage" class="message-error">
            {{ errorMessage }}
          </p>
        </section>

        <section class="company-list-section">
          <div class="dashboard-list-header">
            <div>
              <span class="section-badge">Dossiers clients</span>
              <h2 class="dashboard-section-title">Clients enregistrés</h2>
            </div>

            <div class="dashboard-counter">
              {{ clients.length }} client{{ clients.length > 1 ? 's' : '' }}
            </div>
          </div>

          <div v-if="clients.length === 0" class="dashboard-empty-state">
            <h3>Aucun client enregistré</h3>
            <p>
              Ajoutez votre premier dossier client pour commencer à structurer les informations de cette entreprise.
            </p>
          </div>

          <div v-else class="client-card-grid">
            <article
              v-for="client in clients"
              :key="client.id"
              class="client-card"
            >
              <div class="client-card-head">
                <span class="company-badge">Client</span>
              </div>

              <h3 class="client-name">
                {{ client.first_name }} {{ client.last_name }}
              </h3>

              <dl class="client-details">
                <div>
                  <dt>Date</dt>
                  <dd>{{ new Date(client.transaction_date).toLocaleDateString('fr-CA') }}</dd>
                </div>

                <div>
                  <dt>Montant</dt>
                  <dd>{{ Number(client.amount).toFixed(2) }}</dd>
                </div>

                <div>
                  <dt>Marchandise</dt>
                  <dd>{{ client.merchandise }}</dd>
                </div>

                <div>
                  <dt>Poids</dt>
                  <dd>{{ client.merchandise_weight }}</dd>
                </div>
              </dl>

              <div class="client-doc-links">
                <a
                  v-if="client.id_document_url"
                  :href="client.id_document_url"
                  class="btn btn-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir la pièce d’identité
                </a>

                <a
                  v-if="client.signed_contract_url"
                  :href="client.signed_contract_url"
                  class="btn btn-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir le contrat
                </a>
              </div>
            </article>
          </div>
        </section>
      </template>
    </section>
  </main>
</template>