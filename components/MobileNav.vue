<script setup lang="ts">
const route = useRoute()
const managed = usePublicSiteSettings()
const features = computed(() => managed.value?.features || { search: true, favorites: true })
</script>
<template>
  <nav class="mobile-nav" aria-label="Navigation mobile">
    <NuxtLink to="/" :class="{ active: route.path === '/' }"><AppIcon name="home" /><span>Accueil</span></NuxtLink>
    <NuxtLink to="/browse" :class="{ active: route.path === '/browse' }"><AppIcon name="compass" /><span>Explorer</span></NuxtLink>
    <NuxtLink v-if="features.search" to="/search" :class="{ active: route.path === '/search' }"><AppIcon name="search" /><span>Recherche</span></NuxtLink>
    <NuxtLink v-if="features.favorites" to="/favorites" :class="{ active: route.path === '/favorites' }"><AppIcon name="heart" /><span>Ma liste</span></NuxtLink>
  </nav>
</template>
