<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import heroAmbient from '../assets/home/hero-ambient.png'

const pageRef = ref(null)
const router = useRouter()
let observer = null
let authSubscription = null

function setupReveal(root) {
  const targets = root.querySelectorAll('[data-home-reveal]')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced) {
    targets.forEach((el) => el.classList.add('is-inview'))
    root.classList.add('is-hero-ready')
    return
  }

  requestAnimationFrame(() => {
    root.classList.add('is-hero-ready')
  })

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview')
          observer?.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px',
    },
  )

  targets.forEach((el) => observer.observe(el))
}

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    router.replace('/dashboard')
    return
  }

  authSubscription = supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      router.replace('/dashboard')
    }
  })

  const root = pageRef.value
  if (!root) return
  setupReveal(root)
})

onUnmounted(() => {
  observer?.disconnect()
  authSubscription?.data?.subscription?.unsubscribe()
})
</script>

<template>
  <main ref="pageRef" class="home-page">
    <section class="hero-section">
      <div class="home-hero-media" aria-hidden="true">
        <img
          class="home-hero-media-img"
          :src="heroAmbient"
          alt=""
          width="1920"
          height="1080"
          decoding="async"
          fetchpriority="high"
        />
        <div class="home-hero-media-veil"></div>
      </div>

      <div class="home-hero-glow" aria-hidden="true"></div>
      <div class="home-hero-glow home-hero-glow-2" aria-hidden="true"></div>

      <div class="home-container hero-grid">
        <div class="hero-copy">
          <span class="section-badge hero-entrance hero-entrance-1">
            Plateforme de gestion multi-entreprises
          </span>

          <h1 class="hero-title">
            <span class="hero-title-line">
              <span class="hero-title-inner hero-entrance hero-entrance-2">
                Centralisez vos entreprises,
              </span>
            </span>
            <span class="hero-title-line">
              <span class="hero-title-inner hero-entrance hero-entrance-3">
                vos clients et vos documents
              </span>
            </span>
            <span class="hero-title-line">
              <span class="hero-title-inner hero-entrance hero-entrance-4">
                dans un seul espace sécurisé.
              </span>
            </span>
          </h1>

          <p class="hero-text hero-entrance hero-entrance-5">
            Gérez vos transactions, les informations de vos clients, les pièces d’identité
            et les contrats signés avec une interface conçue pour un usage professionnel.
          </p>

          <div class="hero-actions hero-entrance hero-entrance-6">
            <RouterLink to="/login" class="btn">Accéder à la plateforme</RouterLink>
            <a href="#features" class="btn btn-secondary">Découvrir les fonctionnalités</a>
          </div>

          <div class="hero-metrics">
            <div class="metric-card hero-entrance hero-entrance-7">
              <strong>Multi-entreprises</strong>
              <span>Un même compte peut gérer plusieurs structures.</span>
            </div>
            <div class="metric-card hero-entrance hero-entrance-8">
              <strong>Dossiers clients</strong>
              <span>Transactions, marchandises, poids et documents regroupés.</span>
            </div>
          </div>
        </div>

        <div class="hero-visual hero-entrance hero-entrance-9">
          <div class="hero-visual-orbit" aria-hidden="true"></div>

          <div class="dashboard-preview" aria-hidden="true">
            <div class="preview-topbar">
              <span></span>
              <span></span>
              <span></span>
              <strong class="preview-topbar-title">Gestovia</strong>
            </div>

            <div class="preview-body">
              <aside class="preview-sidebar">
                <div class="preview-brand-pill">GS</div>
                <p class="preview-nav-item is-active">Tableau de bord</p>
                <p class="preview-nav-item">Entreprises</p>
                <p class="preview-nav-item">Clients</p>
                <p class="preview-nav-item">Documents</p>
              </aside>

              <section class="preview-content">
                <div class="preview-stat-grid">
                  <div class="preview-stat-card is-filled">
                    <span class="preview-stat-label">Entreprises</span>
                    <strong class="preview-stat-value">12</strong>
                  </div>
                  <div class="preview-stat-card is-filled">
                    <span class="preview-stat-label">Clients</span>
                    <strong class="preview-stat-value">48</strong>
                  </div>
                  <div class="preview-stat-card is-filled">
                    <span class="preview-stat-label">Documents</span>
                    <strong class="preview-stat-value">126</strong>
                  </div>
                </div>

                <div class="preview-table-card is-filled">
                  <div class="preview-table-head">
                    <span>Derniers clients</span>
                    <span>Statut</span>
                  </div>
                  <div class="preview-table-row">
                    <span>Martin Transport</span>
                    <em class="preview-status is-ok">Complet</em>
                  </div>
                  <div class="preview-table-row">
                    <span>Nordique Logistique</span>
                    <em class="preview-status is-pending">En cours</em>
                  </div>
                  <div class="preview-table-row">
                    <span>Atlas Commerce</span>
                    <em class="preview-status is-ok">Complet</em>
                  </div>
                  <div class="preview-table-row">
                    <span>Horizon Cargo</span>
                    <em class="preview-status is-pending">Documents</em>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#features"
        class="home-scroll-hint hero-entrance hero-entrance-10"
        aria-label="Défiler vers les fonctionnalités"
      >
        <span class="home-scroll-hint-line"></span>
      </a>
    </section>

    <section id="features" class="features-section">
      <div class="home-container">
        <div class="section-heading" data-home-reveal>
          <span class="section-badge">Fonctionnalités</span>
          <h2 class="section-title">Un workflow clair pour gérer vos opérations</h2>
          <p class="section-text">
            La plateforme a été pensée pour suivre l’ensemble du cycle administratif
            d’un client, de la transaction jusqu’aux documents justificatifs.
          </p>
        </div>

        <div class="features-grid">
          <article class="feature-card home-card-motion" data-home-reveal style="--reveal-delay: 0ms">
            <span class="feature-index">01</span>
            <h3>Gestion multi-entreprises</h3>
            <p>
              Créez et administrez plusieurs entreprises avec un seul compte utilisateur.
            </p>
          </article>

          <article class="feature-card home-card-motion" data-home-reveal style="--reveal-delay: 100ms">
            <span class="feature-index">02</span>
            <h3>Dossiers clients complets</h3>
            <p>
              Ajoutez les informations essentielles, la transaction, le montant, la marchandise et le poids.
            </p>
          </article>

          <article class="feature-card home-card-motion" data-home-reveal style="--reveal-delay: 200ms">
            <span class="feature-index">03</span>
            <h3>Documents centralisés</h3>
            <p>
              Conservez les pièces d’identité et les contrats signés dans le même dossier.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="workflow-section">
      <div class="home-container workflow-grid">
        <div class="workflow-copy" data-home-reveal>
          <span class="section-badge">Processus</span>
          <h2 class="section-title">Un parcours simple pour vos équipes</h2>
        </div>

        <div class="workflow-steps">
          <article class="workflow-step home-card-motion" data-home-reveal style="--reveal-delay: 0ms">
            <span class="step-number">01</span>
            <h3>Créez votre espace</h3>
            <p>Ouvrez un compte sécurisé et accédez à votre environnement de travail.</p>
          </article>

          <article class="workflow-step home-card-motion" data-home-reveal style="--reveal-delay: 110ms">
            <span class="step-number">02</span>
            <h3>Ajoutez vos entreprises</h3>
            <p>Organisez vos activités par structure pour garder une gestion claire.</p>
          </article>

          <article class="workflow-step home-card-motion" data-home-reveal style="--reveal-delay: 220ms">
            <span class="step-number">03</span>
            <h3>Enregistrez vos clients</h3>
            <p>Complétez chaque dossier avec ses transactions et ses documents.</p>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>