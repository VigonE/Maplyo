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

          <!-- Lead Categories Evolution Chart -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h4 class="text-xl font-bold text-gray-900 mb-2">🌡️ Lead Categories Distribution</h4>
                <p class="text-sm text-gray-500">Total number of leads in each category (absolute values)</p>
              </div>
              
              <!-- Category Toggles -->
              <div class="flex flex-col gap-2">
                <button
                  @click="toggleCategory('cold')"
                  :class="[
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                    visibleCategories.cold 
                      ? 'bg-blue-100 text-blue-700 shadow-sm' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <div :class="['w-8 h-0.5 rounded-full', visibleCategories.cold ? 'bg-blue-500' : 'bg-gray-400']"></div>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Cold Leads</span>
                </button>
                
                <button
                  @click="toggleCategory('warm')"
                  :class="[
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                    visibleCategories.warm 
                      ? 'bg-yellow-100 text-yellow-700 shadow-sm' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <div :class="['w-8 h-0.5 rounded-full', visibleCategories.warm ? 'bg-yellow-500' : 'bg-gray-400']"></div>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span>Warm Leads</span>
                </button>
                
                <button
                  @click="toggleCategory('hot')"
                  :class="[
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                    visibleCategories.hot 
                      ? 'bg-orange-100 text-orange-700 shadow-sm' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <div :class="['w-8 h-0.5 rounded-full', visibleCategories.hot ? 'bg-orange-500' : 'bg-gray-400']"></div>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                  <span>Hot Leads</span>
                </button>
                
                <button
                  @click="toggleCategory('won')"
                  :class="[
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                    visibleCategories.won 
                      ? 'bg-green-100 text-green-700 shadow-sm' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <div :class="['w-8 h-0.5 rounded-full', visibleCategories.won ? 'bg-green-500' : 'bg-gray-400']"></div>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Won</span>
                </button>
                
                <button
                  @click="toggleCategory('lost')"
                  :class="[
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                    visibleCategories.lost 
                      ? 'bg-red-100 text-red-700 shadow-sm' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <div :class="['w-8 h-0.5 rounded-full', visibleCategories.lost ? 'bg-red-500' : 'bg-gray-400']"></div>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span>Lost</span>
                </button>
                
                <button
                  @click="toggleCategory('recurring')"
                  :class="[
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                    visibleCategories.recurring 
                      ? 'bg-purple-100 text-purple-700 shadow-sm' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <div :class="['w-8 h-0.5 rounded-full', visibleCategories.recurring ? 'bg-purple-500' : 'bg-gray-400']"></div>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span>Recurring</span>
                </button>
              </div>
            </div>
            
            <div class="relative" style="height: 400px;">
              <svg class="w-full h-full" viewBox="0 0 1000 350" preserveAspectRatio="none">
                <!-- Grid lines -->
                <line v-for="i in 7" :key="'grid-cat-' + i" 
                  :x1="0" :y1="i * 50" :x2="1000" :y2="i * 50" 
                  stroke="#f3f4f6" stroke-width="1" />
                
                <line v-for="i in 10" :key="'grid-cat-vert-' + i" 
                  :x1="i * 100" :y1="0" :x2="i * 100" :y2="350" 
                  stroke="#f9fafb" stroke-width="1" />
                
                <!-- Cold Leads Area (if visible) -->
                <path 
                  v-if="visibleCategories.cold"
                  :d="getCategoryAreaPath('cold')"
                  fill="url(#gradientCold)"
                  opacity="0.15"
                  class="transition-opacity duration-300"
                />
                
                <!-- Warm Leads Area (if visible) -->
                <path 
                  v-if="visibleCategories.warm"
                  :d="getCategoryAreaPath('warm')"
                  fill="url(#gradientWarm)"
                  opacity="0.15"
                  class="transition-opacity duration-300"
                />
                
                <!-- Hot Leads Area (if visible) -->
                <path 
                  v-if="visibleCategories.hot"
                  :d="getCategoryAreaPath('hot')"
                  fill="url(#gradientHot)"
                  opacity="0.15"
                  class="transition-opacity duration-300"
                />
                
                <!-- Won Area (if visible) -->
                <path 
                  v-if="visibleCategories.won"
                  :d="getCategoryAreaPath('won')"
                  fill="url(#gradientWon)"
                  opacity="0.15"
                  class="transition-opacity duration-300"
                />
                
                <!-- Lost Area (if visible) -->
                <path 
                  v-if="visibleCategories.lost"
                  :d="getCategoryAreaPath('lost')"
                  fill="url(#gradientLost)"
                  opacity="0.15"
                  class="transition-opacity duration-300"
                />
                
                <!-- Recurring Area (if visible) -->
                <path 
                  v-if="visibleCategories.recurring"
                  :d="getCategoryAreaPath('recurring')"
                  fill="url(#gradientRecurring)"
                  opacity="0.15"
                  class="transition-opacity duration-300"
                />
                
                <!-- Cold Leads Line (if visible) -->
                <path 
                  v-if="visibleCategories.cold"
                  :d="getCategoryLinePath('cold')"
                  stroke="#3b82f6"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transition-all duration-300"
                  style="filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3));"
                />
                
                <!-- Warm Leads Line (if visible) -->
                <path 
                  v-if="visibleCategories.warm"
                  :d="getCategoryLinePath('warm')"
                  stroke="#eab308"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transition-all duration-300"
                  style="filter: drop-shadow(0 2px 4px rgba(234, 179, 8, 0.3));"
                />
                
                <!-- Hot Leads Line (if visible) -->
                <path 
                  v-if="visibleCategories.hot"
                  :d="getCategoryLinePath('hot')"
                  stroke="#f97316"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transition-all duration-300"
                  style="filter: drop-shadow(0 2px 4px rgba(249, 115, 22, 0.3));"
                />
                
                <!-- Won Line (if visible) -->
                <path 
                  v-if="visibleCategories.won"
                  :d="getCategoryLinePath('won')"
                  stroke="#22c55e"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transition-all duration-300"
                  style="filter: drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3));"
                />
                
                <!-- Lost Line (if visible) -->
                <path 
                  v-if="visibleCategories.lost"
                  :d="getCategoryLinePath('lost')"
                  stroke="#ef4444"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transition-all duration-300"
                  style="filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3));"
                />
                
                <!-- Recurring Line (if visible) -->
                <path 
                  v-if="visibleCategories.recurring"
                  :d="getCategoryLinePath('recurring')"
                  stroke="#a855f7"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transition-all duration-300"
                  style="filter: drop-shadow(0 2px 4px rgba(168, 85, 247, 0.3));"
                />
                
                <!-- Data points for Cold Leads -->
                <g v-if="visibleCategories.cold">
                  <circle 
                    v-for="(point, index) in reportData.categoryTimeline" 
                    :key="'point-cold-' + index"
                    :cx="(index / (reportData.categoryTimeline.length - 1)) * 1000"
                    :cy="350 - ((point.cold / reportData.maxCategoryCount) * 310 + 20)"
                    r="4"
                    fill="#3b82f6"
                    stroke="white"
                    stroke-width="2"
                    class="hover:r-6 transition-all cursor-pointer"
                    @mouseenter="showCategoryTooltip($event, point, 'cold')"
                    @mouseleave="hideTooltip"
                  />
                </g>
                
                <!-- Data points for Warm Leads -->
                <g v-if="visibleCategories.warm">
                  <circle 
                    v-for="(point, index) in reportData.categoryTimeline" 
                    :key="'point-warm-' + index"
                    :cx="(index / (reportData.categoryTimeline.length - 1)) * 1000"
                    :cy="350 - ((point.warm / reportData.maxCategoryCount) * 310 + 20)"
                    r="4"
                    fill="#eab308"
                    stroke="white"
                    stroke-width="2"
                    class="hover:r-6 transition-all cursor-pointer"
                    @mouseenter="showCategoryTooltip($event, point, 'warm')"
                    @mouseleave="hideTooltip"
                  />
                </g>
                
                <!-- Data points for Hot Leads -->
                <g v-if="visibleCategories.hot">
                  <circle 
                    v-for="(point, index) in reportData.categoryTimeline" 
                    :key="'point-hot-' + index"
                    :cx="(index / (reportData.categoryTimeline.length - 1)) * 1000"
                    :cy="350 - ((point.hot / reportData.maxCategoryCount) * 310 + 20)"
                    r="4"
                    fill="#f97316"
                    stroke="white"
                    stroke-width="2"
                    class="hover:r-6 transition-all cursor-pointer"
                    @mouseenter="showCategoryTooltip($event, point, 'hot')"
                    @mouseleave="hideTooltip"
                  />
                </g>
                
                <!-- Data points for Won -->
                <g v-if="visibleCategories.won">
                  <circle 
                    v-for="(point, index) in reportData.categoryTimeline" 
                    :key="'point-won-' + index"
                    :cx="(index / (reportData.categoryTimeline.length - 1)) * 1000"
                    :cy="350 - ((point.won / reportData.maxCategoryCount) * 310 + 20)"
                    r="4"
                    fill="#22c55e"
                    stroke="white"
                    stroke-width="2"
                    class="hover:r-6 transition-all cursor-pointer"
                    @mouseenter="showCategoryTooltip($event, point, 'won')"
                    @mouseleave="hideTooltip"
                  />
                </g>
                
                <!-- Data points for Lost -->
                <g v-if="visibleCategories.lost">
                  <circle 
                    v-for="(point, index) in reportData.categoryTimeline" 
                    :key="'point-lost-' + index"
                    :cx="(index / (reportData.categoryTimeline.length - 1)) * 1000"
                    :cy="350 - ((point.lost / reportData.maxCategoryCount) * 310 + 20)"
                    r="4"
                    fill="#ef4444"
                    stroke="white"
                    stroke-width="2"
                    class="hover:r-6 transition-all cursor-pointer"
                    @mouseenter="showCategoryTooltip($event, point, 'lost')"
                    @mouseleave="hideTooltip"
                  />
                </g>
                
                <!-- Data points for Recurring -->
                <g v-if="visibleCategories.recurring">
                  <circle 
                    v-for="(point, index) in reportData.categoryTimeline" 
                    :key="'point-recurring-' + index"
                    :cx="(index / (reportData.categoryTimeline.length - 1)) * 1000"
                    :cy="350 - ((point.recurring / reportData.maxCategoryCount) * 310 + 20)"
                    r="4"
                    fill="#a855f7"
                    stroke="white"
                    stroke-width="2"
                    class="hover:r-6 transition-all cursor-pointer"
                    @mouseenter="showCategoryTooltip($event, point, 'recurring')"
                    @mouseleave="hideTooltip"
                  />
                </g>
                
                <!-- Gradient definitions -->
                <defs>
                  <linearGradient id="gradientCold" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
                  </linearGradient>
                  <linearGradient id="gradientWarm" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#eab308;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#eab308;stop-opacity:0" />
                  </linearGradient>
                  <linearGradient id="gradientHot" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#f97316;stop-opacity:0" />
                  </linearGradient>
                  <linearGradient id="gradientWon" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#22c55e;stop-opacity:0" />
                  </linearGradient>
                  <linearGradient id="gradientLost" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#ef4444;stop-opacity:0" />
                  </linearGradient>
                  <linearGradient id="gradientRecurring" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#a855f7;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#a855f7;stop-opacity:0" />
                  </linearGradient>
                </defs>
              </svg>
              
              <!-- Tooltip -->
              <div
                v-if="tooltip.visible"
                :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
                class="absolute pointer-events-none bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg z-10"
              >
                <div class="font-semibold">{{ tooltip.label }}</div>
                <div>{{ tooltip.value }}</div>
              </div>
              
              <!-- X-axis labels -->
              <div class="flex justify-between mt-3 text-xs text-gray-500 px-2">
                <span>{{ reportData.categoryTimeline[0]?.label }}</span>
                <span>{{ reportData.categoryTimeline[Math.floor(reportData.categoryTimeline.length / 3)]?.label }}</span>
                <span>{{ reportData.categoryTimeline[Math.floor(reportData.categoryTimeline.length * 2 / 3)]?.label }}</span>
                <span>{{ reportData.categoryTimeline[reportData.categoryTimeline.length - 1]?.label }}</span>
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

          <!-- Main Evolution Chart -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h4 class="text-xl font-bold text-gray-900 mb-2">📈 Funnel Evolution</h4>
                <p class="text-sm text-gray-500">Click on metrics to show/hide curves</p>
              </div>
              
              <!-- Metric Toggles -->
              <div class="flex flex-col gap-2">
                <button
                  @click="toggleMetric('newProspects')"
                  :class="[
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                    visibleMetrics.newProspects 
                      ? 'bg-blue-100 text-blue-700 shadow-sm' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <div :class="['w-8 h-0.5 rounded-full', visibleMetrics.newProspects ? 'bg-blue-500' : 'bg-gray-400']"></div>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span>New Prospects</span>
                </button>
                
                <button
                  @click="toggleMetric('revenue')"
                  :class="[
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                    visibleMetrics.revenue 
                      ? 'bg-green-100 text-green-700 shadow-sm' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <div :class="['w-8 h-0.5 rounded-full', visibleMetrics.revenue ? 'bg-green-500' : 'bg-gray-400']"></div>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Revenue</span>
                </button>
                
                <button
                  @click="toggleMetric('conversion')"
                  :class="[
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                    visibleMetrics.conversion 
                      ? 'bg-orange-100 text-orange-700 shadow-sm' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <div :class="['w-8 h-0.5 rounded-full', visibleMetrics.conversion ? 'bg-orange-500' : 'bg-gray-400']"></div>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span>Conversion %</span>
                </button>
              </div>
            </div>
            
            <div class="relative" style="height: 400px;">
              <svg class="w-full h-full" viewBox="0 0 1000 350" preserveAspectRatio="none">
                <!-- Grid lines -->
                <line v-for="i in 7" :key="'grid-main-' + i" 
                  :x1="0" :y1="i * 50" :x2="1000" :y2="i * 50" 
                  stroke="#f3f4f6" stroke-width="1" />
                
                <line v-for="i in 10" :key="'grid-vert-' + i" 
                  :x1="i * 100" :y1="0" :x2="i * 100" :y2="350" 
                  stroke="#f9fafb" stroke-width="1" />
                
                <!-- New Prospects Area (if visible) -->
                <path 
                  v-if="visibleMetrics.newProspects"
                  :d="getMainChartAreaPath('newCount')"
                  fill="url(#gradientNewProspects)"
                  opacity="0.15"
                  class="transition-opacity duration-300"
                />
                
                <!-- Revenue Area (if visible) -->
                <path 
                  v-if="visibleMetrics.revenue"
                  :d="getMainChartAreaPath('revenue')"
                  fill="url(#gradientRevenueMain)"
                  opacity="0.15"
                  class="transition-opacity duration-300"
                />
                
                <!-- New Prospects Line (if visible) -->
                <path 
                  v-if="visibleMetrics.newProspects"
                  :d="getMainChartLinePath('newCount')"
                  stroke="#3b82f6"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transition-all duration-300"
                  style="filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3));"
                />
                
                <!-- Revenue Line (if visible) -->
                <path 
                  v-if="visibleMetrics.revenue"
                  :d="getMainChartLinePath('revenue')"
                  stroke="#10b981"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transition-all duration-300"
                  style="filter: drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3));"
                />
                
                <!-- Conversion Line (if visible) -->
                <path 
                  v-if="visibleMetrics.conversion"
                  :d="getConversionMainLinePath()"
                  stroke="#f59e0b"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-dasharray="8,4"
                  class="transition-all duration-300"
                  style="filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3));"
                />
                
                <!-- Data points for New Prospects -->
                <g v-if="visibleMetrics.newProspects">
                  <circle 
                    v-for="(point, index) in reportData.timeline" 
                    :key="'point-new-' + index"
                    :cx="(index / (reportData.timeline.length - 1)) * 1000"
                    :cy="350 - ((point.newCount / reportData.maxNewCount) * 310 + 20)"
                    r="4"
                    fill="#3b82f6"
                    stroke="white"
                    stroke-width="2"
                    class="hover:r-6 transition-all cursor-pointer"
                    @mouseenter="showTooltip($event, point, 'newCount')"
                    @mouseleave="hideTooltip"
                  />
                </g>
                
                <!-- Data points for Revenue -->
                <g v-if="visibleMetrics.revenue">
                  <circle 
                    v-for="(point, index) in reportData.timeline" 
                    :key="'point-rev-' + index"
                    :cx="(index / (reportData.timeline.length - 1)) * 1000"
                    :cy="350 - ((point.revenue / reportData.maxRevenue) * 310 + 20)"
                    r="4"
                    fill="#10b981"
                    stroke="white"
                    stroke-width="2"
                    class="hover:r-6 transition-all cursor-pointer"
                    @mouseenter="showTooltip($event, point, 'revenue')"
                    @mouseleave="hideTooltip"
                  />
                </g>
                
                <!-- Data points for Conversion -->
                <g v-if="visibleMetrics.conversion">
                  <circle 
                    v-for="(point, index) in reportData.conversionTimeline" 
                    :key="'point-conv-' + index"
                    :cx="(index / (reportData.conversionTimeline.length - 1)) * 1000"
                    :cy="350 - ((point.rate / 100) * 310 + 20)"
                    r="4"
                    fill="#f59e0b"
                    stroke="white"
                    stroke-width="2"
                    class="hover:r-6 transition-all cursor-pointer"
                    @mouseenter="showTooltip($event, point, 'conversion')"
                    @mouseleave="hideTooltip"
                  />
                </g>
                
                <!-- Gradient definitions -->
                <defs>
                  <linearGradient id="gradientNewProspects" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
                  </linearGradient>
                  <linearGradient id="gradientRevenueMain" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#10b981;stop-opacity:0" />
                  </linearGradient>
                </defs>
              </svg>
              
              <!-- Tooltip -->
              <div
                v-if="tooltip.visible"
                :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
                class="absolute pointer-events-none bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg z-10"
              >
                <div class="font-semibold">{{ tooltip.label }}</div>
                <div>{{ tooltip.value }}</div>
              </div>
              
              <!-- X-axis labels -->
              <div class="flex justify-between mt-3 text-xs text-gray-500 px-2">
                <span>{{ reportData.timeline[0]?.label }}</span>
                <span>{{ reportData.timeline[Math.floor(reportData.timeline.length / 3)]?.label }}</span>
                <span>{{ reportData.timeline[Math.floor(reportData.timeline.length * 2 / 3)]?.label }}</span>
                <span>{{ reportData.timeline[reportData.timeline.length - 1]?.label }}</span>
              </div>
            </div>
          </div>

          <!-- Multi-metric Evolution Chart (Hidden - using main chart instead) -->
          <div v-if="false" class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-lg font-semibold text-gray-900">📊 Multi-Metric Evolution</h4>
              <div class="flex gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span class="text-gray-600">Prospects</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  <span class="text-gray-600">Revenue</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span class="text-gray-600">Conversion %</span>
                </div>
              </div>
            </div>
            <div class="relative h-80">
              <svg class="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                <!-- Grid lines -->
                <line v-for="i in 6" :key="'grid-multi-' + i" 
                  :x1="0" :y1="i * 50" :x2="800" :y2="i * 50" 
                  stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4" />
                
                <!-- Revenue area (normalized) -->
                <path 
                  :d="getMultiMetricAreaPath('revenue')"
                  fill="url(#gradientRevenueMulti)"
                  opacity="0.2"
                />
                
                <!-- Prospects line -->
                <path 
                  :d="getMultiMetricLinePath('count')"
                  stroke="#8b5cf6"
                  stroke-width="3"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                
                <!-- Revenue line -->
                <path 
                  :d="getMultiMetricLinePath('revenue')"
                  stroke="#10b981"
                  stroke-width="3"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                
                <!-- Conversion line -->
                <path 
                  :d="getConversionMultiLinePath()"
                  stroke="#f59e0b"
                  stroke-width="3"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-dasharray="6,3"
                />
                
                <!-- Data points for prospects -->
                <circle 
                  v-for="(point, index) in reportData.timeline" 
                  :key="'point-multi-prospects-' + index"
                  :cx="(index / (reportData.timeline.length - 1)) * 800"
                  :cy="300 - ((point.count / reportData.maxCount) * 260 + 20)"
                  r="5"
                  fill="#8b5cf6"
                  stroke="white"
                  stroke-width="2"
                  class="hover:r-7 transition-all cursor-pointer"
                >
                  <title>{{ point.label }}: {{ point.count }} prospects</title>
                </circle>
                
                <!-- Data points for revenue -->
                <circle 
                  v-for="(point, index) in reportData.timeline" 
                  :key="'point-multi-revenue-' + index"
                  :cx="(index / (reportData.timeline.length - 1)) * 800"
                  :cy="300 - ((point.revenue / reportData.maxRevenue) * 260 + 20)"
                  r="5"
                  fill="#10b981"
                  stroke="white"
                  stroke-width="2"
                  class="hover:r-7 transition-all cursor-pointer"
                >
                  <title>{{ point.label }}: {{ formatCurrency(point.revenue) }}</title>
                </circle>
                
                <!-- Gradient definition -->
                <defs>
                  <linearGradient id="gradientRevenueMulti" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#10b981;stop-opacity:0" />
                  </linearGradient>
                </defs>
              </svg>
              
              <!-- X-axis labels -->
              <div class="flex justify-between mt-2 text-xs text-gray-500">
                <span>{{ reportData.timeline[0]?.label }}</span>
                <span>{{ reportData.timeline[Math.floor(reportData.timeline.length / 2)]?.label }}</span>
                <span>{{ reportData.timeline[reportData.timeline.length - 1]?.label }}</span>
              </div>
            </div>
          </div>

          <!-- Conversion Rate Evolution Chart (Hidden - using main chart instead) -->
          <div v-if="false" class="bg-white border border-gray-200 rounded-lg p-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">🎯 Conversion Rate Evolution</h4>
            <div class="relative h-64">
              <svg class="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                <!-- Grid lines -->
                <line v-for="i in 5" :key="'grid-conv-' + i" 
                  :x1="0" :y1="i * 40" :x2="800" :y2="i * 40" 
                  stroke="#e5e7eb" stroke-width="1" />
                
                <!-- Area under curve -->
                <path 
                  :d="getConversionAreaPath()"
                  fill="url(#gradientConversion)"
                  opacity="0.3"
                />
                
                <!-- Line -->
                <path 
                  :d="getConversionLinePath()"
                  stroke="#f59e0b"
                  stroke-width="3"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                
                <!-- Data points -->
                <circle 
                  v-for="(point, index) in reportData.conversionTimeline" 
                  :key="'point-conv-' + index"
                  :cx="(index / (reportData.conversionTimeline.length - 1)) * 800"
                  :cy="200 - (point.rate * 1.8)"
                  r="5"
                  fill="#f59e0b"
                  class="hover:r-7 transition-all cursor-pointer"
                >
                  <title>{{ point.label }}: {{ point.rate.toFixed(1) }}% conversion</title>
                </circle>
                
                <!-- Gradient definition -->
                <defs>
                  <linearGradient id="gradientConversion" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:0" />
                  </linearGradient>
                </defs>
              </svg>
              
              <!-- X-axis labels -->
              <div class="flex justify-between mt-2 text-xs text-gray-500">
                <span>{{ reportData.conversionTimeline[0]?.label }}</span>
                <span>{{ reportData.conversionTimeline[Math.floor(reportData.conversionTimeline.length / 2)]?.label }}</span>
                <span>{{ reportData.conversionTimeline[reportData.conversionTimeline.length - 1]?.label }}</span>
              </div>
            </div>
          </div>

          <!-- Activity Timeline (Bars) -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">📊 Activity Timeline</h4>
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

