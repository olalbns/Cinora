<script setup lang="ts">
import type { ContentItem } from '~/types/content'
const route = useRoute()
const router = useRouter()
const service = useContentService()
const query = ref(String(route.query.q || ''))
const results = ref<ContentItem[]>([])
const searching = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function runSearch(value: string) {
  if (value.trim().length < 2) { results.value = []; return }
  searching.value = true
  results.value = await service.search(value, 30)
  searching.value = false
  router.replace({ query: { q: value } })
}
watch(query, value => { clearTimeout(timer); timer = setTimeout(() => runSearch(value), 250) })
onMounted(() => runSearch(query.value))
useSeoMeta({ title: 'Recherche' })
</script>

<template>
  <div class="search-page page-top container container--wide">
    <p class="eyebrow">RECHERCHE</p><h1>Que voulez-vous regarder ?</h1>
    <div class="search-page__field"><AppIcon name="search" :size="25" /><input v-model="query" autofocus type="search" placeholder="Titre, artiste, réalisateur ou genre" /><span v-if="searching" class="spinner" /><button v-else-if="query" @click="query = ''"><AppIcon name="close" /></button></div>
    <div v-if="query.length >= 2" class="search-summary"><p>Résultats pour <strong>“{{ query }}”</strong></p><span>{{ results.length }} résultat{{ results.length > 1 ? 's' : '' }}</span></div>
    <div v-if="results.length" class="catalog-grid catalog-grid--wide"><MovieCard v-for="item in results" :key="item.id" :item="item" /></div>
    <EmptyState v-else-if="query.length >= 2 && !searching" icon="search" title="Aucun résultat" text="Essayez avec un titre plus court, un genre ou le nom d’une personne." action="Explorer autrement" to="/browse" />
    <div v-else-if="query.length < 2" class="search-discover"><span>Suggestions</span><div><button v-for="word in ['Science-fiction', 'Drame', 'Nouveautés', 'Mystère', 'Séries']" :key="word" @click="query = word">{{ word }} <AppIcon name="arrow-right" :size="16" /></button></div></div>
  </div>
</template>
