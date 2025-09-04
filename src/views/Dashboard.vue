<template>
  <div class="h-screen flex">
    <!-- Sidebar avec onglets -->
    <div class="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-blue-600">Maplyo CRM</h1>
          <div class="flex items-center gap-2">
            <!-- Bouton engrenage avec menu déroulant -->
            <div class="relative">
              <button
                @click="showSettingsMenu = !showSettingsMenu"
                class="text-gray-500 hover:text-gray-700 p-1 rounded"
                title="Paramètres"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              <!-- Menu déroulant -->
              <div
                v-if="showSettingsMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                @click.stop
              >
                <div class="py-1">
                  <button
                    @click="triggerFileImport"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Importer CSV
                  </button>
                </div>
              </div>
            </div>
            
            <button
              @click="authStore.logout"
              class="text-gray-500 hover:text-gray-700"
              title="Déconnexion"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Gestionnaire d'onglets avec listes -->
      <div class="flex-1 overflow-hidden">
        <TabsManager
          ref="tabsManager"
          @add-prospect="showAddModal = true"
          @edit-prospect="editProspect"
          @delete-prospect="deleteProspect"
          @select-prospect="selectProspect"
          @reorder-prospects="reorderProspects"
          @tab-changed="onTabChanged"
        />
      </div>
    </div>

    <!-- Map -->
    <div class="flex-1">
      <MapView
        :prospects="visibleProspects"
        :selected-prospect="selectedProspect"
        @select-prospect="selectProspect"
      />
    </div>

    <!-- Add/Edit Modal -->
    <ProspectModal
      :show="showAddModal || showEditModal"
      :prospect="editingProspect"
      :current-tab-id="currentTabId"
      @close="closeModal"
    />

    <!-- Input fichier caché pour l'import CSV -->
    <input
      ref="fileInput"
      type="file"
      accept=".csv"
      @change="handleFileImport"
      class="hidden"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProspectsStore } from '@/stores/prospects'
import TabsManager from '@/components/TabsManager.vue'
import MapView from '@/components/MapView.vue'
import ProspectModal from '@/components/ProspectModal.vue'

const authStore = useAuthStore()
const prospectsStore = useProspectsStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const editingProspect = ref(null)
const selectedProspect = ref(null)
const tabsManager = ref(null)
const currentTabId = ref('default')
const showSettingsMenu = ref(false)
const fileInput = ref(null)

// Prospects visibles selon l'onglet actuel
const visibleProspects = computed(() => {
  if (currentTabId.value === 'default') {
    return prospectsStore.prospects
  } else {
    return prospectsStore.prospects.filter(p => p.tabId === currentTabId.value)
  }
})

// Surveiller les changements d'onglet actif
watch(() => tabsManager.value?.activeTabId, (newTabId) => {
  if (newTabId) {
    currentTabId.value = newTabId
  }
})

function onTabChanged(tabId) {
  currentTabId.value = tabId
  console.log('Onglet changé vers:', tabId) // Debug
}

onMounted(async () => {
  await prospectsStore.fetchProspects()
  
  // Écouter les événements des onglets
  if (tabsManager.value) {
    currentTabId.value = tabsManager.value.activeTabId || 'default'
  }
})

function selectProspect(prospect) {
  selectedProspect.value = prospect
}

function editProspect(prospect) {
  editingProspect.value = { ...prospect }
  showEditModal.value = true
}

async function deleteProspect(prospect) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce prospect ?')) {
    await prospectsStore.deleteProspect(prospect.id)
  }
}

async function reorderProspects(newOrder) {
  await prospectsStore.reorderProspects(newOrder)
}

function closeModal() {
  showAddModal.value = false
  showEditModal.value = false
  editingProspect.value = null
  
  // Recharger les prospects pour mettre à jour l'affichage
  prospectsStore.fetchProspects()
}

// Fonctions pour l'import CSV
function triggerFileImport() {
  showSettingsMenu.value = false
  fileInput.value?.click()
}

async function handleFileImport(event) {
  const file = event.target.files[0]
  if (!file) return

  if (!file.name.toLowerCase().endsWith('.csv')) {
    alert('Veuillez sélectionner un fichier CSV')
    return
  }

  try {
    const text = await file.text()
    const prospects = parseCSV(text)
    
    if (prospects.length === 0) {
      alert('Aucun prospect trouvé dans le fichier CSV')
      return
    }

    let importedCount = 0
    let errorCount = 0

    for (const prospectData of prospects) {
      try {
        const result = await prospectsStore.createProspect({
          ...prospectData,
          tabId: currentTabId.value || 'default',
          status: 'cold' // Par défaut
        })
        
        if (result.success) {
          importedCount++
        } else {
          errorCount++
          console.error('Erreur lors de l\'import:', result.error)
        }
      } catch (error) {
        errorCount++
        console.error('Erreur lors de l\'import:', error)
      }
    }

    alert(`Import terminé!\n${importedCount} prospects importés\n${errorCount} erreurs`)
    
    // Réinitialiser l'input file
    event.target.value = ''
    
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier:', error)
    alert('Erreur lors de la lecture du fichier CSV')
  }
}

function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données')
  }

  // Lire la ligne d'en-tête
  const headers = lines[0].split(';').map(h => h.trim().toLowerCase())
  console.log('En-têtes détectés:', headers)

  const prospects = []

  // Traiter chaque ligne de données
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Ignorer les lignes vides

    const values = line.split(';').map(v => v.trim())
    
    // Créer un objet prospect avec mapping des colonnes
    const prospect = {
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      address: '',
      revenue: 0,
      notes: ''
    }

    // Mapper les colonnes selon les en-têtes
    headers.forEach((header, index) => {
      const value = values[index] || ''
      
      switch (header) {
        case 'name':
        case 'nom':
          prospect.name = value
          break
        case 'email':
        case 'mail':
        case 'e-mail':
          prospect.email = value
          break
        case 'phone':
        case 'telephone':
        case 'téléphone':
        case 'tel':
          prospect.phone = value
          break
        case 'company':
        case 'entreprise':
        case 'société':
        case 'societe':
          prospect.company = value
          break
        case 'position':
        case 'poste':
        case 'titre':
          prospect.position = value
          break
        case 'address':
        case 'adresse':
          prospect.address = value
          break
        case 'revenue':
        case 'revenu':
        case 'chiffre':
        case 'ca':
          // Nettoyer et convertir le revenu (enlever les espaces, virgules -> points)
          const cleanValue = value.replace(/[^\d,.-]/g, '').replace(',', '.')
          prospect.revenue = parseFloat(cleanValue) || 0
          break
        case 'notes':
        case 'note':
        case 'commentaire':
        case 'commentaires':
          prospect.notes = value
          break
      }
    })

    // Vérifier qu'on a au moins un nom
    if (prospect.name) {
      prospects.push(prospect)
    }
  }

  console.log(`${prospects.length} prospects traités depuis le CSV`)
  return prospects
}

// Fermer le menu si on clique ailleurs
function handleClickOutside(event) {
  if (!event.target.closest('.relative')) {
    showSettingsMenu.value = false
  }
}

onMounted(async () => {
  await prospectsStore.fetchProspects()
  
  // Écouter les événements des onglets
  if (tabsManager.value) {
    currentTabId.value = tabsManager.value.activeTabId || 'default'
  }
  
  // Ajouter l'écouteur pour fermer le menu
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
