<script setup lang="ts">
const managed = usePublicSiteSettings()
const email = computed(() => managed.value?.site.supportEmail || 'bonjour@cinora.example')
const topics = [
  { title: 'Lecture et qualité', text: 'Vérifiez votre connexion, puis rechargez la session de lecture depuis la fiche du contenu.' },
  { title: 'Favoris et historique', text: 'Ces données restent dans votre navigateur. Vous pouvez les effacer depuis votre profil.' },
  { title: 'Langues et sous-titres', text: 'Choisissez vos préférences dans le profil, puis activez CC dans le lecteur lorsqu’une piste est disponible.' }
]
useSeoMeta({ title: 'Centre d’aide' })
</script>
<template><div class="legal-page page-top container"><header><p class="eyebrow">ASSISTANCE</p><h1>Comment pouvons-nous vous aider ?</h1><p>Retrouvez les réponses essentielles ou contactez directement l’équipe.</p></header><div class="help-grid"><article v-for="topic in topics" :key="topic.title"><AppIcon name="info" /><h2>{{ topic.title }}</h2><p>{{ topic.text }}</p></article></div><section class="help-contact"><div><p class="eyebrow">BESOIN D’AIDE ?</p><h2>Parlez à une personne.</h2><p>Décrivez votre problème avec le titre concerné, votre navigateur et l’appareil utilisé.</p></div><a :href="`mailto:${email}`" class="btn btn--primary">{{ email }}<AppIcon name="arrow-right" /></a></section></div></template>
