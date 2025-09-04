<template>
  <div class="flex flex-col h-full">
    <!-- En-tête de l'onglet -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{{ tabName }}</h2>
          <p class="text-sm text-gray-500">{{ filteredProspects.length }} prospect(s)</p>
        </div>
        <button
          @click="$emit('add-prospect')"
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
        >
          Ajouter
        </button>
      </div>
    </div>

    <!-- Contenu scrollable -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-500">Chargement...</p>
      </div>
      
      <div v-else-if="filteredProspects.length === 0" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <p class="mt-2 text-gray-500">Aucun prospect dans cet onglet</p>
        <p class="text-sm text-gray-400">Cliquez sur "Ajouter" pour commencer</p>
      </div>

      <div v-else>
        <draggable
          v-model="localProspects"
          item-key="id"
          @end="onReorder"
          handle=".drag-handle"
          class="space-y-2"
        >
          <template #item="{ element: prospect }">
            <div
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
              :class="{ 
                'ring-2 ring-blue-500 shadow-md': selectedProspect?.id === prospect.id,
                'opacity-75': prospect.tabId && prospect.tabId !== tabId
              }"
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
                    <div
                      class="w-3 h-3 rounded-full border-2"
                      :style="{ backgroundColor: getStatusColor(prospect.status) }"
                    ></div>
                    <h3 class="text-sm font-medium text-gray-900 truncate">
                      {{ prospect.name }}
                    </h3>
                  </div>
                  
                  <p class="text-xs text-gray-500 mb-2 truncate">
                    📍 {{ prospect.address || 'Aucune adresse' }}
                  </p>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-green-600">
                      💰 {{ formatCurrency(prospect.revenue || 0) }}
                    </span>
                    <span
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      :class="getStatusClass(prospect.status)"
                    >
                      {{ getStatusLabel(prospect.status) }}
                    </span>
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
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import { useProspectsStore } from '../stores/prospects'

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

const emit = defineEmits(['edit', 'delete', 'reorder', 'select', 'add-prospect'])

const prospectsStore = useProspectsStore()
const localProspects = ref([])

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

const loading = computed(() => prospectsStore.loading)

// Synchroniser localProspects avec filteredProspects, mais sans boucle
watch(filteredProspects, (newProspects) => {
  localProspects.value = [...newProspects]
}, { immediate: true })

// Watch les changements de tabId pour recalculer
watch(() => props.tabId, () => {
  localProspects.value = [...filteredProspects.value]
})

function onReorder() {
  const newOrder = localProspects.value.map(p => p.id)
  emit('reorder', newOrder)
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

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
</script>
