<script setup lang="ts">
import type { ContentItem } from '~/types/content'
const props = defineProps<{ item: ContentItem }>()
const { isFavorite, toggleFavorite } = useLibrary()
const managed = usePublicSiteSettings()
const playerEnabled = computed(() => Boolean(managed.value?.features.player && managed.value?.apiMode !== 'mock' && managed.value?.mediaConfigured))
const favoritesEnabled = computed(() => managed.value?.features.favorites ?? true)
</script>

<template>
  <section class="hero" :style="{ '--hero-image': `url(${props.item.backdrop})` }">
    <div class="hero__media" />
    <div class="hero__wash" />
    <div class="hero__content container container--wide">
      <div class="hero__copy">
        <p class="hero__eyebrow"><span /> {{ props.item.eyebrow || 'À LA UNE' }}</p>
        <h1>{{ props.item.title }}</h1>
        <div class="hero__meta">
          <span class="match">{{ props.item.match }} % pour vous</span>
          <span>{{ props.item.year }}</span>
          <span class="age-badge">{{ props.item.ageRating }}</span>
          <span>{{ Math.floor(props.item.duration / 60) }} h {{ props.item.duration % 60 }} min</span>
          <span class="quality-badge">{{ props.item.quality }}</span>
        </div>
        <p class="hero__synopsis">{{ props.item.synopsis }}</p>
        <div class="hero__actions">
          <NuxtLink v-if="playerEnabled" :to="`/watch/${props.item.slug}`" class="btn btn--primary btn--large"><AppIcon name="play" :size="20" /> Regarder</NuxtLink>
          <NuxtLink :to="`/movies/${props.item.slug}`" class="btn btn--glass btn--large"><AppIcon name="info" :size="20" /> Plus d’infos</NuxtLink>
          <button v-if="favoritesEnabled" class="btn-circle" :aria-label="isFavorite(props.item) ? 'Retirer des favoris' : 'Ajouter aux favoris'" @click="toggleFavorite(props.item)">
            <AppIcon :name="isFavorite(props.item) ? 'check' : 'plus'" :size="22" />
          </button>
        </div>
      </div>
    </div>
    <a href="#catalogue" class="hero__scroll"><span>Découvrir</span><AppIcon name="chevron-down" :size="18" /></a>
  </section>
</template>
