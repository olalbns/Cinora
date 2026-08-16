<script setup lang="ts">
const route = useRoute()
const service = useContentService()
const { isFavorite, toggleFavorite } = useLibrary()
const managed = usePublicSiteSettings()
const playerEnabled = computed(() => Boolean(managed.value?.features.player && managed.value?.apiMode !== 'mock' && managed.value?.mediaConfigured))
const favoritesEnabled = computed(() => managed.value?.features.favorites ?? true)
const { data: item } = await useAsyncData(`detail-${route.params.slug}`, () => service.getBySlug(String(route.params.slug)))
if (!item.value) throw createError({ statusCode: 404, statusMessage: 'Titre introuvable' })
const { data: related } = await useAsyncData(`related-${route.params.slug}`, () => service.getCatalog({ genre: item.value!.genres[0], perPage: 8 }))
const selectedSeason = ref(item.value.seasons?.[0]?.number || 1)
const season = computed(() => item.value?.seasons?.find(value => value.number === selectedSeason.value))
const relatedItems = computed(() => related.value?.items.filter(value => value.id !== item.value?.id) || [])
const { user } = useAuth()
const comments = ref<any[]>([]), commentText = ref(''), commentRating = ref(8), commentSending = ref(false)
async function loadComments(){if(managed.value?.apiMode==='database')comments.value=(await $fetch<any>(`/api/comments/${item.value!.id}`)).items}
async function sendComment(){if(!user.value)return navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`);if(!commentText.value.trim())return;commentSending.value=true;try{await $fetch(`/api/comments/${item.value!.id}`,{method:'POST',body:{content:commentText.value,rating:commentRating.value}});commentText.value='';await loadComments()}finally{commentSending.value=false}}
onMounted(loadComments)
useSeoMeta({ title: item.value.title, description: item.value.synopsis, ogImage: item.value.backdrop })
</script>

<template>
  <div v-if="item" class="detail-page">
    <section class="detail-hero" :style="{ '--detail-bg': `url(${item.backdrop})` }">
      <div class="detail-hero__backdrop" /><div class="detail-hero__gradient" />
      <div class="detail-hero__content container container--wide">
        <p class="eyebrow">{{ item.platform }}</p><h1>{{ item.title }}</h1>
        <div class="hero__meta"><span class="match">{{ item.match }} % pour vous</span><span>{{ item.year }}</span><span class="age-badge">{{ item.ageRating }}</span><span>{{ item.type === 'series' ? `${item.seasons?.length || 1} saisons` : `${Math.floor(item.duration / 60)} h ${item.duration % 60} min` }}</span><span class="quality-badge">{{ item.quality }}</span></div>
        <p class="detail-hero__synopsis">{{ item.synopsis }}</p>
        <div class="hero__actions"><NuxtLink v-if="playerEnabled" :to="`/watch/${item.slug}`" class="btn btn--primary btn--large"><AppIcon name="play" /> {{ item.type === 'series' ? 'Voir S1:E1' : 'Regarder' }}</NuxtLink><button v-if="favoritesEnabled" class="btn btn--glass btn--large" @click="toggleFavorite(item)"><AppIcon :name="isFavorite(item) ? 'check' : 'plus'" /> {{ isFavorite(item) ? 'Dans ma liste' : 'Ma liste' }}</button></div>
      </div>
    </section>

    <section class="detail-info container container--wide">
      <div class="detail-info__main"><p>{{ item.synopsis }}</p><div class="detail-tags"><NuxtLink v-for="genre in item.genres" :key="genre" :to="`/browse?genre=${genre}`">{{ genre }}</NuxtLink></div></div>
      <dl class="detail-facts"><div><dt>Distribution</dt><dd>{{ item.cast.join(', ') }}</dd></div><div><dt>Réalisation</dt><dd>{{ item.director }}</dd></div><div><dt>Audio</dt><dd>{{ item.audio.join(', ') }}</dd></div></dl>
    </section>

    <section v-if="playerEnabled && item.type === 'series' && item.seasons" class="episodes container container--wide">
      <div class="section-heading"><div><p class="eyebrow">ÉPISODES</p><h2>{{ item.title }}</h2></div><div class="select-wrap"><select v-model="selectedSeason"><option v-for="value in item.seasons" :key="value.number" :value="value.number">Saison {{ value.number }}</option></select><AppIcon name="chevron-down" :size="16" /></div></div>
      <div class="episode-list"><NuxtLink v-for="episode in season?.episodes" :key="episode.id" :to="`/watch/${item.slug}?season=${selectedSeason}&episode=${episode.number}`" class="episode"><span class="episode__number">{{ String(episode.number).padStart(2, '0') }}</span><div class="episode__thumb"><img :src="episode.thumbnail" :alt="episode.title"/><span><AppIcon name="play" /></span></div><div class="episode__copy"><div><h3>{{ episode.title }}</h3><span>{{ episode.duration }} min</span></div><p>{{ episode.synopsis }}</p></div></NuxtLink></div>
    </section>

    <section v-if="managed?.apiMode === 'database'" class="comments-section container container--wide"><div class="section-heading"><div><p class="eyebrow">COMMUNAUTÉ</p><h2>Avis et commentaires</h2></div><span>{{ comments.length }} contribution{{ comments.length>1?'s':'' }}</span></div><form class="comment-form" @submit.prevent="sendComment"><textarea v-model="commentText" maxlength="2000" placeholder="Partagez votre avis…"/><label>Note <select v-model.number="commentRating"><option v-for="n in 10" :key="n" :value="n">{{ n }}/10</option></select></label><button class="btn btn--primary" :disabled="commentSending||!commentText.trim()">{{ commentSending?'Publication…':'Publier' }}</button></form><div class="comment-list"><article v-for="comment in comments" :key="comment.id"><div><strong>{{ comment.user.displayName }}</strong><span>{{ comment.rating?`${comment.rating}/10`:'' }} · {{ new Date(comment.createdAt).toLocaleDateString() }}</span></div><p>{{ comment.content }}</p></article></div></section>
    <MediaRow v-if="relatedItems.length" title="Vous aimerez aussi" :items="relatedItems" />
  </div>
</template>
