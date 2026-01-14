<template>
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
            <span v-html="highlightSearchTerm(prospect.name, searchQuery)"></span>
          </h3>
          <!-- Company name badge -->
          <span
            v-if="prospect.company"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 flex-shrink-0"
            :title="'Company: ' + prospect.company"
          >
            🏢 {{ prospect.company }}
          </span>
          <!-- Badge d'onglet d'origine -->
          <button
            v-if="isAllLeadsView && getProspectTabName(prospect)"
            @click.stop="navigateToProspectTab(prospect)"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 flex-shrink-0 transition-colors cursor-pointer"
            :title="'Click to go to tab: ' + getProspectTabName(prospect)"
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {{ getProspectTabName(prospect) }}
          </button>
        </div>
        
        <p class="text-xs text-gray-500 mb-2 truncate">
          📍 <span v-html="highlightSearchTerm(prospect.address || 'No address', searchQuery)"></span>
        </p>
        
        <div class="space-y-2">
          <!-- Revenue Information -->
          <div v-if="!editingRevenue && !editingProbability && !editingDate" class="space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Revenue:</span>
              <div class="flex items-center gap-1">
                <span class="text-sm font-medium text-gray-700">
                  {{ formatCurrency(prospect.revenue || 0) }}
                </span>
                <button
                  @click.stop="startEditingRevenue()"
                  class="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                  title="Edit amount"
                >
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Probability:</span>
              <div class="flex items-center gap-1">
                <span class="text-sm font-medium text-blue-600">
                  {{ prospect.probability_coefficient !== undefined ? prospect.probability_coefficient : 100 }}%
                </span>
                <button
                  @click.stop="startEditingProbability()"
                  class="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                  title="Edit probability"
                >
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="flex items-center justify-between border-t pt-1">
              <span class="text-xs font-medium text-gray-700">Weighted Revenue:</span>
              <span class="text-sm font-bold text-green-600">
                💰 {{ formatCurrency(getWeightedRevenue(prospect)) }}
              </span>
            </div>
          </div>
          
          <!-- Date prévisionnelle - TEST OUTSIDE CONDITION -->
          <div class="flex items-center justify-between border-t pt-1" style="background-color: #ffff00; color: #000000;">
            <span class="text-xs text-gray-500">Estimated date:</span>
            <div class="flex items-center gap-1">
              <span class="text-sm font-medium text-purple-600">
                📅 TEST DATE VISIBLE
              </span>
              <button
                @click.stop="startEditingDate()"
                class="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                title="Edit estimated date"
              >
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Revenue Editing Mode -->
          <div v-if="editingRevenue" class="space-y-2">
            <div class="flex items-center gap-2 w-full">
              <span class="text-sm">💰</span>
              <input
                v-model.number="tempRevenue"
                type="number"
                min="0"
                step="1"
                ref="revenueInput"
                @keydown="handleRevenueKeydown"
                @blur="saveRevenue()"
                @click.stop
                class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Amount"
              />
              <button
                @click.stop="saveRevenue()"
                class="text-green-600 hover:text-green-700 p-1"
                title="Validate"
              >
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                @click.stop="cancelEditingRevenue()"
                class="text-red-600 hover:text-red-700 p-1"
                title="Cancel"
              >
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="text-xs text-gray-500">
              Probability: {{ prospect.probability_coefficient !== undefined ? prospect.probability_coefficient : 100 }}% • 
              Weighted: {{ formatCurrency((tempRevenue || 0) * (prospect.probability_coefficient !== undefined ? prospect.probability_coefficient : 100) / 100) }}
            </div>
          </div>
          
          <!-- Probability Editing Mode -->
          <div v-else-if="editingProbability" class="space-y-2">
            <div class="flex items-center gap-2 w-full">
              <span class="text-sm">📊</span>
              <input
                v-model.number="tempProbability"
                type="number"
                min="0"
                max="100"
                step="1"
                ref="probabilityInput"
                @keydown="handleProbabilityKeydown"
                @blur="saveProbability()"
                @click.stop
                class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Probability %"
              />
              <span class="text-sm text-gray-500">%</span>
              <button
                @click.stop="saveProbability()"
                class="text-green-600 hover:text-green-700 p-1"
                title="Validate"
              >
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                @click.stop="cancelEditingProbability()"
                class="text-red-600 hover:text-red-700 p-1"
                title="Cancel"
              >
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="text-xs text-gray-500">
              Revenue: {{ formatCurrency(prospect.revenue || 0) }} • 
              Weighted: {{ formatCurrency((prospect.revenue || 0) * (tempProbability || 0) / 100) }}
            </div>
          </div>
          
          <!-- Date Editing Mode -->
          <div v-else-if="editingDate" class="space-y-2">
            <div class="flex items-center gap-2 w-full">
              <span class="text-sm">📅</span>
              <input
                v-model="tempDate"
                type="date"
                ref="dateInput"
                @keydown="handleDateKeydown"
                @blur="saveDate()"
                @click.stop
                class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                @click.stop="saveDate()"
                class="text-green-600 hover:text-green-700 p-1"
                title="Validate"
              >
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                @click.stop="cancelEditingDate()"
                class="text-red-600 hover:text-red-700 p-1"
                title="Cancel"
              >
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="text-xs text-gray-500">
              Select the estimated completion date for this prospect
            </div>
          </div>
        </div>
        
        <!-- Section des notes simplifiée -->
        <div class="mt-2">
          <div class="bg-gray-50 border border-gray-200 rounded-md p-2 min-h-[30px] cursor-pointer hover:bg-gray-100 transition-colors"
               @click.stop="openNotesModal()"
               title="Click to view/edit notes">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div v-if="prospect.notes && prospect.notes.trim()" 
                     class="text-xs text-gray-700 leading-relaxed break-words truncate max-w-full">
                  {{ getPlainTextFromHtml(prospect.notes) }}
                </div>
                <div v-else class="text-xs text-gray-400 italic">
                  Click to add notes...
                </div>
              </div>
              <div class="flex-shrink-0 ml-1">
                <svg class="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-1 ml-4">
        <button
          @click.stop="$emit('edit', prospect)"
          class="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
          title="Edit"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          @click.stop="$emit('delete', prospect)"
          class="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
          title="Delete"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal simple pour les notes -->
  <teleport to="body">
    <div v-if="showNotesModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeNotesModal">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] m-4 flex flex-col" @click.stop>
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">{{ prospect.name }} - Notes</h3>
          <button @click="closeNotesModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <textarea
            v-model="tempNotes"
            class="w-full h-full min-h-[300px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Add your notes here..."
            @keydown.ctrl.enter="saveNotes"
            @keydown.meta.enter="saveNotes"
          ></textarea>
        </div>
        <div class="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            @click="closeNotesModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="saveNotes"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Save (Ctrl+Enter)
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useProspectsStore } from '../stores/prospects'

