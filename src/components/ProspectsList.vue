<template>
  <div class="flex flex-col h-full">
    <!-- En-tête de l'onglet -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{{ tabName }}</h2>
          <p class="text-sm text-gray-500">{{ visibleProspectsCount }} prospect(s) • Total: {{ totalRevenue }}</p>
        </div>
        <button
          @click="$emit('add-prospect')"
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
        >
          Ajouter
        </button>
      </div>
      
      <!-- Slider de filtrage par revenu -->
      <div class="px-4 pb-3">
        <div class="mb-2">
          <label class="block text-xs font-medium text-gray-600 mb-1">
            Filtrer par revenu minimum 
            <span v-if="prospectsAboveSmoothedMax > 0" class="text-purple-600">
              (Lissé sur 90%)
            </span>
          </label>
          <div class="text-xs text-gray-500 mb-2">
            Filtre: {{ formatCurrency(actualRevenueFilter) }} - {{ formatCurrency(maxRevenue) }} 
            ({{ visibleProspectsCount }}/{{ totalProspectsInTab }} prospects)
            <span v-if="prospectsAboveSmoothedMax > 0" class="text-blue-600">
              • {{ prospectsAboveSmoothedMax }} prospect(s) premium au-dessus
            </span>
          </div>
        </div>
        <div class="relative">
          <!-- Slider -->
          <input
            v-model.number="revenueFilter"
            type="range"
            :min="minRevenue"
            :max="maxRevenue"
            :step="1"
            class="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer revenue-slider"
            :style="{ background: sliderBackground }"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>{{ formatCurrency(minRevenue) }}</span>
            <span>{{ formatCurrency(maxRevenue) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu scrollable -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-500">Chargement...</p>
      </div>
      
      <div v-else-if="visibleProspectsAfterFilter.length === 0" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <p class="mt-2 text-gray-500">Aucun prospect dans cette plage de revenus</p>
        <p class="text-sm text-gray-400">Ajustez le slider ou ajoutez des prospects</p>
      </div>

      <!-- Catégories du funnel verticales -->
      <div v-else class="space-y-4 p-4">
        <div
          v-for="status in statusOrder"
          :key="status"
          :data-status="status"
          class="border border-gray-200 rounded-lg bg-gray-50"
        >
          <!-- En-tête de catégorie -->
          <div 
            class="p-3 border-b border-gray-200 flex items-center justify-between"
            :class="getCategoryHeaderClass(status)"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-4 h-4 rounded-full"
                :style="{ backgroundColor: getStatusColor(status) }"
              ></div>
              <h3 class="text-sm font-semibold text-gray-900">
                {{ getStatusLabel(status) }}
              </h3>
              <span class="text-xs text-gray-500">
                ({{ getProspectsByStatus(status).length }})
              </span>
            </div>
            <div class="text-sm font-bold text-green-600">
              {{ getCategoryRevenue(status) }}
            </div>
          </div>

          <!-- Zone de drop pour cette catégorie -->
          <div 
            class="min-h-[100px] p-3"
            :class="{ 'bg-blue-50 border-blue-300': isDragOverCategory === status }"
          >
            <draggable
              :model-value="getProspectsByStatus(status)"
              :group="{ name: 'prospects', pull: true, put: true }"
              item-key="id"
              @end="onStatusChange"
              @dragover.prevent="isDragOverCategory = status"
              @dragleave="isDragOverCategory = null"
              @drop="isDragOverCategory = null"
              handle=".drag-handle"
              class="space-y-2"
              :animation="200"
              ghost-class="opacity-50"
              chosen-class="dragging"
            >
              <template #item="{ element: prospect }">
                <div
                  class="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all duration-200 cursor-pointer"
                  :class="{ 
                    'ring-2 ring-blue-500 shadow-md': selectedProspect?.id === prospect.id,
                    'opacity-75': prospect.tabId && prospect.tabId !== tabId
                  }"
                  :data-prospect-id="prospect.id"
                  @click="$emit('select', prospect)"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2">
                        <div class="drag-handle cursor-move text-gray-400 hover:text-gray-600">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                          </svg>
                        </div>
                        <h3 class="text-sm font-medium text-gray-900 truncate">
                          {{ prospect.name }}
                        </h3>
                      </div>
                      
                      <p class="text-xs text-gray-500 mb-2 truncate">
                        📍 {{ prospect.address || 'Aucune adresse' }}
                      </p>
                      
                      <div class="flex items-center justify-between">
                        <div v-if="!editingRevenue[prospect.id]" class="flex items-center gap-2">
                          <span class="text-sm font-semibold text-green-600">
                            💰 {{ formatCurrency(prospect.revenue || 0) }}
                          </span>
                          <button
                            @click.stop="startEditingRevenue(prospect)"
                            class="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                            title="Modifier le montant"
                          >
                            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                        
                        <div v-else class="flex items-center gap-2 w-full">
                          <span class="text-sm">💰</span>
                          <input
                            v-model.number="tempRevenue[prospect.id]"
                            type="number"
                            min="0"
                            step="1"
                            :data-prospect-id="prospect.id"
                            @keydown="handleRevenueKeydown($event, prospect)"
                            @blur="saveRevenue(prospect)"
                            @click.stop
                            class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Montant"
                          />
                          <button
                            @click.stop="saveRevenue(prospect)"
                            class="text-green-600 hover:text-green-700 p-1"
                            title="Valider"
                          >
                            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            @click.stop="cancelEditingRevenue(prospect.id)"
                            class="text-red-600 hover:text-red-700 p-1"
                            title="Annuler"
                          >
                            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <!-- Section des notes -->
                      <div class="mt-2">
                        <div v-if="!editingNotes[prospect.id]" class="relative">
                          <div 
                            class="bg-gray-50 border border-gray-200 rounded-md p-2 min-h-[40px] cursor-pointer hover:bg-gray-100 transition-colors"
                            @click.stop="startEditingNotes(prospect)"
                            title="Cliquer pour modifier les notes"
                          >
                            <div class="flex items-start justify-between">
                              <div class="flex-1">
                                <div v-if="prospect.notes && prospect.notes.trim()" 
                                     class="text-xs text-gray-700 leading-relaxed break-words whitespace-pre-line">
                                  {{ getPlainTextFromHtml(prospect.notes) }}
                                </div>
                                <div v-else class="text-xs text-gray-400 italic">
                                  Cliquer pour ajouter des notes...
                                </div>
                              </div>
                              <button
                                @click.stop="startEditingNotes(prospect)"
                                class="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 ml-1 flex-shrink-0"
                                title="Modifier les notes"
                              >
                                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div v-else class="bg-white border-2 border-blue-300 rounded-md p-2">
                          <!-- Éditeur de texte riche Quill -->
                          <QuillEditor
                            v-model:content="tempNotes[prospect.id]"
                            contentType="html"
                            :options="quillOptions"
                            @blur="saveNotes(prospect)"
                            @keydown="handleNotesKeydown($event, prospect)"
                            style="min-height: 120px; max-height: 300px;"
                            class="quill-editor-compact"
                          />
                          <div class="flex justify-end gap-1 mt-2">
                            <button
                              @click.stop="saveNotes(prospect)"
                              class="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50"
                              title="Valider"
                            >
                              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              @click.stop="cancelEditingNotes(prospect.id)"
                              class="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                              title="Annuler"
                            >
                              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-1 ml-4">
                      <button
                        @click.stop="$emit('edit', prospect)"
                        class="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                        title="Modifier"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        @click.stop="$emit('delete', prospect)"
                        class="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                        title="Supprimer"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0016.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>

            <!-- Message pour catégorie vide -->
            <div v-if="getProspectsByStatus(status).length === 0" class="text-center py-6 text-gray-400">
              <p class="text-sm">Aucun prospect {{ getStatusLabel(status).toLowerCase() }}</p>
              <p class="text-xs">Glissez une carte ici pour changer son statut</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import draggable from 'vuedraggable'
import { useProspectsStore } from '../stores/prospects'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  tabId: {
    type: String,
    required: true
  },
  tabName: {
    type: String,
    default: 'Prospects'
  },
  selectedProspect: Object
})

