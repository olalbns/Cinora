<script setup lang="ts">
const service = useContentService()
const { data: home } = await useAsyncData('home', () => service.getHome())
const { history, hydrate } = useLibrary()
const visibleSections = computed(() => home.value?.sections.filter(section => section.id !== 'continue') || [])
onMounted(hydrate)
useSeoMeta({ title: 'Accueil', description: 'Découvrez des films et séries sélectionnés pour vous.' })
</script>

<template>
  <div v-if="home" class="home-page">
    <HeroBanner :item="home.hero" />
    <div id="catalogue" class="home-catalogue">
      <MediaRow v-if="history.length" title="Reprendre la lecture" subtitle="Retrouvez vos histoires là où vous les avez laissées" :items="history.map(entry => entry.item)" progress :progress-values="history.map(entry => entry.progress)" />
      <MediaRow v-for="section in visibleSections" :key="section.id" :title="section.title" :subtitle="section.subtitle" :items="section.items" :ranked="section.ranked" />
    </div>
    <section class="editorial container container--wide">
      <div class="editorial__image"><img src="/images/poster-astra.jpg" alt="Astra" loading="lazy" /></div>
      <div class="editorial__copy"><p class="eyebrow">NOTRE SÉLECTION</p><h2>Le cinéma dans toute<br><em>sa profondeur.</em></h2><p>Chaque semaine, notre équipe sélectionne des œuvres singulières : grands récits, nouveaux regards et histoires qui méritent votre temps.</p><NuxtLink to="/browse" class="text-link">Explorer la sélection <AppIcon name="arrow-right" :size="18" /></NuxtLink></div>
    </section>
  </div>
</template>
