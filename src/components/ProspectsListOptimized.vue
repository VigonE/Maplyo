<template>
  <div class="flex flex-col h-full">
    <!-- En-tête de l'onglet -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{{ tabName }}</h2>
          <p class="text-sm text-gray-500">{{ visibleProspectsCount }} lead(s) • Weighted Total: {{ totalRevenue }}</p>
        </div>
        <button
          @click="$emit('add-prospect')"
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
        >
          Add
        </button>
      </div>
      
      <!-- Champ de recherche -->
      <div class="mt-4 mb-4 px-4">
        <div class="relative">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Search leads by name, company, email..."
            class="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div v-if="debouncedSearchQuery" class="text-xs text-gray-500 mt-1">
          {{ searchFilteredCount }} of {{ totalProspectsInTab }} leads match "{{ debouncedSearchQuery }}"
        </div>
      </div>
      
      <!-- Slider de filtrage par revenu -->
      <div class="px-4 pb-3">
        <div class="mb-2">
          <label class="block text-xs font-medium text-gray-600 mb-1">
            Filter by minimum weighted revenue
          </label>
          <div class="text-xs text-gray-500 mb-2">
            Filter: {{ formatCurrency(actualRevenueFilter) }} - {{ formatCurrency(maxRevenue) }} 
            ({{ visibleProspectsCount }}/{{ totalProspectsInTab }} leads)
          </div>
        </div>
        <div class="relative">
          <input
            v-model.number="revenueFilter"
            type="range"
            :min="minRevenue"
            :max="maxRevenue"
            :step="1"
            class="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer revenue-slider"
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <p class="mt-2 text-gray-500">No leads in this revenue range</p>
        <p class="text-sm text-gray-400">Adjust the slider or add leads</p>
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
              :group="{ name: 'leads', pull: true, put: true }"
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
                <ProspectCard
                  :key="prospect.id"
                  :prospect="prospect"
                  :is-all-leads-view="isAllLeadsView"
                  :all-tabs="allTabs"
                  :search-query="debouncedSearchQuery"
                  :selected-prospect="selectedProspect"
                  @select="$emit('select', $event)"
                  @edit="$emit('edit', $event)"
                  @delete="$emit('delete', $event)"
                  @navigate-to-tab="$emit('navigate-to-tab', $event)"
                  @update-prospect="updateProspectLocal"
                />
              </template>
            </draggable>

            <!-- Message pour catégorie vide -->
            <div v-if="getProspectsByStatus(status).length === 0" class="text-center py-6 text-gray-400">
              <p class="text-sm">No {{ getStatusLabel(status).toLowerCase() }} leads</p>
              <p class="text-xs">Drag a card here to change its status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import { debounce, throttle } from 'lodash-es'
import draggable from 'vuedraggable'
import { useProspectsStore } from '../stores/prospects'
import ProspectCard from './ProspectCard.vue'

