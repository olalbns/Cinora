# Backend local complet

CINORA inclut désormais PostgreSQL, Redis, les API compatibles, les comptes utilisateurs, le CMS et l’observabilité locale.

## Démarrage recommandé

```bash
cp .env.example .env
```

Renseignez au minimum :

```env
NUXT_ADMIN_PASSWORD="votre-mot-de-passe-administrateur"
NUXT_ADMIN_SESSION_SECRET="au-moins-32-caracteres-aleatoires"
DATABASE_URL=postgresql://cinora:cinora_dev@localhost:5432/cinora
REDIS_URL=redis://localhost:6379
NUXT_PUBLIC_CONTENT_MODE=database
NUXT_PLAYBACK_API_BASE=https://votre-api-media.example
```

Générez le secret avec :

```bash
openssl rand -hex 32
```

Démarrez les dépendances :

```bash
docker compose up -d postgres redis mailpit
npm ci
npm run db:setup
npm run dev
```

Ouvrez :

- Site : `http://localhost:3000`
- Dashboard : `http://localhost:3000/admin`
- Santé : `http://localhost:3000/api/health`
- Métriques : `http://localhost:3000/api/metrics`
- Emails locaux et récupération de mot de passe : `http://localhost:8025`

Dans le dashboard, ouvrez **Sources API** et sélectionnez **PostgreSQL local**.

## Tout exécuter dans Docker

```bash
export NUXT_ADMIN_PASSWORD='votre-mot-de-passe'
export NUXT_ADMIN_SESSION_SECRET="$(openssl rand -hex 32)"
docker compose --profile full up --build
```

Le conteneur applique les migrations et le seed avant de démarrer Nuxt.

## Outils optionnels

Administration PostgreSQL :

```bash
docker compose --profile tools up -d adminer
```

Adminer : `http://localhost:8080`

- Serveur : `postgres`
- Utilisateur : `cinora`
- Mot de passe : `cinora_dev`
- Base : `cinora`

Prometheus et Grafana :

```bash
docker compose --profile monitoring up -d prometheus grafana
```

- Prometheus : `http://localhost:9090`
- Grafana : `http://localhost:3005`
- Identifiants Grafana locaux : `admin` / `cinora_grafana`

## API compatibles disponibles

Base locale : `http://localhost:3000/api/v1`

- `GET /home`
- `POST /subject/search`
- `POST /subject/search-suggest`
- `POST /subject/filter`
- `GET /subject/trending`
- `GET /subject/detail-rec`
- `GET /detail`
- `GET /ranking-list`
- `GET /ranking-list/content`
- `GET /staff/subject-list`
- `GET /staff/staff-related`
- `GET /staff-detail`
- `GET /platform/play-list`
- `GET /upcoming-subject-list`
- `GET /blog-page-list`
- `GET /web/get-custom-page-config`
- `GET /web/get-page-tdk`

Les réponses utilisent l’enveloppe :

```json
{ "code": 0, "message": "ok", "data": {} }
```

## Comptes et données utilisateur

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `PUT /api/auth/profile`
- favoris synchronisés dans PostgreSQL ;
- historique synchronisé dans PostgreSQL ;
- sessions opaques stockées dans Redis ;
- mots de passe dérivés avec `scrypt` et sel aléatoire.

## CMS

Le dashboard contient un onglet **Catalogue CMS**. Il permet de créer, modifier, publier et supprimer des films et séries.

Les tables supplémentaires — acteurs, épisodes, classements, blogs, pages personnalisées — sont disponibles dans Adminer et exposées par des routes administrateur.

## Lecture média

CINORA ne stocke pas de média protégé. Le lecteur appelle l’API configurée dans `NUXT_PLAYBACK_API_BASE` ou dans le dashboard et attend :

```json
{
  "streamUrl": "https://cdn.example/media/signed.m3u8",
  "format": "hls",
  "expiresAt": "2026-08-15T18:00:00Z",
  "subtitles": []
}
```

Aucun contournement de jeton, de limite de visionnage ou d’infrastructure tierce n’est inclus.
