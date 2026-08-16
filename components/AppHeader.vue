<script setup lang="ts">
import type { ContentItem } from '~/types/content'

const app = useAppConfig()
const { t } = useI18n()
const { user } = useAuth()
const userInitials = computed(() => user.value?.displayName.split(/\s+/).map(value => value[0]).join('').slice(0,2).toUpperCase() || '')
const managed = usePublicSiteSettings()
const brand = computed(() => managed.value?.site || { ...app.brand, logoUrl: '' })
const features = computed(() => managed.value?.features || { search: true, favorites: true, history: true, trending: true, collections: true, player: true })
const navigation = computed(() => {
  const items = managed.value?.navigation || app.navigation.map((item, index) => ({ ...item, id: `fallback-${index}`, enabled: true }))
  return items.filter(item => {
    if (item.to.startsWith('/trending')) return features.value.trending
    if (item.to.startsWith('/platforms')) return features.value.collections
    if (item.to.startsWith('/search')) return features.value.search
    if (item.to.startsWith('/favorites')) return features.value.favorites
    if (item.to.startsWith('/history')) return features.value.history
    return true
  })
})
const route = useRoute()
const service = useContentService()
const searchOpen = ref(false)
const mobileOpen = ref(false)
const query = ref('')
const results = ref<ContentItem[]>([])
const searching = ref(false)
const scrolled = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

watch(query, value => {
  clearTimeout(timer)
  if (value.trim().length < 2) {
    results.value = []
    searching.value = false
    return
  }
  searching.value = true
  timer = setTimeout(async () => {
    results.value = await service.search(value, 6)
    searching.value = false
  }, 220)
})

watch(() => route.fullPath, () => {
  searchOpen.value = false
  mobileOpen.value = false
})

function navLabel(item: { id?: string; label: string }) {
  const key = item.id?.replace(/^fallback-\d+$/, '')
  return key && ['home','movies','series','trending','collections'].includes(key) ? t(`nav.${key}`) : item.label
}

function openSearch() {
  if (!features.value.search) return
  searchOpen.value = true
  nextTick(() => document.querySelector<HTMLInputElement>('#global-search')?.focus())
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') searchOpen.value = false
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    openSearch()
  }
}

function onScroll() { scrolled.value = window.scrollY > 24 }

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header class="header" :class="{ 'header--solid': scrolled || route.path !== '/', 'header--menu': mobileOpen }">
    <div class="header__inner container container--wide">
      <button class="header__mobile-toggle icon-btn" aria-label="Ouvrir le menu" @click="mobileOpen = !mobileOpen">
        <AppIcon :name="mobileOpen ? 'close' : 'menu'" :size="22" />
      </button>

      <NuxtLink to="/" class="brand" aria-label="Accueil CINORA">
        <img v-if="brand.logoUrl" class="brand__logo" :src="brand.logoUrl" :alt="brand.name">
        <span v-else class="brand__mark">{{ brand.shortName }}</span>
        <span class="brand__name">{{ brand.name }}</span>
      </NuxtLink>

      <nav class="header__nav" aria-label="Navigation principale">
        <NuxtLink v-for="item in navigation" :key="item.to" :to="item.to" class="nav-link" :class="{ 'nav-link--active': route.path === item.to.split('?')[0] }">
          {{ navLabel(item) }}
        </NuxtLink>
      </nav>

      <div class="header__actions">
        <button v-if="features.search" class="search-trigger" aria-label="Rechercher" @click="openSearch">
          <AppIcon name="search" :size="19" />
          <span>{{ t('common.search') }}</span>
          <kbd>⌘ K</kbd>
        </button>
        <NuxtLink v-if="features.favorites" to="/favorites" class="icon-btn desktop-only" aria-label="Mes favoris"><AppIcon name="heart" /></NuxtLink>
        <NuxtLink :to="user ? '/profile' : '/login'" class="avatar" :aria-label="user ? t('common.profile') : 'Connexion'">{{ user ? userInitials : '··' }}</NuxtLink>
      </div>
    </div>

    <Transition name="mobile-menu">
      <nav v-if="mobileOpen" class="mobile-menu" aria-label="Menu mobile">
        <NuxtLink v-for="item in navigation" :key="item.to" :to="item.to">{{ navLabel(item) }} <AppIcon name="chevron-right" :size="18" /></NuxtLink>
        <NuxtLink v-if="features.favorites" to="/favorites">Ma liste <AppIcon name="chevron-right" :size="18" /></NuxtLink>
        <NuxtLink v-if="features.history" to="/history">Historique <AppIcon name="chevron-right" :size="18" /></NuxtLink>
      </nav>
    </Transition>
  </header>

  <Teleport to="body">
    <Transition name="search-modal">
      <div v-if="searchOpen" class="search-modal" role="dialog" aria-modal="true" aria-label="Recherche globale">
        <button class="search-modal__backdrop" aria-label="Fermer" @click="searchOpen = false" />
        <div class="search-panel">
          <div class="search-panel__field">
            <AppIcon name="search" :size="24" />
            <input id="global-search" v-model="query" type="search" autocomplete="off" :placeholder="t('search.placeholder')" @keyup.enter="query.trim() && navigateTo(`/search?q=${encodeURIComponent(query)}`)" />
            <span v-if="searching" class="spinner" />
            <button v-else-if="query" aria-label="Effacer" @click="query = ''"><AppIcon name="close" /></button>
            <button v-else class="esc-key" @click="searchOpen = false">ESC</button>
          </div>

          <div class="search-panel__content">
            <p v-if="query.length < 2" class="search-hint">Commencez à écrire pour explorer le catalogue.</p>
            <template v-else-if="results.length">
              <div class="search-panel__heading"><span>Suggestions</span><NuxtLink :to="`/search?q=${encodeURIComponent(query)}`">Tout afficher</NuxtLink></div>
              <NuxtLink v-for="item in results" :key="item.id" :to="`/movies/${item.slug}`" class="search-result">
                <img :src="item.image" :alt="item.title" />
                <div><strong>{{ item.title }}</strong><span>{{ item.year }} · {{ item.type === 'series' ? 'Série' : 'Film' }} · {{ item.genres.slice(0, 2).join(', ') }}</span></div>
                <AppIcon name="chevron-right" :size="18" />
              </NuxtLink>
            </template>
            <div v-else-if="!searching" class="search-empty"><span>“{{ query }}”</span><p>Aucun résultat. Essayez un autre titre ou genre.</p></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
