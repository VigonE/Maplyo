<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeModal"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <!-- Header -->
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  📊 CSV Import
                </h3>
                <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <!-- File Upload Section -->
              <div v-if="!csvData.length && !isImporting" class="space-y-6">
                <!-- Drag & Drop Area -->
                <div 
                  @drop="handleDrop"
                  @dragover.prevent
                  @dragenter.prevent
                  :class="[
                    'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  ]"
                  @dragenter="isDragging = true"
                  @dragleave="isDragging = false"
                >
                  <div class="flex flex-col items-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="mt-4">
                      <p class="text-lg font-medium text-gray-900">Drop your CSV file here</p>
                      <p class="text-sm text-gray-500 mt-2">or</p>
                    </div>
                    <button 
                      @click="$refs.fileInput.click()"
                      class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      📁 Browse Files
                    </button>
                  </div>
                </div>

                <!-- Hidden file input -->
                <input 
                  ref="fileInput"
                  type="file" 
                  accept=".csv" 
                  class="hidden" 
                  @change="handleFileSelect"
                >

                <!-- Sample CSV format info -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-gray-900 mb-2">💡 Supported CSV formats:</h4>
                  <div class="text-xs text-gray-600 font-mono bg-white p-2 rounded border mb-2">
                    <strong>Format 1 (with semicolon):</strong><br>
                    NAME;ADDRESS;REVENUE<br>
                    "Company Name";Paris;126369,39
                  </div>
                  <div class="text-xs text-gray-600 font-mono bg-white p-2 rounded border">
                    <strong>Format 2 (with comma):</strong><br>
                    name,company,email,phone,address,revenue,status<br>
                    "John Doe","Acme Corp","john@acme.com","0123456789","Paris","50000","hot"
                  </div>
                  <p class="text-xs text-gray-500 mt-2">
                    Supported columns: NAME/name, company, email, phone, ADDRESS/address, REVENUE/revenue, status, notes, position
                  </p>
                </div>
              </div>

              <!-- Preview & Configuration -->
              <div v-if="csvData.length && !isImporting && !importResults" class="space-y-6">
                <!-- Success message -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-green-800">
                        File loaded successfully!
                      </h3>
                      <div class="mt-2 text-sm text-green-700">
                        <p>{{ csvData.length }} rows detected</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Target Tab Selection -->
                <div class="space-y-3">
                  <label class="text-sm font-medium text-gray-900">📁 Target tab:</label>
                  <select 
                    v-model="selectedTabId" 
                    class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select a tab</option>
                    <option v-for="tab in availableTabs" :key="tab.id" :value="tab.id">
                      {{ tab.name }} {{ tab.is_special ? '(Special)' : '' }}
                    </option>
                  </select>
                </div>

                <!-- Duplicate Detection Settings -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h4 class="text-sm font-medium text-blue-900">🔍 Duplicate Detection</h4>
                  <div class="flex items-center gap-4">
                    <label class="text-sm font-medium text-blue-700">Similarity threshold:</label>
                    <div class="flex items-center gap-2">
                      <input
                        v-model.number="duplicateThreshold"
                        type="range"
                        min="50"
                        max="100"
                        step="5"
                        class="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span class="text-sm font-medium text-blue-700 min-w-[3rem]">{{ duplicateThreshold }}%</span>
                    </div>
                  </div>
                  <p class="text-xs text-blue-600">
                    Companies with names {{ duplicateThreshold }}% similar or more will be flagged as potential duplicates
                  </p>
                </div>

                <!-- Data preview -->
                <div class="space-y-2">
                  <h4 class="text-sm font-medium text-gray-900">📋 Data preview (first 5 rows):</h4>
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                      <thead class="bg-gray-50">
                        <tr>
                          <th v-for="header in csvHeaders" :key="header" 
                              class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {{ header }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="(row, index) in csvPreview" :key="index" class="hover:bg-gray-50">
                          <td v-for="header in csvHeaders" :key="header" 
                              class="px-3 py-2 text-sm text-gray-900 max-w-32 truncate">
                            {{ row[header] || '-' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Import Progress -->
              <div v-if="isImporting" class="space-y-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <svg class="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <div class="ml-3 flex-1">
                      <h3 class="text-sm font-medium text-blue-800">Import in progress...</h3>
                      <p class="text-sm text-blue-600">{{ importProgress.message || 'Processing your data...' }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    :style="{ width: importProgress.progress + '%' }"
                  ></div>
                </div>
                
                <div class="text-sm text-gray-600 text-center">
                  {{ importProgress.progress || 0 }}% completed
                </div>
              </div>

              <!-- Results Summary -->
              <div v-if="importResults" class="space-y-4">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-green-800">Import completed successfully!</h3>
                      <div class="mt-2 text-sm text-green-700">
                        <ul class="space-y-1">
                          <li>✅ {{ importResults.imported || 0 }} prospects imported</li>
                          <li v-if="importResults.merged > 0">🔄 {{ importResults.merged }} prospects merged</li>
                          <li v-if="importResults.skipped > 0">⚠️ {{ importResults.skipped }} rows skipped</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer buttons -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <template v-if="!isImporting">
            <button 
              v-if="csvData.length && !importResults"
              @click="startImport"
              :disabled="!selectedTabId"
              :class="[
                'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm',
                selectedTabId 
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                  : 'bg-gray-300 cursor-not-allowed'
              ]"
            >
              🚀 Start Import
            </button>
            
            <button 
              v-if="importResults"
              @click="closeModal"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Done
            </button>
          </template>
          
          <button 
            v-if="!isImporting"
            @click="closeModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Duplicate Resolution Modal -->
  <div
    v-if="showDuplicateModal"
    class="fixed inset-0 z-[70] overflow-y-auto"
    aria-labelledby="duplicate-modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-[70]" aria-hidden="true"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative z-[71]">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <!-- Header -->
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="duplicate-modal-title">
                  🔍 Duplicate Companies Detected
                </h3>
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <label class="text-sm font-medium text-gray-700">Similarity threshold:</label>
                    <input
                      v-model.number="duplicateThreshold"
                      type="number"
                      min="50"
                      max="100"
                      step="5"
                      class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span class="text-sm text-gray-500">%</span>
                  </div>
                </div>
              </div>

              <!-- Resolution Strategy -->
              <div class="mb-6">
                <label class="text-sm font-medium text-gray-900 mb-3 block">📋 Resolution strategy for all duplicates:</label>
                <div class="grid grid-cols-2 gap-3">
                  <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      v-model="duplicateResolution"
                      type="radio"
                      value="skip"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span class="ml-3 text-sm font-medium text-gray-700">⏭️ Skip duplicates</span>
                  </label>
                  <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      v-model="duplicateResolution"
                      type="radio"
                      value="merge_max"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span class="ml-3 text-sm font-medium text-gray-700">📈 Keep max revenue</span>
                  </label>
                  <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      v-model="duplicateResolution"
                      type="radio"
                      value="merge_sum"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span class="ml-3 text-sm font-medium text-gray-700">➕ Sum revenues</span>
                  </label>
                  <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      v-model="duplicateResolution"
                      type="radio"
                      value="create_new"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span class="ml-3 text-sm font-medium text-gray-700">➕ Create all as new</span>
                  </label>
                </div>
              </div>

              <!-- Duplicates List -->
              <div class="space-y-4 max-h-96 overflow-y-auto">
                <h4 class="text-sm font-medium text-gray-900">
                  Found {{ duplicateConflicts.length }} potential duplicate(s):
                </h4>
                
                <div v-for="(conflict, index) in duplicateConflicts" :key="index" class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="text-sm font-medium text-gray-900">{{ conflict.similarity }}% similarity</span>
                        <span class="px-2 py-1 text-xs rounded-full"
                              :class="conflict.similarity >= 90 ? 'bg-red-100 text-red-800' : 
                                     conflict.similarity >= 80 ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-blue-100 text-blue-800'">
                          {{ conflict.similarity >= 90 ? 'Very High' : 
                             conflict.similarity >= 80 ? 'High' : 'Medium' }}
                        </span>
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4">
                        <!-- CSV Data -->
                        <div class="bg-green-50 border border-green-200 rounded p-3">
                          <h5 class="text-sm font-medium text-green-800 mb-2">📄 CSV Data:</h5>
                          <p class="text-sm text-green-700 font-medium">{{ conflict.csvCompany }}</p>
                          <p class="text-sm text-green-600">Revenue: {{ formatCurrency(conflict.csvRevenue) }}</p>
                        </div>
                        
                        <!-- Existing/Other Data -->
                        <div class="bg-blue-50 border border-blue-200 rounded p-3">
                          <h5 class="text-sm font-medium text-blue-800 mb-2">
                            {{ conflict.isInternalDuplicate ? '📄 Other CSV Data:' : '💾 Existing Data:' }}
                          </h5>
                          <p class="text-sm text-blue-700 font-medium">
                            {{ conflict.isInternalDuplicate ? conflict.otherCsvCompany : conflict.existingCompany }}
                          </p>
                          <p class="text-sm text-blue-600">
                            Revenue: {{ formatCurrency(conflict.isInternalDuplicate ? conflict.otherRevenue : conflict.existingRevenue) }}
                          </p>
                        </div>
                      </div>
                      
                      <!-- Resolution Preview -->
                      <div class="mt-3 p-2 bg-gray-50 rounded text-sm">
                        <span class="font-medium text-gray-700">Resolution preview: </span>
                        <span v-if="duplicateResolution === 'skip'" class="text-orange-600">
                          Skip importing "{{ conflict.csvCompany }}"
                        </span>
                        <span v-else-if="duplicateResolution === 'merge_max'" class="text-blue-600">
                          Keep "{{ Math.max(conflict.csvRevenue, conflict.isInternalDuplicate ? conflict.otherRevenue : conflict.existingRevenue) === conflict.csvRevenue ? conflict.csvCompany : (conflict.isInternalDuplicate ? conflict.otherCsvCompany : conflict.existingCompany) }}" 
                          with {{ formatCurrency(Math.max(conflict.csvRevenue, conflict.isInternalDuplicate ? conflict.otherRevenue : conflict.existingRevenue)) }}
                        </span>
                        <span v-else-if="duplicateResolution === 'merge_sum'" class="text-green-600">
                          Merge with total revenue: {{ formatCurrency(conflict.csvRevenue + (conflict.isInternalDuplicate ? conflict.otherRevenue : conflict.existingRevenue)) }}
                        </span>
                        <span v-else class="text-purple-600">
                          Create "{{ conflict.csvCompany }}" as new prospect
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer buttons -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            @click="applyDuplicateResolution"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            🚀 Apply & Continue Import
          </button>
          
          <button 
            @click="cancelDuplicateResolution"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancel Import
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProspectsStore } from '../stores/prospects'
import axios from 'axios'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  availableTabs: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['close', 'imported'])

// Store
const prospectsStore = useProspectsStore()

// State
const isDragging = ref(false)
const csvFile = ref(null)
const csvData = ref([])
const csvHeaders = ref([])
const csvPreview = ref([])
const selectedTabId = ref('')
const isImporting = ref(false)
const importProgress = ref({ progress: 0, message: '' })
const importResults = ref(null)

// Duplicate detection
const duplicateThreshold = ref(80) // Similarity percentage threshold
const duplicateConflicts = ref([])
const showDuplicateModal = ref(false)
const duplicateResolution = ref('skip') // 'skip', 'merge_max', 'merge_sum', 'create_new'

// Methods
const closeModal = () => {
  if (!isImporting.value) {
    resetModal()
    emit('close')
  }
}

const resetModal = () => {
  csvFile.value = null
  csvData.value = []
  csvHeaders.value = []
  csvPreview.value = []
  selectedTabId.value = ''
  isImporting.value = false
  importProgress.value = { progress: 0, message: '' }
  importResults.value = null
  duplicateConflicts.value = []
  showDuplicateModal.value = false
  duplicateResolution.value = 'skip'
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    handleFile(files[0])
  }
}

