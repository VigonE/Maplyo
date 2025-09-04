<template>
  <div class="h-full relative">
    <div ref="mapContainer" class="h-full w-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import L from 'leaflet'

const props = defineProps({
  prospects: Array,
  selectedProspect: Object
})

const emit = defineEmits(['select-prospect'])

const mapContainer = ref(null)
let map = null
const markers = new Map()

onMounted(async () => {
  await nextTick()
  initMap()
})

watch(() => props.prospects, (newProspects) => {
  if (map) {
    updateMarkers(newProspects)
  }
}, { deep: true })

watch(() => props.selectedProspect, (prospect) => {
  if (map && prospect && markers.has(prospect.id)) {
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

function updateMarkers(prospects) {
  if (!map) return

  // Clear existing markers
  markers.forEach(marker => {
    map.removeLayer(marker)
  })
  markers.clear()

  if (!prospects?.length) return

  prospects.forEach(prospect => {
    if (prospect.latitude && prospect.longitude) {
      createMarker(prospect)
    }
  })

  // Fit map to show all markers if we have any
  if (markers.size > 0) {
    const group = new L.featureGroup(Array.from(markers.values()))
    map.fitBounds(group.getBounds().pad(0.1))
  }
}

function createMarker(prospect) {
  const radius = Math.max(10, Math.min(50, (prospect.revenue || 0) / 1000))
  
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
