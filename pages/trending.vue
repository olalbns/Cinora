<script setup lang="ts">
const service = useContentService()
const { data: items } = await useAsyncData('trending-page', () => service.getTrending())
useSeoMeta({ title: 'Tendances', description: 'Les films et séries les plus regardés du moment.' })
</script>

<template>
  <div class="trending-page page-top">
    <header class="trending-hero container container--wide"><div><p class="eyebrow">MAINTENANT SUR CINORA</p><h1>Ce que tout le monde<br><em>regarde.</em></h1></div><p>Le classement évolue chaque jour selon les découvertes de notre communauté.</p></header>
    <section v-if="items" class="ranking-list container container--wide">
      <article v-for="(item, index) in items" :key="item.id" class="ranking-item">
        <span class="ranking-item__number">{{ String(index + 1).padStart(2, '0') }}</span>
        <NuxtLink :to="`/movies/${item.slug}`" class="ranking-item__image"><img :src="item.image" :alt="item.title" /></NuxtLink>
        <div class="ranking-item__copy"><div><span class="match">{{ item.match }} % pour vous</span><span>{{ item.year }}</span><span>{{ item.quality }}</span></div><h2>{{ item.title }}</h2><p>{{ item.synopsis }}</p><span>{{ item.genres.join(' · ') }}</span></div>
        <NuxtLink :to="`/movies/${item.slug}`" class="round-link"><AppIcon name="arrow-right" /></NuxtLink>
      </article>
    </section>
  </div>
</template>