// Visible metrics for the main chart
const visibleMetrics = ref({
  newProspects: true,
  revenue: true,
  conversion: true
})

// Visible categories for the category chart
const visibleCategories = ref({
  cold: true,
  warm: true,
  hot: true,
  won: true,
  lost: true,
  recurring: true
})

// Tooltip state
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  label: '',
  value: ''
})

const statusLabels = {
  'cold': 'Cold Lead',
  'warm': 'Warm Lead',
  'hot': 'Hot Lead',
  'proposal': 'Proposal Sent',
  'negotiation': 'Negotiation',
  'closed-won': 'Closed Won',
  'closed-lost': 'Closed Lost'
}

function toggleMetric(metric) {
  visibleMetrics.value[metric] = !visibleMetrics.value[metric]
}

function toggleCategory(category) {
  visibleCategories.value[category] = !visibleCategories.value[category]
}

function showTooltip(event, point, type) {
  const rect = event.target.getBoundingClientRect()
  const container = event.target.closest('.relative')
  const containerRect = container.getBoundingClientRect()
  
  tooltip.value.x = rect.left - containerRect.left + rect.width / 2
  tooltip.value.y = rect.top - containerRect.top - 40
  tooltip.value.label = point.label
  
  if (type === 'newCount') {
    tooltip.value.value = `+${point.newCount} new prospects`
  } else if (type === 'revenue') {
    tooltip.value.value = formatCurrency(point.revenue)
  } else if (type === 'conversion') {
    tooltip.value.value = `${point.rate.toFixed(1)}% conversion`
  }
  
  tooltip.value.visible = true
}