// Fonction throttle simple pour éviter la dépendance
const throttle = (func, delay) => {
  let timeoutId
  let lastExecTime = 0
  return function (...args) {
    const currentTime = Date.now()
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args)
      lastExecTime = currentTime
    } else {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func.apply(this, args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

const props = defineProps({
  tabId: {
    type: String,
    required: true
  },
  tabName: {
    type: String,
    default: 'Prospects'
  },
  selectedProspect: Object,
  isAllLeadsView: {
    type: Boolean,
    default: false
  },
  allTabs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete', 'reorder', 'select', 'add-prospect', 'filtered-prospects', 'navigate-to-tab'])

const prospectsStore = useProspectsStore()
const isDragOverCategory = ref(null)
const revenueFilter = ref(0)
const searchQuery = ref('')
const searchInput = ref(null)

// Cache pour les calculs coûteux
const filteredProspectsCache = new Map()
const revenueStatsCache = ref(null)
const lastCacheKey = ref('')

// Debouncer la recherche pour éviter trop de calculs
const debouncedSearchQuery = ref('')
const updateSearch = debounce((value) => {
  debouncedSearchQuery.value = value
}, 300)

// Watcher pour la recherche avec debounce
watch(searchQuery, (newValue) => {
  updateSearch(newValue)
})

// Fonction de recherche optimisée
const searchInProspect = (prospect, query) => {
  if (!query) return true
  
  const searchTerm = query.toLowerCase()
  
  // Chercher seulement dans les champs principaux pour de meilleures performances
  return (
    (prospect.name && prospect.name.toLowerCase().includes(searchTerm)) ||
    (prospect.email && prospect.email.toLowerCase().includes(searchTerm)) ||
    (prospect.company && prospect.company.toLowerCase().includes(searchTerm)) ||
    (prospect.address && prospect.address.toLowerCase().includes(searchTerm))
  )
}

// Fonction pour calculer le revenu pondéré avec cache
const getWeightedRevenue = (prospect) => {
  return prospectsStore.getWeightedRevenue(prospect)
}

// Filtrer les prospects avec cache optimisé
const filteredProspects = computed(() => {
  const cacheKey = `${props.tabId}-${debouncedSearchQuery.value}-${prospectsStore.prospects.length}`
  
  if (filteredProspectsCache.has(cacheKey)) {
    return filteredProspectsCache.get(cacheKey)
  }
  
  let prospects = []
  
  // Déterminer si c'est l'onglet "All Leads"
  const currentTab = props.allTabs.find(t => t.id === props.tabId)
  const isAllLeadsTab = props.isAllLeadsView || 
                       (props.tabId && props.tabId.includes('all-leads')) ||
                       props.tabName === 'All Leads' ||
                       (currentTab && currentTab.is_special)
  
  if (isAllLeadsTab || props.tabId === 'default') {
    prospects = prospectsStore.prospects
  } else {
    prospects = prospectsStore.prospects.filter(p => {
      const prospectTabId = p.tabId || p.tab_id
      return prospectTabId === props.tabId
    })
  }
  
  // Appliquer le filtre de recherche
  if (debouncedSearchQuery.value) {
    prospects = prospects.filter(p => searchInProspect(p, debouncedSearchQuery.value))
  }
  
  filteredProspectsCache.set(cacheKey, prospects)
  
  // Limiter la taille du cache
  if (filteredProspectsCache.size > 20) {
    const firstKey = filteredProspectsCache.keys().next().value
    filteredProspectsCache.delete(firstKey)
  }
  
  return prospects
})

// Calcul des statistiques de revenu avec cache
const revenueStats = computed(() => {
  const cacheKey = `revenue-stats-${filteredProspects.value.length}-${props.tabId}`
  
  if (revenueStatsCache.value && lastCacheKey.value === cacheKey) {
    return revenueStatsCache.value
  }
  
  if (filteredProspects.value.length === 0) {
    const result = {
      maxRevenue: 100000,
      minRevenue: 0,
      prospectsAboveSmoothed: 0,
      smoothedMax: 100000
    }
    revenueStatsCache.value = result
    lastCacheKey.value = cacheKey
    return result
  }

  const revenues = filteredProspects.value.map(p => getWeightedRevenue(p)).sort((a, b) => a - b)
  const minRevenue = revenues[0]
  const actualMaxRevenue = revenues[revenues.length - 1]
  
  let smoothedMax = actualMaxRevenue
  let prospectsAboveSmoothed = 0
  
  if (revenues.length > 5) {
    const percentile90Index = Math.floor(revenues.length * 0.9)
    smoothedMax = revenues[percentile90Index]
    prospectsAboveSmoothed = revenues.filter(r => r > smoothedMax).length
  }
  
  const result = {
    maxRevenue: actualMaxRevenue,
    minRevenue,
    prospectsAboveSmoothed,
    smoothedMax
  }
  
  revenueStatsCache.value = result
  lastCacheKey.value = cacheKey
  
  return result
})

// Comptes et statistiques
const searchFilteredCount = computed(() => filteredProspects.value.length)
const totalProspectsInTab = computed(() => filteredProspects.value.length)
const maxRevenue = computed(() => revenueStats.value.maxRevenue)
const minRevenue = computed(() => revenueStats.value.minRevenue)
const actualRevenueFilter = computed(() => revenueFilter.value)

// Prospects filtrés par revenu
const visibleProspectsAfterFilter = computed(() => {
  return filteredProspects.value.filter(p => getWeightedRevenue(p) >= actualRevenueFilter.value)
})

const visibleProspectsCount = computed(() => visibleProspectsAfterFilter.value.length)

// Calcul du revenu total
const totalRevenue = computed(() => {
  const total = visibleProspectsAfterFilter.value.reduce((sum, prospect) => {
    return sum + prospectsStore.getWeightedRevenue(prospect)
  }, 0)
  return formatCurrency(total)
})

const loading = computed(() => prospectsStore.loading)

// Ordre des statuts dans le funnel
const statusOrder = ['hot', 'warm', 'cold', 'recurring', 'won', 'lost']

// Cache pour les prospects par statut
const prospectsByStatusCache = new Map()

// Obtenir les prospects par statut avec cache
function getProspectsByStatus(status) {
  const cacheKey = `${status}-${visibleProspectsAfterFilter.value.length}-${actualRevenueFilter.value}`
  
  if (prospectsByStatusCache.has(cacheKey)) {
    return prospectsByStatusCache.get(cacheKey)
  }
  
  const prospects = visibleProspectsAfterFilter.value.filter(p => p.status === status)
  
  prospectsByStatusCache.set(cacheKey, prospects)
  
  // Limiter la taille du cache
  if (prospectsByStatusCache.size > 50) {
    const firstKey = prospectsByStatusCache.keys().next().value
    prospectsByStatusCache.delete(firstKey)
  }
  
  return prospects
}

// Calculer le revenu par catégorie
function getCategoryRevenue(status) {
  const prospects = getProspectsByStatus(status)
  const total = prospects.reduce((sum, prospect) => {
    return sum + prospectsStore.getWeightedRevenue(prospect)
  }, 0)
  return formatCurrency(total)
}

// Gestion du changement de statut par drag & drop optimisée
const onStatusChange = async (evt) => {
  console.log('🎯 onStatusChange triggered', evt)
  
  // Traitement du drag & drop entre catégories différentes
  if (evt.to !== evt.from) {
    const targetCategory = evt.to.closest('[data-status]')
    const sourceCategory = evt.from.closest('[data-status]')
    const newStatus = targetCategory?.dataset.status
    const oldStatus = sourceCategory?.dataset.status
    const prospectId = parseInt(evt.item.dataset.prospectId)
    
    console.log('🔄 Moving prospect', prospectId, 'from', oldStatus, 'to', newStatus)
    
    if (newStatus && prospectId && newStatus !== oldStatus) {
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
            probability_coefficient: prospect.probability_coefficient || 100,
            notes: prospect.notes || '',
            tabId: prospect.tabId || prospect.tab_id || 'default'
          }
          
          console.log('📝 Update data:', updateData)
          
          const result = await prospectsStore.updateProspect(prospectId, updateData)
          if (result.success) {
            console.log(`✅ Prospect ${prospectId} moved to ${newStatus}`)
            // Vider les caches après succès
            clearAllCaches()
          } else {
            console.error('❌ Failed to update prospect:', result.error)
          }
        } catch (error) {
          console.error('❌ Error updating prospect status:', error)
        }
      }
    }
  } else {
    // Réordonnancement dans la même catégorie
    const targetCategory = evt.to.closest('[data-status]')
    const status = targetCategory?.dataset.status
    
    console.log('🔄 Reordering within same category:', status)
    
    if (status && evt.oldIndex !== evt.newIndex) {
      console.log('📍 Drag event details:', {
        oldIndex: evt.oldIndex,
        newIndex: evt.newIndex,
        status: status
      })
      
      // Récupérer la liste actuelle des prospects de cette catégorie
      const categoryProspects = getProspectsByStatus(status)
      console.log('📋 Current category prospects:', categoryProspects.map(p => ({ id: p.id, name: p.name })))
      
      // Créer le nouvel ordre en déplaçant l'élément
      const newOrder = [...categoryProspects]
      const [movedProspect] = newOrder.splice(evt.oldIndex, 1)
      newOrder.splice(evt.newIndex, 0, movedProspect)
      
      const newCategoryOrder = newOrder.map(p => p.id)
      console.log('📋 New order for category', status, ':', newCategoryOrder)
      
      try {
        const result = await prospectsStore.reorderProspectsInCategory(status, newCategoryOrder)
        if (result.success) {
          console.log(`✅ Prospects reordered successfully within ${status}`)
          // Vider les caches après succès
          clearAllCaches()
          // Attendre un peu pour que la base de données soit mise à jour
          await new Promise(resolve => setTimeout(resolve, 100))
        } else {
          console.error('❌ Failed to reorder prospects:', result.error)
        }
      } catch (error) {
        console.error('❌ Error reordering prospects:', error)
      }
    }
  }
}

// Fonction pour vider tous les caches
const clearAllCaches = () => {
  filteredProspectsCache.clear()
  prospectsByStatusCache.clear()
  revenueStatsCache.value = null
  lastCacheKey.value = ''
}

// Fonction pour mettre à jour un prospect localement
const updateProspectLocal = (prospectId, updates) => {
  prospectsStore.updateProspectLocal(prospectId, updates)
  clearAllCaches()
}

// Initialiser le filtre de revenu
watch(minRevenue, (newMinRevenue) => {
  if (revenueFilter.value === 0 && newMinRevenue > 0) {
    revenueFilter.value = newMinRevenue
  }
}, { immediate: true })

// Émettre les prospects filtrés vers le parent
watch(visibleProspectsAfterFilter, (filteredProspects) => {
  emit('filtered-prospects', filteredProspects)
}, { immediate: true })

function getStatusLabel(status) {
  const labels = {
    'cold': 'Cold',
    'warm': 'Warm',
    'hot': 'Hot',
    'won': 'Won',
    'lost': 'Lost'
  }
  return labels[status] || status || 'Unknown'
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
    'cold': '#6b7280',
    'warm': '#f59e0b',
    'hot': '#ef4444',
    'won': '#10b981',
    'lost': '#374151'
  }
  return colors[status] || '#3b82f6'
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Gestion des raccourcis clavier
function handleGlobalKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault()
    if (searchInput.value) {
      searchInput.value.focus()
      searchInput.value.select()
    }
  }
  
  if (event.key === 'Escape' && searchQuery.value && document.activeElement === searchInput.value) {
    searchQuery.value = ''
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
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

/* Style pour l'élément en cours de drag */
.dragging {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: 2px solid #3b82f6;
}
</style>
