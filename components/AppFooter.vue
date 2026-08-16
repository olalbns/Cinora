<script setup lang="ts">
const app = useAppConfig()
const managed = usePublicSiteSettings()
const { t, locale, locales, setLocale } = useI18n()
const brand = computed(() => managed.value?.site || { ...app.brand, logoUrl: '' })
const features = computed(() => managed.value?.features || { favorites: true, history: true, trending: true, collections: true })
function changeLocale(event: Event) { setLocale((event.target as HTMLSelectElement).value as any) }
</script>
<template>
  <footer class="footer">
    <div class="container container--wide footer__inner">
      <div class="footer__brand"><NuxtLink to="/" class="brand"><img v-if="brand.logoUrl" class="brand__logo" :src="brand.logoUrl" :alt="brand.name"><span v-else class="brand__mark">{{ brand.shortName }}</span><span class="brand__name">{{ brand.name }}</span></NuxtLink><p>{{ brand.tagline }}</p></div>
      <div class="footer__links"><strong>{{ t('footer.discover') }}</strong><NuxtLink to="/browse">{{ t('common.explore') }}</NuxtLink><NuxtLink v-if="features.trending" to="/trending">{{ t('nav.trending') }}</NuxtLink><NuxtLink v-if="features.collections" to="/platforms">{{ t('nav.collections') }}</NuxtLink></div>
      <div class="footer__links"><strong>{{ t('footer.account') }}</strong><NuxtLink v-if="features.favorites" to="/favorites">{{ t('common.favorites') }}</NuxtLink><NuxtLink v-if="features.history" to="/history">{{ t('common.history') }}</NuxtLink><NuxtLink to="/profile">{{ t('common.profile') }}</NuxtLink></div>
      <div class="footer__links"><strong>{{ t('footer.about') }}</strong><NuxtLink to="/help">{{ t('footer.help') }}</NuxtLink><NuxtLink to="/privacy">{{ t('footer.privacy') }}</NuxtLink><NuxtLink to="/terms">{{ t('footer.terms') }}</NuxtLink></div>
    </div>
    <div class="container container--wide footer__bottom"><span>© {{ new Date().getFullYear() }} {{ brand.name }}.</span><label class="footer-language"><select :value="locale" aria-label="Language" @change="changeLocale"><option v-for="item in locales" :key="item.code" :value="item.code">{{ item.name }}</option></select><AppIcon name="chevron-down" :size="14" /></label></div>
  </footer>
</template>
