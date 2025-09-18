<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
    style="z-index: 10000;"
    @click="closeModal"
  >
    <div 
      class="relative top-8 mx-auto p-6 border w-11/12 max-w-5xl shadow-lg rounded-lg bg-white" 
      @click.stop
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center">
          <div v-if="prospect" class="w-3 h-3 rounded-full mr-3" :class="getStatusColor(prospect.status)"></div>
          <h3 class="text-2xl font-bold text-gray-900">
            {{ prospect ? prospect.name : 'New Lead' }}
          </h3>
          <span v-if="prospect" class="ml-3 px-3 py-1 text-sm rounded-full" :class="getStatusBadge(prospect.status)">
            {{ prospect.status?.toUpperCase() }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button 
            v-if="prospect"
            @click="openEditModal" 
            class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit in full modal"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left Column - Basic Info -->
        <div class="space-y-6">
          <!-- Contact Info -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-lg font-semibold text-gray-800 mb-4">Contact Information</h4>
            <div class="space-y-4">
              <!-- Name -->
              <div class="flex items-center">
                <label class="w-20 text-sm font-medium text-gray-600">Name:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.name && prospect" class="text-gray-900">{{ form.name }}</span>
                  <input 
                    v-if="editing.name || !prospect"
                    v-model="form.name"
                    type="text"
                    required
                    placeholder="Enter prospect name"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="prospect ? saveField('name') : null"
                    @keyup.enter="prospect ? saveField('name') : null"
                  >
                  <button 
                    v-if="prospect"
                    @click="toggleEdit('name')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Email -->
              <div class="flex items-center">
                <label class="w-20 text-sm font-medium text-gray-600">Email:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.email && prospect" class="text-gray-900">{{ form.email || 'No email' }}</span>
                  <input 
                    v-if="editing.email || !prospect"
                    v-model="form.email"
                    type="email"
                    placeholder="Enter email address"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="prospect ? saveField('email') : null"
                    @keyup.enter="prospect ? saveField('email') : null"
                  >
                  <button 
                    v-if="prospect"
                    @click="toggleEdit('email')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Phone -->
              <div class="flex items-center">
                <label class="w-20 text-sm font-medium text-gray-600">Phone:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.phone && prospect" class="text-gray-900">{{ form.phone || 'No phone' }}</span>
                  <input 
                    v-if="editing.phone || !prospect"
                    v-model="form.phone"
                    type="tel"
                    placeholder="Enter phone number"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="prospect ? saveField('phone') : null"
                    @keyup.enter="prospect ? saveField('phone') : null"
                  >
                  <button 
                    v-if="prospect"
                    @click="toggleEdit('phone')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Company -->
              <div class="flex items-center">
                <label class="w-20 text-sm font-medium text-gray-600">Company:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.company && prospect" class="text-gray-900">{{ form.company || 'No company' }}</span>
                  <input 
                    v-if="editing.company || !prospect"
                    v-model="form.company"
                    type="text"
                    placeholder="Enter company name"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="prospect ? saveField('company') : null"
                    @keyup.enter="prospect ? saveField('company') : null"
                  >
                  <button 
                    v-if="prospect"
                    @click="toggleEdit('company')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Contact -->
              <div class="flex items-center">
                <label class="w-20 text-sm font-medium text-gray-600">Contact:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.contact && prospect" class="text-gray-900">{{ form.contact || 'No contact' }}</span>
                  <input 
                    v-if="editing.contact || !prospect"
                    v-model="form.contact"
                    type="text"
                    placeholder="Enter contact person"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="prospect ? saveField('contact') : null"
                    @keyup.enter="prospect ? saveField('contact') : null"
                  >
                  <button 
                    v-if="prospect"
                    @click="toggleEdit('contact')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Address -->
              <div class="flex items-center">
                <label class="w-20 text-sm font-medium text-gray-600">Address:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.address && prospect" class="text-gray-900">{{ form.address || 'No address' }}</span>
                  <textarea 
                    v-if="editing.address || !prospect"
                    v-model="form.address"
                    rows="2"
                    placeholder="Complete address for geolocation"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="prospect ? saveField('address') : null"
                  ></textarea>
                  <button 
                    v-if="prospect"
                    @click="toggleEdit('address')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Tab Selection -->
              <div class="flex items-center">
                <label class="w-20 text-sm font-medium text-gray-600">Tab:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.tabId && prospect" class="text-gray-900">
                    {{ getTabName(form.tabId) || 'No tab' }}
                  </span>
                  <select 
                    v-if="editing.tabId || !prospect"
                    v-model="form.tabId"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="prospect ? saveField('tabId') : null"
                    @change="prospect ? saveField('tabId') : null"
                  >
                    <option v-for="tab in availableTabs" :key="tab.id" :value="tab.id">
                      {{ tab.name }}
                    </option>
                  </select>
                  <button 
                    v-if="prospect"
                    @click="toggleEdit('tabId')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Business Info -->
          <div class="bg-green-50 rounded-lg p-4">
            <h4 class="text-lg font-semibold text-gray-800 mb-4">Business Information</h4>
            <div class="space-y-4">
              <!-- Revenue -->
              <div class="flex items-center">
                <label class="w-24 text-sm font-medium text-gray-600">Revenue:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.revenue" class="text-green-700 font-semibold">{{ formatCurrency(form.revenue || 0) }}</span>
                  <input 
                    v-else 
                    v-model.number="form.revenue"
                    type="number"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="saveField('revenue')"
                    @keyup.enter="saveField('revenue')"
                  >
                  <button 
                    @click="toggleEdit('revenue')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Probability -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-600 flex items-center justify-between">
                  <span>Probability:</span>
                  <span class="text-lg font-bold text-blue-600">{{ form.probability_coefficient || 100 }}%</span>
                </label>
                <div class="relative">
                  <input 
                    v-model.number="form.probability_coefficient"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    @input="onProbabilityChange"
                    :style="{ background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${form.probability_coefficient || 100}%, #E5E7EB ${form.probability_coefficient || 100}%, #E5E7EB 100%)` }"
                  >
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <!-- Estimated Date -->
              <div class="flex items-center">
                <label class="w-24 text-sm font-medium text-gray-600">Est. Date:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.estimated_completion_date" class="text-purple-700">
                    {{ form.estimated_completion_date ? formatDate(form.estimated_completion_date) : 'No date set' }}
                  </span>
                  <input 
                    v-else 
                    v-model="form.estimated_completion_date"
                    type="date"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="saveField('estimated_completion_date')"
                    @keyup.enter="saveField('estimated_completion_date')"
                  >
                  <button 
                    @click="toggleEdit('estimated_completion_date')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Status -->
              <div class="flex items-center">
                <label class="w-24 text-sm font-medium text-gray-600">Status:</label>
                <div class="flex-1 flex items-center">
                  <select 
                    v-model="form.status"
                    @change="saveField('status')"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cold">❄️ COLD</option>
                    <option value="warm">🌡️ WARM</option>
                    <option value="hot">🔥 HOT</option>
                    <option value="recurring">🔄 RECURRING</option>
                    <option value="won">✅ WON</option>
                    <option value="lost">❌ LOST</option>
                  </select>
                </div>
              </div>

              <!-- Recurring Settings - show only if status is recurring -->
              <div v-if="form.status === 'recurring'" class="space-y-4 border-t pt-4 mt-4">
                <h5 class="font-medium text-purple-800 flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Recurring Settings
                </h5>
                
                <!-- Recurrence Interval -->
                <div class="flex items-center">
                  <label class="w-24 text-sm font-medium text-gray-600">Interval:</label>
                  <div class="flex-1 flex items-center">
                    <span v-if="!editing.recurrence_months" class="text-purple-700">
                      {{ getRecurrenceText(form.recurrence_months) }}
                    </span>
                    <select 
                      v-else 
                      v-model.number="form.recurrence_months"
                      class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @blur="saveField('recurrence_months')"
                      @change="saveField('recurrence_months')"
                    >
                      <option :value="1">Every month</option>
                      <option :value="2">Every 2 months</option>
                      <option :value="3">Every 3 months (Quarterly)</option>
                      <option :value="6">Every 6 months</option>
                      <option :value="12">Every 12 months (Yearly)</option>
                      <option :value="24">Every 24 months</option>
                    </select>
                    <button 
                      @click="toggleEdit('recurrence_months')"
                      class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Next Followup Date -->
                <div class="flex items-center">
                  <label class="w-24 text-sm font-medium text-gray-600">Next Due:</label>
                  <div class="flex-1 flex items-center">
                    <span v-if="!editing.next_followup_date" class="text-purple-700">
                      {{ form.next_followup_date ? formatDate(form.next_followup_date) : 'No date set' }}
                    </span>
                    <input 
                      v-else 
                      v-model="form.next_followup_date"
                      type="date"
                      class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @blur="saveField('next_followup_date')"
                      @keyup.enter="saveField('next_followup_date')"
                    >
                    <button 
                      @click="toggleEdit('next_followup_date')"
                      class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Notes -->
        <div class="space-y-6">
          <div class="bg-blue-50 rounded-lg p-4 h-full">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-800">Notes</h4>
              <button 
                v-if="prospect"
                @click="toggleEdit('notes')"
                class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {{ editing.notes ? 'Save Notes' : 'Edit Notes' }}
              </button>
            </div>
            
            <div class="h-96">
              <!-- Display mode -->
              <div 
                v-if="!editing.notes && prospect" 
                class="h-full p-3 bg-white rounded border overflow-y-auto"
                v-html="form.notes || '<em class=\'text-gray-500\'>No notes yet...</em>'"
              ></div>
              
              <!-- Edit mode or new prospect mode -->
              <RichTextEditor
                v-if="editing.notes || !prospect"
                v-model="form.notes"
                placeholder="Add your notes here..."
                class="h-80"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Weighted Revenue: <span class="font-semibold text-green-600">{{ formatCurrency(getWeightedRevenue()) }}</span>
        </div>
        <div class="flex space-x-3">
          <button 
            @click="closeModal"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            v-if="!prospect"
            @click="createProspect"
            :disabled="!form.name.trim()"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Lead
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import { useProspectsStore } from '../stores/prospects'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import RichTextEditor from './RichTextEditor.vue'

const props = defineProps({
  show: Boolean,
  prospect: Object,
  currentTabId: {
    type: String,
    default: 'default'
  },
  initialStatus: {
    type: String,
    default: 'cold'
  }
})

const emit = defineEmits(['close', 'save', 'edit'])

const prospectsStore = useProspectsStore()
const authStore = useAuthStore()
const availableTabsRef = ref([])

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
  console.log('📋 FunnelProspectModal: Received tabsChanged event, reloading tabs')
  loadAvailableTabs()
}