const handleFileSelect = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    handleFile(files[0])
  }
}

const handleFile = async (file) => {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    alert('Please select a CSV file')
    return
  }

  csvFile.value = file
  
  try {
    const text = await readFileAsText(file)
    const parsedData = parseCSV(text)
    
    if (parsedData.length === 0) {
      alert('No data found in CSV file')
      return
    }

    csvData.value = parsedData
    csvHeaders.value = Object.keys(parsedData[0])
    csvPreview.value = parsedData.slice(0, 5)
    
    // Set default tab if available
    if (props.availableTabs.length > 0) {
      selectedTabId.value = props.availableTabs[0].id
    }
    
  } catch (error) {
    console.error('Error reading CSV file:', error)
    alert('Error reading CSV file: ' + error.message)
  }
}

const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(new Error('File reading error'))
    reader.readAsText(file, 'UTF-8')
  })
}

const parseCSV = (text) => {
  const lines = text.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least one header line and one data line')
  }

  // Auto-detect separator by analyzing the first line
  const firstLine = lines[0]
  const semicolonCount = (firstLine.match(/;/g) || []).length
  const commaCount = (firstLine.match(/,/g) || []).length
  
  // Use semicolon if it appears more frequently than comma, or if there are semicolons at all
  const separator = semicolonCount > 0 && semicolonCount >= commaCount ? ';' : ','
  
  console.log(`🔍 Auto-detected CSV separator: "${separator}" (semicolons: ${semicolonCount}, commas: ${commaCount})`)

  const headers = parseCSVLine(lines[0], separator)
  const data = []

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCSVLine(lines[i], separator)
      const row = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      data.push(row)
    }
  }

  return data
}

