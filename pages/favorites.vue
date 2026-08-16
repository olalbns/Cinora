<script setup lang="ts">
const { favorites, hydrate } = useLibrary()
onMounted(hydrate)
useSeoMeta({ title: 'Ma liste' })
</script>

<template>
  <div class="library-page page-top container container--wide">
    <header class="library-header"><div><p class="eyebrow">VOTRE ESPACE</p><h1>Ma liste</h1><p>Les histoires que vous avez choisies de garder près de vous.</p></div><span>{{ favorites.length }} titre{{ favorites.length > 1 ? 's' : '' }}</span></header>
    <div v-if="favorites.length" class="catalog-grid catalog-grid--wide"><MovieCard v-for="item in favorites" :key="item.id" :item="item" /></div>
    <EmptyState v-else icon="heart" title="Votre liste vous attend" text="Ajoutez des films et des séries avec le bouton cœur pour les retrouver ici." />
  </div>
</template>