function hideTooltip() {
  tooltip.value.visible = false
}

function showCategoryTooltip(event, point, category) {
  const rect = event.target.getBoundingClientRect()
  const container = event.target.closest('.relative')
  const containerRect = container.getBoundingClientRect()
  
  tooltip.value.x = rect.left - containerRect.left + rect.width / 2
  tooltip.value.y = rect.top - containerRect.top - 40
  tooltip.value.label = point.label
  
  const categoryLabels = {
    cold: 'Cold Leads',
    warm: 'Warm Leads',
    hot: 'Hot Leads',
    won: 'Closed Won',
    lost: 'Closed Lost',
    recurring: 'Recurring'
  }
  
  tooltip.value.value = `${point[category]} ${categoryLabels[category]}`
  tooltip.value.visible = true
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
    
    // Generate conversion timeline
    const conversionTimeline = generateConversionTimeline(filteredProspects, startDate, endDate, timeline.length)
    
    // Generate category timeline (cold, warm, hot)
    // IMPORTANT: Use ALL prospects, not just filtered ones, to show complete status distribution
    const categoryTimeline = generateCategoryTimeline(props.prospects, startDate, endDate, timeline.length)

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
      conversionTimeline,
      categoryTimeline,
      maxCount: Math.max(...timeline.map(t => t.count), 1),
      maxNewCount: Math.max(...timeline.map(t => t.newCount), 1),
      maxRevenue: Math.max(...timeline.map(t => t.revenue), 1),
      maxCategoryCount: Math.max(
        ...categoryTimeline.map(t => Math.max(t.cold, t.warm, t.hot, t.won, t.lost, t.recurring)),
        1
      ),
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
  let cumulativeCount = 0

  for (let i = 0; i < intervals; i++) {
    const intervalStart = new Date(startDate.getTime() + i * intervalDuration * 24 * 60 * 60 * 1000)
    const intervalEnd = new Date(startDate.getTime() + (i + 1) * intervalDuration * 24 * 60 * 60 * 1000)
    
    // Prospects created in this interval
    const intervalProspects = prospects.filter(p => {
      const pDate = new Date(p.created_at || p.updated_at || Date.now())
      return pDate >= intervalStart && pDate < intervalEnd
    })
    
    // New prospects added in this period
    const newCount = intervalProspects.length
    cumulativeCount += newCount

    timeline.push({
      label: formatPeriodLabel(intervalStart, daysDiff),
      count: intervalProspects.length, // Prospects in this period
      newCount: newCount, // New prospects added
      totalCount: cumulativeCount, // Cumulative total
      revenue: intervalProspects.reduce((sum, p) => sum + (parseFloat(p.revenue) || 0), 0)
    })
  }

  return timeline
}