const parseCSVLine = (line, separator = ';') => {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === separator && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

// Function to calculate string similarity using Levenshtein distance
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0
  
  // Clean strings but preserve commas as they are part of company names
  const cleanStr1 = str1.toLowerCase().trim()
  const cleanStr2 = str2.toLowerCase().trim()
  
  if (cleanStr1 === cleanStr2) return 100
  
  const len1 = cleanStr1.length
  const len2 = cleanStr2.length
  
  if (len1 === 0 || len2 === 0) return 0
  
  const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0))
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i
  for (let j = 0; j <= len2; j++) matrix[0][j] = j
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = cleanStr1[i - 1] === cleanStr2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }
  
  const distance = matrix[len1][len2]
  const maxLength = Math.max(len1, len2)
  return Math.round(((maxLength - distance) / maxLength) * 100)
}

// Function to find duplicate prospects
const findDuplicates = async (csvData, existingProspects) => {
  const conflicts = []
  
  // Helper function to extract clean company name for comparison
  const extractCompanyName = (fullName) => {
    if (!fullName) return ''
    
    // For names like "ViscoTec France SASU, Adresse de facturation"
    // Extract just the company part before the first comma if it contains address info
    let cleanName = fullName.trim()
    
    // If there's a comma followed by address-like words, take only the part before
    const addressPatterns = /,\s*(adresse|address|facturation|billing|siege|siège|domicile)/i
    if (addressPatterns.test(cleanName)) {
      cleanName = cleanName.split(',')[0].trim()
    }
    
    // Remove common legal suffixes for better matching
    cleanName = cleanName.replace(/\s+(sasu|sarl|sas|sa|eurl|sci|snc|scp|selarl)$/i, '').trim()
    
    return cleanName
  }
  
  for (let i = 0; i < csvData.length; i++) {
    const csvRow = csvData[i]
    const csvCompanyFull = getColumnValue(csvRow, ['NAME', 'name', 'company', 'Company', 'COMPANY'])
    const csvCompany = extractCompanyName(csvCompanyFull)
    
    if (!csvCompany) continue
    
    console.log(`🔍 Checking "${csvCompanyFull}" → extracted: "${csvCompany}"`)
    
    // Check against existing prospects
    for (const existing of existingProspects) {
      const existingCompanyFull = existing.company || existing.name
      const existingCompany = extractCompanyName(existingCompanyFull)
      if (!existingCompany) continue
      
      const similarity = calculateSimilarity(csvCompany, existingCompany)
      
      if (similarity >= duplicateThreshold.value) {
        console.log(`📊 Found similarity ${similarity}% between "${csvCompany}" and "${existingCompany}"`)
        conflicts.push({
          csvRow: csvRow,
          csvIndex: i,
          csvCompany: csvCompanyFull,
          existingProspect: existing,
          existingCompany: existingCompanyFull,
          similarity: similarity,
          csvRevenue: parseRevenue(getColumnValue(csvRow, ['REVENUE', 'revenue', 'Revenue', 'chiffre_affaires', 'ca'])),
          existingRevenue: existing.revenue || 0
        })
      }
    }
    
    // Check against other CSV rows (internal duplicates)
    for (let j = i + 1; j < csvData.length; j++) {
      const otherRow = csvData[j]
      const otherCompanyFull = getColumnValue(otherRow, ['NAME', 'name', 'company', 'Company', 'COMPANY'])
      const otherCompany = extractCompanyName(otherCompanyFull)
      
      if (!otherCompany) continue
      
      const similarity = calculateSimilarity(csvCompany, otherCompany)
      
      if (similarity >= duplicateThreshold.value) {
        console.log(`📊 Found internal similarity ${similarity}% between "${csvCompany}" and "${otherCompany}"`)
        conflicts.push({
          csvRow: csvRow,
          csvIndex: i,
          csvCompany: csvCompanyFull,
          otherCsvRow: otherRow,
          otherCsvIndex: j,
          otherCsvCompany: otherCompanyFull,
          similarity: similarity,
          csvRevenue: parseRevenue(getColumnValue(csvRow, ['REVENUE', 'revenue', 'Revenue', 'chiffre_affaires', 'ca'])),
          otherRevenue: parseRevenue(getColumnValue(otherRow, ['REVENUE', 'revenue', 'Revenue', 'chiffre_affaires', 'ca'])),
          isInternalDuplicate: true
        })
      }
    }
  }
  
  return conflicts
}