// Computed pour les onglets disponibles
const availableTabs = computed(() => availableTabsRef.value)

// Lifecycle hooks
onMounted(() => {
  loadAvailableTabs()
  window.addEventListener('tabsChanged', handleTabsChanged)
})

onUnmounted(() => {
  window.removeEventListener('tabsChanged', handleTabsChanged)
})

// Form data
const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  contact: '',
  address: '',
  status: props.initialStatus || 'cold',
  revenue: 0,
  probability_coefficient: 100,
  notes: '',
  estimated_completion_date: '',
  recurrence_months: 12,
  next_followup_date: '',
  tabId: ''
})

// Editing state for each field
const editing = reactive({
  name: false,
  email: false,
  phone: false,
  company: false,
  contact: false,
  address: false,
  revenue: false,
  probability_coefficient: false,
  estimated_completion_date: false,
  status: false,
  notes: false,
  recurrence_months: false,
  next_followup_date: false,
  tabId: false
})

// Watch for prospect changes
watch(() => props.prospect, (newProspect) => {
  if (newProspect) {
    Object.assign(form, {
      name: newProspect.name || '',
      email: newProspect.email || '',
      phone: newProspect.phone || '',
      company: newProspect.company || '',
      contact: newProspect.contact || newProspect.position || '',
      address: newProspect.address || '',
      status: newProspect.status || 'cold',
      revenue: newProspect.revenue || 0,
      probability_coefficient: newProspect.probability_coefficient || 100,
      notes: newProspect.notes || '',
      estimated_completion_date: newProspect.estimated_completion_date || '',
      recurrence_months: newProspect.recurrence_months || 12,
      next_followup_date: newProspect.next_followup_date || '',
      tabId: newProspect.tab_id || newProspect.tabId || ''
    })
  } else {
    // Reset form for new prospect
    Object.assign(form, {
      name: '',
      email: '',
      phone: '',
      company: '',
      contact: '',
      address: '',
      status: props.initialStatus || 'cold',
      revenue: 0,
      probability_coefficient: 100,
      notes: '',
      estimated_completion_date: '',
      recurrence_months: 12,
      next_followup_date: '',
      tabId: ''
    })
    // Re-set default tab for new prospect
    if (availableTabsRef.value.length > 0) {
      const defaultTab = availableTabsRef.value.find(t => t.id === props.currentTabId) || availableTabsRef.value[0]
      form.tabId = defaultTab.id
    }
  }
}, { immediate: true })

