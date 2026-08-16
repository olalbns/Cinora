<script setup lang="ts">
const { history, hydrate } = useLibrary()
onMounted(hydrate)
useSeoMeta({ title: 'Historique' })
</script>

<template>
  <div class="library-page page-top container container--wide">
    <header class="library-header"><div><p class="eyebrow">VOTRE ESPACE</p><h1>Historique</h1><p>Reprenez exactement là où vous vous êtes arrêté.</p></div><span>{{ history.length }} titre{{ history.length > 1 ? 's' : '' }}</span></header>
    <div v-if="history.length" class="catalog-grid catalog-grid--wide"><MovieCard v-for="entry in history" :key="entry.item.id" :item="entry.item" :progress="entry.progress" /></div>
    <EmptyState v-else icon="clock" title="Rien à reprendre pour l’instant" text="Les contenus que vous commencez apparaîtront automatiquement ici." />
  </div>
</template>
