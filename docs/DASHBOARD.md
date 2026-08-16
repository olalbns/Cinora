# Dashboard privé CINORA

Le tableau de bord est disponible à `/admin`. Il permet de modifier la configuration sans toucher au code.

## Variables obligatoires

```env
NUXT_ADMIN_PASSWORD=un-mot-de-passe-long-et-unique
NUXT_ADMIN_SESSION_SECRET=au-moins-32-caracteres-aleatoires
```

Générez un secret avec :

```bash
openssl rand -base64 48
```

Le mot de passe et le secret restent dans la configuration serveur et ne sont jamais envoyés au navigateur.

## Sécurité

- cookie de session HttpOnly, SameSite strict et Secure en production ;
- session valable huit heures ;
- comparaison du mot de passe en temps constant ;
- limitation à cinq tentatives par adresse IP sur quinze minutes ;
- routes `/api/admin/*` protégées côté serveur ;
- mots de passe et jetons API interdits dans la configuration sauvegardée ;
- domaines analysés et adresse de métadonnées cloud refusés ;
- fichier `storage/site-settings.json` créé avec le mode `0600`.

Pour un déploiement multi-instance, remplacez le stockage JSON par PostgreSQL, Redis ou votre service de configuration.

## Sections disponibles

### Vue d’ensemble

État du frontend, mode de données, nombre d’endpoints, fonctionnalités et liens visibles.

### Sources API

- mode démonstration ou API ;
- URL publique du BFF ;
- URL privée SSR ;
- timeout et `callerSource` ;
- chemins des sept endpoints ;
- test réel de `/home` avec contrôle du format compatible.

Une sauvegarde est appliquée immédiatement aux nouvelles requêtes. Le frontend passe désormais par les routes Nitro `/api/catalog/*`, donc les URL privées ne sont pas exposées au navigateur.

### Identité

Nom, monogramme, slogan, email de support, URL du logo et couleur principale. Le nom et la couleur sont appliqués au frontend au prochain chargement.

### Navigation

Libellés, destinations, visibilité, ajout et suppression de liens.

### Fonctionnalités

Recherche, favoris, historique, tendances, collections et lecteur.

### SEO

Suffixe des titres, description globale et directive `index/noindex`.

## Stockage

Les réglages sont écrits atomiquement dans :

```text
storage/site-settings.json
```

La configuration initiale vient des variables `.env`. Après la première sauvegarde, le fichier devient prioritaire.

## Endpoints internes

| Route | Protection | Rôle |
|---|---|---|
| `POST /api/admin/auth/login` | Publique, limitée | Connexion |
| `POST /api/admin/auth/logout` | Cookie | Déconnexion |
| `GET /api/admin/auth/session` | Publique | État de session |
| `GET /api/admin/settings` | Administrateur | Lire les réglages |
| `PUT /api/admin/settings` | Administrateur | Sauvegarder |
| `POST /api/admin/api-test` | Administrateur | Tester `/home` |
| `GET /api/site-config` | Publique | Réglages visuels non sensibles |
| `/api/catalog/*` | Publique | Proxy contrôlé vers le BFF |