// Helper function to get column value (already exists but need to expose it)
const getColumnValue = (row, possibleNames) => {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name]
    }
  }
  return ''
}

// Helper function to parse revenue (already exists but need to expose it)
const parseRevenue = (value) => {
  if (!value) return 0
  const cleanValue = value.toString().replace(/\s/g, '').replace(',', '.')
  const parsed = parseFloat(cleanValue)
  return isNaN(parsed) ? 0 : parsed
}

const startImport = async () => {
  if (!selectedTabId.value || csvData.value.length === 0) {
    alert('Please select a target tab')
    return
  }

  isImporting.value = true
  importProgress.value = { progress: 0, message: 'Checking for duplicates...' }

  try {
    // First, get existing prospects to check for duplicates
    await prospectsStore.fetchProspects()
    const existingProspects = prospectsStore.prospects
    
    // Find potential duplicates
    const conflicts = await findDuplicates(csvData.value, existingProspects)
    
    if (conflicts.length > 0) {
      // Show duplicate resolution modal
      duplicateConflicts.value = conflicts
      showDuplicateModal.value = true
      isImporting.value = false
      return
    }
    
    // No conflicts, proceed with import
    await proceedWithImport()
    
  } catch (error) {
    console.error('Import error:', error)
    alert('Import error: ' + error.message)
    isImporting.value = false
  }
}

