<template>
  <a-layout style="min-height: 100vh; width: 100vw; background: #f9f8f8;">
    <AppHeader />
    <a-layout-content
      :class="layoutContentClass"
      style="width: 100vw;"
    >
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

const layoutContentClass = computed(() => {
  if (route.path.startsWith('/dashboard')) return 'dashboard-layout-content';
  if (route.path.startsWith('/expenses')) return 'expenses-layout-content';
  return '';
});
</script>