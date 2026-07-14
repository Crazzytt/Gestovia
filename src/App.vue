<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

const route = useRoute()
const isMarketing = computed(() => route.meta.layout === 'marketing')
</script>

<template>
  <div :class="{ 'marketing-layout': isMarketing }">
    <AppHeader v-if="isMarketing" />
    <router-view />
    <AppFooter v-if="isMarketing" />
  </div>
</template>
