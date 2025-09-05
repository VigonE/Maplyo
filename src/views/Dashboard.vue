<template>
  <div class="h-screen flex">
    <!-- Sidebar avec onglets -->
    <div 
      class="bg-white border-r border-gray-200 flex flex-col flex-shrink-0"
      :style="`width: ${sidebarWidth}px`"
    >
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
                title="Settings"
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
                    @click="openSystemSettings"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    System Settings
                  </button>
                  <div class="border-t border-gray-100"></div>
                  <button
                    @click="triggerFileImport"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Import CSV
                  </button>
                </div>
              </div>
            </div>
            
            <button
              @click="authStore.logout"
              class="text-gray-500 hover:text-gray-700"
              title="Logout"
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
          @filtered-prospects="onFilteredProspects"
        />
      </div>
    </div>

    <!-- Séparateur redimensionnable -->
    <div 
      class="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize relative group flex-shrink-0"
      @mousedown="startResize"
    >
      <div class="absolute inset-y-0 left-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>

    <!-- Map -->
    <div class="flex-1 min-h-0">
      <MapView
        :prospects="filteredProspectsForMap"
        :all-prospects="prospectsStore.prospects"
        :selected-prospect="selectedProspect"
        @select-prospect="selectProspect"
      />
    </div>

    <!-- Add/Edit Modal -->
    <ProspectModal
      :show="showAddModal || showEditModal"
      :prospect="editingProspect"
      :current-tab-id="currentTabId"
      :key="modalKey"
      @close="closeModal"
    />

    <!-- System Settings Modal -->
    <div
      v-if="showSystemSettings"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      style="z-index: 9999;"
      @click="closeSystemSettings"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              System Settings
            </h3>
            <button @click="closeSystemSettings" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <!-- Database Operations -->
            <div class="border rounded-lg p-4">
              <h4 class="text-md font-medium text-gray-800 mb-3">Database Operations</h4>
              
              <!-- Export Database -->
              <div class="space-y-2">
                <button
                  @click="exportDatabase"
                  :disabled="exportLoading"
                  class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="!exportLoading" class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ exportLoading ? 'Exporting...' : 'Export Database (JSON)' }}
                </button>
                <p class="text-xs text-gray-500">Download all your data as a JSON file</p>
              </div>

              <!-- Import Database -->
              <div class="space-y-2 mt-4">
                <button
                  @click="triggerDatabaseImport"
                  :disabled="importLoading"
                  class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="!importLoading" class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ importLoading ? 'Importing...' : 'Import Database (JSON)' }}
                </button>
                <p class="text-xs text-gray-500">Restore data from a JSON backup file</p>
              </div>

              <!-- Warning -->
              <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div class="flex">
                  <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div class="ml-3">
                    <p class="text-sm text-yellow-800">
                      <strong>Warning:</strong> Importing will replace all existing data. Make sure to export a backup first.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status Messages -->
            <div v-if="systemMessage" class="p-3 rounded-md" :class="systemMessageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'">
              <div class="flex">
                <svg v-if="systemMessageType === 'success'" class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div class="ml-3">
                  <p class="text-sm">{{ systemMessage }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input fichier caché pour l'import CSV -->
    <input
      ref="fileInput"
      type="file"
      accept=".csv"
      @change="handleFileImport"
      class="hidden"
    />

    <!-- Input fichier caché pour l'import de base de données -->
    <input
      ref="databaseFileInput"
      type="file"
      accept=".json"
      @change="handleDatabaseImport"
      class="hidden"
    />
  </div>
</template>

<style scoped>
/* Styles pour le curseur de redimensionnement */
.cursor-col-resize {
  cursor: col-resize;
}

/* Désactiver la sélection pendant le redimensionnement */
.select-none {
  user-select: none;
}

/* Améliorer l'indicateur de redimensionnement */
.resize-handle {
  transition: all 0.2s ease;
}

.resize-handle:hover {
  background-color: #3b82f6;
}

/* Effet de mise en évidence pour le prospect sélectionné depuis la carte */
:deep(.highlight-prospect) {
  animation: highlight-pulse 2s ease-in-out;
  transform: scale(1.02);
}

@keyframes highlight-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    background-color: rgba(59, 130, 246, 0.05);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.3);
    background-color: rgba(59, 130, 246, 0.1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    background-color: transparent;
  }
}

