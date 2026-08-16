<script setup lang="ts">
import type { ContentItem } from '~/types/content'
const props = withDefaults(defineProps<{ item: ContentItem; rank?: number; progress?: number; compact?: boolean }>(), { rank: 0, progress: 0, compact: false })
const { isFavorite, toggleFavorite } = useLibrary()
const managed = usePublicSiteSettings()
const playerEnabled = computed(() => Boolean(managed.value?.features.player && managed.value?.apiMode !== 'mock' && managed.value?.mediaConfigured))
const favoritesEnabled = computed(() => managed.value?.features.favorites ?? true)
</script>

<template>
  <article class="movie-card" :class="{ 'movie-card--ranked': props.rank > 0, 'movie-card--compact': props.compact }">
    <span v-if="props.rank" class="movie-card__rank">{{ props.rank }}</span>
    <NuxtLink :to="`/movies/${props.item.slug}`" class="movie-card__link" :aria-label="`Voir ${props.item.title}`">
      <div class="movie-card__poster">
        <img :src="props.item.image" :alt="`Affiche de ${props.item.title}`" loading="lazy" />
        <div class="movie-card__shade" />
        <div class="movie-card__badges">
          <span v-if="props.item.isNew" class="new-badge">NOUVEAU</span>
          <span class="quality-badge">{{ props.item.quality }}</span>
        </div>
        <div class="movie-card__hover">
          <span class="card-play"><AppIcon :name="playerEnabled ? 'play' : 'info'" :size="18" /></span>
          <div class="movie-card__hover-actions">
            <button v-if="favoritesEnabled" :aria-label="isFavorite(props.item) ? 'Retirer de ma liste' : 'Ajouter à ma liste'" @click.prevent.stop="toggleFavorite(props.item)">
              <AppIcon :name="isFavorite(props.item) ? 'heart-filled' : 'heart'" :size="18" />
            </button>
            <span><AppIcon name="info" :size="18" /></span>
          </div>
        </div>
        <div v-if="props.progress" class="movie-card__progress"><span :style="{ width: `${props.progress}%` }" /></div>
      </div>
      <div class="movie-card__copy">
        <h3>{{ props.item.title }}</h3>
        <div><span class="match">{{ props.item.match }} %</span><span>{{ props.item.year }}</span><span>{{ props.item.type === 'series' ? 'Série' : 'Film' }}</span></div>
      </div>
    </NuxtLink>
  </article>
</template>