// Watch for initialStatus changes (for new prospects)
watch(() => props.initialStatus, (newStatus) => {
  if (!props.prospect && newStatus) {
    form.status = newStatus
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

// Toggle edit mode for a field
function toggleEdit(field) {
  if (editing[field]) {
    // Currently editing, save the field
    saveField(field)
  } else {
    // Start editing
    editing[field] = true
    
    // For date field, ensure we have the current value in the form
    if (field === 'estimated_completion_date') {
      console.log(`📅 Starting edit for date. Current prospect value: ${props.prospect.estimated_completion_date}`)
      console.log(`📅 Current form value: ${form.estimated_completion_date}`)
      
      // Sync form with prospect if they differ
      if (form.estimated_completion_date !== props.prospect.estimated_completion_date) {
        form.estimated_completion_date = props.prospect.estimated_completion_date || ''
        console.log(`📅 Synced form date to: ${form.estimated_completion_date}`)
      }
    }
  }
}

// Save a specific field
async function saveField(field) {
  try {
    console.log(`🔄 Saving field '${field}' with value:`, form[field])
    
    const updateData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
      contact: form.contact,
      address: form.address,
      status: form.status,
      revenue: form.revenue,
      probability_coefficient: form.probability_coefficient,
      notes: form.notes,
      estimated_completion_date: form.estimated_completion_date,
      recurrence_months: form.recurrence_months,
      next_followup_date: form.next_followup_date,
      tabId: form.tabId || props.prospect?.tabId || props.prospect?.tab_id || 'default'
    }

    console.log(`🔄 Full update data for ${field}:`, updateData)
    
    // Pour les nouveaux prospects, on utilise createProspect au lieu d'updateProspect
    let result;
    if (props.prospect && props.prospect.id) {
      // Mode édition
      result = await prospectsStore.updateProspect(props.prospect.id, updateData)
    } else {
      // Mode création
      console.log('Creating prospect with data:', updateData)
      result = await prospectsStore.createProspect(updateData)
      
      if (result.success) {
        // Update the form with the new prospect data
        Object.assign(form, result.prospect)
        emit('save', result.prospect)
        return
      }
    }
    
    if (result.success) {
      // Update the original prospect object
      Object.assign(props.prospect, form)
      editing[field] = false
      
      // Force reactivity update for the specific field
      if (field === 'estimated_completion_date') {
        console.log(`✅ Successfully saved estimated_completion_date: ${form.estimated_completion_date}`)
        console.log(`📅 Updated prospect object:`, props.prospect.estimated_completion_date)
      }
      
      // Log spécial pour les champs de récurrence
      if (field === 'recurrence_months' || field === 'next_followup_date') {
        console.log(`✅ Successfully saved recurring field '${field}':`, form[field])
      }
      
      console.log(`✅ Updated ${field} for ${props.prospect.name}`)
    } else {
      console.error('❌ Failed to update prospect:', result.error)
    }
  } catch (error) {
    console.error('❌ Error updating prospect:', error)
  }
}

// Handle probability change with debounced saving
let probabilityTimeout = null
function onProbabilityChange() {
  // Clear existing timeout
  if (probabilityTimeout) {
    clearTimeout(probabilityTimeout)
  }
  
  // Set new timeout to save after 500ms of no changes
  probabilityTimeout = setTimeout(() => {
    saveField('probability_coefficient')
  }, 500)
}

// Close modal
function closeModal() {
  // Save notes if they were being edited
  if (editing.notes && props.prospect) {
    saveField('notes')
  }
  emit('close')
}

// Create new prospect
async function createProspect() {
  try {
    console.log('🆕 Creating new prospect with data:', form)
    
    const prospectData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
      contact: form.contact,
      address: form.address,
      status: form.status,
      revenue: form.revenue,
      probability_coefficient: form.probability_coefficient,
      notes: form.notes,
      estimated_completion_date: form.estimated_completion_date,
      recurrence_months: form.recurrence_months,
      next_followup_date: form.next_followup_date,
      tabId: form.tabId || (availableTabsRef.value.length > 0 ? availableTabsRef.value[0].id : '')
    }

    const result = await prospectsStore.createProspect(prospectData)
    
    if (result.success) {
      console.log('✅ Successfully created prospect:', result.prospect)
      emit('save', result.prospect)
      emit('close')
    } else {
      console.error('❌ Failed to create prospect:', result.error)
    }
  } catch (error) {
    console.error('❌ Error creating prospect:', error)
  }
}

// Open edit modal
function openEditModal() {
  // Save any pending changes first
  if (editing.notes) {
    saveField('notes')
  }
  // Emit to parent to open the classic edit modal
  emit('edit', props.prospect)
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0)
}

