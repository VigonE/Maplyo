<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
    style="z-index: 10000;"
  >
    <div class="relative top-4 mx-auto p-5 border w-11/12 mconst generateForecast = () => {
  console.log('=== GENERATING FORECAST ===')
  console.log('Props prospects count:', props.prospects.length)
  console.log('First prospect COMPLETE:', props.prospects[0])
  console.log('All keys of first prospect:', props.prospects[0] ? Object.keys(props.prospects[0]) : 'No prospects')
  console.log('Lead times:', props.leadTimes)
  
  // Debug: Let's check all prospects' status
  console.log('🔍 STATUS ANALYSIS:')
  const statusCount = {}
  props.prospects.forEach(p => {
    const status = p.status || 'unknown'
    statusCount[status] = (statusCount[status] || 0) + 1
  })
  console.log('Status distribution:', statusCount)
  
  // Debug: Check hot prospects specifically
  const hotProspects = props.prospects.filter(p => p.status === 'hot')
  console.log('🔥 HOT PROSPECTS:', hotProspects.length, hotProspects.map(p => ({ name: p.name, status: p.status, revenue: p.revenue, tab_id: p.tab_id })))xl shadow-lg rounded-md bg-white" @click.stop>
      <div class="mt-3">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900 flex items-center">
            <svg class="h-8 w-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            📈 Revenue Forecast - {{ currentTabName }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Calculating forecast...</span>
        </div>

        <!-- Empty Tab State -->
        <div v-else-if="prospects.length === 0" class="text-center py-12">
          <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No prospects in "{{ currentTabName }}" tab</h3>
          <p class="mt-2 text-sm text-gray-500">Add prospects to this tab or switch to another tab to generate a forecast.</p>
          <div class="mt-6">
            <button
              @click="closeModal"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
            >
              Close
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <div v-else class="space-y-6">
          <!-- Metrics Summary -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div class="text-sm font-medium text-blue-600">Pipeline Total</div>
              <div class="text-2xl font-bold text-blue-900">{{ formatCurrency(metrics.pipelineValue) }}</div>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg border border-purple-200 relative">
              <div class="flex items-center justify-center gap-1">
                <div class="text-sm font-medium text-purple-600">Confidence Score</div>
                <!-- Help Icon with Tooltip -->
                <div class="relative group">
                  <svg class="w-4 h-4 text-purple-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                  </svg>
                  <!-- Tooltip -->
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div class="font-semibold mb-2">How we calculate confidence:</div>
                    <div class="space-y-1 text-left">
                      <div>• <strong>Data Quality:</strong> Contact info, completion dates, notes</div>
                      <div>• <strong>Deal Size:</strong> Revenue amount analysis</div>
                      <div>• <strong>Status:</strong> Hot/Warm/Cold likelihood</div>
                      <div>• <strong>Age Factor:</strong> How recent the lead is</div>
                      <div>• <strong>Timeline:</strong> Realistic completion dates</div>
                    </div>
                    <div class="text-center mt-2 text-purple-200">Higher score = more reliable forecast</div>
                    <!-- Tooltip Arrow -->
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <div class="text-2xl font-bold text-purple-900">{{ calculateConfidenceScore().toFixed(0) }}%</div>
              <div class="text-xs text-purple-500 mt-1">Forecast reliability</div>
            </div>
          </div>

          <!-- Forecasted Revenue Breakdown -->
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 mb-4">
            <h4 class="text-lg font-semibold text-green-800 mb-4 flex items-center">
              💰 Revenue Forecast
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Until end of year -->
              <div class="bg-white rounded-lg border border-green-100 p-4">
                <div class="text-sm font-medium text-green-600 mb-3 text-center">Until end of year</div>
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span class="text-xs text-blue-600 font-medium">🎯 Leads</span>
                    <div class="text-right">
                      <div class="text-sm font-bold text-blue-900">{{ formatCurrency(metrics.leadsRevenueEndOfYear) }}</div>
                      <div class="text-xs text-blue-600">{{ metrics.leadsCountEndOfYear }} leads</div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span class="text-xs text-purple-600 font-medium">🔄 Recurring</span>
                    <div class="text-right">
                      <div class="text-sm font-bold text-purple-900">{{ formatCurrency(metrics.recurringRevenueEndOfYear) }}</div>
                      <div class="text-xs text-purple-600">{{ metrics.recurringCountEndOfYear }} clients</div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-green-50 rounded border-t border-green-200">
                    <span class="text-xs text-green-600 font-bold">💰 Total</span>
                    <div class="text-right">
                      <div class="text-lg font-bold text-green-900">{{ formatCurrency(metrics.revenueEndOfYear) }}</div>
                      <div class="text-xs text-green-500">{{ getMonthsUntilEndOfYear() }} months</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Next 6 months -->
              <div class="bg-white rounded-lg border border-green-100 p-4">
                <div class="text-sm font-medium text-green-600 mb-3 text-center">Next 6 months</div>
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span class="text-xs text-blue-600 font-medium">🎯 Leads</span>
                    <div class="text-right">
                      <div class="text-sm font-bold text-blue-900">{{ formatCurrency(metrics.leadsRevenue6Months) }}</div>
                      <div class="text-xs text-blue-600">{{ metrics.leadsCount6Months }} leads</div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span class="text-xs text-purple-600 font-medium">🔄 Recurring</span>
                    <div class="text-right">
                      <div class="text-sm font-bold text-purple-900">{{ formatCurrency(metrics.recurringRevenue6Months) }}</div>
                      <div class="text-xs text-purple-600">{{ metrics.recurringCount6Months }} clients</div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-green-50 rounded border-t border-green-200">
                    <span class="text-xs text-green-600 font-bold">💰 Total</span>
                    <div class="text-right">
                      <div class="text-lg font-bold text-green-900">{{ formatCurrency(metrics.revenue6Months) }}</div>
                      <div class="text-xs text-green-500">{{ formatDateRange(6) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Next 12 months -->
              <div class="bg-white rounded-lg border border-green-100 p-4">
                <div class="text-sm font-medium text-green-600 mb-3 text-center">Next 12 months</div>
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span class="text-xs text-blue-600 font-medium">🎯 Leads</span>
                    <div class="text-right">
                      <div class="text-sm font-bold text-blue-900">{{ formatCurrency(metrics.leadsRevenue12Months) }}</div>
                      <div class="text-xs text-blue-600">{{ metrics.leadsCount12Months }} leads</div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span class="text-xs text-purple-600 font-medium">🔄 Recurring</span>
                    <div class="text-right">
                      <div class="text-sm font-bold text-purple-900">{{ formatCurrency(metrics.recurringRevenue12Months) }}</div>
                      <div class="text-xs text-purple-600">{{ metrics.recurringCount12Months }} clients</div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-green-50 rounded border-t border-green-200">
                    <span class="text-xs text-green-600 font-bold">💰 Total</span>
                    <div class="text-right">
                      <div class="text-lg font-bold text-green-900">{{ formatCurrency(metrics.revenue12Months) }}</div>
                      <div class="text-xs text-green-500">{{ formatDateRange(12) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Next year -->
              <div class="bg-white rounded-lg border border-green-100 p-4">
                <div class="text-sm font-medium text-green-600 mb-3 text-center">Next year</div>
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span class="text-xs text-blue-600 font-medium">🎯 Leads</span>
                    <div class="text-right">
                      <div class="text-sm font-bold text-blue-900">{{ formatCurrency(metrics.leadsRevenueNextYear) }}</div>
                      <div class="text-xs text-blue-600">{{ metrics.leadsCountNextYear }} leads</div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span class="text-xs text-purple-600 font-medium">🔄 Recurring</span>
                    <div class="text-right">
                      <div class="text-sm font-bold text-purple-900">{{ formatCurrency(metrics.recurringRevenueNextYear) }}</div>
                      <div class="text-xs text-purple-600">{{ metrics.recurringCountNextYear }} clients</div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center p-2 bg-green-50 rounded border-t border-green-200">
                    <span class="text-xs text-green-600 font-bold">💰 Total</span>
                    <div class="text-right">
                      <div class="text-lg font-bold text-green-900">{{ formatCurrency(metrics.revenueNextYear) }}</div>
                      <div class="text-xs text-green-500">{{ formatDateRange(12, true) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Conversion rate moved below -->
            <div class="mt-4 text-center p-4 bg-white rounded-lg border border-green-100">
              <div class="text-sm font-medium text-green-600">Conversion rate</div>
              <div class="text-xl font-bold text-green-900">{{ (metrics.conversionRate * 100).toFixed(1) }}%</div>
              <div class="text-xs text-green-500 mt-1">Average probability</div>
            </div>
          </div>

          <!-- Chart Container -->
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-lg font-semibold text-gray-800">Revenue Forecast Evolution</h4>
              
              <!-- Chart Controls -->
              <div class="space-y-3">
                <div class="flex items-center space-x-4">
                  <div class="flex items-center space-x-3 flex-1">
                    <label class="text-sm text-gray-600 whitespace-nowrap">Moving Average Period:</label>
                    <input 
                      type="range" 
                      v-model="movingAveragePeriod" 
                      @input="updateChart"
                      min="3" 
                      max="12" 
                      step="1"
                      class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    >
                    <span class="text-sm font-medium text-blue-600 min-w-[60px]">{{ movingAveragePeriod }} months</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <label class="flex items-center text-sm text-gray-600">
                      <input type="checkbox" v-model="showBars" @change="updateChart" class="mr-1">
                      Show Bars
                    </label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <label class="text-sm text-gray-600">Moving Average Type:</label>
                    <select v-model="movingAverageType" @change="updateChart" class="text-sm border border-gray-300 rounded px-2 py-1">
                      <option value="both">📈 Both (Total)</option>
                      <option value="leads">🎯 Leads Only</option>
                      <option value="recurring">🔄 Recurring Only</option>
                    </select>
                  </div>
                </div>
                
                <!-- Sliders d'ajustement dynamique -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-600 flex items-center">
                      ⏱️ Lead Time Adjustment
                      <span class="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {{ leadTimeAdjustment > 0 ? '+' : '' }}{{ leadTimeAdjustment }}%
                      </span>
                    </label>
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500">-50%</span>
                      <input
                        type="range"
                        v-model.number="leadTimeAdjustment"
                        min="-50"
                        max="50"
                        step="5"
                        @input="updateChart"
                        class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span class="text-xs text-gray-500">+50%</span>
                    </div>
                    <p class="text-xs text-gray-500">Adjust closing lead times by ±50%</p>
                  </div>
                  
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-600 flex items-center">
                      🎯 Probability Adjustment
                      <span class="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        {{ probabilityAdjustment > 0 ? '+' : '' }}{{ probabilityAdjustment }}%
                      </span>
                    </label>
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500">-50%</span>
                      <input
                        type="range"
                        v-model.number="probabilityAdjustment"
                        min="-50"
                        max="50"
                        step="5"
                        @input="updateChart"
                        class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span class="text-xs text-gray-500">+50%</span>
                    </div>
                    <p class="text-xs text-gray-500">Adjust conversion probabilities by ±50%</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="h-96 w-full">
              <canvas ref="chartCanvas" class="w-full h-full"></canvas>
            </div>
          </div>

          <!-- Detailed Analysis -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Monthly Breakdown -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-lg font-semibold text-gray-800 mb-4">🗓️ Monthly Distribution</h4>
              <div class="max-h-64 overflow-y-auto space-y-2">
                <div 
                  v-for="(month, index) in forecast.slice(0, 12)" 
                  :key="index"
                  class="flex justify-between items-center p-2 bg-white rounded border"
                >
                  <span class="text-sm font-medium">{{ formatMonth(month.date) }}</span>
                  <span class="text-sm text-gray-600">{{ formatCurrency(month.revenue) }}</span>
                </div>
              </div>
            </div>

            <!-- Risk Analysis -->
            <div class="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 class="text-lg font-semibold text-red-800 mb-4">⚠️ Risk Analysis</h4>
              <div class="space-y-3">
                <div v-for="risk in metrics.riskFactors" :key="risk.type" class="flex items-start">
                  <div class="flex-shrink-0 w-2 h-2 bg-red-400 rounded-full mt-2 mr-3"></div>
                  <div>
                    <div class="text-sm font-medium text-red-800">{{ risk.title }}</div>
                    <div class="text-xs text-red-600">{{ risk.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Analysis -->
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h4 class="text-lg font-semibold text-gray-800 mb-4">📊 Category Analysis</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="(data, category) in categoryAnalysis" :key="category" class="text-center p-4 rounded-lg" :class="getCategoryClass(category)">
                <div class="text-sm font-medium text-gray-600 uppercase">{{ category === 'recurring' ? '🔄 Recurring' : category }}</div>
                <div class="text-xl font-bold mt-1">{{ data.count }} prospects</div>
                <div class="text-sm text-gray-500">{{ formatCurrency(data.value) }}</div>
                <div class="text-xs text-gray-400">
                  {{ category === 'recurring' ? `Avg: ${data.avgMonths.toFixed(1)} months cycle` : `Avg: ${data.avgMonths} months` }}
                </div>
              </div>
            </div>
          </div>

          <!-- Recurring Prospects Next Occurrences -->
          <div v-if="getRecurringProspects().length > 0" class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 class="text-lg font-semibold text-purple-800 mb-4">🔄 Prochaines échéances récurrentes</h4>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div 
                v-for="occurrence in getNextRecurringOccurrences()" 
                :key="`${occurrence.prospectId}_${occurrence.date}`"
                class="flex justify-between items-center p-3 bg-white rounded border border-purple-100"
              >
                <div class="flex-1">
                  <div class="font-medium text-purple-900">{{ occurrence.name }}</div>
                  <div class="text-sm text-purple-600">
                    Cycle: {{ occurrence.recurrenceMonths }} mois | 
                    Probabilité: {{ (occurrence.probability * 100).toFixed(0) }}%
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-purple-800">{{ formatDateShort(occurrence.date) }}</div>
                  <div class="text-sm text-purple-600">{{ formatCurrency(occurrence.expectedRevenue) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            @click="exportForecast"
            class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            📊 Exporter
          </button>
          <button
            @click="refreshForecast"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            🔄 Refresh
          </button>
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  prospects: {
    type: Array,
    default: () => []
  },
  leadTimes: {
    type: Object,
    default: () => ({
      hot: 3,
      warm: 6,
      cold: 12
    })
  },
  currentTabName: {
    type: String,
    default: 'Prospects'
  }
})

// Emits
const emit = defineEmits(['close'])

// Refs
const loading = ref(false)
const chartCanvas = ref(null)
const chart = ref(null)
const movingAveragePeriod = ref(6) // Default to 6 months moving average
const movingAverageType = ref('both') // Default to both leads and recurring
const showBars = ref(true) // Show bars by default
const forecast = ref([])
const metrics = ref({
  pipelineValue: 0,
  weightedPipeline: 0,
  forecastedRevenue: 0,
  revenue6Months: 0,
  revenue12Months: 0,
  revenueEndOfYear: 0,
  revenueNextYear: 0,
  
  // Separated metrics for End of Year
  leadsRevenueEndOfYear: 0,
  recurringRevenueEndOfYear: 0,
  leadsCountEndOfYear: 0,
  recurringCountEndOfYear: 0,
  
  // Separated metrics for 6 months
  leadsRevenue6Months: 0,
  recurringRevenue6Months: 0,
  leadsCount6Months: 0,
  recurringCount6Months: 0,
  
  // Separated metrics for 12 months
  leadsRevenue12Months: 0,
  recurringRevenue12Months: 0,
  leadsCount12Months: 0,
  recurringCount12Months: 0,
  
  // Separated metrics for Next Year
  leadsRevenueNextYear: 0,
  recurringRevenueNextYear: 0,
  leadsCountNextYear: 0,
  recurringCountNextYear: 0,
  
  conversionRate: 0,
  riskFactors: []
})

// Variables de contrôle pour éviter les conflits
const isCreatingChart = ref(false)
let chartUpdateTimeout = null

// Sliders pour ajustement dynamique (centré à 0 = 100% des valeurs par défaut)
const leadTimeAdjustment = ref(0) // -50% à +50%
const probabilityAdjustment = ref(0) // -50% à +50%

// Fonction pour détruire le graphique de manière sûre
const safeDestroyChart = () => {
  if (!chart.value) return
  
  try {
    chart.value.stop()
    chart.value.destroy()
  } catch (error) {
    console.error('Error destroying chart:', error)
  } finally {
    chart.value = null
  }
}

// Calculer les lead times ajustés
const getAdjustedLeadTimes = () => {
  const adjustment = 1 + (leadTimeAdjustment.value / 100)
  return {
    hot: Math.max(1, Math.round((props.leadTimes.hot || 3) * adjustment)),
    warm: Math.max(1, Math.round((props.leadTimes.warm || 6) * adjustment)),
    cold: Math.max(1, Math.round((props.leadTimes.cold || 12) * adjustment))
  }
}

// Calculer les probabilités ajustées
const getAdjustedProbabilities = () => {
  const adjustment = 1 + (probabilityAdjustment.value / 100)
  return {
    hot: Math.min(100, Math.max(1, (props.leadTimes.hotProbability || 80) * adjustment)) / 100,
    warm: Math.min(100, Math.max(1, (props.leadTimes.warmProbability || 45) * adjustment)) / 100,
    cold: Math.min(100, Math.max(1, (props.leadTimes.coldProbability || 15) * adjustment)) / 100,
    recurring: Math.min(100, Math.max(1, (props.leadTimes.recurringProbability || 30) * adjustment)) / 100
  }
}

// Computed
const categoryAnalysis = computed(() => {
  const analysis = {
    hot: { count: 0, value: 0, avgMonths: props.leadTimes.hot },
    warm: { count: 0, value: 0, avgMonths: props.leadTimes.warm },
    cold: { count: 0, value: 0, avgMonths: props.leadTimes.cold },
    recurring: { count: 0, value: 0, avgMonths: 0 } // For recurring, avgMonths represents the average recurrence interval
  }
  
  props.prospects.forEach(prospect => {
    const status = prospect.status || 'cold'
    const category = getProspectCategory(status)
    
    if (analysis[category]) {
      analysis[category].count++
      analysis[category].value += prospect.revenue || 0
      
      // For recurring prospects, track the average recurrence interval
      if (category === 'recurring') {
        analysis[category].avgMonths = (analysis[category].avgMonths * (analysis[category].count - 1) + (prospect.recurrence_months || 12)) / analysis[category].count
      }
    }
  })

  return analysis
})

// Function to convert status to temperature category
const getProspectCategory = (status) => {
  // Statuses are already hot/warm/cold in your system
  const validCategories = ['hot', 'warm', 'cold', 'recurring']
  return validCategories.includes(status) ? status : 'cold'
}

// Methods
const generateForecast = () => {
  if (!props.prospects.length) {
    return []
  }

  const forecastMonths = 24
  const today = new Date()
  const forecastData = []

  // Initialize forecast array
  for (let month = 0; month < forecastMonths; month++) {
    const forecastDate = new Date(today.getFullYear(), today.getMonth() + month, 1)
    forecastData.push({
      date: forecastDate,
      revenue: 0,
      prospects: []
    })
  }

  // Process each prospect with ENHANCED algorithm using estimated_completion_date
  props.prospects.forEach(prospect => {
    const revenue = prospect.revenue || 0
    const status = prospect.status || 'cold'
    const category = getProspectCategory(status)
    
    if (revenue <= 0) {
      return
    }

    // Handle recurring prospects separately
    if (status === 'recurring') {
      // For recurring prospects, calculate multiple occurrences
      const recurrenceMonths = prospect.recurrence_months || 12
      let nextFollowupDate = prospect.next_followup_date

      if (nextFollowupDate) {
        const firstDate = new Date(nextFollowupDate)
        
        // Calculate each recurrence within the forecast period
        let occurrence = 0
        while (occurrence < 50) { // Limite de sécurité pour éviter les boucles infinies
          const occurrenceDate = new Date(firstDate)
          occurrenceDate.setMonth(firstDate.getMonth() + (occurrence * recurrenceMonths))
          
          // Check if this occurrence is within our forecast window
          if (occurrenceDate >= today) {
            const monthsDiff = (occurrenceDate.getFullYear() - today.getFullYear()) * 12 + 
                             (occurrenceDate.getMonth() - today.getMonth())
            
            if (monthsDiff < forecastMonths) {
              // Use high probability for recurring prospects (95% by default)
              const adjustedProbabilities = getAdjustedProbabilities()
              const recurringProbability = adjustedProbabilities.recurring
              const prospectProbability = (prospect.probability_coefficient || 100) / 100
              const finalProbability = recurringProbability * prospectProbability
              const expectedRevenue = revenue * finalProbability
              
              forecastData[monthsDiff].revenue += expectedRevenue
              forecastData[monthsDiff].prospects.push({
                id: `${prospect.id}_${occurrence}`,
                name: `${prospect.name} (Occurrence ${occurrence + 1})`,
                expectedRevenue,
                probability: finalProbability,
                estimatedDate: occurrenceDate.toISOString().split('T')[0],
                isRecurring: true,
                originalId: prospect.id,
                recurrenceMonths: recurrenceMonths
              })
              occurrence++
            } else {
              // On a dépassé la période de forecast
              break
            }
          } else {
            occurrence++
          }
        }
      } else {
        // Si pas de next_followup_date définie, utiliser la date du jour + 1 mois comme première occurrence
        const adjustedProbabilities = getAdjustedProbabilities()
        const recurringProbability = adjustedProbabilities.recurring
        const prospectProbability = (prospect.probability_coefficient || 100) / 100
        const finalProbability = recurringProbability * prospectProbability
        
        for (let occurrence = 0; occurrence < Math.floor(forecastMonths / recurrenceMonths); occurrence++) {
          const occurrenceDate = new Date(today)
          occurrenceDate.setMonth(today.getMonth() + 1 + (occurrence * recurrenceMonths)) // Commencer dans 1 mois
          
          const monthsDiff = (occurrenceDate.getFullYear() - today.getFullYear()) * 12 + 
                           (occurrenceDate.getMonth() - today.getMonth())
          
          if (monthsDiff < forecastMonths) {
            const expectedRevenue = revenue * finalProbability
            
            forecastData[monthsDiff].revenue += expectedRevenue
            forecastData[monthsDiff].prospects.push({
              id: `${prospect.id}_${occurrence}`,
              name: `${prospect.name} (Occurrence ${occurrence + 1})`,
              expectedRevenue,
              probability: finalProbability,
              estimatedDate: occurrenceDate.toISOString().split('T')[0],
              isRecurring: true,
              originalId: prospect.id,
              recurrenceMonths: recurrenceMonths
            })
          }
        }
      }
    } else {
      // Regular prospects (non-recurring)
      const categoryProbability = getCategoryProbability(category)
      
      // Use individual probability coefficient if available, otherwise use category probability
      const prospectProbability = (prospect.probability_coefficient || 100) / 100 // Convert percentage to decimal
      const finalProbability = categoryProbability * prospectProbability // Combine both probabilities
      
      // Calculate target month using estimated_completion_date if available
      let targetMonth = 0
      if (prospect.estimated_completion_date) {
        const estimatedDate = new Date(prospect.estimated_completion_date)
        let monthsDiff = (estimatedDate.getFullYear() - today.getFullYear()) * 12 + 
                         (estimatedDate.getMonth() - today.getMonth())
        
        // Apply lead time adjustment to the estimated completion date
        const leadTimeAdjustmentFactor = 1 + (leadTimeAdjustment.value / 100)
        monthsDiff = Math.round(monthsDiff * leadTimeAdjustmentFactor)
        
        targetMonth = Math.max(0, Math.min(monthsDiff, forecastMonths - 1))
      } else {
        // Fallback to adjusted lead time if no estimated date
        const adjustedLeadTimes = getAdjustedLeadTimes()
        const leadTimeMonths = adjustedLeadTimes[category] || 6
        targetMonth = Math.min(leadTimeMonths, forecastMonths - 1)
      }
      
      // ENHANCED ALGORITHM: Use estimated_completion_date for more accurate forecasting
      const expectedRevenue = revenue * finalProbability
      
      forecastData[targetMonth].revenue += expectedRevenue
      forecastData[targetMonth].prospects.push({
        id: prospect.id,
        name: prospect.name,
        expectedRevenue,
        probability: finalProbability,
        estimatedDate: prospect.estimated_completion_date
      })
    }
  })

  return forecastData
}

const calculateMetrics = (forecastData) => {
  const totalPipeline = props.prospects.reduce((sum, p) => sum + (p.revenue || 0), 0)
  const weightedPipeline = props.prospects.reduce((sum, p) => {
    const status = p.status || 'cold'
    const category = getProspectCategory(status)
    const weight = (p.revenue || 0) * getCategoryProbability(category)
    return sum + weight
  }, 0)
  
  const forecastTotal = forecastData.reduce((sum, f) => sum + f.revenue, 0)
  
  // Calculate revenue for different time periods
  const today = new Date()
  const endOfYear = new Date(today.getFullYear(), 11, 31) // December 31st
  const monthsUntilEndOfYear = Math.max(0, (endOfYear.getFullYear() - today.getFullYear()) * 12 + (endOfYear.getMonth() - today.getMonth()) + 1)
  
  // Calculate separated metrics for each time period
  const calculatePeriodMetrics = (periodMonths) => {
    let leadsRevenue = 0
    let recurringRevenue = 0
    let leadsCount = 0
    const recurringClientsSet = new Set() // Pour compter les clients uniques
    
    forecastData.slice(0, periodMonths).forEach(monthData => {
      monthData.prospects.forEach(prospect => {
        if (prospect.isRecurring) {
          recurringRevenue += prospect.expectedRevenue
          // Utiliser l'ID original du prospect pour compter les clients uniques
          recurringClientsSet.add(prospect.originalId || prospect.id)
        } else {
          leadsRevenue += prospect.expectedRevenue
          leadsCount++
        }
      })
    })
    
    return { 
      leadsRevenue, 
      recurringRevenue, 
      leadsCount, 
      recurringCount: recurringClientsSet.size // Nombre de clients uniques
    }
  }
  
  // Calculate metrics for different periods
  const endOfYearMetrics = calculatePeriodMetrics(monthsUntilEndOfYear)
  const sixMonthsMetrics = calculatePeriodMetrics(6)
  const twelveMonthsMetrics = calculatePeriodMetrics(12)
  
  // Calculate Next Year metrics (months 13-24)
  const calculateNextYearMetrics = () => {
    let leadsRevenue = 0
    let recurringRevenue = 0
    let leadsCount = 0
    const recurringClientsSet = new Set()
    
    // Next year = mois 13 à 24 (12 mois après les 12 premiers mois)
    forecastData.slice(12, 24).forEach(monthData => {
      monthData.prospects.forEach(prospect => {
        if (prospect.isRecurring) {
          recurringRevenue += prospect.expectedRevenue
          recurringClientsSet.add(prospect.originalId || prospect.id)
        } else {
          leadsRevenue += prospect.expectedRevenue
          leadsCount++
        }
      })
    })
    
    return { 
      leadsRevenue, 
      recurringRevenue, 
      leadsCount, 
      recurringCount: recurringClientsSet.size
    }
  }
  
  const nextYearMetrics = calculateNextYearMetrics()
  
  const revenue6Months = forecastData.slice(0, 6).reduce((sum, f) => sum + f.revenue, 0)
  const revenue12Months = forecastData.slice(0, 12).reduce((sum, f) => sum + f.revenue, 0)
  const revenueEndOfYear = forecastData.slice(0, monthsUntilEndOfYear).reduce((sum, f) => sum + f.revenue, 0)
  const revenueNextYear = forecastData.slice(12, 24).reduce((sum, f) => sum + f.revenue, 0)
  
  return {
    pipelineValue: totalPipeline,
    weightedPipeline,
    forecastedRevenue: forecastTotal,
    revenue6Months,
    revenue12Months,
    revenueEndOfYear,
    revenueNextYear,
    
    // Separated metrics for End of Year
    leadsRevenueEndOfYear: endOfYearMetrics.leadsRevenue,
    recurringRevenueEndOfYear: endOfYearMetrics.recurringRevenue,
    leadsCountEndOfYear: endOfYearMetrics.leadsCount,
    recurringCountEndOfYear: endOfYearMetrics.recurringCount,
    
    // Separated metrics for 6 months
    leadsRevenue6Months: sixMonthsMetrics.leadsRevenue,
    recurringRevenue6Months: sixMonthsMetrics.recurringRevenue,
    leadsCount6Months: sixMonthsMetrics.leadsCount,
    recurringCount6Months: sixMonthsMetrics.recurringCount,
    
    // Separated metrics for 12 months
    leadsRevenue12Months: twelveMonthsMetrics.leadsRevenue,
    recurringRevenue12Months: twelveMonthsMetrics.recurringRevenue,
    leadsCount12Months: twelveMonthsMetrics.leadsCount,
    recurringCount12Months: twelveMonthsMetrics.recurringCount,
    
    // Separated metrics for Next Year
    leadsRevenueNextYear: nextYearMetrics.leadsRevenue,
    recurringRevenueNextYear: nextYearMetrics.recurringRevenue,
    leadsCountNextYear: nextYearMetrics.leadsCount,
    recurringCountNextYear: nextYearMetrics.recurringCount,
    
    conversionRate: totalPipeline > 0 ? forecastTotal / totalPipeline : 0,
    riskFactors: identifyRiskFactors()
  }
}

const getCategoryProbability = (category) => {
  const adjustedProbabilities = getAdjustedProbabilities()
  const probability = adjustedProbabilities[category] || 0.3
  return probability
}

const gaussianPDF = (x, mean, stdDev) => {
  return Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2)) / (stdDev * Math.sqrt(2 * Math.PI))
}

const getSeasonalMultiplier = (date) => {
  const month = date.getMonth() + 1
  const seasonality = {
    1: 0.9, 2: 1.0, 3: 1.1, 4: 1.0, 5: 0.95, 6: 1.15,
    7: 0.8, 8: 0.85, 9: 1.1, 10: 1.0, 11: 1.05, 12: 1.2
  }
  return seasonality[month] || 1.0
}

const getMonthsDiff = (date1, date2) => {
  return (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth())
}

const identifyRiskFactors = () => {
  const risks = []
  
  // Check for concentration risk
  const totalCount = props.prospects.length
  if (totalCount === 0) return risks
  
  const hotCount = props.prospects.filter(p => getProspectCategory(p.status || 'cold') === 'hot').length
  const coldCount = props.prospects.filter(p => getProspectCategory(p.status || 'cold') === 'cold').length
  
  if (coldCount / totalCount > 0.7) {
    risks.push({
      type: 'concentration',
      title: 'Cold Prospects Concentration',
      description: 'More than 70% of prospects are in the "cold" category'
    })
  }
  
  if (hotCount / totalCount < 0.1) {
    risks.push({
      type: 'pipeline',
      title: 'Lack of Hot Prospects',
      description: 'Less than 10% of prospects are in the "hot" category'
    })
  }
  
  // Check for aging prospects
  const today = new Date()
  const oldProspects = props.prospects.filter(p => {
    const created = new Date(p.created_at || today)
    return getMonthsDiff(created, today) > 6
  })
  
  if (oldProspects.length / totalCount > 0.5) {
    risks.push({
      type: 'aging',
      title: 'Aging Prospects',
      description: 'More than 50% of prospects are older than 6 months'
    })
  }
  
  return risks
}

// Fonction pour recalculer le forecast avec les ajustements des sliders
const recalculateForecastWithAdjustments = () => {
  forecast.value = generateForecast()
  metrics.value = calculateMetrics(forecast.value)
}

// Function to calculate moving average
function calculateMovingAverage(data, period) {
  const result = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      // For the first few points, use what data we have
      const available = data.slice(0, i + 1)
      const sum = available.reduce((acc, val) => acc + val, 0)
      result.push(sum / available.length)
    } else {
      // Calculate moving average for the full period
      const subset = data.slice(i - period + 1, i + 1)
      const sum = subset.reduce((acc, val) => acc + val, 0)
      result.push(sum / period)
    }
  }
  
  return result
}

// Smart confidence score calculation based on multiple advanced criteria
const calculateConfidenceScore = () => {
  if (!props.prospects || props.prospects.length === 0) return 0
  
  let totalWeight = 0
  let weightedConfidence = 0
  const today = new Date()
  
  props.prospects.forEach(prospect => {
    const revenue = prospect.revenue || 0
    if (revenue === 0) return // Skip prospects with no revenue
    
    // Base probability
    const baseProbability = (prospect.probability_coefficient || 100) / 100
    
    // 1. Data Quality Factor (0.7 - 1.3)
    let dataQualityFactor = 1.0
    
    // Has completion date
    if (prospect.estimated_completion_date) {
      dataQualityFactor += 0.15
    }
    
    // Has detailed notes
    if (prospect.notes && prospect.notes.length > 100) {
      dataQualityFactor += 0.10
    } else if (prospect.notes && prospect.notes.length > 30) {
      dataQualityFactor += 0.05
    }
    
    // Has contact information
    if (prospect.email) dataQualityFactor += 0.05
    if (prospect.phone) dataQualityFactor += 0.05
    if (prospect.contact) dataQualityFactor += 0.05
    
    // 2. Deal Size Factor (0.8 - 1.2)
    let dealSizeFactor = 1.0
    if (revenue > 50000) dealSizeFactor = 1.2
    else if (revenue > 20000) dealSizeFactor = 1.1
    else if (revenue > 5000) dealSizeFactor = 1.0
    else if (revenue < 1000) dealSizeFactor = 0.8
    
    // 3. Status/Stage Factor (0.6 - 1.4)
    const statusFactors = {
      'hot': 1.4,
      'warm': 1.0,
      'cold': 0.6
    }
    const statusFactor = statusFactors[prospect.status] || 1.0
    
    // 4. Age Factor (0.7 - 1.1)
    let ageFactor = 1.0
    if (prospect.created_at) {
      const createdDate = new Date(prospect.created_at)
      const ageInMonths = (today - createdDate) / (1000 * 60 * 60 * 24 * 30)
      
      if (ageInMonths < 1) ageFactor = 1.1 // Fresh leads
      else if (ageInMonths < 3) ageFactor = 1.05 // Recent leads
      else if (ageInMonths > 12) ageFactor = 0.7 // Old leads
      else if (ageInMonths > 6) ageFactor = 0.85 // Aging leads
    }
    
    // 5. Timeline Factor (0.8 - 1.2)
    let timelineFactor = 1.0
    if (prospect.estimated_completion_date) {
      const completionDate = new Date(prospect.estimated_completion_date)
      const monthsToCompletion = (completionDate - today) / (1000 * 60 * 60 * 24 * 30)
      
      if (monthsToCompletion < 1) timelineFactor = 1.2 // Immediate closure
      else if (monthsToCompletion < 3) timelineFactor = 1.1 // Near-term closure
      else if (monthsToCompletion > 12) timelineFactor = 0.8 // Long-term closure
    }
    
    // Calculate final confidence for this prospect
    const prospectConfidence = Math.min(1.0, 
      baseProbability * dataQualityFactor * dealSizeFactor * statusFactor * ageFactor * timelineFactor
    )
    
    // Weight by revenue
    const weight = revenue
    totalWeight += weight
    weightedConfidence += weight * prospectConfidence
  })
  
  // Portfolio-level adjustments
  let portfolioFactor = 1.0
  
  // Diversification factor
  const statusDistribution = {
    hot: props.prospects.filter(p => p.status === 'hot').length,
    warm: props.prospects.filter(p => p.status === 'warm').length,
    cold: props.prospects.filter(p => p.status === 'cold').length
  }
  
  const total = props.prospects.length
  const hotRatio = statusDistribution.hot / total
  const warmRatio = statusDistribution.warm / total
  
  // Ideal distribution: 20% hot, 40% warm, 40% cold
  if (hotRatio > 0.4) portfolioFactor -= 0.1 // Too many hot leads (unrealistic)
  if (hotRatio < 0.1) portfolioFactor -= 0.15 // Too few hot leads
  if (warmRatio > 0.6) portfolioFactor -= 0.05 // Too many warm leads
  
  // Sample size factor
  if (total < 5) portfolioFactor -= 0.2 // Small sample size
  else if (total > 20) portfolioFactor += 0.1 // Good sample size
  
  const finalScore = totalWeight > 0 ? 
    Math.max(0, Math.min(1, (weightedConfidence / totalWeight) * portfolioFactor)) : 0
  
  return finalScore
}

const createChart = async () => {
  if (isCreatingChart.value) {
    return
  }
  
  if (!forecast.value.length || !props.isVisible || loading.value || props.prospects.length === 0) {
    return
  }
  
  isCreatingChart.value = true
  
  await nextTick()
  
  let attempts = 0
  const maxAttempts = 10
  
  while (!chartCanvas.value && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 200))
    attempts++
  }
  
  if (!chartCanvas.value) {
    return
  }
  
  try {
    safeDestroyChart()
    
    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) {
      return
    }
  
  const datasets = []
  
  // Calculate recurring and non-recurring revenue for each month (needed for both bars and moving average)
  const recurringRevenue = []
  const nonRecurringRevenue = []
  
  forecast.value.forEach(monthData => {
    let recurringTotal = 0
    let nonRecurringTotal = 0
    
    monthData.prospects.forEach(prospect => {
      if (prospect.isRecurring) {
        recurringTotal += prospect.expectedRevenue
      } else {
        nonRecurringTotal += prospect.expectedRevenue
      }
    })
    
    recurringRevenue.push(recurringTotal)
    nonRecurringRevenue.push(nonRecurringTotal)
  })
  
  // Add bar chart if enabled - now split between recurring and non-recurring
  if (showBars.value) {
    // Non-recurring revenue (base bar)
    datasets.push({
      type: 'bar',
      label: 'Non-Recurring Revenue',
      data: nonRecurringRevenue,
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgba(59, 130, 246, 0.8)',
      borderWidth: 1,
      yAxisID: 'y',
      stack: 'revenue'
    })
    
    // Recurring revenue (stacked on top)
    datasets.push({
      type: 'bar',
      label: 'Recurring Revenue',
      data: recurringRevenue,
      backgroundColor: 'rgba(147, 51, 234, 0.6)',
      borderColor: 'rgba(147, 51, 234, 0.8)',
      borderWidth: 1,
      yAxisID: 'y',
      stack: 'revenue'
    })
  }
  
  // Add moving average trend line based on selected type
  let movingAverageData, movingAverageLabel, movingAverageColor
  
  switch (movingAverageType.value) {
    case 'leads':
      movingAverageData = calculateMovingAverage(nonRecurringRevenue, movingAveragePeriod.value)
      movingAverageLabel = `🎯 Leads Moving Average (${movingAveragePeriod.value} months)`
      movingAverageColor = '#3b82f6'
      break
    case 'recurring':
      movingAverageData = calculateMovingAverage(recurringRevenue, movingAveragePeriod.value)
      movingAverageLabel = `🔄 Recurring Moving Average (${movingAveragePeriod.value} months)`
      movingAverageColor = '#9333ea'
      break
    default: // 'both'
      const totalRevenueData = forecast.value.map(f => f.revenue)
      movingAverageData = calculateMovingAverage(totalRevenueData, movingAveragePeriod.value)
      movingAverageLabel = `📈 Total Moving Average (${movingAveragePeriod.value} months)`
      movingAverageColor = '#ef4444'
      break
  }
  
  datasets.push({
    type: 'line',
    label: movingAverageLabel,
    data: movingAverageData,
    borderColor: movingAverageColor,
    backgroundColor: 'transparent',
    fill: false,
    tension: 0.2, // Slight smoothing for visual appeal
    pointRadius: 2,
    pointHoverRadius: 4,
    borderWidth: 3,
    yAxisID: 'y'
  })

  chart.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: forecast.value.map(f => formatMonth(f.date)),
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0 // Désactiver les animations par défaut
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            footer: function(tooltipItems) {
              let total = 0
              tooltipItems.forEach(function(tooltipItem) {
                total += tooltipItem.parsed.y
              })
              return 'Total: ' + formatCurrency(total)
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          stacked: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value)
            }
          }
        },
        x: {
          stacked: true,
          ticks: {
            maxTicksLimit: 12
          }
        }
      }
    }
  })
  
  } catch (error) {
    console.error('❌ Error creating chart:', error)
    safeDestroyChart()
  } finally {
    isCreatingChart.value = false
  }
}

