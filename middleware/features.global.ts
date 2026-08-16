import type { PublicSiteSettings } from '~/types/site-settings'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/admin')) return
  const routes: Array<[string, keyof PublicSiteSettings['features']]> = [
    ['/search', 'search'],
    ['/favorites', 'favorites'],
    ['/history', 'history'],
    ['/trending', 'trending'],
    ['/platforms', 'collections'],
    ['/watch', 'player']
  ]
  const match = routes.find(([path]) => to.path === path || to.path.startsWith(`${path}/`))
  if (!match) return

  const state = usePublicSiteSettings()
  if (!state.value) {
    try { state.value = await useRequestFetch()<PublicSiteSettings>('/api/site-config') }
    catch { return }
  }
  if (!state.value.features[match[1]]) return navigateTo('/?fonction-indisponible=1')
  if (match[1] === 'player' && (state.value.apiMode === 'mock' || !state.value.mediaConfigured)) return navigateTo('/?lecteur-non-configure=1')
})