const emit = defineEmits(['edit', 'delete', 'reorder', 'select', 'add-prospect', 'filtered-prospects'])

const prospectsStore = useProspectsStore()
const localProspects = ref([])
const isDragOverCategory = ref(null)
const revenueFilter = ref(0) // Sera mis à jour avec minRevenue quand disponible
const forceRerender = ref(0) // Trigger pour forcer le re-render

// Variables pour l'édition du montant directement sur la carte
const editingRevenue = ref({}) // { prospectId: true/false }
const tempRevenue = ref({}) // { prospectId: newAmount }

// Variables pour l'édition des notes directement sur la carte
const editingNotes = ref({}) // { prospectId: true/false }
const tempNotes = ref({}) // { prospectId: newNotes }

// Configuration pour QuillEditor
const quillOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  },
  placeholder: 'Ajoutez vos notes ici... (Échap pour annuler)',
  formats: ['bold', 'italic', 'underline', 'list', 'bullet', 'link']
}

// Ordre des statuts dans le funnel (du plus chaud au plus froid)
const statusOrder = ['hot', 'warm', 'cold', 'won', 'lost']

// Filtrer les prospects selon l'onglet
const filteredProspects = computed(() => {
  if (props.tabId === 'default') {
    // L'onglet par défaut affiche tous les prospects
    return prospectsStore.prospects
  } else {
    // Les autres onglets affichent seulement leurs prospects assignés
    // Gérer les cas où tabId est null ou undefined
    return prospectsStore.prospects.filter(p => {
      const prospectTabId = p.tabId || p.tab_id; // Support for both formats
      return prospectTabId === props.tabId
    })
  }
})

