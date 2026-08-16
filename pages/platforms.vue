<script setup lang="ts">
const service = useContentService()
const { data: collections } = await useAsyncData('platforms', () => service.getPlatforms())
useSeoMeta({ title: 'Collections', description: 'Explorez nos univers partenaires.' })
</script>

<template>
  <div class="collections-page page-top container container--wide">
    <header class="simple-hero"><p class="eyebrow">TOUS LES UNIVERS</p><h1>Des collections qui<br><em>ont une signature.</em></h1><p>Explorez le catalogue par studio, label et collection éditoriale.</p></header>
    <div v-if="collections" class="collection-list">
      <section v-for="collection in collections" :key="collection.id" class="collection-block" :style="{ '--collection-color': collection.color }">
        <div class="collection-block__header"><div class="collection-monogram">{{ collection.name.slice(0, 1) }}</div><div><h2>{{ collection.name }}</h2><p>{{ collection.description }}</p></div><span>{{ collection.itemCount }} titres</span></div>
        <div class="collection-block__grid"><MovieCard v-for="item in collection.items" :key="item.id" :item="item" compact /><NuxtLink :to="`/browse`" class="collection-more"><span><AppIcon name="arrow-right" :size="24" /></span><strong>Tout voir</strong></NuxtLink></div>
      </section>
    </div>
  </div>
</template>
