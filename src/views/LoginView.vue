<script setup>
import { ref } from 'vue'
import AuthModal from '../components/AuthModal.vue'

const authMode = ref('login')
</script>

<template>
  <main class="login-page login-page-card">
    <section class="login-shell">
      <AuthModal variant="page" v-model:mode="authMode" />
    </section>
  </main>
</template>