// Calculer le revenu total
const totalRevenue = computed(() => {
  const total = visibleProspectsAfterFilter.value.reduce((sum, prospect) => {
    return sum + (prospect.revenue || 0)
  }, 0)
  return formatCurrency(total)
})

// Prospects dans cet onglet (avant filtrage par revenu)
const totalProspectsInTab = computed(() => filteredProspects.value.length)

// Calcul du revenu maximum avec mise en cache - seulement recalculé quand les prospects changent
const revenueStats = computed(() => {
  if (filteredProspects.value.length === 0) {
    return {
      maxRevenue: 100000,
      minRevenue: 0,
      prospectsAboveSmoothed: 0,
      smoothedMax: 100000
    }
  }

  const revenues = filteredProspects.value.map(p => p.revenue || 0).sort((a, b) => a - b)
  const minRevenue = Math.min(...revenues)
  const actualMaxRevenue = Math.max(...revenues)
  
  let smoothedMax = actualMaxRevenue
  let prospectsAboveSmoothed = 0
  
  // Si on a plus de 5 prospects, utiliser le 90e percentile pour éviter les valeurs extrêmes isolées
  if (revenues.length > 5) {
    const percentile90Index = Math.floor(revenues.length * 0.9)
    smoothedMax = revenues[percentile90Index]
    prospectsAboveSmoothed = revenues.filter(r => r > smoothedMax).length
  }
  
  // Log seulement lors du premier calcul ou si les données ont vraiment changé
  console.log('� Revenue stats calculated:', {
    prospects: filteredProspects.value.length,
    minRevenue,
    maxRevenue: actualMaxRevenue, // Le vrai maximum utilisé pour le slider
    smoothedMax,
    prospectsAboveSmoothed
  })
  
  return {
    maxRevenue: actualMaxRevenue, // Utiliser le vrai maximum pour le slider
    minRevenue,
    prospectsAboveSmoothed,
    smoothedMax
  }
})

// Accès simplifié aux statistiques
const maxRevenue = computed(() => revenueStats.value.maxRevenue)
const minRevenue = computed(() => revenueStats.value.minRevenue)
const prospectsAboveSmoothedMax = computed(() => revenueStats.value.prospectsAboveSmoothed)

// Le filtre de revenu utilise maintenant directement la valeur du slider
const actualRevenueFilter = computed(() => revenueFilter.value)

// Prospects filtrés par revenu ET par onglet
const visibleProspectsAfterFilter = computed(() => {
  return filteredProspects.value.filter(p => (p.revenue || 0) >= actualRevenueFilter.value)
})

// Compter les prospects visibles après filtrage
const visibleProspectsCount = computed(() => visibleProspectsAfterFilter.value.length)

// Émettre les prospects filtrés vers le parent pour la carte
watch(visibleProspectsAfterFilter, (filteredProspects) => {
  emit('filtered-prospects', filteredProspects)
}, { immediate: true })

// Initialiser le filtre de revenu avec la valeur minimale
watch(minRevenue, (newMinRevenue) => {
  if (revenueFilter.value === 0 && newMinRevenue > 0) {
    revenueFilter.value = newMinRevenue
  }
}, { immediate: true })

// Background du slider avec gradient coloré
const sliderBackground = computed(() => {
  const range = maxRevenue.value - minRevenue.value
  const position = range > 0 ? ((revenueFilter.value - minRevenue.value) / range) * 100 : 0
  return `linear-gradient(to right, 
    #ef4444 0%, 
    #f59e0b ${position/2}%, 
    #10b981 ${position}%, 
    #e5e7eb ${position}%, 
    #e5e7eb 100%)`
})

