<script setup lang="ts">
const managed = usePublicSiteSettings()
const { data } = await useFetch('/api/site-config', { key: 'public-site-config' })
if (data.value) managed.value = data.value

const accent = computed(() => managed.value?.site.accent || '#e5092b')
const suffix = computed(() => managed.value?.seo.titleSuffix || 'CINORA')
const route = useRoute()

useHead(() => ({
  titleTemplate: title => title ? `${title} · ${suffix.value}` : suffix.value,
  htmlAttrs: {
    // Un style inline sur <html> reste prioritaire sur les valeurs par défaut du bundle CSS.
    style: `--accent:${accent.value};--accent-hover:color-mix(in srgb, ${accent.value} 86%, white)`
  },
  meta: [
    { name: 'description', content: managed.value?.seo.description || 'Une expérience cinéma, pensée pour vous.' },
    { name: 'robots', content: managed.value?.seo.indexable ? 'index,follow' : 'noindex,nofollow' }
  ]
}))

let settingsChannel: BroadcastChannel | null = null
const applySettings = async (settings: typeof managed.value) => {
  if (!settings) return
  managed.value = settings
  if (!route.path.startsWith('/admin')) await refreshNuxtData()
}
const onSettingsStorage = (event: StorageEvent) => {
  if (event.key === 'cinora:settings-sync' && event.newValue) applySettings(JSON.parse(event.newValue))
}
onMounted(() => {
  settingsChannel = 'BroadcastChannel' in window ? new BroadcastChannel('cinora-settings') : null
  if (settingsChannel) settingsChannel.onmessage = event => applySettings(event.data)
  window.addEventListener('storage', onSettingsStorage)
})
onBeforeUnmount(() => {
  settingsChannel?.close()
  window.removeEventListener('storage', onSettingsStorage)
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
