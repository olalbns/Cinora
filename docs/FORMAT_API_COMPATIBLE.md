# Format d’API compatible avec les artefacts analysés

Le mode API de CINORA attend désormais la **même enveloppe et les mêmes noms de champs** que ceux relevés dans les fichiers fournis. Les types exhaustifs sont dans `types/observed-api.ts`.

> Cette compatibilité est destinée à votre propre backend et à des contenus autorisés. Les domaines du site analysé sont explicitement refusés dans les adaptateurs.

## 1. Enveloppe commune

Une réponse réussie doit utiliser `code: 0` :

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

Pour une erreur, conservez au minimum :

```json
{
  "code": 40101,
  "message": "unauthorized",
  "reason": "TOKEN_EXPIRED",
  "metadata": {}
}
```

Le frontend considère toute valeur de `code` différente de `0` comme une erreur.

## 2. Objet `subject`

`subjectType` conserve les valeurs observées :

- `1` : film ;
- `2` : série.

La durée `duration` est exprimée en **secondes**. `genre` et `subtitles` sont des chaînes séparées par des virgules.

```json
{
  "subjectId": "subject_001",
  "subjectType": 1,
  "title": "Titre de démonstration",
  "description": "Synopsis…",
  "releaseDate": "2026-08-15",
  "duration": 7200,
  "genre": "Drama,Thriller",
  "cover": {
    "url": "https://cdn.votre-domaine.com/images/poster.webp",
    "width": 1200,
    "height": 1800,
    "size": 245000,
    "format": "webp",
    "thumbnail": "",
    "blurHash": "",
    "gif": null,
    "avgHueLight": "#777777",
    "avgHueDark": "#222222",
    "id": "image_001"
  },
  "countryName": "France",
  "imdbRatingValue": "8.2",
  "subtitles": "Français,English",
  "ops": "",
  "hasResource": true,
  "trailer": null,
  "detailPath": "titre-de-demonstration-AbC123",
  "staffList": [],
  "appointmentCnt": 0,
  "appointmentDate": "",
  "corner": "13+",
  "imdbRatingCount": 1250,
  "stills": null,
  "postTitle": "",
  "season": 0,
  "dubs": [],
  "accessStrategy": null
}
```

Les clés restent présentes même lorsque leur valeur est vide ou `null`.

## 3. `GET /home`

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "platformList": [
      { "name": "Mon Studio", "uploadBy": "Équipe éditoriale" }
    ],
    "operatingList": [
      {
        "type": "BANNER",
        "position": 1,
        "title": "À la une",
        "subjects": [],
        "banner": {
          "items": [
            {
              "id": "banner_01",
              "title": "",
              "image": { "url": "https://cdn.votre-domaine.com/banner.webp", "width": 1920, "height": 1080, "size": 0, "format": "webp", "thumbnail": "", "blurHash": "", "gif": null, "avgHueLight": "", "avgHueDark": "", "id": "image_banner" },
              "url": "",
              "subjectId": "subject_001",
              "subjectType": 1,
              "subject": { "subjectId": "subject_001", "subjectType": 1, "title": "…" },
              "detailPath": "titre-de-demonstration-AbC123"
            }
          ]
        },
        "opId": "operation_01",
        "url": "",
        "liveList": [],
        "filters": [],
        "customData": null,
        "genreTopId": "",
        "detailPath": ""
      },
      {
        "type": "SUBJECTS_MOVIE",
        "position": 2,
        "title": "Films populaires",
        "subjects": [],
        "banner": null,
        "opId": "operation_02",
        "url": "",
        "liveList": [],
        "filters": [],
        "customData": null,
        "genreTopId": "",
        "detailPath": ""
      }
    ]
  }
}
```

Types d’opérations pris en charge : `BANNER`, `CUSTOM`, `SUBJECTS_MOVIE`, `FILTER`, `APPOINTMENT_LIST` et `SPORT_LIVE`. Les rangées du frontend sont construites depuis `subjects`; pour `CUSTOM`, elles peuvent aussi être construites depuis `customData.items[].subject`.

## 4. Listes : recherche, filtres et tendances

Les trois endpoints renvoient la même structure `subjectList + pager`.

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "subjectList": [],
    "pager": {
      "hasMore": true,
      "nextPage": "2",
      "page": "1",
      "perPage": 20,
      "totalCount": 120
    }
  }
}
```

### `POST /subject/search`

```json
{ "keyword": "astra", "page": 1, "perPage": 20, "subjectType": 0 }
```

### `POST /subject/filter`

```json
{
  "keyword": "",
  "page": 1,
  "perPage": 24,
  "subjectType": 1,
  "genre": "Drama",
  "year": "2026",
  "sort": "popular"
}
```

### `GET /subject/trending`

Paramètres : `page`, `perPage`.

## 5. `GET /detail?detailPath=...`

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "subject": {},
    "stars": [
      {
        "staffId": "staff_01",
        "staffType": 1,
        "name": "Nom",
        "character": "Personnage",
        "avatarUrl": "https://cdn.votre-domaine.com/avatar.webp",
        "detailPath": "nom-staff_01"
      }
    ],
    "resource": {
      "seasons": [
        {
          "se": 1,
          "maxEp": 8,
          "allEp": "1,2,3,4,5,6,7,8",
          "resolutions": [
            { "resolution": 720, "epNum": 8 },
            { "resolution": 1080, "epNum": 8 }
          ]
        }
      ],
      "source": "votre-cms",
      "uploadBy": "Votre studio"
    },
    "metadata": {
      "title": "Titre SEO",
      "description": "Description SEO",
      "keyWords": "mot,clé",
      "image": "https://cdn.votre-domaine.com/backdrop.webp"
    },
    "isForbid": false,
    "watchTimeLimit": 0,
    "postList": {
      "pager": { "hasMore": false, "nextPage": "", "page": "1", "perPage": 0, "totalCount": 0 },
      "items": []
    },
    "accessStrategy": null
  }
}
```

Le frontend conserve `ops` et `accessStrategy` pour compatibilité, mais **ne les interprète pas**. Le endpoint `/detail` est toujours appelé côté serveur via `server/api/catalog/detail.get.ts`, afin de ne pas exposer l’adresse privée du BFF.

## 6. `GET /platform/play-list`

Paramètres : `page`, `perPage`, `platform`.

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "pager": { "hasMore": false, "nextPage": "", "page": "1", "perPage": 24, "totalCount": 24 },
    "monthList": [
      {
        "pager": { "hasMore": false, "nextPage": "", "page": "", "perPage": 0, "totalCount": 8 },
        "subjects": [],
        "platform": "Mon Studio",
        "month": "202608",
        "allMonth": []
      }
    ],
    "platform": "Mon Studio",
    "platformList": [
      { "name": "Mon Studio", "uploadBy": "Équipe éditoriale" }
    ]
  }
}
```

## 7. Lecture vidéo

Le format analysé ne fournit pas une session média web standard directement exploitable de manière sûre. CINORA conserve donc un endpoint séparé et autorisé :

```http
POST /playback/session
```

```json
{
  "streamUrl": "https://cdn.votre-domaine.com/signed/media.mp4",
  "format": "mp4",
  "expiresAt": "2026-08-15T18:00:00Z",
  "subtitles": []
}
```

Utilisez une URL signée à durée courte. Aucun mécanisme d’extraction, de déblocage ou d’interprétation du champ opaque `ops` n’est inclus.
