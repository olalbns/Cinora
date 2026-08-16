<script setup lang="ts">
import { genres } from '~/data/mock'
import type { CatalogFilters, ContentType } from '~/types/content'
const service = useContentService()
const route = useRoute()
const router = useRouter()
const mobileFilters = ref(false)

const type = ref<ContentType | 'all'>((route.query.type as ContentType) || 'all')
const genre = ref(String(route.query.genre || 'Tous'))
const year = ref(String(route.query.year || 'Toutes'))
const sort = ref<CatalogFilters['sort']>((route.query.sort as CatalogFilters['sort']) || 'popular')
const minRating = ref(Number(route.query.rating || 0))
const currentPage = ref(Math.max(1, Number(route.query.page || 1)))

const filters = computed<CatalogFilters>(() => ({ type: type.value, genre: genre.value, year: year.value, sort: sort.value, minRating: minRating.value, page: currentPage.value, perPage: 20 }))
const { data: catalog, status } = await useAsyncData('catalog', () => service.getCatalog(filters.value), { watch: [filters] })
const totalPages = computed(() => Math.max(1, Math.ceil((catalog.value?.total || 0) / (catalog.value?.perPage || 20))))

watch(filters, value => router.replace({ query: {
  ...(value.type !== 'all' ? { type: value.type } : {}),
  ...(value.genre !== 'Tous' ? { genre: value.genre } : {}),
  ...(value.year !== 'Toutes' ? { year: value.year } : {}),
  ...(value.sort !== 'popular' ? { sort: value.sort } : {}),
  ...(value.minRating ? { rating: value.minRating } : {}),
  ...(value.page && value.page > 1 ? { page: value.page } : {})
} }), { deep: true })
watch([type, genre, year, sort, minRating], () => { currentPage.value = 1 })

function reset() { type.value = 'all'; genre.value = 'Tous'; year.value = 'Toutes'; sort.value = 'popular'; minRating.value = 0; currentPage.value = 1 }
function changePage(delta: number) { currentPage.value = Math.min(totalPages.value, Math.max(1, currentPage.value + delta)); if (import.meta.client) window.scrollTo({ top: 300, behavior: 'smooth' }) }
useSeoMeta({ title: 'Explorer', description: 'Parcourez tout le catalogue CINORA.' })
</script>

<template>
  <div class="listing-page page-top">
    <header class="listing-hero container container--wide"><p class="eyebrow">LE CATALOGUE</p><h1>Votre prochaine<br><em>obsession.</em></h1><p>Des histoires choisies avec soin, pour chaque humeur et chaque moment.</p></header>
    <div class="catalog-layout container container--wide">
      <button class="filter-mobile-btn btn btn--outline" @click="mobileFilters = !mobileFilters"><AppIcon name="filter" /> Filtres <span>{{ catalog?.total || 0 }}</span></button>
      <aside class="filters" :class="{ 'filters--open': mobileFilters }">
        <div class="filters__top"><h2>Filtres</h2><button @click="reset">Réinitialiser</button></div>
        <div class="filter-group"><label>Format</label><div class="segmented"><button :class="{ active: type === 'all' }" @click="type = 'all'">Tout</button><button :class="{ active: type === 'movie' }" @click="type = 'movie'">Films</button><button :class="{ active: type === 'series' }" @click="type = 'series'">Séries</button></div></div>
        <div class="filter-group"><label for="genre">Genre</label><div class="select-wrap"><select id="genre" v-model="genre"><option v-for="item in genres" :key="item">{{ item }}</option></select><AppIcon name="chevron-down" :size="16" /></div></div>
        <div class="filter-group"><label for="year">Année</label><div class="select-wrap"><select id="year" v-model="year"><option>Toutes</option><option v-for="item in [2026, 2025, 2024, 2023, 2022, 2021]" :key="item">{{ item }}</option></select><AppIcon name="chevron-down" :size="16" /></div></div>
        <div class="filter-group"><label>Note minimale</label><div class="rating-filter"><button v-for="rating in [0, 7, 8, 9]" :key="rating" :class="{ active: minRating === rating }" @click="minRating = rating"><AppIcon v-if="rating" name="star" :size="13" />{{ rating || 'Toutes' }}<span v-if="rating">+</span></button></div></div>
      </aside>
      <section class="catalog-results">
        <div class="catalog-toolbar"><p><strong>{{ catalog?.total || 0 }}</strong> titres</p><div class="select-wrap sort-select"><select v-model="sort"><option value="popular">Les plus populaires</option><option value="recent">Les plus récents</option><option value="rating">Les mieux notés</option><option value="title">A — Z</option></select><AppIcon name="chevron-down" :size="16" /></div></div>
        <div v-if="status === 'pending'" class="catalog-grid"><div v-for="n in 8" :key="n" class="poster-skeleton" /></div>
        <template v-else-if="catalog?.items.length"><div class="catalog-grid"><MovieCard v-for="item in catalog.items" :key="item.id" :item="item" /></div><nav v-if="totalPages > 1" class="pagination" aria-label="Pagination"><button :disabled="currentPage === 1" @click="changePage(-1)"><AppIcon name="chevron-left"/>Précédent</button><span>Page {{ currentPage }} sur {{ totalPages }}</span><button :disabled="currentPage === totalPages" @click="changePage(1)">Suivant<AppIcon name="chevron-right"/></button></nav></template>
        <EmptyState v-else title="Aucun titre ne correspond" text="Élargissez vos critères pour retrouver plus d’histoires." action="Effacer les filtres" to="/browse" />
      </section>
    </div>
  </div>
</template>
