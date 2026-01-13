<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useDemoStore } from '@/stores/demo'
import { useAuthStore } from '@/stores/auth'

const demoStore = useDemoStore()
const authStore = useAuthStore()

// Au montage, vérifier s'il y a une session démo en cours
onMounted(() => {
  // Essayer de charger une session démo existante
  const hasSession = demoStore.loadFromSessionStorage()
  
  if (hasSession && demoStore.isDemoMode) {
    // Si une session démo existe, restaurer l'utilisateur démo
    authStore.user = demoStore.demoUser
    authStore.token = 'demo-token-restored'
  }
  
  // Gérer la fermeture de la fenêtre/onglet
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

function handleBeforeUnload() {
  // Si on est en mode démo, nettoyer la session
  if (demoStore.isDemoMode) {
    demoStore.exitDemoMode()
  }
}
</script>

<style>
#app {
  height: 100vh;
  width: 100vw;
}
</style>