const props = defineProps({
  prospect: {
    type: Object,
    required: true
  },
  isAllLeadsView: {
    type: Boolean,
    default: false
  },
  allTabs: {
    type: Array,
    default: () => []
  },
  searchQuery: {
    type: String,
    default: ''
  },
  selectedProspect: Object
})

const emit = defineEmits(['select', 'edit', 'delete', 'navigate-to-tab', 'update-prospect'])

const prospectsStore = useProspectsStore()

// États d'édition
const editingRevenue = ref(false)
const editingProbability = ref(false)
const editingDate = ref(false)
const tempRevenue = ref(0)
const tempProbability = ref(0)
const tempDate = ref('')
const revenueInput = ref(null)
const probabilityInput = ref(null)
const dateInput = ref(null)

// Notes modal
const showNotesModal = ref(false)
const tempNotes = ref('')

// Fonction pour calculer le revenu pondéré
const getWeightedRevenue = (prospect) => {
  return prospectsStore.getWeightedRevenue(prospect)
}

// Fonction pour obtenir le nom de l'onglet d'origine
const getProspectTabName = (prospect) => {
  if (!props.isAllLeadsView) return null
  
  const prospectTabId = prospect.tabId || prospect.tab_id
  if (!prospectTabId || prospectTabId === 'default') {
    return 'Main Pipeline'
  }
  
  const tab = props.allTabs.find(t => t.id === prospectTabId)
  return tab ? tab.name : 'Unknown Tab'
}

// Navigation vers l'onglet d'origine
const navigateToProspectTab = (prospect) => {
  const prospectTabId = prospect.tabId || prospect.tab_id
  if (prospectTabId && prospectTabId !== 'default') {
    emit('navigate-to-tab', prospectTabId, prospect.id)
  }
}

// Mise en évidence des termes de recherche
const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !text) return text
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}

// Édition du montant
const startEditingRevenue = () => {
  editingRevenue.value = true
  tempRevenue.value = props.prospect.revenue || 0
  nextTick(() => {
    if (revenueInput.value) {
      revenueInput.value.focus()
      revenueInput.value.select()
    }
  })
}

