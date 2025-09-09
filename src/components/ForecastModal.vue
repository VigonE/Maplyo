<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
    style="z-index: 10000;"
    @click="closeModal"
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
            📈 Prévisionnel CA - {{ currentTabName }}
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
          <span class="ml-3 text-gray-600">Calcul du prévisionnel...</span>
        </div>

        <!-- Empty Tab State -->
        <div v-else-if="prospects.length === 0" class="text-center py-12">
          <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucun prospect dans l'onglet "{{ currentTabName }}"</h3>
          <p class="mt-2 text-sm text-gray-500">Ajoutez des prospects à cet onglet ou basculez vers un autre onglet pour générer un prévisionnel.</p>
          <div class="mt-6">
            <button
              @click="closeModal"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
            >
              Fermer
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <div v-else class="space-y-6">
          <!-- Debug Info -->
          <div class="bg-gray-100 p-4 rounded-lg border">
            <h4 class="text-sm font-semibold text-gray-800 mb-2">🐛 Debug Info</h4>
            <div class="text-xs text-gray-600 space-y-1">
              <div>Total prospects: {{ prospects.length }}</div>
              <div>Prospects with potential_revenue > 0: {{ prospects.filter(p => p.potential_revenue > 0).length }}</div>
              <div>Prospects with revenue > 0: {{ prospects.filter(p => p.revenue > 0).length }}</div>
              <div>Sample prospect fields: {{ prospects[0] ? Object.keys(prospects[0]).join(', ') : 'None' }}</div>
              <div>Sample values: {{ prospects[0] ? `${prospects[0].name} - pot:${prospects[0].potential_revenue} rev:${prospects[0].revenue} st:${prospects[0].stage} stat:${prospects[0].status}` : 'None' }}</div>
              <div>Lead times: {{ JSON.stringify(leadTimes) }}</div>
            </div>
          </div>

          <!-- Metrics Summary -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div class="text-sm font-medium text-blue-600">Pipeline Total</div>
              <div class="text-2xl font-bold text-blue-900">{{ formatCurrency(metrics.pipelineValue) }}</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
              <div class="text-sm font-medium text-green-600">CA Prévisionnel</div>
              <div class="text-2xl font-bold text-green-900">{{ formatCurrency(metrics.forecastedRevenue) }}</div>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div class="text-sm font-medium text-yellow-600">Taux de Conversion</div>
              <div class="text-2xl font-bold text-yellow-900">{{ (metrics.conversionRate * 100).toFixed(1) }}%</div>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div class="text-sm font-medium text-purple-600">Score de Confiance</div>
              <div class="text-2xl font-bold text-purple-900">{{ metrics.confidenceScore }}%</div>
            </div>
          </div>

          <!-- Chart Container -->
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h4 class="text-lg font-semibold text-gray-800 mb-4">Évolution du CA Prévisionnel</h4>
            <div class="h-96 w-full">
              <canvas ref="chartCanvas" class="w-full h-full"></canvas>
            </div>
          </div>

          <!-- Detailed Analysis -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Monthly Breakdown -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-lg font-semibold text-gray-800 mb-4">🗓️ Répartition Mensuelle</h4>
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
              <h4 class="text-lg font-semibold text-red-800 mb-4">⚠️ Analyse des Risques</h4>
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
            <h4 class="text-lg font-semibold text-gray-800 mb-4">📊 Analyse par Catégorie</h4>
            <div class="grid grid-cols-3 gap-4">
              <div v-for="(data, category) in categoryAnalysis" :key="category" class="text-center p-4 rounded-lg" :class="getCategoryClass(category)">
                <div class="text-sm font-medium text-gray-600 uppercase">{{ category }}</div>
                <div class="text-xl font-bold mt-1">{{ data.count }} prospects</div>
                <div class="text-sm text-gray-500">{{ formatCurrency(data.value) }}</div>
                <div class="text-xs text-gray-400">Avg: {{ data.avgMonths }} mois</div>
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
            🔄 Actualiser
          </button>
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
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
const forecast = ref([])
const metrics = ref({
  pipelineValue: 0,
  weightedPipeline: 0,
  forecastedRevenue: 0,
  conversionRate: 0,
  confidenceScore: 0,
  riskFactors: []
})

// Computed
const categoryAnalysis = computed(() => {
  const analysis = {
    hot: { count: 0, value: 0, avgMonths: props.leadTimes.hot },
    warm: { count: 0, value: 0, avgMonths: props.leadTimes.warm },
    cold: { count: 0, value: 0, avgMonths: props.leadTimes.cold }
  }

  console.log('Analyzing prospects:', props.prospects)
  
  props.prospects.forEach(prospect => {
    // Utiliser le bon champ: status au lieu de stage
    const status = prospect.status || 'cold'
    const category = getProspectCategory(status)
    
    console.log('Prospect:', prospect.name, 'Status:', status, 'Category:', category, 'Revenue:', prospect.revenue)
    
    if (analysis[category]) {
      analysis[category].count++
      analysis[category].value += prospect.revenue || 0
    }
  })

  console.log('Category analysis result:', analysis)
  return analysis
})

// Fonction pour convertir le status en catégorie de température
const getProspectCategory = (status) => {
  // Les statuts sont déjà hot/warm/cold dans votre système
  const validCategories = ['hot', 'warm', 'cold']
  return validCategories.includes(status) ? status : 'cold'
}

