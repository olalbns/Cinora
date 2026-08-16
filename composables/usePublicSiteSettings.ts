import type { PublicSiteSettings } from '~/types/site-settings'

export function usePublicSiteSettings() {
  return useState<PublicSiteSettings | null>('public-site-settings', () => null)
}
