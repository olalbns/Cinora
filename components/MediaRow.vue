<script setup lang="ts">
import type { ContentItem } from '~/types/content'
const props = withDefaults(defineProps<{ title: string; subtitle?: string; items: ContentItem[]; ranked?: boolean; progress?: boolean; progressValues?: number[] }>(), { subtitle: '', ranked: false, progress: false, progressValues: () => [] })
const track = ref<HTMLElement>()
const canLeft = ref(false)
const canRight = ref(true)

function updateScrollState() {
  if (!track.value) return
  canLeft.value = track.value.scrollLeft > 8
  canRight.value = track.value.scrollLeft + track.value.clientWidth < track.value.scrollWidth - 8
}
function scroll(direction: number) {
  if (!track.value) return
  track.value.scrollBy({ left: direction * track.value.clientWidth * .82, behavior: 'smooth' })
  setTimeout(updateScrollState, 400)
}
onMounted(updateScrollState)
</script>

<template>
  <section class="media-row" :class="{ 'media-row--ranked': props.ranked }">
    <div class="section-heading container container--wide">
      <div><h2>{{ props.title }}</h2><p v-if="props.subtitle">{{ props.subtitle }}</p></div>
      <NuxtLink to="/browse">Voir tout <AppIcon name="arrow-right" :size="16" /></NuxtLink>
    </div>
    <div class="media-row__wrap">
      <button v-show="canLeft" class="row-arrow row-arrow--left" aria-label="Faire défiler vers la gauche" @click="scroll(-1)"><AppIcon name="chevron-left" :size="28" /></button>
      <div ref="track" class="media-row__track container container--wide" @scroll.passive="updateScrollState">
        <MovieCard v-for="(item, index) in props.items" :key="`${props.title}-${item.id}`" :item="item" :rank="props.ranked ? index + 1 : 0" :progress="props.progress ? (props.progressValues[index] || 0) : 0" />
      </div>
      <button v-show="canRight" class="row-arrow row-arrow--right" aria-label="Faire défiler vers la droite" @click="scroll(1)"><AppIcon name="chevron-right" :size="28" /></button>
    </div>
  </section>
</template>
