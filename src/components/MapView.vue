<template>
  <div class="h-full relative">
    <!-- Bouton pour ouvrir le volet des filtres -->
    <div class="absolute top-4 right-4 z-[1001] flex gap-2 filters-panel-buttons">
      <!-- Bouton Filtres -->
      <button
        @click="showFiltersPanel = !showFiltersPanel"
        :class="{
          'bg-blue-600 text-white': showFiltersPanel,
          'bg-white text-gray-700 hover:bg-gray-50': !showFiltersPanel
        }"
        class="px-3 py-2 rounded-lg shadow-lg border transition-all duration-200 flex items-center gap-2 hover-lift"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span class="hidden sm:inline">Filtres</span>
      </button>

      <!-- Bouton Heatmap -->
      <button
        @click="toggleHeatmap"
        :class="{
          'bg-blue-600 text-white': showHeatmap,
          'bg-white text-gray-700 hover:bg-gray-50': !showHeatmap
        }"
        class="px-3 py-2 rounded-lg shadow-lg border transition-colors duration-200 flex items-center gap-2 hover-lift"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="hidden sm:inline">{{ showHeatmap ? 'Désactiver' : 'Heatmap' }}</span>
      </button>
    </div>

    <!-- Volet des filtres (rétractable) -->
    <div 
      :class="{
        'translate-x-0': showFiltersPanel,
        'translate-x-full': !showFiltersPanel
      }"
      class="fixed top-0 right-0 h-full w-80 sm:w-80 md:w-80 lg:w-80 xl:w-80 max-w-full bg-white shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out border-l border-gray-200 filters-panel"
    >
      <!-- En-tête du volet -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtres de statut
        </h3>
        <button
          @click="showFiltersPanel = false"
          class="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 text-gray-500 hover:text-gray-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Contenu du volet -->
      <div class="p-4 space-y-4">
        <!-- Bouton "Tout sélectionner" -->
        <div class="mb-6">
          <button
            @click="toggleAllStatuses"
            :class="{
              'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md': showAllStatuses,
              'bg-gray-100 text-gray-700 hover:bg-gray-200': !showAllStatuses
            }"
            class="w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 text-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ showAllStatuses ? 'Désélectionner tout' : 'Sélectionner tout' }}
          </button>
        </div>

        <!-- Filtres individuels -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-gray-600 uppercase tracking-wide">Statuts disponibles</h4>
          
          <!-- Cold -->
          <button
            @click="toggleStatusFilter('cold')"
            :class="{
              'bg-gray-600 text-white shadow-lg scale-105': statusFilters.cold,
              'bg-gray-50 text-gray-700 hover:bg-gray-100': !statusFilters.cold
            }"
            class="w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 text-sm"
          >
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-full shadow-sm" style="background-color: #6b7280;"></span>
              <span>Cold</span>
            </div>
            <div class="ml-auto">
              {{ statusFilters.cold ? '✓' : '' }}
            </div>
          </button>
          
          <!-- Warm -->
          <button
            @click="toggleStatusFilter('warm')"
            :class="{
              'bg-yellow-500 text-white shadow-lg scale-105': statusFilters.warm,
              'bg-gray-50 text-gray-700 hover:bg-gray-100': !statusFilters.warm
            }"
            class="w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 text-sm"
          >
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-full shadow-sm" style="background-color: #f59e0b;"></span>
              <span>Warm</span>
            </div>
            <div class="ml-auto">
              {{ statusFilters.warm ? '✓' : '' }}
            </div>
          </button>
          
          <!-- Hot -->
          <button
            @click="toggleStatusFilter('hot')"
            :class="{
              'bg-red-500 text-white shadow-lg scale-105': statusFilters.hot,
              'bg-gray-50 text-gray-700 hover:bg-gray-100': !statusFilters.hot
            }"
            class="w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 text-sm"
          >
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-full shadow-sm" style="background-color: #ef4444;"></span>
              <span>Hot</span>
            </div>
            <div class="ml-auto">
              {{ statusFilters.hot ? '✓' : '' }}
            </div>
          </button>
          
          <!-- Recurring -->
          <button
            @click="toggleStatusFilter('recurring')"
            :class="{
              'bg-purple-500 text-white shadow-lg scale-105': statusFilters.recurring,
              'bg-gray-50 text-gray-700 hover:bg-gray-100': !statusFilters.recurring
            }"
            class="w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 text-sm"
          >
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-full shadow-sm" style="background-color: #8b5cf6;"></span>
              <span>Recurring</span>
            </div>
            <div class="ml-auto">
              {{ statusFilters.recurring ? '✓' : '' }}
            </div>
          </button>
        </div>

        <!-- Statistiques des filtres -->
        <div class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <h4 class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Résultats
          </h4>
          <p class="text-sm text-gray-600">
            <span class="font-semibold text-blue-600">{{ filteredProspects.length }}</span> 
            prospect{{ filteredProspects.length > 1 ? 's' : '' }} affiché{{ filteredProspects.length > 1 ? 's' : '' }}
            <span v-if="props.prospects && props.prospects.length > 0">
              sur {{ props.prospects.length }} total{{ props.prospects.length > 1 ? 'aux' : '' }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Overlay pour fermer le volet en cliquant à côté -->
    <div 
      v-if="showFiltersPanel"
      @click="showFiltersPanel = false"
      class="fixed inset-0 bg-black bg-opacity-25 z-[999] transition-opacity duration-300"
    ></div>
    
    <!-- Color intensity slider -->
    <div v-if="showHeatmap" class="absolute top-20 right-4 z-[1000] bg-white rounded-lg shadow-lg border p-3 min-w-[200px]">
      <div class="text-sm font-medium text-gray-700 mb-2">Color Intensity</div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-500">Low</span>
        <input
          v-model="colorIntensity"
          @input="updateHeatmap"
          type="range"
          min="0.3"
          max="2.0"
          step="0.1"
          class="flex-1 h-2 bg-gradient-to-r from-blue-200 via-yellow-200 to-red-400 rounded-lg appearance-none cursor-pointer"
        />
        <span class="text-xs text-gray-500">High</span>
      </div>
      <div class="text-xs text-gray-500 mt-1 text-center">{{ colorIntensity }}</div>
    </div>
    
    <div ref="mapContainer" class="h-full w-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// Importer le plugin heatmap
import 'leaflet.heat'
import { useProspectsStore } from '../stores/prospects'

const props = defineProps({
  prospects: Array,           // Prospects filtrés (pour affichage)
  allProspects: Array,       // Tous les prospects (pour échelle de couleur)
  selectedProspect: Object
})

const emit = defineEmits(['select-prospect'])

const prospectsStore = useProspectsStore()

const mapContainer = ref(null)
let map = null
const markers = new Map()
let heatmapLayer = null
const showHeatmap = ref(false)
const colorIntensity = ref(1.0)  // Valeur par défaut du slider

// Filtres de statut
const statusFilters = ref({
  cold: true,
  warm: true,
  hot: true,
  recurring: true,
  won: false,
  lost: false
})

// État du volet des filtres
const showFiltersPanel = ref(false)

// Computed properties pour les filtres
const showAllStatuses = computed(() => 
  Object.values(statusFilters.value).every(value => value)
)

const filteredProspects = computed(() => {
  if (!props.prospects) return []
  
  return props.prospects.filter(prospect => {
    const status = prospect.status || 'cold'
    return statusFilters.value[status] === true
  })
})

// Fonctions de gestion des filtres
function toggleStatusFilter(status) {
  statusFilters.value[status] = !statusFilters.value[status]
  updateDisplay()
}

function toggleAllStatuses() {
  const newValue = !showAllStatuses.value
  // Active/désactive tous les statuts principaux
  statusFilters.value.cold = newValue
  statusFilters.value.warm = newValue
  statusFilters.value.hot = newValue
  statusFilters.value.recurring = newValue
  updateDisplay()
}

function updateDisplay() {
  if (map) {
    if (showHeatmap.value) {
      updateHeatmap()
    } else {
      updateMarkers(filteredProspects.value)
    }
  }
}

onMounted(async () => {
  await nextTick()
  initMap()
  
  // Écouter la touche Escape pour fermer le volet
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  // Nettoyer l'éventuel listener
  document.removeEventListener('keydown', handleEscapeKey)
})

function handleEscapeKey(event) {
  if (event.key === 'Escape' && showFiltersPanel.value) {
    showFiltersPanel.value = false
  }
}

watch(() => props.prospects, (newProspects) => {
  if (map) {
    if (showHeatmap.value) {
      updateHeatmap()
    } else {
      updateMarkers(filteredProspects.value)
    }
  }
}, { deep: true })

watch(filteredProspects, (newFilteredProspects) => {
  if (map) {
    if (showHeatmap.value) {
      updateHeatmap()
    } else {
      updateMarkers(newFilteredProspects)
    }
  }
}, { deep: true })

watch(() => props.selectedProspect, (prospect) => {
  if (map && prospect && markers.has(prospect.id) && !showHeatmap.value) {
    const marker = markers.get(prospect.id)
    map.setView(marker.getLatLng(), 14)
    marker.openPopup()
  }
})

function initMap() {
  if (!mapContainer.value) return

  // Fix for default markers
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
  })

  map = L.map(mapContainer.value, {
    center: [46.603354, 1.888334], // Center of France
    zoom: 6,
    zoomControl: true
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  updateMarkers(filteredProspects.value)
}

function toggleHeatmap() {
  showHeatmap.value = !showHeatmap.value
  
  if (showHeatmap.value) {
    // Cacher les marqueurs et afficher la heatmap
    clearMarkers()
    updateHeatmap()
  } else {
    // Cacher la heatmap et afficher les marqueurs
    clearHeatmap()
    updateMarkers(filteredProspects.value)
  }
}

function updateHeatmap() {
  if (!map || !filteredProspects.value) return
  
  clearHeatmap()
  
  // Préparer les données pour la heatmap (prospects filtrés pour l'affichage)
  const prospectsWithCoords = filteredProspects.value.filter(prospect => 
    prospect.latitude && prospect.longitude && getComparableRevenue(prospect) > 0
  )
  
  if (prospectsWithCoords.length === 0) return

  // Calculer l'échelle basée sur les prospects VISIBLES pour avoir toujours du rouge
  const visibleRevenues = prospectsWithCoords.map(p => getComparableRevenue(p))
  const visibleMaxRevenue = Math.max(...visibleRevenues)
  const visibleMinRevenue = Math.min(...visibleRevenues)
  const visibleRevenueRange = visibleMaxRevenue - visibleMinRevenue
  
  // Calculer aussi l'échelle globale pour la cohérence relative
  const allProspectsWithRevenue = (props.allProspects || filteredProspects.value).filter(prospect => 
    getComparableRevenue(prospect) > 0
  )
  const allRevenues = allProspectsWithRevenue.map(p => getComparableRevenue(p))
  const globalMaxRevenue = Math.max(...allRevenues)
  
  // Créer plusieurs points pour les gros revenus (effet de densité)
  const heatmapData = []
  
  prospectsWithCoords.forEach(prospect => {
    const revenue = getComparableRevenue(prospect)
    const lat = parseFloat(prospect.latitude)
    const lng = parseFloat(prospect.longitude)
    
    let intensity
    
    if (visibleRevenueRange === 0) {
      // Tous les revenus visibles sont identiques
      intensity = 0.9  // Plus élevé pour être visible
    } else {
      // Normalisation hybride : basée sur les visibles mais avec influence globale
      const visibleNormalized = (revenue - visibleMinRevenue) / visibleRevenueRange
      const globalNormalized = revenue / globalMaxRevenue
      
      // Mélange : 70% basé sur les visibles, 30% sur l'échelle globale
      // Cela garantit que le max visible soit proche de rouge, mais garde une cohérence
      const hybridNormalized = (visibleNormalized * 0.7) + (globalNormalized * 0.3)
      
      // S'assurer que le max visible atteigne au moins 0.9 (rouge vif)
      const minIntensityForMax = 0.9
      const adjustedNormalized = hybridNormalized * (1 - minIntensityForMax) + 
                                 (visibleNormalized * minIntensityForMax)
      
      // Intensité plus élevée avec minimum à 0.4 pour éviter le violet fade
      intensity = Math.pow(adjustedNormalized, 0.6) * 0.6 + 0.4
    }
    
    // Appliquer le multiplicateur d'intensité du slider
    intensity = Math.min(1.0, intensity * colorIntensity.value)
    
    // Garantir que le prospect avec le plus gros revenu visible soit au moins à 0.95
    if (revenue === visibleMaxRevenue) {
      intensity = Math.max(intensity, 0.95 * Math.min(1.0, colorIntensity.value))
    }
    
    // Réduire le nombre de points multiples pour un lissage plus naturel
    const numPoints = Math.max(1, Math.floor(intensity * 2) + 1)
    
    for (let i = 0; i < numPoints; i++) {
      // Décalage plus important pour un effet plus lissé
      const latOffset = (Math.random() - 0.5) * 0.004
      const lngOffset = (Math.random() - 0.5) * 0.004
      
      heatmapData.push([
        lat + latOffset,
        lng + lngOffset,
        intensity
      ])
    }
  })

  if (heatmapData.length > 0) {
    heatmapLayer = L.heatLayer(heatmapData, {
      radius: 50,        // Rayon plus large pour plus de lissage
      blur: 30,          // Plus de flou pour un lissage plus doux
      maxZoom: 18,       // Zoom max plus élevé
      minOpacity: Math.max(0.1, 0.3 * colorIntensity.value),   // Opacité minimum adaptée au slider
      max: Math.max(0.5, 0.9 / colorIntensity.value),          // Max adapté pour équilibrer
      gradient: {
        0.0: 'rgba(0, 50, 255, 0.2)',   // Bleu transparent
        0.1: 'rgba(0, 100, 255, 0.4)',  // Bleu léger
        0.2: 'rgba(0, 150, 255, 0.5)',  // Bleu plus visible
        0.3: 'rgba(0, 200, 150, 0.6)',  // Vert-bleu
        0.4: 'rgba(100, 255, 100, 0.7)', // Vert clair
        0.5: 'rgba(255, 255, 0, 0.8)',  // Jaune vif
        0.6: 'rgba(255, 180, 0, 0.85)', // Orange
        0.7: 'rgba(255, 100, 0, 0.9)',  // Orange-rouge
        0.8: 'rgba(255, 20, 0, 0.95)',  // Rouge vif
        0.9: 'rgba(255, 0, 0, 1.0)',    // Rouge intense
        1.0: 'rgba(200, 0, 0, 1.0)'     // Rouge foncé
      }
    }).addTo(map)
  }
}

function clearHeatmap() {
  if (heatmapLayer && map) {
    map.removeLayer(heatmapLayer)
    heatmapLayer = null
  }
}

function clearMarkers() {
  markers.forEach(marker => {
    if (map.hasLayer(marker)) {
      map.removeLayer(marker)
    }
  })
  markers.clear()
}

function updateMarkers(prospects) {
  if (!map || showHeatmap.value) return

  // Clear existing markers
  clearMarkers()

  if (!prospects?.length) return

  // Calculer les statistiques de revenus pondérés une seule fois pour tous les markers
  // Pour les prospects récurrents, utiliser le montant annualisé
  const allComparableRevenues = prospects.map(p => getComparableRevenue(p)).filter(r => r > 0)
  const revenueStats = allComparableRevenues.length > 0 ? {
    min: Math.min(...allComparableRevenues),
    max: Math.max(...allComparableRevenues)
  } : null

  prospects.forEach(prospect => {
    if (prospect.latitude && prospect.longitude) {
      createMarker(prospect, revenueStats)
    }
  })

  // Fit map to show all markers if we have any
  if (markers.size > 0) {
    const group = new L.featureGroup(Array.from(markers.values()))
    map.fitBounds(group.getBounds().pad(0.1))
  }
}

// Nouvelle fonction pour calculer le revenu comparable entre leads et récurrents
function getComparableRevenue(prospect) {
  if (prospect.status === 'recurring') {
    // Pour les prospects récurrents, calculer le montant annuel total
    const baseRevenue = prospect.revenue || 0
    const probability = (prospect.probability_coefficient || 100) / 100
    const recurrenceMonths = prospect.recurrence_months || 12
    
    // Calculer combien d'occurrences dans une année
    const occurrencesPerYear = 12 / recurrenceMonths
    
    // Montant annuel total pondéré par la probabilité
    return baseRevenue * probability * occurrencesPerYear
  } else {
    // Pour les leads normaux, utiliser le revenu pondéré standard
    return prospectsStore.getWeightedRevenue(prospect)
  }
}

function createMarker(prospect, revenueStats) {
  // Calculer le rayon proportionnel au revenu comparable avec une progression visuelle agréable
  
  const minRadius = 8   // Rayon minimum pour les leads sans revenu ou très faibles
  const maxRadius = 25  // Rayon maximum pour les plus gros revenus
  
  let radius = minRadius
  
  const comparableRevenue = getComparableRevenue(prospect)
  
  if (comparableRevenue > 0 && revenueStats && revenueStats.max > revenueStats.min) {
    // Calculer l'écart relatif des revenus
    const revenueRange = revenueStats.max - revenueStats.min
    const relativeRange = revenueRange / revenueStats.max // Écart relatif par rapport au max
    
    // Normaliser le revenu comparable entre 0 et 1
    let normalizedRevenue = (comparableRevenue - revenueStats.min) / revenueRange
    
    // Si l'écart relatif est très faible (moins de 10%), respecter la vraie proportion
    if (relativeRange < 0.1) {
      // Garder la proportion exacte mais avec un écart minimal visible (2px)
      const minVisibleDiff = 2 / (maxRadius - minRadius) // 2px en proportion
      normalizedRevenue = Math.max(normalizedRevenue, minVisibleDiff)
    } else {
      // Pour les écarts plus importants, utiliser une racine carrée pour adoucir
      normalizedRevenue = Math.sqrt(normalizedRevenue)
    }
    
    // Calculer le rayon final
    radius = minRadius + normalizedRevenue * (maxRadius - minRadius)
    
    // Debug log pour vérifier les calculs
    const isRecurring = prospect.status === 'recurring'
    const debugInfo = isRecurring 
      ? `recurring: ${prospect.revenue}€ × ${(prospect.probability_coefficient || 100)}% × ${12/(prospect.recurrence_months || 12)} occ/year`
      : `lead: ${prospect.revenue}€ × ${(prospect.probability_coefficient || 100)}%`
    
    console.log(`${isRecurring ? '🔄' : '🎯'} ${prospect.name}: ${debugInfo} = ${comparableRevenue.toFixed(2)}€, radius=${radius.toFixed(1)}`)
  } else if (comparableRevenue > 0) {
    // Si tous les revenus sont identiques, utiliser un rayon moyen
    radius = (minRadius + maxRadius) / 2
  }
  
  const marker = L.circleMarker([prospect.latitude, prospect.longitude], {
    radius: radius,
    fillColor: getStatusColor(prospect.status),
    color: '#ffffff',
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.6
  })

  // Tooltip au survol - afficher le revenu comparable pour cohérence
  const baseRevenue = prospect.revenue || 0
  const hasLowerProbability = prospect.probability_coefficient && prospect.probability_coefficient < 100
  const isRecurring = prospect.status === 'recurring'
  
  let revenueDisplay = ''
  if (isRecurring) {
    const occurrencesPerYear = 12 / (prospect.recurrence_months || 12)
    revenueDisplay = `💰 ${formatCurrency(comparableRevenue)} /year`
    if (hasLowerProbability || (prospect.recurrence_months && prospect.recurrence_months !== 12)) {
      revenueDisplay += `<div class="text-xs text-gray-500">(${formatCurrency(baseRevenue)} × ${occurrencesPerYear.toFixed(1)} occ/year${hasLowerProbability ? ` at ${prospect.probability_coefficient}%` : ''})</div>`
    }
  } else {
    revenueDisplay = `💰 ${formatCurrency(comparableRevenue)}`
    if (hasLowerProbability) {
      revenueDisplay += `<div class="text-xs text-gray-500">(${formatCurrency(baseRevenue)} at ${prospect.probability_coefficient}%)</div>`
    }
  }
  
  const tooltipContent = `
    <div class="text-sm">
      <div class="font-bold text-gray-900 mb-1">${prospect.name}</div>
      <div class="text-gray-600 text-xs mb-1">📍 ${getCity(prospect.address)}</div>
      <div class="text-green-700 font-semibold mb-1">
        ${revenueDisplay}
      </div>
      <div class="text-xs px-2 py-1 rounded-full bg-blue-600 text-white inline-block">${getStatusLabel(prospect.status)}</div>
    </div>
  `

  marker.bindTooltip(tooltipContent, {
    permanent: false,
    direction: 'top',
    offset: [0, -10],
    className: 'custom-tooltip'
  })

  // Popup au clic (informations plus détaillées)
  let popupRevenueInfo = ''
  if (isRecurring) {
    const occurrencesPerYear = 12 / (prospect.recurrence_months || 12)
    popupRevenueInfo = `
      <span class="font-medium text-green-600">${formatCurrency(comparableRevenue)} /year</span>
      <div class="text-xs text-gray-500">
        ${formatCurrency(baseRevenue)} every ${prospect.recurrence_months || 12} months
        ${hasLowerProbability ? ` (${prospect.probability_coefficient}%)` : ''}
      </div>
    `
  } else {
    popupRevenueInfo = `
      <span class="font-medium text-green-600">${formatCurrency(comparableRevenue)}</span>
      ${hasLowerProbability ? `<div class="text-xs text-gray-500">Base: ${formatCurrency(baseRevenue)} (${prospect.probability_coefficient}%)</div>` : ''}
    `
  }

  const popupContent = `
    <div class="p-2">
      <h3 class="font-semibold text-lg">${prospect.name}</h3>
      <p class="text-sm text-gray-600 mb-2">${prospect.address || 'No address'}</p>
      <div class="flex justify-between items-center">
        <div>
          ${popupRevenueInfo}
        </div>
        <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">${getStatusLabel(prospect.status)}</span>
      </div>
    </div>
  `

  marker.bindPopup(popupContent)
  
  marker.on('click', () => {
    emit('select-prospect', prospect)
  })

  marker.addTo(map)
  markers.set(prospect.id, marker)
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
    'recurring': 'Recurring',
    'won': 'Won',
    'lost': 'Lost'
  }
  return labels[status] || status || 'Unknown'
}

