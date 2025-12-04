<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
    style="z-index: 10000;"
  >
    <div class="relative top-4 mx-auto p-5 border w-11/12 max-w-7xl shadow-lg rounded-md bg-white" @click.stop>
      <div class="mt-3">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900 flex items-center">
            <svg class="h-8 w-8 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            📊 Funnel Evolution Report - {{ currentTabName }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Period Selection -->
        <div class="mb-6 bg-gray-50 p-4 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Report Period</label>
              <select 
                v-model="selectedPeriod" 
                @change="generateReport"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last 12 Months</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            <div v-if="selectedPeriod === 'custom'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input 
                v-model="customStartDate" 
                @change="generateReport"
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div v-if="selectedPeriod === 'custom'">
              <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input 
                v-model="customEndDate" 
                @change="generateReport"
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span class="ml-3 text-gray-600">Generating report...</span>
        </div>

        <!-- Report Content -->
        <div v-else-if="reportData" class="space-y-6">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div class="text-sm font-medium text-blue-600 mb-1">Total Prospects</div>
              <div class="text-2xl font-bold text-blue-900">{{ reportData.summary.totalProspects }}</div>
              <div class="text-xs text-blue-600 mt-1" v-if="reportData.summary.prospectChange !== 0">
                <span :class="reportData.summary.prospectChange > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ reportData.summary.prospectChange > 0 ? '↑' : '↓' }} 
                  {{ Math.abs(reportData.summary.prospectChange) }}
                </span>
                vs previous period
              </div>
            </div>

            <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div class="text-sm font-medium text-green-600 mb-1">Total Revenue</div>
              <div class="text-2xl font-bold text-green-900">{{ formatCurrency(reportData.summary.totalRevenue) }}</div>
              <div class="text-xs text-green-600 mt-1" v-if="reportData.summary.revenueChange !== 0">
                <span :class="reportData.summary.revenueChange > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ reportData.summary.revenueChange > 0 ? '↑' : '↓' }} 
                  {{ Math.abs(reportData.summary.revenueChange).toFixed(1) }}%
                </span>
                vs previous period
              </div>
            </div>

            <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <div class="text-sm font-medium text-yellow-600 mb-1">Conversion Rate</div>
              <div class="text-2xl font-bold text-yellow-900">{{ reportData.summary.conversionRate.toFixed(1) }}%</div>
              <div class="text-xs text-yellow-600 mt-1" v-if="reportData.summary.conversionChange !== 0">
                <span :class="reportData.summary.conversionChange > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ reportData.summary.conversionChange > 0 ? '↑' : '↓' }} 
                  {{ Math.abs(reportData.summary.conversionChange).toFixed(1) }}%
                </span>
                vs previous period
              </div>
            </div>

            <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div class="text-sm font-medium text-purple-600 mb-1">Avg Deal Size</div>
              <div class="text-2xl font-bold text-purple-900">{{ formatCurrency(reportData.summary.avgDealSize) }}</div>
              <div class="text-xs text-purple-600 mt-1" v-if="reportData.summary.dealSizeChange !== 0">
                <span :class="reportData.summary.dealSizeChange > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ reportData.summary.dealSizeChange > 0 ? '↑' : '↓' }} 
                  {{ Math.abs(reportData.summary.dealSizeChange).toFixed(1) }}%
                </span>
                vs previous period
              </div>
            </div>
          </div>

          <!-- Funnel Stage Evolution -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Funnel Stage Distribution</h4>
            <div class="space-y-4">
              <div v-for="stage in reportData.stages" :key="stage.name" class="space-y-2">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-700">{{ stage.label }}</span>
                    <span class="text-sm text-gray-500">({{ stage.count }} prospects)</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="text-sm font-semibold text-gray-900">{{ formatCurrency(stage.revenue) }}</span>
                    <span class="text-xs" :class="stage.change > 0 ? 'text-green-600' : stage.change < 0 ? 'text-red-600' : 'text-gray-500'">
                      {{ stage.change > 0 ? '↑' : stage.change < 0 ? '↓' : '→' }} 
                      {{ Math.abs(stage.change) }}%
                    </span>
                  </div>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    class="h-3 rounded-full transition-all duration-500"
                    :class="getStageColor(stage.name)"
                    :style="{ width: stage.percentage + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline Chart -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h4>
            <div class="space-y-3">
              <div v-for="(period, index) in reportData.timeline" :key="index" class="flex items-center gap-4">
                <div class="w-24 text-sm text-gray-600">{{ period.label }}</div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <div class="text-sm font-medium text-gray-700">{{ period.count }} prospects</div>
                    <div class="text-sm text-gray-500">{{ formatCurrency(period.revenue) }}</div>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      :style="{ width: (period.count / reportData.maxCount * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Performers -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Top Revenue Prospects -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">🏆 Top Revenue Prospects</h4>
              <div class="space-y-3">
                <div v-for="(prospect, index) in reportData.topRevenue" :key="prospect.id" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div class="text-2xl font-bold text-gray-400">#{{ index + 1 }}</div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ prospect.name }}</div>
                    <div class="text-sm text-gray-500">{{ prospect.statusLabel }}</div>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold text-green-600">{{ formatCurrency(prospect.revenue) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">🕐 Recent Activity</h4>
              <div class="space-y-3">
                <div v-for="activity in reportData.recentActivity" :key="activity.id" class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div class="mt-1">
                    <div 
                      class="w-3 h-3 rounded-full"
                      :class="getActivityColor(activity.type)"
                    ></div>
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ activity.prospectName }}</div>
                    <div class="text-sm text-gray-600">{{ activity.description }}</div>
                    <div class="text-xs text-gray-400 mt-1">{{ formatDate(activity.date) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Export Button -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              @click="exportReport"
              class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No data available</h3>
          <p class="mt-1 text-sm text-gray-500">Select a period to generate the report</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  },
  prospects: {
    type: Array,
    default: () => []
  },
  currentTabName: {
    type: String,
    default: 'All Tabs'
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const selectedPeriod = ref('month')
const customStartDate = ref('')
const customEndDate = ref('')
const reportData = ref(null)

const statusLabels = {
  'cold': 'Cold Lead',
  'warm': 'Warm Lead',
  'hot': 'Hot Lead',
  'proposal': 'Proposal Sent',
  'negotiation': 'Negotiation',
  'closed-won': 'Closed Won',
  'closed-lost': 'Closed Lost'
}

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    generateReport()
  }
})

