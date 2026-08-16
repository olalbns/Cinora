# Connecter CINORA à votre API compatible

Le frontend est livré en **mode mock**. En mode `api`, il attend les formats observés dans les artefacts fournis. La spécification détaillée est dans [`FORMAT_API_COMPATIBLE.md`](./FORMAT_API_COMPATIBLE.md).

## 1. Configuration

Copiez `.env.example` vers `.env` :

```env
NUXT_PUBLIC_CONTENT_MODE=api
NUXT_PUBLIC_API_BASE=https://api.votre-domaine.com/wefeed-h5api-bff
NUXT_PUBLIC_API_TIMEOUT=10000
NUXT_PUBLIC_API_CALLER_SOURCE=node-frontend

# Facultatif : adresse privée du BFF pour les appels SSR /detail
NUXT_API_SERVER_BASE=http://content-bff.production
```

La base doit être celle de **votre backend autorisé**. Les hôtes étudiés dans le rapport sont bloqués par le code.

## 2. Endpoints consommés

| Méthode | Route | Format de réponse |
|---|---|---|
| GET | `/home` | `platformList + operatingList` |
| POST | `/subject/search` | `subjectList + pager` |
| POST | `/subject/filter` | `subjectList + pager` |
| GET | `/subject/trending` | `subjectList + pager` |
| GET | `/detail?detailPath=…` | `subject + stars + resource + metadata` |
| GET | `/platform/play-list` | `monthList + platformList + pager` |
| POST | `/playback/session` | Session média signée propre à CINORA |

Toutes les réponses catalogue utilisent l’enveloppe :

```json
{ "code": 0, "message": "ok", "data": {} }
```

## 3. Fichiers importants

- `types/observed-api.ts` : contrats TypeScript exacts ;
- `services/content/api.adapter.ts` : conversion du format observé vers les composants CINORA ;
- `services/content/managed.adapter.ts` : client des proxys Nitro locaux ;
- `server/api/catalog/*` : proxys serveur vers le BFF configuré ;
- `server/api/catalog/playback.post.ts` : session de lecture autorisée ;
- `types/content.ts` : modèle interne de présentation.

Ne modifiez pas les composants Vue pour adapter un DTO : effectuez les transformations dans `api.adapter.ts`.

## 4. Authentification

- **Cookie HttpOnly** : `credentials: 'include'` est déjà activé. Configurez CORS sur votre API.
- **Bearer token** : ajoutez l’en-tête dans `request()` et `createSession()` aux emplacements `TODO AUTH`.
- Le proxy `/detail` transmet déjà `cookie` et `authorization` vers votre BFF.

N’insérez jamais un secret serveur dans une variable `NUXT_PUBLIC_*`.

## 5. Règles de conversion déjà implémentées

- `subjectType: 1` devient `movie` ; `subjectType: 2` devient `series` ;
- `duration` passe de secondes à minutes ;
- `genre` est découpé sur les virgules ;
- `cover.url` devient l’affiche ;
- `stills.url`, `trailer.cover.url` ou `metadata.image` devient le fond ;
- `imdbRatingValue` est converti en nombre ;
- `resource.seasons` est transformé en saisons/épisodes ;
- `operatingList` est transformé en rangées d’accueil ;
- `monthList[].subjects` alimente les collections par plateforme.

## 6. Checklist avant production

- [ ] Pointer les variables vers votre propre BFF
- [ ] Vérifier que chaque réponse contient `code`, `message` et `data`
- [ ] Retourner toutes les clés obligatoires d’un `subject`
- [ ] Configurer CORS, cookies et HTTPS
- [ ] Retourner des URLs d’images autorisées
- [ ] Fournir des URLs vidéo signées et temporaires
- [ ] Gérer les codes applicatifs non nuls
- [ ] Tester films (`subjectType: 1`) et séries (`subjectType: 2`)
- [ ] Vérifier les droits de diffusion des médias
