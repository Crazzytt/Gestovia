<template>
  <main class="home-page">
    <section class="hero-section">
      <div class="home-container hero-grid">
        <div class="hero-copy reveal">
          <span class="section-badge">Plateforme de gestion multi-entreprises</span>
          <h1 class="hero-title">
            Centralisez vos entreprises, vos clients et vos documents dans un seul espace sécurisé.
          </h1>
          <p class="hero-text">
            Gérez vos transactions, les informations de vos clients, les pièces d’identité
            et les contrats signés avec une interface conçue pour un usage professionnel.
          </p>

          <div class="hero-actions">
            <RouterLink to="/login" class="btn">Accéder à la plateforme</RouterLink>
            <a href="#features" class="btn btn-secondary">Découvrir les fonctionnalités</a>
          </div>

          <div class="hero-metrics">
            <div class="metric-card reveal-delay-1">
              <strong>Multi-entreprises</strong>
              <span>Un même compte peut gérer plusieurs structures.</span>
            </div>
            <div class="metric-card reveal-delay-2">
              <strong>Dossiers clients</strong>
              <span>Transactions, marchandises, poids et documents regroupés.</span>
            </div>
          </div>
        </div>

        <div class="hero-visual reveal-delay-3">
          <div class="dashboard-preview">
            <div class="preview-topbar">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div class="preview-body">
              <aside class="preview-sidebar">
                <div class="sidebar-line large"></div>
                <div class="sidebar-line"></div>
                <div class="sidebar-line"></div>
                <div class="sidebar-line"></div>
              </aside>

              <section class="preview-content">
                <div class="preview-stat-grid">
                  <div class="preview-stat-card"></div>
                  <div class="preview-stat-card"></div>
                  <div class="preview-stat-card"></div>
                </div>

                <div class="preview-table-card">
                  <div class="table-line long"></div>
                  <div class="table-line"></div>
                  <div class="table-line"></div>
                  <div class="table-line"></div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="features-section">
      <div class="home-container">
        <div class="section-heading reveal">
          <span class="section-badge">Fonctionnalités</span>
          <h2 class="section-title">Un workflow clair pour gérer vos opérations</h2>
          <p class="section-text">
            La plateforme a été pensée pour suivre l’ensemble du cycle administratif
            d’un client, de la transaction jusqu’aux documents justificatifs.
          </p>
        </div>

        <div class="features-grid">
          <article class="feature-card reveal">
            <h3>Gestion multi-entreprises</h3>
            <p>
              Créez et administrez plusieurs entreprises avec un seul compte utilisateur.
            </p>
          </article>

          <article class="feature-card reveal-delay-1">
            <h3>Dossiers clients complets</h3>
            <p>
              Ajoutez les informations essentielles, la transaction, le montant, la marchandise et le poids.
            </p>
          </article>

          <article class="feature-card reveal-delay-2">
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
        <div class="workflow-copy reveal">
          <span class="section-badge">Processus</span>
          <h2 class="section-title">Un parcours simple pour vos équipes</h2>
        </div>

        <div class="workflow-steps">
          <article class="workflow-step reveal">
            <span class="step-number">01</span>
            <h3>Créez votre espace</h3>
            <p>Ouvrez un compte sécurisé et accédez à votre environnement de travail.</p>
          </article>

          <article class="workflow-step reveal-delay-1">
            <span class="step-number">02</span>
            <h3>Ajoutez vos entreprises</h3>
            <p>Organisez vos activités par structure pour garder une gestion claire.</p>
          </article>

          <article class="workflow-step reveal-delay-2">
            <span class="step-number">03</span>
            <h3>Enregistrez vos clients</h3>
            <p>Complétez chaque dossier avec ses transactions et ses documents.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="home-container">
        <div class="cta-card reveal">
          <div>
            <span class="section-badge">Accès sécurisé</span>
            <h2 class="section-title">Commencez à structurer votre gestion client</h2>
            <p class="section-text">
              Accédez à une interface professionnelle pensée pour les entreprises qui gèrent des dossiers sensibles.
            </p>
          </div>

          <RouterLink to="/login" class="btn">Se connecter / S’inscrire</RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>