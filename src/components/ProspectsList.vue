<template>
  <div class="p-4">
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">Loading...</p>
    </div>
    
    <div v-else-if="prospects.length === 0" class="text-center py-8">
      <p class="text-gray-500">No prospects yet</p>
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
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            :class="{ 'ring-2 ring-primary-500': selectedProspect?.id === prospect.id }"
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
                    class="w-4 h-4 rounded-full border-2"
                    :style="{ backgroundColor: getStatusColor(prospect.status) }"
                  ></div>
                  <h3 class="text-sm font-medium text-gray-900 truncate">
                    {{ prospect.name }}
                  </h3>
                </div>
                
                <p class="text-xs text-gray-500 mb-2">{{ prospect.address || 'No address' }}</p>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-green-600">
                    {{ formatCurrency(prospect.revenue || 0) }}
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
                  class="text-gray-400 hover:text-primary-600"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click.stop="$emit('delete', prospect)"
                  class="text-gray-400 hover:text-red-600"
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps({
  prospects: Array,
  loading: Boolean,
  selectedProspect: Object
})

const emit = defineEmits(['edit', 'delete', 'reorder', 'select'])

const localProspects = ref([])

watch(() => props.prospects, (newProspects) => {
  localProspects.value = [...newProspects]
}, { immediate: true })

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