const proceedWithImport = async () => {
  isImporting.value = true
  importProgress.value = { progress: 0, message: 'Starting import...' }

  try {
    console.log('Starting CSV import with data:', {
      rowCount: csvData.value.length,
      targetTab: selectedTabId.value,
      firstRow: csvData.value[0]
    })

    let imported = 0
    let skipped = 0
    let merged = 0
    
    for (let i = 0; i < csvData.value.length; i++) {
      const row = csvData.value[i]
      
      // Update progress
      const progress = Math.round(((i + 1) / csvData.value.length) * 100)
      importProgress.value = {
        progress,
        message: `Processing row ${i + 1} of ${csvData.value.length}...`
      }
      
      try {
        const prospectData = {
          name: getColumnValue(row, ['NAME', 'name', 'company', 'Company', 'COMPANY']) || `Import ${i + 1}`,
          email: getColumnValue(row, ['email', 'Email', 'EMAIL', 'mail']) || '',
          phone: getColumnValue(row, ['phone', 'Phone', 'PHONE', 'telephone']) || '',
          company: getColumnValue(row, ['NAME', 'name', 'company', 'Company', 'COMPANY']) || '',
          position: getColumnValue(row, ['position', 'Position', 'POSITION', 'title']) || '',
          address: getColumnValue(row, ['ADDRESS', 'address', 'Address', 'ville', 'city']) || '',
          status: getColumnValue(row, ['status', 'Status', 'STATUS']) || 'cold',
          revenue: parseRevenue(getColumnValue(row, ['REVENUE', 'revenue', 'Revenue', 'chiffre_affaires', 'ca'])),
          notes: getColumnValue(row, ['notes', 'Notes', 'NOTES', 'description']) || '',
          tabId: selectedTabId.value
        }

        console.log('Mapping row:', row, 'to prospect:', prospectData)

        // Create prospect using store
        const result = await prospectsStore.createProspect(prospectData)
        
        if (result.success) {
          imported++
        } else {
          skipped++
          console.warn('Failed to import row:', i + 1, result.error)
        }
        
      } catch (error) {
        skipped++
        console.error('Error importing row:', i + 1, error)
      }
      
      // Small delay to prevent overwhelming the server
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    importResults.value = {
      imported,
      merged,
      skipped
    }

    // Refresh prospects
    await prospectsStore.fetchProspects()
    
    emit('imported', importResults.value)
    
  } catch (error) {
    console.error('Import error:', error)
    alert('Import error: ' + error.message)
  } finally {
    isImporting.value = false
  }
}

// Watch for modal opening to reset state
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    resetModal()
  }
})

