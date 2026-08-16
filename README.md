# CINORA — frontend vidéo Nuxt 3

Interface premium sombre, responsive et prête à être branchée sur une API de contenus autorisés.

## Fonctionnalités

- Accueil éditorial avec hero et carrousels
- Catalogue, filtres, tri et recherche instantanée
- Fiches films/séries et épisodes
- Lecteur de démonstration prêt à recevoir une session média signée
- Tendances et collections
- Favoris et historique persistés dans le navigateur
- Responsive desktop, tablette et mobile
- Couche d’adaptation TypeScript : mode mock ou API
- Dashboard privé avec CMS catalogue et configuration des API
- Backend PostgreSQL + Redis exécutable localement
- Comptes utilisateurs, favoris, historique, commentaires et préférences synchronisés
- API compatibles : recherche, suggestions, recommandations, classements, acteurs, sorties, blogs et SEO
- Interface multilingue en huit langues
- Rate limiting Redis, santé, métriques Prometheus et stack Grafana optionnelle
- Configuration dynamique via des proxys Nitro
- Images de démonstration originales, stockées localement

## Démarrage

```bash
npm install
npm run dev
```

Puis ouvrez `http://localhost:3000`.

## Commandes

```bash
npm run dev        # développement
npm run typecheck  # validation TypeScript
npm run build      # build de production
npm run preview    # aperçu du build
```

## Backend local complet

Consultez **[`docs/LOCAL_BACKEND.md`](docs/LOCAL_BACKEND.md)** pour démarrer PostgreSQL, Redis, les migrations, le seed, Adminer et l’observabilité.

## Dashboard privé

Configurez `NUXT_ADMIN_PASSWORD` et `NUXT_ADMIN_SESSION_SECRET`, puis ouvrez `/admin`.

Consultez **[`docs/DASHBOARD.md`](docs/DASHBOARD.md)** pour la sécurité, le stockage et les fonctions disponibles.

## Connexion API

Le mode API accepte la même enveloppe et les mêmes DTO que ceux relevés dans les artefacts d’analyse (`code`, `message`, `data`, `subjectList`, `operatingList`, etc.).

- Guide d’intégration : **[`docs/CONNEXION_API.md`](docs/CONNEXION_API.md)**
- Formats complets : **[`docs/FORMAT_API_COMPATIBLE.md`](docs/FORMAT_API_COMPATIBLE.md)**
- Types TypeScript : **[`types/observed-api.ts`](types/observed-api.ts)**

Les domaines analysés sont refusés par les adaptateurs : configurez uniquement votre propre backend autorisé.

## Personnalisation rapide

1. Utilisez `/admin` pour le nom, la couleur, la navigation, les modules et le SEO.
2. Ajustez les autres tokens visuels dans `assets/css/main.css`.
3. Remplacez les images de `public/images/` ou fournissez-les via votre API.
4. Modifiez les données fictives dans `data/mock.ts` si nécessaire.

> Ce projet n’intègre aucun endpoint ni média provenant du site analysé. Le lecteur et les adaptateurs sont destinés exclusivement à des contenus que vous êtes autorisé à distribuer.