// Methods
const generateForecast = () => {
  console.log('=== GENERATING FORECAST ===')
  console.log('Props prospects count:', props.prospects.length)
  console.log('First prospect COMPLETE:', props.prospects[0])
  console.log('All keys of first prospect:', props.prospects[0] ? Object.keys(props.prospects[0]) : 'No prospects')
  console.log('Lead times:', props.leadTimes)
  
  if (!props.prospects.length) {
    console.log('No prospects found, returning empty forecast')
    return []
  }

  // Debug: check prospects with revenue
  const prospectsWithRevenue = props.prospects.filter(p => p.revenue > 0) // FIX: utiliser 'revenue' pas 'potential_revenue'
  console.log('Prospects with revenue > 0:', prospectsWithRevenue.length)
  console.log('Sample prospects with revenue:', prospectsWithRevenue.slice(0, 3))

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

  // Process each prospect with SIMPLIFIED algorithm
  props.prospects.forEach(prospect => {
    const revenue = prospect.revenue || 0 // Utiliser 'revenue' au lieu de 'potential_revenue'
    const status = prospect.status || 'cold' // Utiliser 'status' au lieu de 'stage'
    const category = getProspectCategory(status)
    const leadTimeMonths = props.leadTimes[category] || 6
    const probability = getCategoryProbability(category)
    
    console.log('Processing prospect:', {
      name: prospect.name,
      revenue: revenue,
      status: status,
      category: category,
      leadTime: leadTimeMonths,
      probability: probability
    })
    
    if (revenue <= 0) {
      console.log('Skipping prospect with zero revenue:', prospect.name)
      return
    }
    
    // SIMPLE ALGORITHM: Just put the weighted revenue in the expected closing month
    const targetMonth = Math.min(leadTimeMonths, forecastMonths - 1)
    const expectedRevenue = revenue * probability
    
    console.log(`Adding ${expectedRevenue} to month ${targetMonth}`)
    
    forecastData[targetMonth].revenue += expectedRevenue
    forecastData[targetMonth].prospects.push({
      id: prospect.id,
      name: prospect.name,
      expectedRevenue,
      probability: probability
    })
  })

  console.log('Final forecast data:', forecastData.map(f => ({ date: f.date, revenue: f.revenue })))
  return forecastData
}

const calculateMetrics = (forecastData) => {
  console.log('=== CALCULATING METRICS ===')
  
  const totalPipeline = props.prospects.reduce((sum, p) => sum + (p.revenue || 0), 0)
  const weightedPipeline = props.prospects.reduce((sum, p) => {
    const status = p.status || 'cold'
    const category = getProspectCategory(status)
    const weight = (p.revenue || 0) * getCategoryProbability(category)
    console.log(`Prospect ${p.name}: ${p.revenue} * ${getCategoryProbability(category)} = ${weight}`)
    return sum + weight
  }, 0)
  
  const forecastTotal = forecastData.reduce((sum, f) => sum + f.revenue, 0)
  
  console.log('Metrics calculated:', {
    totalPipeline,
    weightedPipeline,
    forecastTotal
  })
  
  return {
    pipelineValue: totalPipeline,
    weightedPipeline,
    forecastedRevenue: forecastTotal,
    conversionRate: totalPipeline > 0 ? forecastTotal / totalPipeline : 0,
    confidenceScore: calculateConfidenceScore(),
    riskFactors: identifyRiskFactors()
  }
}

const getCategoryProbability = (category) => {
  const probabilities = {
    hot: 0.80,
    warm: 0.45,
    cold: 0.15
  }
  return probabilities[category] || 0.3
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

const calculateConfidenceScore = () => {
  if (!props.prospects.length) return 0
  
  const categoryDistribution = {}
  props.prospects.forEach(p => {
    const status = p.status || 'cold' // FIX: utiliser 'status' pas 'stage'
    const category = getProspectCategory(status)
    categoryDistribution[category] = (categoryDistribution[category] || 0) + 1
  })
  
  const maxCategory = Math.max(...Object.values(categoryDistribution))
  const diversityScore = 1 - (maxCategory / props.prospects.length)
  
  return Math.min(100, Math.max(0, diversityScore * 100))
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
      title: 'Concentration sur prospects froids',
      description: 'Plus de 70% des prospects sont dans la catégorie "cold"'
    })
  }
  
  if (hotCount / totalCount < 0.1) {
    risks.push({
      type: 'pipeline',
      title: 'Manque de prospects chauds',
      description: 'Moins de 10% des prospects sont dans la catégorie "hot"'
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
      title: 'Prospects vieillissants',
      description: 'Plus de 50% des prospects ont plus de 6 mois'
    })
  }
  
  return risks
}

const createChart = async () => {
  if (!chartCanvas.value || !forecast.value.length) return
  
  await nextTick()
  
  if (chart.value) {
    chart.value.destroy()
  }
  
  const ctx = chartCanvas.value.getContext('2d')
  
  chart.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: forecast.value.map(f => formatMonth(f.date)),
      datasets: [
        {
          label: 'CA Prévisionnel',
          data: forecast.value.map(f => f.revenue),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value)
            }
          }
        },
        x: {
          ticks: {
            maxTicksLimit: 12
          }
        }
      }
    }
  })
}

const refreshForecast = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate loading
    
    forecast.value = generateForecast()
    metrics.value = calculateMetrics(forecast.value)
    
    await createChart()
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

const getCategoryClass = (category) => {
  const classes = {
    hot: 'bg-red-50 border border-red-200',
    warm: 'bg-yellow-50 border border-yellow-200',
    cold: 'bg-blue-50 border border-blue-200'
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
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    refreshForecast()
  }
})

// Cleanup chart on unmount
onMounted(() => {
  return () => {
    if (chart.value) {
      chart.value.destroy()
    }
  }
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
</style>
