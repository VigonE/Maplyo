<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
    style="z-index: 9999;"
    @click="closeModal"
  >
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
      <div class="mt-3">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ prospect ? 'Edit Lead' : 'New Lead' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label for="company" class="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              id="company"
              v-model="form.company"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label for="position" class="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <input
              id="position"
              v-model="form.position"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label for="address" class="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              id="address"
              v-model="form.address"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Complete address for geolocation"
            ></textarea>
          </div>

          <div>
            <label for="revenue" class="block text-sm font-medium text-gray-700 mb-1">
              Revenue ($)
            </label>
            <input
              id="revenue"
              v-model.number="form.revenue"
              type="number"
              min="0"
              step="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label for="probability" class="block text-sm font-medium text-gray-700 mb-1">
              Probability (%)
            </label>
            <div class="relative">
              <input
                id="probability"
                v-model.number="form.probability_coefficient"
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="100"
                class="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <span class="absolute right-3 top-2 text-gray-500">%</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">Leave empty for 100% (certain deal)</p>
          </div>

          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              v-model="form.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="cold">Cold</option>
              <option value="warm">Warm</option>
              <option value="hot">Hot</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div>
            <label for="tab" class="block text-sm font-medium text-gray-700 mb-1">
              Onglet
            </label>
            <select
              id="tab"
              v-model="form.tabId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option v-for="tab in availableTabs" :key="tab.id" :value="tab.id">
                {{ tab.name }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              Choose which tab to display this lead
            </p>
          </div>

          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Additional notes..."
            ></textarea>
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {{ loading ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import { useProspectsStore } from '@/stores/prospects'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const props = defineProps({
  show: Boolean,
  prospect: Object,
  currentTabId: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)
const error = ref('')
const availableTabsRef = ref([])
const authStore = useAuthStore()

// Fonction pour charger les onglets depuis l'API
const loadAvailableTabs = async () => {
  try {
    console.log('📋 Loading available tabs from API...')
    const response = await axios.get('/api/tabs', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    // Filtrer pour ne garder que les onglets non-spéciaux pour l'assignation
    availableTabsRef.value = response.data.filter(tab => !tab.is_special)
    console.log('📋 Available tabs for assignment:', availableTabsRef.value)
    
    // Si on crée un nouveau prospect et qu'on n'a pas encore de tabId, utiliser le premier onglet disponible
    if (!props.prospect && !form.tabId && availableTabsRef.value.length > 0) {
      // Essayer d'utiliser l'onglet actuel ou le premier disponible
      const defaultTab = availableTabsRef.value.find(t => t.id === props.currentTabId) || availableTabsRef.value[0]
      form.tabId = defaultTab.id
      console.log('📋 Set default tab for new prospect:', defaultTab.name)
    }
  } catch (error) {
    console.error('❌ Error loading tabs:', error)
    availableTabsRef.value = []
  }
}

// Écouter les changements d'onglets
const handleTabsChanged = () => {
  console.log('📋 ProspectModal: Received tabsChanged event, reloading tabs')
  loadAvailableTabs()
}

// Computed pour les onglets disponibles
const availableTabs = computed(() => availableTabsRef.value)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  position: '',
  address: '',
  revenue: 0,
  probability_coefficient: 100,
  status: 'cold',
  tabId: '',
  notes: ''
})

// Lifecycle hooks
onMounted(() => {
  loadAvailableTabs()
  window.addEventListener('tabsChanged', handleTabsChanged)
})

onUnmounted(() => {
  window.removeEventListener('tabsChanged', handleTabsChanged)
})

watch(() => props.prospect, (newLead) => {
  if (newLead) {
    Object.assign(form, {
      name: newLead.name || '',
      email: newLead.email || '',
      phone: newLead.phone || '',
      company: newLead.company || '',
      position: newLead.position || '',
      address: newLead.address || '',
      revenue: newLead.revenue || 0,
      probability_coefficient: newLead.probability_coefficient || 100,
      status: newLead.status || 'cold',
      tabId: newLead.tab_id || newLead.tabId || '',
      notes: newLead.notes || ''
    })
  } else {
    // Reset form for new lead
    Object.assign(form, {
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      address: '',
      revenue: 0,
      probability_coefficient: 100,
      status: 'cold',
      tabId: '',
      notes: ''
    })
    // Re-set default tab for new prospect
    if (availableTabsRef.value.length > 0) {
      const defaultTab = availableTabsRef.value.find(t => t.id === props.currentTabId) || availableTabsRef.value[0]
      form.tabId = defaultTab.id
    }
  }
}, { immediate: true })

// Watch pour currentTabId
watch(() => props.currentTabId, (newTabId) => {
  if (!props.prospect && newTabId && availableTabsRef.value.length > 0) {
    // Pour un nouveau lead, mettre à jour le tabId si l'onglet existe
    const targetTab = availableTabsRef.value.find(t => t.id === newTabId)
    if (targetTab) {
      form.tabId = targetTab.id
      console.log('Updated form tabId to:', targetTab.id)
    }
  }
})

function closeModal() {
  error.value = ''
  emit('close')
}

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    // Debug: vérifier les valeurs
    console.log('Form data:', { ...form })
    console.log('Current tab ID:', props.currentTabId)
    
    // Utilisons le store directement dans le modal
    const prospectsStore = useProspectsStore()
    
    let result;
    if (props.prospect) {
      // Mode édition
      result = await prospectsStore.updateProspect(props.prospect.id, { ...form })
    } else {
      // Mode création
      const prospectData = { 
        ...form,
        tabId: form.tabId || (availableTabsRef.value.length > 0 ? availableTabsRef.value[0].id : '')
      }
      console.log('Creating prospect with data:', prospectData)
      result = await prospectsStore.createProspect(prospectData)
    }

    if (result.success) {
      emit('close')
    } else {
      error.value = result.error
    }
  } catch (err) {
    error.value = err.message || 'Error saving lead'
  } finally {
    loading.value = false
  }
}
</script>