const updateChart = async () => {
  if (chartUpdateTimeout) {
    clearTimeout(chartUpdateTimeout)
  }
  
  chartUpdateTimeout = setTimeout(async () => {
    if (forecast.value.length > 0 && props.isVisible && !isCreatingChart.value) {
      try {
        forecast.value = generateForecast()
        metrics.value = calculateMetrics(forecast.value)
        
        await createChart()
      } catch (error) {
        console.error('❌ Error updating chart:', error)
      }
    }
  }, 150)
}

const refreshForecast = async () => {
  if (!props.isVisible) return
  
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate loading
    
    forecast.value = generateForecast()
    metrics.value = calculateMetrics(forecast.value)
    
    if (props.isVisible) {
      await createChart()
    }
  } catch (error) {
    console.error('❌ Error refreshing forecast:', error)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)
}

const formatMonth = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: '2-digit'
  }).format(date)
}

const getMonthsUntilEndOfYear = () => {
  const today = new Date()
  const endOfYear = new Date(today.getFullYear(), 11, 31)
  const monthsUntilEndOfYear = Math.max(0, (endOfYear.getFullYear() - today.getFullYear()) * 12 + (endOfYear.getMonth() - today.getMonth()) + 1)
  return monthsUntilEndOfYear
}

const formatDateRange = (months, isNextYear = false) => {
  const today = new Date()
  
  if (isNextYear) {
    // Pour "Next year", afficher l'année suivante
    const nextYear = today.getFullYear() + 1
    return `Jan ${nextYear.toString().slice(-2)} - Dec ${nextYear.toString().slice(-2)}`
  }
  
  const endDate = new Date(today.getFullYear(), today.getMonth() + months, 0) // Last day of the target month
  
  const startMonth = today.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  
  return `${startMonth} - ${endMonth}`
}