// Duplicate resolution functions
const applyDuplicateResolution = async () => {
  showDuplicateModal.value = false
  
  // Apply the selected resolution strategy
  const processedRows = new Set()
  let modifiedData = [...csvData.value]
  
  for (const conflict of duplicateConflicts.value) {
    const csvIndex = conflict.csvIndex
    
    if (processedRows.has(csvIndex)) continue
    
    switch (duplicateResolution.value) {
      case 'skip':
        // Mark row to be skipped
        modifiedData[csvIndex] = null
        break
        
      case 'merge_max':
        // Keep the data with higher revenue
        if (conflict.isInternalDuplicate) {
          const keepCsv = conflict.csvRevenue >= conflict.otherRevenue
          if (!keepCsv) {
            modifiedData[csvIndex] = null
          } else {
            modifiedData[conflict.otherCsvIndex] = null
          }
          processedRows.add(conflict.otherCsvIndex)
        } else {
          // CSV vs existing - if existing has higher revenue, skip CSV
          if (conflict.existingRevenue > conflict.csvRevenue) {
            modifiedData[csvIndex] = null
          }
        }
        break
        
      case 'merge_sum':
        // Sum the revenues
        if (conflict.isInternalDuplicate) {
          // Merge internal duplicates
          const sumRevenue = conflict.csvRevenue + conflict.otherRevenue
          modifiedData[csvIndex] = {
            ...modifiedData[csvIndex],
            [Object.keys(modifiedData[csvIndex]).find(key => 
              ['REVENUE', 'revenue', 'Revenue', 'chiffre_affaires', 'ca'].includes(key)
            ) || 'REVENUE']: sumRevenue.toString().replace('.', ',')
          }
          modifiedData[conflict.otherCsvIndex] = null
          processedRows.add(conflict.otherCsvIndex)
        } else {
          // Sum with existing prospect - update the revenue in CSV
          const sumRevenue = conflict.csvRevenue + conflict.existingRevenue
          modifiedData[csvIndex] = {
            ...modifiedData[csvIndex],
            [Object.keys(modifiedData[csvIndex]).find(key => 
              ['REVENUE', 'revenue', 'Revenue', 'chiffre_affaires', 'ca'].includes(key)
            ) || 'REVENUE']: sumRevenue.toString().replace('.', ',')
          }
          
          // Also update the existing prospect
          try {
            await prospectsStore.updateProspect(conflict.existingProspect.id, {
              ...conflict.existingProspect,
              revenue: sumRevenue
            })
          } catch (error) {
            console.error('Error updating existing prospect:', error)
          }
        }
        break
        
      case 'create_new':
        // Keep all as new - no modification needed
        break
    }
    
    processedRows.add(csvIndex)
  }
  
  // Filter out null rows (skipped ones)
  csvData.value = modifiedData.filter(row => row !== null)
  
  // Reset conflicts and proceed with import
  duplicateConflicts.value = []
  await proceedWithImport()
}

const cancelDuplicateResolution = () => {
  showDuplicateModal.value = false
  duplicateConflicts.value = []
  isImporting.value = false
}

// Format currency helper
const formatCurrency = (amount) => {
  if (!amount) return '0 €'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}
</script>

<style scoped>
/* Custom styles for drag and drop */
.drag-active {
  border-color: #3b82f6;
  background-color: #dbeafe;
}
</style>
