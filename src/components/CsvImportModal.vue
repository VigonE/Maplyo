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

  const headers = parseCSVLine(lines[0])
  const data = []

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCSVLine(lines[i])
      const row = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      data.push(row)
    }
  }

  return data
}

const parseCSVLine = (line) => {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

const startImport = async () => {
  if (!selectedTabId.value || csvData.value.length === 0) {
    alert('Please select a target tab')
    return
  }

  isImporting.value = true
  importProgress.value = { progress: 0, message: 'Starting import...' }

  try {
    console.log('Starting CSV import with data:', {
      rowCount: csvData.value.length,
      targetTab: selectedTabId.value,
      firstRow: csvData.value[0]
    })

    // Use simple prospect creation instead of complex import
    let imported = 0
    let skipped = 0
    
    for (let i = 0; i < csvData.value.length; i++) {
      const row = csvData.value[i]
      
      // Update progress
      const progress = Math.round(((i + 1) / csvData.value.length) * 100)
      importProgress.value = {
        progress,
        message: `Processing row ${i + 1} of ${csvData.value.length}...`
      }
      
      try {
        // Map CSV data to prospect format - handle different column names
        const getColumnValue = (row, possibleNames) => {
          for (const name of possibleNames) {
            if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
              return row[name]
            }
          }
          return ''
        }

        // Parse revenue value (handle French decimal format)
        const parseRevenue = (value) => {
          if (!value) return 0
          // Convert French format (123456,78) to US format (123456.78)
          const cleanValue = value.toString().replace(/\s/g, '').replace(',', '.')
          const parsed = parseFloat(cleanValue)
          return isNaN(parsed) ? 0 : parsed
        }

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
      merged: 0,
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
</script>

<style scoped>
/* Custom styles for drag and drop */
.drag-active {
  border-color: #3b82f6;
  background-color: #dbeafe;
}
</style>