const formatDateShort = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  }).format(new Date(date))
}

const getRecurringProspects = () => {
  return props.prospects.filter(p => p.status === 'recurring')
}

const getNextRecurringOccurrences = () => {
  const occurrences = []
  const today = new Date()
  const recurringProspects = getRecurringProspects()
  
  recurringProspects.forEach(prospect => {
    const recurrenceMonths = prospect.recurrence_months || 12
    let nextFollowupDate = prospect.next_followup_date
    
    if (nextFollowupDate) {
      const firstDate = new Date(nextFollowupDate)
      
      // Calculer les 3 prochaines occurrences pour chaque prospect récurrent
      for (let i = 0; i < 3; i++) {
        const occurrenceDate = new Date(firstDate)
        occurrenceDate.setMonth(firstDate.getMonth() + (i * recurrenceMonths))
        
        if (occurrenceDate >= today) {
          const adjustedProbabilities = getAdjustedProbabilities()
          const recurringProbability = adjustedProbabilities.recurring
          const prospectProbability = (prospect.probability_coefficient || 100) / 100
          const finalProbability = recurringProbability * prospectProbability
          
          occurrences.push({
            prospectId: prospect.id,
            name: prospect.name,
            date: occurrenceDate.toISOString().split('T')[0],
            expectedRevenue: (prospect.revenue || 0) * finalProbability,
            probability: finalProbability,
            recurrenceMonths: recurrenceMonths,
            occurrenceIndex: i + 1
          })
        }
      }
    } else {
      // Si pas de next_followup_date, commencer dans un mois
      for (let i = 0; i < 3; i++) {
        const occurrenceDate = new Date(today)
        occurrenceDate.setMonth(today.getMonth() + 1 + (i * recurrenceMonths))
        
        const adjustedProbabilities = getAdjustedProbabilities()
        const recurringProbability = adjustedProbabilities.recurring
        const prospectProbability = (prospect.probability_coefficient || 100) / 100
        const finalProbability = recurringProbability * prospectProbability
        
        occurrences.push({
          prospectId: prospect.id,
          name: prospect.name,
          date: occurrenceDate.toISOString().split('T')[0],
          expectedRevenue: (prospect.revenue || 0) * finalProbability,
          probability: finalProbability,
          recurrenceMonths: recurrenceMonths,
          occurrenceIndex: i + 1
        })
      }
    }
  })
  
  // Trier par date
  return occurrences.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 10) // Limiter à 10 prochaines échéances
}

