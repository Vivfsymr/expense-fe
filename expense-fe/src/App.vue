<template>
  <a-layout style="min-height: 100vh; width: 100vw; background: #181a1b;">
    <AppHeader />
    <a-layout-content style="padding: 32px 16px; width: 100vw; padding-top: 80px; min-height: calc(100vh - 64px);">
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
</script>