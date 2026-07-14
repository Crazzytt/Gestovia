<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const year = new Date().getFullYear()

const goHome = async () => {
  if (router.currentRoute.value.path !== '/') {
    await router.push('/')
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <footer class="site-footer">
    <div class="home-container site-footer-grid">
      <div class="site-footer-brand">
        <RouterLink to="/" class="brand brand-footer" @click="goHome">
          <div class="brand-mark">GS</div>
          <div class="site-footer-brand-text">
            <span class="brand-text">Gestovia</span>
            <span class="site-footer-tagline">Plateforme de gestion multi-entreprises</span>
          </div>
        </RouterLink>
        <p class="site-footer-copy">
          Centralisez vos entreprises, vos clients et vos documents dans un seul espace sécurisé —
          transactions, pièces d’identité et contrats signés.
        </p>
      </div>

      <div class="site-footer-col">
        <h3 class="site-footer-heading">Plateforme</h3>
        <nav class="site-footer-links">
          <a href="/" class="site-footer-home" @click.prevent="goHome">Accueil</a>
          <RouterLink to="/#features">Fonctionnalités</RouterLink>
          <RouterLink to="/login">Connexion</RouterLink>
          <RouterLink to="/login">Demander un accès</RouterLink>
        </nav>
      </div>

      <div class="site-footer-col">
        <h3 class="site-footer-heading">Fonctionnalités</h3>
        <nav class="site-footer-links">
          <RouterLink to="/#features">Multi-entreprises</RouterLink>
          <RouterLink to="/#features">Dossiers clients</RouterLink>
          <RouterLink to="/#features">Documents centralisés</RouterLink>
          <RouterLink to="/dashboard">Tableau de bord</RouterLink>
        </nav>
      </div>

      <div class="site-footer-col">
        <h3 class="site-footer-heading">Parcours</h3>
        <ul class="site-footer-list">
          <li>
            <span class="site-footer-step">01</span>
            <span>Créer votre espace</span>
          </li>
          <li>
            <span class="site-footer-step">02</span>
            <span>Ajouter vos entreprises</span>
          </li>
          <li>
            <span class="site-footer-step">03</span>
            <span>Enregistrer vos clients</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="home-container site-footer-bottom">
      <p class="site-footer-legal">&copy; {{ year }} Gestovia. Tous droits réservés.</p>
    </div>
  </footer>
</template>