const loading = computed(() => prospectsStore.loading)

// Synchroniser localProspects avec filteredProspects, mais sans boucle
watch(filteredProspects, (newProspects) => {
  localProspects.value = [...newProspects]
}, { immediate: true })

// Watch les changements de tabId pour recalculer
watch(() => props.tabId, () => {
  localProspects.value = [...filteredProspects.value]
})

// Obtenir les prospects par statut (après filtrage par revenu)
function getProspectsByStatus(status) {
  // Utiliser forceRerender pour déclencher la réactivité si nécessaire
  const _ = forceRerender.value
  const prospects = visibleProspectsAfterFilter.value.filter(p => p.status === status)
  console.log(`🔍 getProspectsByStatus(${status}):`, prospects.map(p => ({ id: p.id, name: p.name, display_order: p.display_order })))
  return prospects
}

// Calculer le revenu par catégorie
function getCategoryRevenue(status) {
  const prospects = getProspectsByStatus(status)
  const total = prospects.reduce((sum, prospect) => {
    return sum + (prospect.revenue || 0)
  }, 0)
  return formatCurrency(total)
}

// Gestion du changement de statut par drag & drop
async function onStatusChange(evt) {
  console.log('🎯 onStatusChange triggered', evt)
  
  // Gérer le réordonnement au sein de la même catégorie
  if (evt.to === evt.from) {
    console.log('🔄 Reordering within same category')
    const targetCategory = evt.to.closest('[data-status]')
    const status = targetCategory?.dataset.status
    
    if (status) {
      console.log('📍 Drag event details:', {
        oldIndex: evt.oldIndex,
        newIndex: evt.newIndex,
        status: status
      })
      
      // Si l'index n'a pas changé, pas besoin de réorganiser
      if (evt.oldIndex === evt.newIndex) {
        console.log('📍 Same position, no reorder needed')
        return
      }
      
      // Récupérer la liste actuelle des prospects de cette catégorie
      const categoryProspects = getProspectsByStatus(status)
      console.log('📋 Current category prospects:', categoryProspects.map(p => ({ id: p.id, name: p.name })))
      
      // Créer le nouvel ordre en déplaçant l'élément
      const newOrder = [...categoryProspects]
      const [movedProspect] = newOrder.splice(evt.oldIndex, 1)
      newOrder.splice(evt.newIndex, 0, movedProspect)
      
      const newCategoryOrder = newOrder.map(p => p.id)
      console.log('📋 New order for category', status, ':', newCategoryOrder)
      
      // Au lieu de créer un ordre global complexe, envoyons juste l'ordre de cette catégorie
      // avec le statut pour que le serveur puisse gérer l'ordre par catégorie
      try {
        const result = await prospectsStore.reorderProspectsInCategory(status, newCategoryOrder)
        if (result.success) {
          console.log(`✅ Prospects reordered successfully within ${status}`)
          // Attendre un peu plus longtemps pour que la base de données soit bien mise à jour
          await new Promise(resolve => setTimeout(resolve, 300))
          // Recharger les données pour avoir l'ordre correct
          await prospectsStore.fetchProspects()
          console.log('🔄 Data refreshed after reorder')
          
          // Forcer une mise à jour de Vue après rechargement des données
          await nextTick()
          forceRerender.value++ // Forcer le re-render des composants
          console.log('🔄 Vue updated after reorder')
        } else {
          console.error('❌ Failed to reorder prospects:', result.error)
        }
      } catch (error) {
        console.error('❌ Error reordering prospects:', error)
      }
    }
    return
  }

  // Ne traiter que les mouvements entre containers différents
  if (evt.to !== evt.from) {
    const targetCategory = evt.to.closest('[data-status]')
    const sourceCategory = evt.from.closest('[data-status]')
    const newStatus = targetCategory?.dataset.status
    const oldStatus = sourceCategory?.dataset.status
    const prospectId = parseInt(evt.item.dataset.prospectId)
    
    console.log('🔄 Moving prospect', prospectId, 'from', oldStatus, 'to', newStatus)
    
    if (newStatus && prospectId && newStatus !== oldStatus) {
      // Trouver le prospect dans notre liste locale
      const prospect = filteredProspects.value.find(p => p.id === prospectId)
      if (prospect) {
        try {
          // Créer un objet avec toutes les propriétés nécessaires du prospect
          const updateData = {
            name: prospect.name,
            email: prospect.email || '',
            phone: prospect.phone || '',
            company: prospect.company || '',
            position: prospect.position || '',
            address: prospect.address || '',
            status: newStatus,
            revenue: prospect.revenue || 0,
            notes: prospect.notes || '',
            tabId: prospect.tabId || prospect.tab_id || 'default'
          }
          
          console.log('📝 Update data:', updateData)
          
          const result = await prospectsStore.updateProspect(prospectId, updateData)
          if (result.success) {
            console.log(`✅ Prospect ${prospectId} moved to ${newStatus}`)
          } else {
            console.error('❌ Failed to update prospect:', result.error)
          }
        } catch (error) {
          console.error('❌ Error updating prospect status:', error)
        }
      }
    }
  }
}

