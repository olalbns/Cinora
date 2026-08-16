export interface ApiEndpointSettings {
  home: string
  search: string
  filter: string
  trending: string
  detail: string
  platformPlaylist: string
  playbackSession: string
}

export interface NavigationSetting {
  id: string
  label: string
  to: string
  enabled: boolean
}

export interface SiteSettings {
  version: 1
  site: {
    name: string
    shortName: string
    tagline: string
    accent: string
    supportEmail: string
    logoUrl: string
  }
  api: {
    mode: 'mock' | 'api' | 'database'
    publicBase: string
    serverBase: string
    playbackBase: string
    timeout: number
    callerSource: string
    endpoints: ApiEndpointSettings
  }
  navigation: NavigationSetting[]
  features: {
    search: boolean
    favorites: boolean
    history: boolean
    trending: boolean
    collections: boolean
    player: boolean
  }
  seo: {
    titleSuffix: string
    description: string
    indexable: boolean
  }
  updatedAt: string
}

export type PublicSiteSettings = Pick<SiteSettings, 'site' | 'navigation' | 'features' | 'seo' | 'updatedAt'> & {
  apiMode: 'mock' | 'api' | 'database'
  mediaConfigured: boolean
}