/* Responsive breakpoints personnalisés si nécessaire */
@media (max-width: 768px) {
  .mobile-toggle {
    display: flex;
  }
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
const showSystemSettings = ref(false)
const exportLoading = ref(false)
const importLoading = ref(false)
const systemMessage = ref('')
const systemMessageType = ref('success') // 'success' or 'error'
const fileInput = ref(null)
const databaseFileInput = ref(null)
const filteredProspectsForMap = ref([])
const showMapOnMobile = ref(false)
const sidebarWidth = ref(400) // Largeur par défaut du sidebar
const isResizing = ref(false)
const modalKey = ref(0) // Pour forcer le re-rendu du modal

// Prospects visibles selon l'onglet actuel (fallback si pas de filtrage)
const visibleProspects = computed(() => {
  if (currentTabId.value === 'default') {
    return prospectsStore.prospects
  } else {
    return prospectsStore.prospects.filter(p => p.tabId === currentTabId.value)
  }
})

// Gérer les prospects filtrés depuis ProspectsList
function onFilteredProspects(filteredProspects) {
  filteredProspectsForMap.value = filteredProspects
}

// Basculer entre carte et prospects sur mobile
function toggleMobileView() {
  showMapOnMobile.value = !showMapOnMobile.value
}

// Gestion du redimensionnement du sidebar
function startResize(event) {
  isResizing.value = true
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
}

function doResize(event) {
  if (!isResizing.value) return
  
  const newWidth = event.clientX
  // Limiter la largeur entre 300px et 70% de l'écran
  const minWidth = 300
  const maxWidth = window.innerWidth * 0.7
  
  if (newWidth >= minWidth && newWidth <= maxWidth) {
    sidebarWidth.value = newWidth
  }
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
  
  // Sauvegarder la largeur dans localStorage
  localStorage.setItem('maplyo_sidebar_width', sidebarWidth.value.toString())
}

// Surveiller les changements d'onglet actif
watch(() => tabsManager.value?.activeTabId, (newTabId) => {
  if (newTabId) {
    currentTabId.value = newTabId
    // Réinitialiser avec tous les prospects de ce tab si pas de filtre actif
    filteredProspectsForMap.value = visibleProspects.value
  }
})

// Surveiller les changements de prospects pour mettre à jour la carte
watch(visibleProspects, (newProspects) => {
  // Mettre à jour seulement si on n'a pas de filtrage actif depuis ProspectsList
  if (filteredProspectsForMap.value.length === 0 || 
      filteredProspectsForMap.value.length === prospectsStore.prospects.length) {
    filteredProspectsForMap.value = newProspects
  }
})

function onTabChanged(tabId) {
  currentTabId.value = tabId
  console.log('Tab changed to:', tabId) // Debug
  // Réinitialiser la carte avec tous les prospects du nouvel onglet
  filteredProspectsForMap.value = visibleProspects.value
  // Forcer le re-rendu du modal pour mettre à jour les onglets disponibles
  modalKey.value++
}

onMounted(async () => {
  await prospectsStore.fetchProspects()
  
  // Écouter les événements des onglets
  if (tabsManager.value) {
    currentTabId.value = tabsManager.value.activeTabId || 'default'
  }
  
  // Initialiser la carte avec tous les prospects
  filteredProspectsForMap.value = visibleProspects.value
  
  // Charger la largeur du sidebar depuis localStorage
  const savedWidth = localStorage.getItem('maplyo_sidebar_width')
  if (savedWidth) {
    sidebarWidth.value = parseInt(savedWidth)
  }
})

onUnmounted(() => {
  // Nettoyer les event listeners
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
})

function selectProspect(prospect) {
  selectedProspect.value = prospect
  
  // Scroll vers le prospect dans la liste
  scrollToProspectInList(prospect)
}

async function scrollToProspectInList(prospect) {
  // Vérifier dans quel onglet se trouve le prospect
  const prospectTabId = prospect.tabId || prospect.tab_id || 'default'
  
  // Basculer vers l'onglet approprié si nécessaire
  if (tabsManager.value && currentTabId.value !== prospectTabId) {
    // Changer d'onglet
    tabsManager.value.switchToTab(prospectTabId)
    currentTabId.value = prospectTabId
    
    // Attendre que le DOM soit mis à jour
    await nextTick()
  }
  
  // Attendre un peu plus pour s'assurer que les composants sont rendus
  setTimeout(() => {
    // Trouver l'élément prospect dans la liste
    const prospectElement = document.querySelector(`[data-prospect-id="${prospect.id}"]`)
    
    if (prospectElement) {
      // Scroller vers l'élément avec un comportement smooth
      prospectElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      })
      
      // Ajouter un effet visuel temporaire pour mettre en évidence le prospect
      prospectElement.classList.add('highlight-prospect')
      setTimeout(() => {
        prospectElement.classList.remove('highlight-prospect')
      }, 2000)
    }
  }, 200)
}