function formatDate(dateString) {
  if (!dateString) return ''
  console.log(`📅 Formatting date: ${dateString}`)
  const date = new Date(dateString)
  const formatted = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
  console.log(`📅 Formatted result: ${formatted}`)
  return formatted
}

function getRecurrenceText(months) {
  if (!months) return 'Not set'
  
  const texts = {
    1: 'Every month',
    2: 'Every 2 months',
    3: 'Every 3 months (Quarterly)',
    6: 'Every 6 months',
    12: 'Every 12 months (Yearly)',
    24: 'Every 24 months'
  }
  
  return texts[months] || `Every ${months} months`
}

function getTabName(tabId) {
  if (!tabId) return 'No tab'
  const tab = availableTabsRef.value.find(t => t.id === tabId)
  return tab ? tab.name : 'Unknown tab'
}

function getWeightedRevenue() {
  return (form.revenue || 0) * (form.probability_coefficient || 100) / 100
}

function getStatusColor(status) {
  const colors = {
    hot: 'bg-red-500',
    warm: 'bg-yellow-500',
    cold: 'bg-blue-500',
    recurring: 'bg-purple-500',
    won: 'bg-green-500',
    lost: 'bg-gray-500'
  }
  return colors[status] || 'bg-gray-500'
}

function getStatusBadge(status) {
  const badges = {
    hot: 'bg-red-100 text-red-800',
    warm: 'bg-yellow-100 text-yellow-800',
    cold: 'bg-blue-100 text-blue-800',
    recurring: 'bg-purple-100 text-purple-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-gray-100 text-gray-800'
  }
  return badges[status] || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
/* Custom slider styles */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #3B82F6;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  background: #2563EB;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #3B82F6;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  background: #2563EB;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.slider:focus {
  outline: none;
}
</style>