function onReorder() {
  const newOrder = localProspects.value.map(p => p.id)
  emit('reorder', newOrder)
}

function getStatusLabel(status) {
  const labels = {
    'cold': 'Cold',
    'warm': 'Warm',
    'hot': 'Hot',
    'won': 'Gagné',
    'lost': 'Perdu'
  }
  return labels[status] || status || 'Unknown'
}

function getStatusClass(status) {
  const classes = {
    'cold': 'bg-gray-100 text-gray-800',
    'warm': 'bg-yellow-100 text-yellow-800',
    'hot': 'bg-red-100 text-red-800',
    'won': 'bg-green-100 text-green-800',
    'lost': 'bg-gray-200 text-gray-600'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function getCategoryHeaderClass(status) {
  const classes = {
    'cold': 'bg-gray-100',
    'warm': 'bg-yellow-50',
    'hot': 'bg-red-50',
    'won': 'bg-green-50',
    'lost': 'bg-gray-50'
  }
  return classes[status] || 'bg-gray-50'
}

function getStatusColor(status) {
  const colors = {
    'cold': '#6b7280',    // gray
    'warm': '#f59e0b',    // yellow
    'hot': '#ef4444',     // red
    'won': '#10b981',     // green
    'lost': '#374151'     // dark gray
  }
  return colors[status] || '#3b82f6' // default blue
}

// Fonctions pour l'édition du montant directement sur la carte
function startEditingRevenue(prospect) {
  editingRevenue.value[prospect.id] = true
  tempRevenue.value[prospect.id] = prospect.revenue || 0
  
  // Auto-focus sur le champ input
  nextTick(() => {
    const input = document.querySelector(`input[data-prospect-id="${prospect.id}"]`)
    if (input) {
      input.focus()
      input.select()
    }
  })
}

function cancelEditingRevenue(prospectId) {
  editingRevenue.value[prospectId] = false
  delete tempRevenue.value[prospectId]
}

async function saveRevenue(prospect) {
  const newRevenue = tempRevenue.value[prospect.id]
  if (newRevenue !== undefined && newRevenue !== prospect.revenue) {
    try {
      const result = await prospectsStore.updateProspect(prospect.id, {
        ...prospect,
        revenue: newRevenue
      })
      
      if (result.success) {
        console.log(`✅ Revenue updated for prospect ${prospect.id}`)
      } else {
        console.error('❌ Failed to update revenue:', result.error)
      }
    } catch (error) {
      console.error('❌ Error updating revenue:', error)
    }
  }
  
  editingRevenue.value[prospect.id] = false
  delete tempRevenue.value[prospect.id]
}

function handleRevenueKeydown(event, prospect) {
  if (event.key === 'Enter') {
    saveRevenue(prospect)
  } else if (event.key === 'Escape') {
    cancelEditingRevenue(prospect.id)
  }
}

// Fonctions pour l'édition des notes directement sur la carte
function startEditingNotes(prospect) {
  editingNotes.value[prospect.id] = true
  tempNotes.value[prospect.id] = prospect.notes || ''
  
  // Auto-focus sur le champ textarea
  nextTick(() => {
    const textarea = document.querySelector(`textarea[data-prospect-notes-id="${prospect.id}"]`)
    if (textarea) {
      textarea.focus()
      textarea.select()
    }
  })
}

function cancelEditingNotes(prospectId) {
  editingNotes.value[prospectId] = false
  delete tempNotes.value[prospectId]
}

async function saveNotes(prospect) {
  const newNotes = tempNotes.value[prospect.id]
  if (newNotes !== undefined && newNotes !== prospect.notes) {
    try {
      const result = await prospectsStore.updateProspect(prospect.id, {
        ...prospect,
        notes: newNotes
      })
      
      if (result.success) {
        console.log(`✅ Notes updated for prospect ${prospect.id}`)
      } else {
        console.error('❌ Failed to update notes:', result.error)
      }
    } catch (error) {
      console.error('❌ Error updating notes:', error)
    }
  }
  
  editingNotes.value[prospect.id] = false
  delete tempNotes.value[prospect.id]
}

function handleNotesKeydown(event, prospect) {
  if (event.key === 'Escape') {
    cancelEditingNotes(prospect.id)
  }
}

// Fonction pour nettoyer le HTML et obtenir le texte brut pour l'affichage
function getPlainTextFromHtml(html) {
  if (!html) return ''
  
  // Créer un élément temporaire pour parser le HTML
  const div = document.createElement('div')
  div.innerHTML = html
  
  // Remplacer les balises par des équivalents texte
  // Remplacer les <br> par des retours à la ligne
  div.innerHTML = div.innerHTML.replace(/<br\s*\/?>/gi, '\n')
  
  // Remplacer les </p> par des retours à la ligne
  div.innerHTML = div.innerHTML.replace(/<\/p>/gi, '\n')
  
  // Remplacer les <li> par des puces
  div.innerHTML = div.innerHTML.replace(/<li>/gi, '• ')
  div.innerHTML = div.innerHTML.replace(/<\/li>/gi, '\n')
  
  // Obtenir le texte brut
  let text = div.textContent || div.innerText || ''
  
  // Nettoyer les retours à la ligne multiples
  text = text.replace(/\n\s*\n/g, '\n').trim()
  
  return text
}

// Fonction pour vérifier si les notes contiennent du HTML
function hasHtmlContent(notes) {
  if (!notes) return false
  return /<[^>]*>/g.test(notes)
}

// Réinitialiser le filtre de revenu
function resetRevenueFilter() {
  revenueFilter.value = minRevenue.value
}

// Formater les devises
function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
</script>

<style scoped>
/* Styles pour le slider de revenu */
.revenue-slider {
  appearance: none;
  -webkit-appearance: none;
  height: 12px;
  border-radius: 6px;
  outline: none;
  transition: all 0.2s ease;
}

.revenue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: 3px solid #3b82f6;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.revenue-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.revenue-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: 3px solid #3b82f6;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.revenue-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.revenue-slider:focus {
  outline: none;
}

.revenue-slider:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
}

