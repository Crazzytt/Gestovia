<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import '../styles/CompanyView.css'

const route = useRoute()
const router = useRouter()
const companyId = route.params.id

const loading = ref(true)
const submitting = ref(false)
const pageReady = ref(false)
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
  company.value?.name ? `${company.value.name} - Clients` : 'Entreprise',
)

const clientCountLabel = computed(
  () => `${clients.value.length} client${clients.value.length > 1 ? 's' : ''}`,
)

const totalAmountLabel = computed(() =>
  formatMoney(clients.value.reduce((sum, client) => sum + Number(client.montant || 0), 0)),
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

const clientInitial = (client) => {
  const first = (client.prenom || '').charAt(0)
  const last = (client.nom || '').charAt(0)
  return `${first}${last}`.toUpperCase() || '?'
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
        'contracts',
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
    `Supprimer le client ${client.prenom} ${client.nom} ?`,
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

    const editId = route.query.edit
    if (editId) {
      const target = clients.value.find((c) => String(c.id) === String(editId))
      if (target) {
        editClient(target)
        router.replace({ path: route.path, query: {} })
      }
    }
  } catch (error) {
    errorMessage.value = error.message || 'Impossible de charger les données.'
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
  <main class="company-pro-page" :class="{ 'is-ready': pageReady }">
    <section class="company-pro-shell">
      <header class="company-page-intro company-reveal company-reveal--1">
        <h1 class="company-page-title">
          {{ company?.name || (loading ? 'Chargement...' : 'Entreprise') }}
        </h1>
        <p class="company-page-subtitle">
          Consultez et gérez les dossiers clients de cette entreprise.
        </p>
      </header>

      <section class="company-main-panel company-reveal company-reveal--2">
        <div class="company-toolbar">
          <div class="company-toolbar-title">
            <h2>Clients</h2>
            <span class="company-meta-pill">{{ clientCountLabel }}</span>
            <span v-if="clients.length" class="company-meta-pill company-meta-pill--muted">
              Total {{ totalAmountLabel }} $
            </span>
          </div>

          <button class="company-primary-btn" type="button" @click="openCreateModal">
            Ajouter un client
          </button>
        </div>

        <p v-if="successMessage && !showCreateModal" class="company-inline-msg success">
          {{ successMessage }}
        </p>
        <p v-if="errorMessage && !showCreateModal" class="company-inline-msg error">
          {{ errorMessage }}
        </p>

        <div v-if="loading" class="company-empty">
          <div class="company-loading-dots" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <p>Chargement des clients...</p>
        </div>

        <div v-else-if="clients.length === 0" class="company-empty">
          <div class="company-empty-icon" aria-hidden="true"></div>
          <h3>Aucun client</h3>
          <p>Ajoutez votre premier dossier pour démarrer le suivi de cette entreprise.</p>
          <button class="company-primary-btn" type="button" @click="openCreateModal">
            Ajouter un client
          </button>
        </div>

        <div v-else class="company-table-wrap">
          <table class="company-client-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Marchandise</th>
                <th>Poids</th>
                <th class="align-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(client, index) in clients"
                :key="client.id"
                :style="{ '--row-delay': `${index * 40}ms` }"
              >
                <td>
                  <div class="client-identity">
                    <span class="client-mark">{{ clientInitial(client) }}</span>
                    <div>
                      <strong>{{ client.prenom }} {{ client.nom }}</strong>
                      <span>Dossier client</span>
                    </div>
                  </div>
                </td>
                <td>{{ formatDate(client.date_transaction) }}</td>
                <td class="number-cell">{{ formatMoney(client.montant) }} $</td>
                <td>{{ client.marchandise || '-' }}</td>
                <td class="number-cell">{{ formatMoney(client.poids) }}</td>
                <td>
                  <div class="company-row-actions">
                    <button
                      class="company-row-btn"
                      type="button"
                      @click="viewClient(client)"
                    >
                      Voir
                    </button>
                    <button
                      class="company-row-btn"
                      type="button"
                      @click="editClient(client)"
                    >
                      Modifier
                    </button>
                    <button
                      class="company-row-btn danger"
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
    </section>

    <Teleport to="body">
      <Transition name="company-modal">
        <div
          v-if="showCreateModal"
          class="company-modal-overlay"
          @click.self="closeCreateModal"
        >
          <div class="company-modal-card" role="dialog" aria-modal="true">
            <div class="company-modal-head">
              <div>
                <h2>{{ isEditing ? 'Modifier un client' : 'Ajouter un client' }}</h2>
                <p>
                  {{
                    isEditing
                      ? 'Mettez à jour les informations du dossier.'
                      : 'Renseignez les informations et joignez les documents requis.'
                  }}
                </p>
              </div>
              <button class="company-modal-close" type="button" @click="closeCreateModal">
                ×
              </button>
            </div>

            <form class="company-modal-form" @submit.prevent="handleSubmit">
              <div class="company-field">
                <label>Nom</label>
                <input v-model="form.nom" type="text" required />
              </div>

              <div class="company-field">
                <label>Prénom</label>
                <input v-model="form.prenom" type="text" required />
              </div>

              <div class="company-field">
                <label>Date de transaction</label>
                <input v-model="form.date_transaction" type="date" required />
              </div>

              <div class="company-field">
                <label>Montant</label>
                <input
                  v-model="form.montant"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div class="company-field company-full">
                <label>Marchandise</label>
                <input v-model="form.marchandise" type="text" required />
              </div>

              <div class="company-field">
                <label>Poids</label>
                <input
                  v-model="form.poids"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div class="company-field">
                <label>
                  Pièce d’identité
                  <span v-if="isEditing"> (optionnel)</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  :required="!isEditing"
                  @change="handleIdDocumentChange"
                />
              </div>

              <div class="company-field company-full">
                <label>
                  Contrat signé
                  <span v-if="isEditing"> (optionnel)</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  :required="!isEditing"
                  @change="handleSignedContractChange"
                />
              </div>

              <div class="company-modal-actions company-full">
                <button class="company-secondary-btn" type="button" @click="closeCreateModal">
                  Annuler
                </button>
                <button class="company-primary-btn" type="submit" :disabled="submitting">
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
              </div>
            </form>

            <p v-if="successMessage" class="company-inline-msg success">
              {{ successMessage }}
            </p>
            <p v-if="errorMessage" class="company-inline-msg error">
              {{ errorMessage }}
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>
