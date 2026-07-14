<p align="center">
  <strong style="font-size: 2rem; letter-spacing: -0.04em;">Gestovia</strong>
</p>

<p align="center"><em>Centralisez vos entreprises, vos clients et vos documents.</em></p>

<p align="center">
  <img src="https://img.shields.io/badge/statut-en%20développement-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/stack-Vue%203%20%2B%20Supabase-3ECF8E?style=flat-square" />
  <img src="https://img.shields.io/badge/focus-gestion%20multi--entreprises-1D4ED8?style=flat-square" />
</p>

---

**Gestovia** est une plateforme SaaS de gestion multi-entreprises. Elle permet de centraliser les structures, les dossiers clients, les transactions et les documents (pièces d’identité, contrats signés) dans un seul espace sécurisé — conçu pour un usage professionnel (transport, commerce, logistique, etc.).

---

## 🎯 Problème résolu

| Problème | Sans Gestovia | Avec Gestovia |
|----------|---------------|---------------|
| Plusieurs entreprises à gérer | Fichiers dispersés, outils séparés | Un compte, plusieurs espaces |
| Dossiers clients incomplets | Info éclatée (Excel, WhatsApp, disque) | Dossier unique par client |
| Documents sensibles | Risque de perte / copies locales | Stockage privé centralisé |
| Suivi des transactions | Peu de visibilité globale | Montants, dates, marchandises, poids |

---

## 👥 Utilisateurs

- **Gestionnaires / propriétaires** — créent des entreprises, ajoutent des clients, consultent les dossiers.
- **Équipes opérationnelles** — enregistrent transactions et pièces jointes sans quitter la plateforme.
- *(À venir)* **Admins** — supervision, sécurité, métriques globales.

---

## ✨ Fonctionnalités clés (MVP)

**Marketing / accès**
- Page d’accueil animée (hero + parcours produit)
- Authentification email (connexion / inscription) via modal ou page dédiée
- Header et footer marketing unifiés sur tout le parcours connecté

**Espace de travail**
- Tableau de bord — liste des entreprises + création rapide
- Page entreprise — liste clients, totaux, CRUD client (création / édition / suppression)
- Détail client — informations, KPIs, accès aux documents signés (URLs sécurisées)

**Documents**
- Upload pièce d’identité + contrat signé vers Supabase Storage (`client-documents`)
- Consultation via URL signée (durée limitée)

---

## 🧱 Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Vue 3 + Vite + Vue Router |
| Backend / Auth / DB / Storage | Supabase (PostgreSQL + Auth + Storage) |
| Styles | CSS modulaire (global + pages) |
| Hébergement prévu | Vercel / Netlify (à confirmer) |

---

## 📂 Structure du dépôt

```
Gestovia/
├── public/
├── src/
│   ├── assets/           # Visuels (ex. hero ambiance accueil)
│   ├── components/       # AppHeader, AppFooter, AuthModal
│   ├── lib/              # Client Supabase
│   ├── router/           # Routes + garde auth
│   ├── styles/           # style.css + CSS par vue
│   ├── views/            # Home, Login, Dashboard, Company, ClientDetail
│   ├── App.vue
│   └── main.js
├── .env                  # Variables locales (non versionnées idéalement)
└── README.md
```

---

## 🗄️ Données Supabase (cœur métier)

| Ressource | Rôle |
|-----------|------|
| `companies` | Entreprises liées à un `owner_id` |
| `clients` | Dossiers clients (`company_id`, transaction, montant, marchandise, poids, chemins docs) |
| Storage `client-documents` | Fichiers privés (IDs + contrats) |

---

## 🚀 Démarrage local

### Prérequis
- Node.js 20+
- Un projet Supabase (URL + clé publishable)

### Installation

```bash
cd Gestovia
npm install
```

### Variables d’environnement

Créer un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://VOTRE_PROJET.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_publishable
```

> Ne jamais committer de secrets. Utiliser `.env.local` / secrets CI en production.

### Lancer l’app

```bash
npm run dev
```

Build de production :

```bash
npm run build
npm run preview
```

---

## 🗺️ Routes principales

| Route | Page | Auth |
|-------|------|------|
| `/` | Accueil | Non |
| `/login` | Connexion / inscription | Non |
| `/dashboard` | Entreprises | Oui |
| `/companies/:id` | Clients de l’entreprise | Oui |
| `/companies/:companyId/clients/:clientId` | Détail client | Oui |

---

## 🗺️ Roadmap

**Phase 1 — Fondations**
- [x] Landing + auth (modal / page)
- [x] Dashboard multi-entreprises
- [x] CRUD clients + documents Storage
- [x] UI unifiée (header / footer, animations, responsive)
- [ ] Désactiver `DEV_BYPASS_AUTH` hors développement
- [ ] Harden RLS / policies Storage en revue complète

**Phase 2 — Produit**
- [ ] Profil utilisateur
- [ ] Rôles / invitations membres d’entreprise
- [ ] Recherche et filtres clients
- [ ] Export PDF / CSV des dossiers

**Phase 3 — Croissance**
- [ ] Facturation / abonnements
- [ ] Notifications
- [ ] Tableau de bord analytique (volumes, montants)
- [ ] App mobile (si besoin terrain)

---

## 🌿 Workflow de branches

```
main       ← stable, déployable
dev        ← intégration des fonctionnalités
feature/*  ← ex: feature/client-search, feature/invites
fix/*      ← ex: fix/signed-url-expiry
```

---

## 🔐 Notes sécurité

- Les documents clients passent par des **URLs signées** (pas d’accès public permanent).
- Vérifier les politiques RLS sur `companies`, `clients` et le bucket `client-documents`.
- En dev, `DEV_BYPASS_AUTH` peut court-circuiter la garde router — à désactiver avant mise en production.

---

## 📎 Liens utiles

- Repo : [github.com/Crazzytt/Gestovia](https://github.com/Crazzytt/Gestovia)
- Docs Vue 3 : https://vuejs.org/
- Docs Supabase : https://supabase.com/docs

---

<p align="center">
  <sub>Gestovia — plateforme de gestion multi-entreprises</sub>
</p>
