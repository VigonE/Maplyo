<template>
  <div
    ref="containerRef"
    :style="{ height: containerHeight + 'px' }"
    class="overflow-auto"
    @scroll="onScroll"
  >
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div
        :style="{ 
          transform: `translateY(${startOffset}px)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }"
      >
        <slot
          v-for="(item, index) in visibleItems"
          :key="getItemKey(item, startIndex + index)"
          :item="item"
          :index="startIndex + index"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  itemHeight: {
    type: Number,
    default: 120
  },
  containerHeight: {
    type: Number,
    default: 400
  },
  buffer: {
    type: Number,
    default: 5
  },
  keyField: {
    type: String,
    default: 'id'
  }
})

const containerRef = ref(null)
const scrollTop = ref(0)

// Calculs de virtualisation
const itemsPerPage = computed(() => Math.ceil(props.containerHeight / props.itemHeight))
const totalHeight = computed(() => props.items.length * props.itemHeight)

const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight) - props.buffer
  return Math.max(0, index)
})

const endIndex = computed(() => {
  const index = startIndex.value + itemsPerPage.value + props.buffer * 2
  return Math.min(props.items.length - 1, index)
})

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value + 1)
})

const startOffset = computed(() => startIndex.value * props.itemHeight)

// Gestion du scroll avec throttling
let ticking = false
const onScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      if (containerRef.value) {
        scrollTop.value = containerRef.value.scrollTop
      }
      ticking = false
    })
    ticking = true
  }
}

// Fonction pour obtenir la clé unique d'un élément
const getItemKey = (item, index) => {
  return item[props.keyField] || index
}

// Fonction pour faire défiler vers un élément spécifique
const scrollToItem = (index) => {
  if (containerRef.value) {
    const targetScrollTop = index * props.itemHeight
    containerRef.value.scrollTop = targetScrollTop
  }
}

// Exposer les méthodes publiques
defineExpose({
  scrollToItem
})

// Réinitialiser le scroll quand les éléments changent
watch(() => props.items.length, () => {
  scrollTop.value = 0
  if (containerRef.value) {
    containerRef.value.scrollTop = 0
  }
})
</script>
