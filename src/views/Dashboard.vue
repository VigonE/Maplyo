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

/* Responsive breakpoints personnalisés si nécessaire */
@media (max-width: 768px) {
  .mobile-toggle {
    display: flex;
  }
}
</style>

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
}

function editProspect(prospect) {
  editingProspect.value = { ...prospect }
  showEditModal.value = true
}

async function deleteProspect(prospect) {
  if (confirm('Are you sure you want to delete this prospect?')) {
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