function getStatusColor(status) {
  const colors = {
    'cold': '#6b7280',    // gray
    'warm': '#f59e0b',    // yellow
    'hot': '#ef4444',     // red
    'recurring': '#8b5cf6', // purple
    'won': '#10b981',     // green
    'lost': '#374151'     // dark gray
  }
  return colors[status] || '#3b82f6' // default blue
}

function getCity(address) {
  if (!address) return 'No city'
  
  // Essayer d'extraire la ville de l'adresse
  // Format typique: "123 rue, 75001 Paris, France" ou "123 rue, Paris, France"
  const parts = address.split(',')
  if (parts.length >= 2) {
    // Prendre la partie qui contient probablement la ville
    let cityPart = parts[parts.length - 2].trim()
    
    // Si ça ressemble à un code postal + ville, prendre juste la ville
    const zipCityMatch = cityPart.match(/^\d{5}\s+(.+)$/)
    if (zipCityMatch) {
      return zipCityMatch[1]
    }
    
    return cityPart
  }
  
  // Si pas de virgule, prendre les derniers mots
  const words = address.split(' ')
  return words.slice(-2).join(' ')
}
</script>

<style>
.leaflet-popup-content-wrapper {
  border-radius: 8px;
}

.leaflet-popup-content {
  margin: 0;
}