const cancelEditingRevenue = () => {
  editingRevenue.value = false
  tempRevenue.value = 0
}

const saveRevenue = async () => {
  if (tempRevenue.value !== props.prospect.revenue) {
    emit('update-prospect', props.prospect.id, { revenue: tempRevenue.value })
  }
  editingRevenue.value = false
}

const handleRevenueKeydown = (event) => {
  if (event.key === 'Enter') {
    saveRevenue()
  } else if (event.key === 'Escape') {
    cancelEditingRevenue()
  }
}

// Édition de la probabilité
const startEditingProbability = () => {
  editingProbability.value = true
  tempProbability.value = props.prospect.probability_coefficient !== undefined ? props.prospect.probability_coefficient : 100
  nextTick(() => {
    if (probabilityInput.value) {
      probabilityInput.value.focus()
      probabilityInput.value.select()
    }
  })
}

const cancelEditingProbability = () => {
  editingProbability.value = false
  tempProbability.value = 0
}

const saveProbability = async () => {
  const validProbability = Math.max(0, Math.min(100, tempProbability.value))
  if (validProbability !== props.prospect.probability_coefficient) {
    emit('update-prospect', props.prospect.id, { probability_coefficient: validProbability })
  }
  editingProbability.value = false
}

const handleProbabilityKeydown = (event) => {
  if (event.key === 'Enter') {
    saveProbability()
  } else if (event.key === 'Escape') {
    cancelEditingProbability()
  }
}

// Édition de la date prévisionnelle
const startEditingDate = () => {
  editingDate.value = true
  tempDate.value = formatDateForInput(props.prospect.estimated_completion_date)
  nextTick(() => {
    if (dateInput.value) {
      dateInput.value.focus()
    }
  })
}

const cancelEditingDate = () => {
  editingDate.value = false
  tempDate.value = ''
}

const saveDate = async () => {
  const dateToSave = tempDate.value || null
  if (dateToSave !== props.prospect.estimated_completion_date) {
    emit('update-prospect', props.prospect.id, { estimated_completion_date: dateToSave })
  }
  editingDate.value = false
}

const handleDateKeydown = (event) => {
  if (event.key === 'Enter') {
    saveDate()
  } else if (event.key === 'Escape') {
    cancelEditingDate()
  }
}

// Fonction pour formater la date pour l'input
const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

// Fonction pour formater la date d'affichage
const formatEstimatedDate = (dateString) => {
  if (!dateString) return 'Non définie'
  
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = date - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const formatted = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  
  if (diffDays < 0) {
    return `${formatted} (${Math.abs(diffDays)}j passés)`
  } else if (diffDays === 0) {
    return `${formatted} (Aujourd'hui)`
  } else if (diffDays === 1) {
    return `${formatted} (Demain)`
  } else if (diffDays <= 30) {
    return `${formatted} (${diffDays}j)`
  } else if (diffDays <= 365) {
    const months = Math.round(diffDays / 30)
    return `${formatted} (${months}m)`
  } else {
    return formatted
  }
}

// Gestion des notes
const openNotesModal = () => {
  showNotesModal.value = true
  tempNotes.value = getPlainTextFromHtml(props.prospect.notes || '')
}

const closeNotesModal = () => {
  showNotesModal.value = false
  tempNotes.value = ''
}

const saveNotes = async () => {
  if (tempNotes.value !== getPlainTextFromHtml(props.prospect.notes || '')) {
    emit('update-prospect', props.prospect.id, { notes: tempNotes.value })
  }
  closeNotesModal()
}

// Fonction pour nettoyer le HTML et obtenir le texte brut
const getPlainTextFromHtml = (html) => {
  if (!html) return ''
  
  const div = document.createElement('div')
  div.innerHTML = html
  
  // Remplacer les balises par des équivalents texte
  div.innerHTML = div.innerHTML.replace(/<br\s*\/?>/gi, '\n')
  div.innerHTML = div.innerHTML.replace(/<\/p>/gi, '\n')
  div.innerHTML = div.innerHTML.replace(/<li>/gi, '• ')
  div.innerHTML = div.innerHTML.replace(/<\/li>/gi, '\n')
  
  let text = div.textContent || div.innerText || ''
  text = text.replace(/\n\s*\n/g, '\n').trim()
  
  return text
}

// Formater les devises
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
</script>

<style scoped>
mark {
  background-color: #fef3c7;
  color: #92400e;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-weight: 500;
}
</style>