function generateConversionTimeline(prospects, startDate, endDate, intervals) {
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  const intervalDuration = daysDiff / intervals
  const conversionTimeline = []

  for (let i = 0; i < intervals; i++) {
    const intervalStart = new Date(startDate.getTime() + i * intervalDuration * 24 * 60 * 60 * 1000)
    const intervalEnd = new Date(startDate.getTime() + (i + 1) * intervalDuration * 24 * 60 * 60 * 1000)
    
    const intervalProspects = prospects.filter(p => {
      const pDate = new Date(p.created_at || p.updated_at || Date.now())
      return pDate >= intervalStart && pDate < intervalEnd
    })

    const wonProspects = intervalProspects.filter(p => p.status === 'closed-won').length
    const rate = intervalProspects.length > 0 ? (wonProspects / intervalProspects.length) * 100 : 0

    conversionTimeline.push({
      label: formatPeriodLabel(intervalStart, daysDiff),
      rate: rate,
      won: wonProspects,
      total: intervalProspects.length
    })
  }

  return conversionTimeline
}

function generateCategoryTimeline(prospects, startDate, endDate, intervals) {
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  const intervalDuration = daysDiff / intervals
  const categoryTimeline = []

  // Get status history for all prospects
  const statusHistory = {}
  
  prospects.forEach(p => {
    if (p.status_history && Array.isArray(p.status_history) && p.status_history.length > 0) {
      statusHistory[p.id] = p.status_history.map(h => ({
        status: h.status,
        changed_at: new Date(h.changed_at)
      })).sort((a, b) => a.changed_at - b.changed_at)
    } else {
      // If no history, use current status with created_at date
      statusHistory[p.id] = [{
        status: p.status,
        changed_at: new Date(p.created_at || Date.now())
      }]
    }
  })

  for (let i = 0; i < intervals; i++) {
    const intervalStart = new Date(startDate.getTime() + i * intervalDuration * 24 * 60 * 60 * 1000)
    const intervalEnd = new Date(startDate.getTime() + (i + 1) * intervalDuration * 24 * 60 * 60 * 1000)
    
    // For each prospect, find what status it had at intervalEnd
    const statusCounts = { cold: 0, warm: 0, hot: 0, won: 0, lost: 0, recurring: 0 }
    let totalCount = 0

    prospects.forEach(p => {
      const pCreated = new Date(p.created_at || Date.now())
      
      // Count ALL prospects that existed at this time (not just those created in the selected period)
      if (pCreated <= intervalEnd) {
        totalCount++
        
        // Find the status at intervalEnd by looking at history
        const history = statusHistory[p.id] || []
        let statusAtTime = p.status // Default to current status
        
        // Find the most recent status change before or at intervalEnd
        for (let j = history.length - 1; j >= 0; j--) {
          if (history[j].changed_at <= intervalEnd) {
            statusAtTime = history[j].status
            break
          }
        }
        
        // Count by status
        if (statusCounts.hasOwnProperty(statusAtTime)) {
          statusCounts[statusAtTime]++
        }
      }
    })
    
    // Log only the last interval (today's values)
    if (i === intervals - 1) {
      console.log(`📊 [${formatPeriodLabel(intervalEnd, daysDiff)}] Total: ${totalCount}, Cold: ${statusCounts.cold}, Warm: ${statusCounts.warm}, Hot: ${statusCounts.hot}, Won: ${statusCounts.won}, Lost: ${statusCounts.lost}, Recurring: ${statusCounts.recurring}`)
    }

    categoryTimeline.push({
      label: formatPeriodLabel(intervalStart, daysDiff),
      cold: statusCounts.cold,
      warm: statusCounts.warm,
      hot: statusCounts.hot,
      won: statusCounts.won,
      lost: statusCounts.lost,
      recurring: statusCounts.recurring,
      total: totalCount
    })
  }

  return categoryTimeline
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

function getLinePath(timeline, metric) {
  if (!timeline || timeline.length === 0) return ''
  
  const maxValue = metric === 'count' 
    ? reportData.value.maxCount 
    : reportData.value.maxRevenue
  
  const points = timeline.map((point, index) => {
    const x = (index / (timeline.length - 1)) * 400
    const y = 200 - (point[metric] / maxValue * 180)
    return `${x},${y}`
  })
  
  return `M ${points.join(' L ')}`
}

function getAreaPath(timeline, metric) {
  if (!timeline || timeline.length === 0) return ''
  
  const maxValue = metric === 'count' 
    ? reportData.value.maxCount 
    : reportData.value.maxRevenue
  
  const points = timeline.map((point, index) => {
    const x = (index / (timeline.length - 1)) * 400
    const y = 200 - (point[metric] / maxValue * 180)
    return `${x},${y}`
  })
  
  return `M 0,200 L ${points.join(' L ')} L 400,200 Z`
}

function getConversionLinePath() {
  if (!reportData.value?.conversionTimeline || reportData.value.conversionTimeline.length === 0) return ''
  
  const points = reportData.value.conversionTimeline.map((point, index) => {
    const x = (index / (reportData.value.conversionTimeline.length - 1)) * 800
    const y = 200 - (point.rate * 1.8)
    return `${x},${y}`
  })
  
  return `M ${points.join(' L ')}`
}

function getConversionAreaPath() {
  if (!reportData.value?.conversionTimeline || reportData.value.conversionTimeline.length === 0) return ''
  
  const points = reportData.value.conversionTimeline.map((point, index) => {
    const x = (index / (reportData.value.conversionTimeline.length - 1)) * 800
    const y = 200 - (point.rate * 1.8)
    return `${x},${y}`
  })
  
  return `M 0,200 L ${points.join(' L ')} L 800,200 Z`
}

function getMultiMetricLinePath(metric) {
  if (!reportData.value?.timeline || reportData.value.timeline.length === 0) return ''
  
  const maxValue = metric === 'count' 
    ? reportData.value.maxCount 
    : reportData.value.maxRevenue
  
  const points = reportData.value.timeline.map((point, index) => {
    const x = (index / (reportData.value.timeline.length - 1)) * 800
    const y = 300 - ((point[metric] / maxValue) * 260 + 20)
    return `${x},${y}`
  })
  
  return `M ${points.join(' L ')}`
}

function getMultiMetricAreaPath(metric) {
  if (!reportData.value?.timeline || reportData.value.timeline.length === 0) return ''
  
  const maxValue = metric === 'count' 
    ? reportData.value.maxCount 
    : reportData.value.maxRevenue
  
  const points = reportData.value.timeline.map((point, index) => {
    const x = (index / (reportData.value.timeline.length - 1)) * 800
    const y = 300 - ((point[metric] / maxValue) * 260 + 20)
    return `${x},${y}`
  })
  
  return `M 0,300 L ${points.join(' L ')} L 800,300 Z`
}

function getConversionMultiLinePath() {
  if (!reportData.value?.conversionTimeline || reportData.value.conversionTimeline.length === 0) return ''
  
  const points = reportData.value.conversionTimeline.map((point, index) => {
    const x = (index / (reportData.value.conversionTimeline.length - 1)) * 800
    // Scale conversion rate (0-100%) to fit the chart (with 20px padding)
    const y = 300 - ((point.rate / 100) * 260 + 20)
    return `${x},${y}`
  })
  
  return `M ${points.join(' L ')}`
}

// Main chart functions (for the big unified chart)
function getMainChartLinePath(metric) {
  if (!reportData.value?.timeline || reportData.value.timeline.length === 0) return ''
  
  const maxValue = metric === 'newCount' 
    ? reportData.value.maxNewCount 
    : reportData.value.maxRevenue
  
  const points = reportData.value.timeline.map((point, index) => {
    const x = (index / (reportData.value.timeline.length - 1)) * 1000
    const y = 350 - ((point[metric] / maxValue) * 310 + 20)
    return `${x},${y}`
  })
  
  return `M ${points.join(' L ')}`
}

function getMainChartAreaPath(metric) {
  if (!reportData.value?.timeline || reportData.value.timeline.length === 0) return ''
  
  const maxValue = metric === 'newCount' 
    ? reportData.value.maxNewCount 
    : reportData.value.maxRevenue
  
  const points = reportData.value.timeline.map((point, index) => {
    const x = (index / (reportData.value.timeline.length - 1)) * 1000
    const y = 350 - ((point[metric] / maxValue) * 310 + 20)
    return `${x},${y}`
  })
  
  return `M 0,350 L ${points.join(' L ')} L 1000,350 Z`
}

function getConversionMainLinePath() {
  if (!reportData.value?.conversionTimeline || reportData.value.conversionTimeline.length === 0) return ''
  
  const points = reportData.value.conversionTimeline.map((point, index) => {
    const x = (index / (reportData.value.conversionTimeline.length - 1)) * 1000
    const y = 350 - ((point.rate / 100) * 310 + 20)
    return `${x},${y}`
  })
  
  return `M ${points.join(' L ')}`
}

// Category chart functions
function getCategoryLinePath(category) {
  if (!reportData.value?.categoryTimeline || reportData.value.categoryTimeline.length === 0) return ''
  
  const points = reportData.value.categoryTimeline.map((point, index) => {
    const x = (index / (reportData.value.categoryTimeline.length - 1)) * 1000
    const y = 350 - ((point[category] / reportData.value.maxCategoryCount) * 310 + 20)
    return `${x},${y}`
  })
  
  return `M ${points.join(' L ')}`
}

function getCategoryAreaPath(category) {
  if (!reportData.value?.categoryTimeline || reportData.value.categoryTimeline.length === 0) return ''
  
  const points = reportData.value.categoryTimeline.map((point, index) => {
    const x = (index / (reportData.value.categoryTimeline.length - 1)) * 1000
    const y = 350 - ((point[category] / reportData.value.maxCategoryCount) * 310 + 20)
    return `${x},${y}`
  })
  
  return `M 0,350 L ${points.join(' L ')} L 1000,350 Z`
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