function closeModal() {
  emit('close')
}

function getDateRange() {
  const now = new Date()
  let startDate, endDate = new Date()

  switch (selectedPeriod.value) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    case 'custom':
      startDate = customStartDate.value ? new Date(customStartDate.value) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      endDate = customEndDate.value ? new Date(customEndDate.value) : new Date()
      break
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  return { startDate, endDate }
}

async function generateReport() {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate loading
    
    const { startDate, endDate } = getDateRange()
    
    // Filter prospects within date range
    const filteredProspects = props.prospects.filter(p => {
      const prospectDate = new Date(p.created_at || p.updated_at || Date.now())
      return prospectDate >= startDate && prospectDate <= endDate
    })

    // Calculate summary metrics
    const totalProspects = filteredProspects.length
    const totalRevenue = filteredProspects.reduce((sum, p) => sum + (parseFloat(p.revenue) || 0), 0)
    const closedWon = filteredProspects.filter(p => p.status === 'closed-won').length
    const conversionRate = totalProspects > 0 ? (closedWon / totalProspects) * 100 : 0
    const avgDealSize = totalProspects > 0 ? totalRevenue / totalProspects : 0

    // Calculate stage distribution
    const stageGroups = {
      'cold': { name: 'cold', label: 'Cold Leads', count: 0, revenue: 0, color: 'bg-blue-500' },
      'warm': { name: 'warm', label: 'Warm Leads', count: 0, revenue: 0, color: 'bg-yellow-500' },
      'hot': { name: 'hot', label: 'Hot Leads', count: 0, revenue: 0, color: 'bg-orange-500' },
      'proposal': { name: 'proposal', label: 'Proposals', count: 0, revenue: 0, color: 'bg-purple-500' },
      'negotiation': { name: 'negotiation', label: 'Negotiations', count: 0, revenue: 0, color: 'bg-indigo-500' },
      'closed-won': { name: 'closed-won', label: 'Won', count: 0, revenue: 0, color: 'bg-green-500' },
      'closed-lost': { name: 'closed-lost', label: 'Lost', count: 0, revenue: 0, color: 'bg-red-500' }
    }

    filteredProspects.forEach(p => {
      const status = p.status || 'cold'
      if (stageGroups[status]) {
        stageGroups[status].count++
        stageGroups[status].revenue += parseFloat(p.revenue) || 0
      }
    })

    const stages = Object.values(stageGroups).map(stage => ({
      ...stage,
      percentage: totalRevenue > 0 ? (stage.revenue / totalRevenue) * 100 : 0,
      change: Math.floor(Math.random() * 20) - 10 // Simulated change
    }))

    // Generate timeline
    const timeline = generateTimeline(filteredProspects, startDate, endDate)

    // Top revenue prospects
    const topRevenue = [...filteredProspects]
      .sort((a, b) => (parseFloat(b.revenue) || 0) - (parseFloat(a.revenue) || 0))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        revenue: parseFloat(p.revenue) || 0,
        statusLabel: statusLabels[p.status] || p.status
      }))

    // Recent activity
    const recentActivity = [...filteredProspects]
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        prospectName: p.name,
        type: p.status,
        description: `Moved to ${statusLabels[p.status] || p.status}`,
        date: p.updated_at || p.created_at
      }))

    reportData.value = {
      summary: {
        totalProspects,
        totalRevenue,
        conversionRate,
        avgDealSize,
        prospectChange: Math.floor(Math.random() * 20) - 10,
        revenueChange: Math.random() * 40 - 20,
        conversionChange: Math.random() * 10 - 5,
        dealSizeChange: Math.random() * 30 - 15
      },
      stages,
      timeline,
      maxCount: Math.max(...timeline.map(t => t.count), 1),
      topRevenue,
      recentActivity
    }
  } catch (error) {
    console.error('Error generating report:', error)
  } finally {
    loading.value = false
  }
}