function editProspect(prospect) {
  editingProspect.value = { ...prospect }
  showEditModal.value = true
}

async function deleteProspect(prospect) {
  if (confirm('Are you sure you want to delete this lead?')) {
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
  
  // Forcer le re-rendu du modal pour la prochaine ouverture
  modalKey.value++
}

// System Settings functions
function openSystemSettings() {
  showSettingsMenu.value = false
  showSystemSettings.value = true
  systemMessage.value = ''
}

function closeSystemSettings() {
  showSystemSettings.value = false
  systemMessage.value = ''
}

async function exportDatabase() {
  exportLoading.value = true
  systemMessage.value = ''
  
  try {
    const response = await fetch('/api/database/export', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Create and download the file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    link.download = `maplyo-database-${timestamp}.json`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    systemMessage.value = 'Database exported successfully!'
    systemMessageType.value = 'success'
    
  } catch (error) {
    console.error('Export error:', error)
    systemMessage.value = `Export failed: ${error.message}`
    systemMessageType.value = 'error'
  } finally {
    exportLoading.value = false
  }
}

function triggerDatabaseImport() {
  systemMessage.value = ''
  databaseFileInput.value?.click()
}

async function handleDatabaseImport(event) {
  const file = event.target.files[0]
  if (!file) return

  if (!file.name.toLowerCase().endsWith('.json')) {
    systemMessage.value = 'Please select a JSON file'
    systemMessageType.value = 'error'
    return
  }

  // Confirm the import action
  const confirmed = confirm(
    'WARNING: This will replace ALL existing data with the data from the backup file. ' +
    'Are you sure you want to continue? This action cannot be undone.'
  )
  
  if (!confirmed) {
    event.target.value = '' // Reset the file input
    return
  }

  importLoading.value = true
  systemMessage.value = ''

  try {
    const text = await file.text()
    let importData
    
    try {
      importData = JSON.parse(text)
    } catch (parseError) {
      throw new Error('Invalid JSON format')
    }

    // Validate the structure
    if (!importData.users || !importData.prospects) {
      throw new Error('Invalid backup file format. Missing required data sections.')
    }

    const response = await fetch('/api/database/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(importData)
    })

    if (!response.ok) {
      let errorMessage = `Import failed: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (parseError) {
        // If we can't parse the error response, check if it's HTML (server error)
        const responseText = await response.text()
        if (responseText.includes('<!DOCTYPE')) {
          errorMessage = 'Server error occurred. Please check that the server is running and try again.'
        } else {
          errorMessage = responseText || errorMessage
        }
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    
    systemMessage.value = `Database imported successfully! ${result.imported?.prospects || 0} prospects imported.`
    systemMessageType.value = 'success'
    
    // Reload prospects data
    await prospectsStore.fetchProspects()
    
  } catch (error) {
    console.error('Import error:', error)
    systemMessage.value = `Import failed: ${error.message}`
    systemMessageType.value = 'error'
  } finally {
    importLoading.value = false
    event.target.value = '' // Reset the file input
  }
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
      alert('No leads found in CSV file')
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
  console.log('Headers detected:', headers)

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

  console.log(`${prospects.length} prospects processed from CSV`)
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

<style scoped>
/* Styles pour le slider */
.slider {
  background: linear-gradient(to right, #3b82f6 0%, #3b82f6 var(--value), #e5e7eb var(--value), #e5e7eb 100%);
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider:focus {
  outline: none;
}

.slider:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}
</style>
