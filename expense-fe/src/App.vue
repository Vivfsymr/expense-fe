<template>
  <a-layout class="app-layout">
    <AppHeader v-if="showHeader" />
    <a-layout-content class="app-content">
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'

const route = useRoute()
const publicPages = ['/login', '/register']
const showHeader = computed(() => !publicPages.includes(route.path))
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  max-width: 100vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  overflow-x: hidden;
}

.app-content {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
  background: transparent !important;
}

:deep(.ant-layout),
:deep(.ant-layout-content) {
  background: transparent !important;
}
</style>