const getCategoryClass = (category) => {
  const classes = {
    hot: 'bg-red-50 border border-red-200',
    warm: 'bg-yellow-50 border border-yellow-200',
    cold: 'bg-blue-50 border border-blue-200',
    recurring: 'bg-purple-50 border border-purple-200'
  }
  return classes[category] || 'bg-gray-50 border border-gray-200'
}

const exportForecast = () => {
  const data = {
    forecast: forecast.value,
    metrics: metrics.value,
    categoryAnalysis: categoryAnalysis.value,
    generatedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `previsionnel-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const closeModal = () => {
  emit('close')
}

// Watch for visibility changes
watch(() => props.isVisible, async (newValue) => {
  if (newValue) {
    // Attendre que le DOM soit prêt avant de créer le graphique
    await nextTick()
    // Délai supplémentaire pour s'assurer que toutes les conditions sont remplies
    setTimeout(() => {
      refreshForecast()
    }, 300)
  } else {
    // Annuler les mises à jour en attente
    if (chartUpdateTimeout) {
      clearTimeout(chartUpdateTimeout)
      chartUpdateTimeout = null
    }
    
    // Réinitialiser le verrou
    isCreatingChart.value = false
    
    // Nettoyer le graphique quand le modal se ferme
    safeDestroyChart()
  }
})

// Watcher supplémentaire pour créer le graphique quand les données sont prêtes
watch([() => loading.value, () => forecast.value.length], async ([newLoading, newForecastLength]) => {
  if (!newLoading && newForecastLength > 0 && props.isVisible && !chart.value) {
    await nextTick()
    setTimeout(() => {
      createChart()
    }, 200)
  }
})

// Watcher pour les ajustements en temps réel
watch([leadTimeAdjustment, probabilityAdjustment, movingAverageType], () => {
  if (chart.value && forecast.value.length > 0) {
    updateChart()
  }
})

// Watcher pour détecter les changements dans les prospects récurrents
watch(() => props.prospects, (newProspects, oldProspects) => {
  // Vérifier si des prospects récurrents ont changé (périodicité ou next_followup_date)
  if (oldProspects && newProspects) {
    let recurringChanged = false
    
    const newRecurring = newProspects.filter(p => p.status === 'recurring')
    const oldRecurring = oldProspects.filter(p => p.status === 'recurring')
    
    // Vérifier si le nombre de prospects récurrents a changé
    if (newRecurring.length !== oldRecurring.length) {
      recurringChanged = true
    } else {
      // Vérifier si des propriétés de récurrence ont changé
      newRecurring.forEach(newP => {
        const oldP = oldRecurring.find(p => p.id === newP.id)
        if (oldP) {
          if (newP.recurrence_months !== oldP.recurrence_months || 
              newP.next_followup_date !== oldP.next_followup_date ||
              newP.revenue !== oldP.revenue ||
              newP.probability_coefficient !== oldP.probability_coefficient) {
            recurringChanged = true
          }
        } else {
          recurringChanged = true
        }
      })
    }
    
    // Si des prospects récurrents ont changé, mettre à jour le forecast
    if (recurringChanged && props.isVisible) {
      console.log('🔄 Recurring prospects changed, updating forecast...')
      updateChart()
    }
  }
}, { deep: true })

// Cleanup chart on unmount
onUnmounted(() => {
  // Nettoyer le timeout
  if (chartUpdateTimeout) {
    clearTimeout(chartUpdateTimeout)
  }
  
  // Nettoyer le graphique
  safeDestroyChart()
})
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Custom slider styles */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-track {
  background: #e5e7eb;
  height: 8px;
  border-radius: 4px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: #3b82f6;
  height: 18px;
  width: 18px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-webkit-slider-thumb:hover {
  background: #2563eb;
  transform: scale(1.1);
}

input[type="range"]::-moz-range-track {
  background: #e5e7eb;
  height: 8px;
  border-radius: 4px;
  border: none;
}

input[type="range"]::-moz-range-thumb {
  background: #3b82f6;
  height: 18px;
  width: 18px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}
</style>
