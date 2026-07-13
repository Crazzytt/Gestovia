<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import '../styles/CompanyView.css'

const route = useRoute()
const router = useRouter()
const companyId = route.params.id

const loading = ref(true)
const submitting = ref(false)
const clients = ref([])
const company = ref(null)
const errorMessage = ref('')
const successMessage = ref('')
const showCreateModal = ref(false)

const isEditing = ref(false)
const editingClientId = ref(null)

const form = ref({
  nom: '',
  prenom: '',
  date_transaction: '',
  montant: '',
  marchandise: '',
  poids: '',
})

const idDocumentFile = ref(null)
const signedContractFile = ref(null)

const pageTitle = computed(() =>
  company.value?.name ? `${company.value.name} - Clients` : 'Entreprise'
)

const resetForm = () => {
  form.value = {
    nom: '',
    prenom: '',
    date_transaction: '',
    montant: '',
    marchandise: '',
    poids: '',
  }
  idDocumentFile.value = null
  signedContractFile.value = null
  isEditing.value = false
  editingClientId.value = null
}

const openCreateModal = () => {
  showCreateModal.value = true
  errorMessage.value = ''
  successMessage.value = ''
  isEditing.value = false
  editingClientId.value = null
  resetForm()
}

const closeCreateModal = () => {
  showCreateModal.value = false
  resetForm()
}

const goBack = () => router.push('/dashboard')

const formatMoney = (value) =>
  new Intl.NumberFormat('fr-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-CA')
}

const handleIdDocumentChange = (event) => {
  idDocumentFile.value = event.target.files?.[0] || null
}

const handleSignedContractChange = (event) => {
  signedContractFile.value = event.target.files?.[0] || null
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

const fetchClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  clients.value = data || []
}

