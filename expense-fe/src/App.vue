<template>
  <a-layout style="min-height: 100vh; width: 100vw; background: #f9f8f8;">
    <a-layout-content
      :class="layoutContentClass"
      style="width: 100vw;"
    >
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

const layoutContentClass = computed(() => {
  if (route.path.startsWith('/dashboard')) return 'dashboard-layout-content';
  if (route.path.startsWith('/expenses')) return 'expenses-layout-content';
  return '';
});
</script>
<style>
html, body {
  height: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}
html {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  min-height: 100vh;
}
body {
  background: transparent !important;
}
</style>