/* Style pour l'élément en cours de drag */
.dragging {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: 2px solid #3b82f6;
}

/* Styles pour le redimensionnement des notes */
.resize-y {
  resize: vertical !important;
}

.resize-y::-webkit-resizer {
  background: linear-gradient(-45deg, transparent 0px, transparent 2px, #cbd5e1 2px, #cbd5e1 4px, transparent 4px, transparent 6px, #cbd5e1 6px, #cbd5e1 8px, transparent 8px);
  border-radius: 0 0 4px 0;
}

/* Améliorer l'apparence du redimensionnement sur Firefox */
@-moz-document url-prefix() {
  .resize-y {
    resize: vertical;
  }
}

/* Styles pour QuillEditor compact */
.quill-editor-compact :deep(.ql-toolbar) {
  border: 1px solid #d1d5db;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  padding: 4px;
  background: #f9fafb;
}

.quill-editor-compact :deep(.ql-container) {
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 6px 6px;
  font-size: 12px;
  line-height: 1.4;
}

.quill-editor-compact :deep(.ql-editor) {
  min-height: 60px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
}

.quill-editor-compact :deep(.ql-toolbar button) {
  width: 24px;
  height: 24px;
  padding: 2px;
  margin: 1px;
}

.quill-editor-compact :deep(.ql-toolbar button svg) {
  width: 14px;
  height: 14px;
}

.quill-editor-compact :deep(.ql-editor p) {
  margin: 0 0 4px 0;
}

.quill-editor-compact :deep(.ql-editor p:last-child) {
  margin-bottom: 0;
}

.quill-editor-compact :deep(.ql-editor ul), 
.quill-editor-compact :deep(.ql-editor ol) {
  margin: 4px 0;
  padding-left: 16px;
}

.quill-editor-compact :deep(.ql-editor li) {
  margin-bottom: 2px;
}

.quill-editor-compact :deep(.ql-editor strong) {
  font-weight: 600;
}

.quill-editor-compact :deep(.ql-editor em) {
  font-style: italic;
}

.quill-editor-compact :deep(.ql-editor a) {
  color: #3b82f6;
  text-decoration: underline;
}

.quill-editor-compact :deep(.ql-editor a:hover) {
  color: #1d4ed8;
}
</style>