/* Style du slider */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-track {
  background: linear-gradient(to right, #3b82f6, #eab308, #ef4444);
  height: 8px;
  border-radius: 4px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: #ffffff;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  border: 2px solid #374151;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-track {
  background: linear-gradient(to right, #3b82f6, #eab308, #ef4444);
  height: 8px;
  border-radius: 4px;
  border: none;
}

input[type="range"]::-moz-range-thumb {
  background: #ffffff;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  border: 2px solid #374151;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}
</style>

<style>
.leaflet-popup-content-wrapper {
  border-radius: 8px;
}

.leaflet-popup-content {
  margin: 0;
}

.custom-tooltip {
  background: white !important;
  border: 2px solid #374151 !important;
  border-radius: 8px !important;
  color: #111827 !important;
  font-size: 13px !important;
  padding: 10px 12px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
  line-height: 1.4 !important;
}

.custom-tooltip::before {
  border-top-color: white !important;
}

/* Style pour la flèche du tooltip */
.custom-tooltip .leaflet-tooltip-left::before,
.custom-tooltip .leaflet-tooltip-right::before,
.custom-tooltip .leaflet-tooltip-top::before,
.custom-tooltip .leaflet-tooltip-bottom::before {
  border-top-color: white !important;
}

/* Styles pour le volet des filtres */
@media (max-width: 768px) {
  .filters-panel {
    width: 100vw !important;
    max-width: 100vw !important;
  }
  
  .filters-panel-buttons {
    position: fixed !important;
    top: 1rem !important;
    right: 1rem !important;
    left: 1rem !important;
    flex-direction: row !important;
    justify-content: space-between !important;
  }
}

/* Animation personnalisée pour les boutons de filtre */
.filter-button-enter-active,
.filter-button-leave-active {
  transition: all 0.2s ease;
}

.filter-button-enter-from,
.filter-button-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Effet de survol amélioré */
.hover-lift {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Animation du volet */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-panel-enter-from,
.slide-panel-leave-to {
  transform: translateX(100%);
}
</style>
