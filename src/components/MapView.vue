<template>
  <div class="h-full relative">
    <!-- Bouton de contrôle de la heatmap -->
    <div class="absolute top-4 right-4 z-[1000]">
      <button
        @click="toggleHeatmap"
        :class="{
          'bg-blue-600 text-white': showHeatmap,
          'bg-white text-gray-700 hover:bg-gray-50': !showHeatmap
        }"
        class="px-3 py-2 rounded-lg shadow-lg border transition-colors duration-200 flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {{ showHeatmap ? 'Masquer Heatmap' : 'Voir Heatmap' }}
      </button>
    </div>
    <div ref="mapContainer" class="h-full w-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// Importer le plugin heatmap
import 'leaflet.heat'

const props = defineProps({
  prospects: Array,           // Prospects filtrés (pour affichage)
  allProspects: Array,       // Tous les prospects (pour échelle de couleur)
  selectedProspect: Object
})

const emit = defineEmits(['select-prospect'])

const mapContainer = ref(null)
let map = null
const markers = new Map()
let heatmapLayer = null
const showHeatmap = ref(false)

onMounted(async () => {
  await nextTick()
  initMap()
})

watch(() => props.prospects, (newProspects) => {
  if (map) {
    if (showHeatmap.value) {
      updateHeatmap()
    } else {
      updateMarkers(newProspects)
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

  updateMarkers(props.prospects)
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
    updateMarkers(props.prospects)
  }
}

function updateHeatmap() {
  if (!map || !props.prospects) return
  
  clearHeatmap()
  
  // Préparer les données pour la heatmap (prospects filtrés pour l'affichage)
  const prospectsWithCoords = props.prospects.filter(prospect => 
    prospect.latitude && prospect.longitude && prospect.revenue > 0
  )
  
  if (prospectsWithCoords.length === 0) return

  // Calculer l'échelle basée sur les prospects VISIBLES pour avoir toujours du rouge
  const visibleRevenues = prospectsWithCoords.map(p => parseFloat(p.revenue) || 0)
  const visibleMaxRevenue = Math.max(...visibleRevenues)
  const visibleMinRevenue = Math.min(...visibleRevenues)
  const visibleRevenueRange = visibleMaxRevenue - visibleMinRevenue
  
  // Calculer aussi l'échelle globale pour la cohérence relative
  const allProspectsWithRevenue = (props.allProspects || props.prospects).filter(prospect => 
    prospect.revenue > 0
  )
  const allRevenues = allProspectsWithRevenue.map(p => parseFloat(p.revenue) || 0)
  const globalMaxRevenue = Math.max(...allRevenues)
  
  // Créer plusieurs points pour les gros revenus (effet de densité)
  const heatmapData = []
  
  prospectsWithCoords.forEach(prospect => {
    const revenue = parseFloat(prospect.revenue) || 0
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
    
    // Garantir que le prospect avec le plus gros revenu visible soit au moins à 0.95
    if (revenue === visibleMaxRevenue) {
      intensity = Math.max(intensity, 0.95)
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
      minOpacity: 0.3,   // Opacité minimum plus élevée pour éviter le violet fade
      max: 0.9,          // Max plus bas pour forcer plus d'intensité
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

  // Calculer les statistiques de revenus une seule fois pour tous les markers
  const allRevenues = prospects.map(p => p.revenue || 0).filter(r => r > 0)
  const revenueStats = allRevenues.length > 0 ? {
    min: Math.min(...allRevenues),
    max: Math.max(...allRevenues)
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

function createMarker(prospect, revenueStats) {
  // Calculer le rayon proportionnel au revenu avec une progression visuelle agréable
  
  const minRadius = 8   // Rayon minimum pour les leads sans revenu ou très faibles
  const maxRadius = 25  // Rayon maximum pour les plus gros revenus
  
  let radius = minRadius
  
  if (prospect.revenue > 0 && revenueStats && revenueStats.max > revenueStats.min) {
    // Calculer l'écart relatif des revenus
    const revenueRange = revenueStats.max - revenueStats.min
    const relativeRange = revenueRange / revenueStats.max // Écart relatif par rapport au max
    
    // Normaliser le revenu entre 0 et 1
    let normalizedRevenue = (prospect.revenue - revenueStats.min) / revenueRange
    
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
    console.log(`Lead ${prospect.name}: revenue=${prospect.revenue}, range=${revenueRange}, relativeRange=${(relativeRange*100).toFixed(1)}%, normalized=${normalizedRevenue.toFixed(3)}, radius=${radius.toFixed(1)}`)
  } else if (prospect.revenue > 0) {
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

  // Tooltip au survol
  const tooltipContent = `
    <div class="text-sm">
      <div class="font-bold text-gray-900 mb-1">${prospect.name}</div>
      <div class="text-gray-600 text-xs mb-1">📍 ${getCity(prospect.address)}</div>
      <div class="text-green-700 font-semibold mb-1">💰 ${formatCurrency(prospect.revenue || 0)}</div>
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
  const popupContent = `
    <div class="p-2">
      <h3 class="font-semibold text-lg">${prospect.name}</h3>
      <p class="text-sm text-gray-600 mb-2">${prospect.address || 'No address'}</p>
      <div class="flex justify-between items-center">
        <span class="font-medium text-green-600">${formatCurrency(prospect.revenue || 0)}</span>
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
</style>