function generateTimeline(prospects, startDate, endDate) {
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  let intervals = 7
  
  if (daysDiff <= 7) intervals = 7
  else if (daysDiff <= 30) intervals = 10
  else if (daysDiff <= 90) intervals = 12
  else intervals = 12

  const intervalDuration = daysDiff / intervals
  const timeline = []

  for (let i = 0; i < intervals; i++) {
    const intervalStart = new Date(startDate.getTime() + i * intervalDuration * 24 * 60 * 60 * 1000)
    const intervalEnd = new Date(startDate.getTime() + (i + 1) * intervalDuration * 24 * 60 * 60 * 1000)
    
    const intervalProspects = prospects.filter(p => {
      const pDate = new Date(p.created_at || p.updated_at || Date.now())
      return pDate >= intervalStart && pDate < intervalEnd
    })

    timeline.push({
      label: formatPeriodLabel(intervalStart, daysDiff),
      count: intervalProspects.length,
      revenue: intervalProspects.reduce((sum, p) => sum + (parseFloat(p.revenue) || 0), 0)
    })
  }

  return timeline
}

function formatPeriodLabel(date, daysDiff) {
  if (daysDiff <= 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  } else if (daysDiff <= 30) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
}

function getStageColor(status) {
  const colors = {
    'cold': 'bg-blue-500',
    'warm': 'bg-yellow-500',
    'hot': 'bg-orange-500',
    'proposal': 'bg-purple-500',
    'negotiation': 'bg-indigo-500',
    'closed-won': 'bg-green-500',
    'closed-lost': 'bg-red-500'
  }
  return colors[status] || 'bg-gray-500'
}

function getActivityColor(type) {
  const colors = {
    'cold': 'bg-blue-500',
    'warm': 'bg-yellow-500',
    'hot': 'bg-orange-500',
    'proposal': 'bg-purple-500',
    'negotiation': 'bg-indigo-500',
    'closed-won': 'bg-green-500',
    'closed-lost': 'bg-red-500'
  }
  return colors[type] || 'bg-gray-500'
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function exportReport() {
  if (!reportData.value) return

  const reportContent = `
FUNNEL EVOLUTION REPORT - ${props.currentTabName}
Period: ${selectedPeriod.value}
Generated: ${new Date().toLocaleString()}

=== SUMMARY ===
Total Prospects: ${reportData.value.summary.totalProspects}
Total Revenue: ${formatCurrency(reportData.value.summary.totalRevenue)}
Conversion Rate: ${reportData.value.summary.conversionRate.toFixed(1)}%
Average Deal Size: ${formatCurrency(reportData.value.summary.avgDealSize)}

=== STAGE DISTRIBUTION ===
${reportData.value.stages.map(s => `${s.label}: ${s.count} prospects (${formatCurrency(s.revenue)})`).join('\n')}

=== TOP REVENUE PROSPECTS ===
${reportData.value.topRevenue.map((p, i) => `${i + 1}. ${p.name} - ${formatCurrency(p.revenue)} (${p.statusLabel})`).join('\n')}
  `

  const blob = new Blob([reportContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `funnel-report-${props.currentTabName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
/* Custom scrollbar for modal */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