const uploadFile = async (file, folder) => {
  if (!file) return null

  const fileExt = file.name.split('.').pop()
  const filePath = `${companyId}/${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('client-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw uploadError
  }

  return filePath
}

const createClient = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!form.value.nom || !form.value.prenom || !form.value.date_transaction) {
    errorMessage.value = 'Veuillez remplir les champs obligatoires.'
    return
  }

  if (!idDocumentFile.value || !signedContractFile.value) {
    errorMessage.value =
      'Veuillez ajouter la pièce d’identité et le contrat signé.'
    return
  }

  try {
    submitting.value = true

    const pieceIdentitePath = await uploadFile(idDocumentFile.value, 'ids')
    const contratSignePath = await uploadFile(signedContractFile.value, 'contracts')

    const payload = {
      company_id: companyId,
      nom: form.value.nom.trim(),
      prenom: form.value.prenom.trim(),
      date_transaction: form.value.date_transaction,
      montant: Number(form.value.montant || 0),
      marchandise: form.value.marchandise.trim(),
      poids: Number(form.value.poids || 0),
      piece_identite_path: pieceIdentitePath,
      contrat_signe_path: contratSignePath,
    }

    const { error } = await supabase.from('clients').insert(payload)

    if (error) throw error

    successMessage.value = 'Client ajouté avec succès.'
    await fetchClients()
    closeCreateModal()
  } catch (error) {
    errorMessage.value = error.message || 'Une erreur est survenue.'
  } finally {
    submitting.value = false
  }
}

const viewClient = (client) => {
  router.push(`/companies/${companyId}/clients/${client.id}`)
}

const editClient = (client) => {
  isEditing.value = true
  editingClientId.value = client.id
  showCreateModal.value = true
  errorMessage.value = ''
  successMessage.value = ''

  form.value = {
    nom: client.nom || '',
    prenom: client.prenom || '',
    date_transaction: client.date_transaction
      ? client.date_transaction.slice(0, 10)
      : '',
    montant: client.montant ?? '',
    marchandise: client.marchandise || '',
    poids: client.poids ?? '',
  }

  idDocumentFile.value = null
  signedContractFile.value = null
}

const updateClient = async () => {
  if (!editingClientId.value) return

  errorMessage.value = ''
  successMessage.value = ''

  if (!form.value.nom || !form.value.prenom || !form.value.date_transaction) {
    errorMessage.value = 'Veuillez remplir les champs obligatoires.'
    return
  }

  try {
    submitting.value = true

    const updatePayload = {
      nom: form.value.nom.trim(),
      prenom: form.value.prenom.trim(),
      date_transaction: form.value.date_transaction,
      montant: Number(form.value.montant || 0),
      marchandise: form.value.marchandise.trim(),
      poids: Number(form.value.poids || 0),
    }

    if (idDocumentFile.value) {
      updatePayload.piece_identite_path = await uploadFile(idDocumentFile.value, 'ids')
    }

    if (signedContractFile.value) {
      updatePayload.contrat_signe_path = await uploadFile(
        signedContractFile.value,
        'contracts'
      )
    }

    const { error } = await supabase
      .from('clients')
      .update(updatePayload)
      .eq('id', editingClientId.value)
      .eq('company_id', companyId)

    if (error) throw error

    successMessage.value = 'Client mis à jour avec succès.'
    await fetchClients()
    closeCreateModal()
  } catch (err) {
    errorMessage.value = err.message || 'Erreur lors de la mise à jour.'
  } finally {
    submitting.value = false
  }
}

const deleteClient = async (client) => {
  const confirmDelete = window.confirm(
    `Supprimer le client ${client.prenom} ${client.nom} ?`
  )
  if (!confirmDelete) return

  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', client.id)
      .eq('company_id', companyId)

    if (error) throw error

    successMessage.value = 'Client supprimé.'
    await fetchClients()
  } catch (err) {
    errorMessage.value = err.message || 'Erreur lors de la suppression.'
  }
}

const handleSubmit = async () => {
  if (isEditing.value) {
    await updateClient()
  } else {
    await createClient()
  }
}

onMounted(async () => {
  try {
    loading.value = true
    await fetchCompany()
    await fetchClients()
    document.title = pageTitle.value
  } catch (error) {
    errorMessage.value = error.message || 'Impossible de charger les données.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="company-layout">
    <section class="company-panel">
      <header class="company-header-pro">
        <div class="company-header-left">
          <button class="back-btn-pro" type="button" @click="goBack">
            Retour
          </button>

          <div>
            <p class="company-overline">Entreprise</p>
            <h1 class="company-title-pro">
              {{ company?.name || 'Chargement...' }}
            </h1>
          </div>
        </div>

        <div class="company-header-right">
          <div class="header-stat-card">
            <span class="header-stat-label">Clients</span>
            <strong class="header-stat-value">{{ clients.length }}</strong>
          </div>
        </div>
      </header>

      <section class="clients-section-pro">
        <div class="section-head-pro">
          <div>
            <h2>Clients</h2>
            <p>Gérez les dossiers enregistrés pour cette entreprise.</p>
          </div>
        </div>

        <p v-if="loading">Chargement...</p>

        <p v-if="errorMessage && !showCreateModal" class="message-error">
          {{ errorMessage }}
        </p>

        <div v-if="!loading && clients.length === 0" class="empty-state-pro">
          <h3>Aucun client</h3>
          <p>Commencez par ajouter votre premier dossier client avec le bouton +.</p>
        </div>

        <div v-else-if="!loading" class="table-shell">
          <table class="clients-table">
            <thead>
              <tr>
                <th>Nom complet</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Marchandise</th>
                <th>Poids</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="client in clients" :key="client.id">
                <td>{{ client.prenom }} {{ client.nom }}</td>
                <td>{{ formatDate(client.date_transaction) }}</td>
                <td>{{ formatMoney(client.montant) }}</td>
                <td>{{ client.marchandise || '-' }}</td>
                <td>{{ formatMoney(client.poids) }}</td>
                <td>
                  <div class="table-actions">
                    <button
                      class="table-action-btn"
                      type="button"
                      @click="viewClient(client)"
                    >
                      Voir
                    </button>
                    <button
                      class="table-action-btn"
                      type="button"
                      @click="editClient(client)"
                    >
                      Modifier
                    </button>
                    <button
                      class="table-action-btn danger"
                      type="button"
                      @click="deleteClient(client)"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <button
        class="floating-add-btn"
        type="button"
        aria-label="Ajouter un client"
        @click="openCreateModal"
      >
        +
      </button>

      <div
        v-if="showCreateModal"
        class="modal-overlay"
        @click.self="closeCreateModal"
      >
        <div class="modal-card">
          <div class="modal-head">
            <div>
              <p class="company-overline">
                {{ isEditing ? 'Modification' : 'Nouveau dossier' }}
              </p>
              <h2>{{ isEditing ? 'Modifier un client' : 'Ajouter un client' }}</h2>
            </div>

            <button class="modal-close" type="button" @click="closeCreateModal">
              ×
            </button>
          </div>

          <form class="modal-form-grid" @submit.prevent="handleSubmit">
            <div class="field-group">
              <label class="field-label">Nom</label>
              <input v-model="form.nom" class="input-pro" type="text" required />
            </div>

            <div class="field-group">
              <label class="field-label">Prénom</label>
              <input
                v-model="form.prenom"
                class="input-pro"
                type="text"
                required
              />
            </div>

            <div class="field-group">
              <label class="field-label">Date de transaction</label>
              <input
                v-model="form.date_transaction"
                class="input-pro"
                type="date"
                required
              />
            </div>

            <div class="field-group">
              <label class="field-label">Montant</label>
              <input
                v-model="form.montant"
                class="input-pro"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div class="field-group modal-full">
              <label class="field-label">Marchandise</label>
              <input
                v-model="form.marchandise"
                class="input-pro"
                type="text"
                required
              />
            </div>

            <div class="field-group">
              <label class="field-label">Poids</label>
              <input
                v-model="form.poids"
                class="input-pro"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div class="field-group">
              <label class="field-label">
                Pièce d’identité
                <span v-if="isEditing"> (optionnel)</span>
              </label>
              <input
                class="input-pro"
                type="file"
                accept="image/*,.pdf"
                @change="handleIdDocumentChange"
                :required="!isEditing"
              />
            </div>

            <div class="field-group modal-full">
              <label class="field-label">
                Contrat signé
                <span v-if="isEditing"> (optionnel)</span>
              </label>
              <input
                class="input-pro"
                type="file"
                accept="image/*,.pdf"
                @change="handleSignedContractChange"
                :required="!isEditing"
              />
            </div>

            <div class="modal-actions modal-full">
              <button class="primary-btn-pro" type="submit" :disabled="submitting">
                {{
                  submitting
                    ? isEditing
                      ? 'Mise à jour...'
                      : 'Enregistrement...'
                    : isEditing
                      ? 'Mettre à jour'
                      : 'Enregistrer'
                }}
              </button>

              <button
                class="secondary-btn-pro"
                type="button"
                @click="closeCreateModal"
              >
                Annuler
              </button>
            </div>
          </form>

          <p v-if="successMessage" class="message-success">
            {{ successMessage }}
          </p>
          <p v-if="errorMessage" class="message-error">
            {{ errorMessage }}
          </p>
        </div>
      </div>
    </section>
  </main>
</template>