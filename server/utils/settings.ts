import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { ApiEndpointSettings, PublicSiteSettings, SiteSettings } from '~/types/site-settings'

const SETTINGS_PATH = join(process.cwd(), 'storage', 'site-settings.json')

const defaultEndpoints: ApiEndpointSettings = {
  home: '/home',
  search: '/subject/search',
  filter: '/subject/filter',
  trending: '/subject/trending',
  detail: '/detail',
  platformPlaylist: '/platform/play-list',
  playbackSession: '/playback/session'
}

export function defaultSettings(): SiteSettings {
  const config = useRuntimeConfig()
  return {
    version: 1,
    site: {
      name: 'CINORA',
      shortName: 'C',
      tagline: 'Le cinéma vous appartient.',
      accent: '#e5092b',
      supportEmail: 'bonjour@cinora.example',
      logoUrl: ''
    },
    api: {
      mode: String(config.public.contentMode) === 'database' ? 'database' : String(config.public.contentMode) === 'api' ? 'api' : 'mock',
      publicBase: String(config.public.apiBase || ''),
      serverBase: String(config.apiServerBase || ''),
      playbackBase: String(config.playbackApiBase || ''),
      timeout: Number(config.public.apiTimeout || 10000),
      callerSource: String(config.public.apiCallerSource || 'node-frontend'),
      endpoints: defaultEndpoints
    },
    navigation: [
      { id: 'home', label: 'Accueil', to: '/', enabled: true },
      { id: 'movies', label: 'Films', to: '/browse?type=movie', enabled: true },
      { id: 'series', label: 'Séries', to: '/browse?type=series', enabled: true },
      { id: 'trending', label: 'Tendances', to: '/trending', enabled: true },
      { id: 'collections', label: 'Collections', to: '/platforms', enabled: true }
    ],
    features: { search: true, favorites: true, history: true, trending: true, collections: true, player: true },
    seo: {
      titleSuffix: 'CINORA',
      description: 'Une expérience cinéma, pensée pour vous.',
      indexable: false
    },
    updatedAt: new Date().toISOString()
  }
}

function mergeDefaults(input: Partial<SiteSettings>): SiteSettings {
  const base = defaultSettings()
  return {
    ...base,
    ...input,
    site: { ...base.site, ...(input.site || {}) },
    api: {
      ...base.api,
      ...(input.api || {}),
      endpoints: { ...base.api.endpoints, ...(input.api?.endpoints || {}) }
    },
    navigation: Array.isArray(input.navigation) ? input.navigation : base.navigation,
    features: { ...base.features, ...(input.features || {}) },
    seo: { ...base.seo, ...(input.seo || {}) }
  }
}

export async function readSettings(): Promise<SiteSettings> {
  try {
    const parsed = JSON.parse(await readFile(SETTINGS_PATH, 'utf8')) as Partial<SiteSettings>
    return mergeDefaults(parsed)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return defaultSettings()
    console.error('[settings] Lecture impossible, valeurs par défaut utilisées', error)
    return defaultSettings()
  }
}

function safeText(value: unknown, fallback: string, max = 180): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : fallback
}

function safeEndpoint(value: unknown, fallback: string): string {
  const path = safeText(value, fallback, 160)
  if (!path.startsWith('/') || path.includes('://') || path.includes('..')) return fallback
  return path
}

function validateBaseUrl(value: unknown, fallback = ''): string {
  const url = safeText(value, fallback, 500)
  if (!url) return ''
  let parsed: URL
  try { parsed = new URL(url) } catch { throw createError({ statusCode: 400, statusMessage: `URL invalide : ${url}` }) }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw createError({ statusCode: 400, statusMessage: 'Seuls HTTP et HTTPS sont autorisés' })
  if (/(^|\.)(aoneroom\.com|123moviesfree\.club)$/i.test(parsed.hostname)) {
    throw createError({ statusCode: 403, statusMessage: 'Les hôtes analysés ne peuvent pas être configurés' })
  }
  if (parsed.hostname === '169.254.169.254') throw createError({ statusCode: 403, statusMessage: 'Adresse de métadonnées interdite' })
  return url.replace(/\/$/, '')
}

export function sanitizeSettings(input: Partial<SiteSettings>, previous: SiteSettings): SiteSettings {
  const accent = safeText(input.site?.accent, previous.site.accent, 16)
  const endpoints = input.api?.endpoints || previous.api.endpoints
  const navigation = Array.isArray(input.navigation)
    ? input.navigation.slice(0, 10).map((item, index) => ({
        id: safeText(item.id, `nav-${index}`, 40).replace(/[^a-zA-Z0-9_-]/g, '-'),
        label: safeText(item.label, 'Lien', 40),
        to: safeEndpoint(item.to, '/'),
        enabled: Boolean(item.enabled)
      }))
    : previous.navigation

  return {
    version: 1,
    site: {
      name: safeText(input.site?.name, previous.site.name, 40),
      shortName: safeText(input.site?.shortName, previous.site.shortName, 3),
      tagline: safeText(input.site?.tagline, previous.site.tagline, 120),
      accent: /^#[0-9a-f]{6}$/i.test(accent) ? accent : previous.site.accent,
      supportEmail: safeText(input.site?.supportEmail, previous.site.supportEmail, 120),
      logoUrl: safeText(input.site?.logoUrl, previous.site.logoUrl, 500)
    },
    api: {
      mode: input.api?.mode === 'database' ? 'database' : input.api?.mode === 'api' ? 'api' : input.api?.mode === 'mock' ? 'mock' : previous.api.mode,
      publicBase: validateBaseUrl(input.api?.publicBase, previous.api.publicBase),
      serverBase: validateBaseUrl(input.api?.serverBase, previous.api.serverBase),
      playbackBase: validateBaseUrl(input.api?.playbackBase, previous.api.playbackBase),
      timeout: Math.min(60000, Math.max(1000, Number(input.api?.timeout || previous.api.timeout))),
      callerSource: safeText(input.api?.callerSource, previous.api.callerSource, 80),
      endpoints: {
        home: safeEndpoint(endpoints.home, previous.api.endpoints.home),
        search: safeEndpoint(endpoints.search, previous.api.endpoints.search),
        filter: safeEndpoint(endpoints.filter, previous.api.endpoints.filter),
        trending: safeEndpoint(endpoints.trending, previous.api.endpoints.trending),
        detail: safeEndpoint(endpoints.detail, previous.api.endpoints.detail),
        platformPlaylist: safeEndpoint(endpoints.platformPlaylist, previous.api.endpoints.platformPlaylist),
        playbackSession: safeEndpoint(endpoints.playbackSession, previous.api.endpoints.playbackSession)
      }
    },
    navigation,
    features: {
      search: input.features?.search ?? previous.features.search,
      favorites: input.features?.favorites ?? previous.features.favorites,
      history: input.features?.history ?? previous.features.history,
      trending: input.features?.trending ?? previous.features.trending,
      collections: input.features?.collections ?? previous.features.collections,
      player: input.features?.player ?? previous.features.player
    },
    seo: {
      titleSuffix: safeText(input.seo?.titleSuffix, previous.seo.titleSuffix, 60),
      description: safeText(input.seo?.description, previous.seo.description, 240),
      indexable: input.seo?.indexable ?? previous.seo.indexable
    },
    updatedAt: new Date().toISOString()
  }
}

export async function writeSettings(settings: SiteSettings): Promise<void> {
  await mkdir(dirname(SETTINGS_PATH), { recursive: true })
  const temporary = `${SETTINGS_PATH}.tmp`
  await writeFile(temporary, `${JSON.stringify(settings, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  await rename(temporary, SETTINGS_PATH)
}

export function publicSettings(settings: SiteSettings): PublicSiteSettings {
  return {
    site: settings.site,
    navigation: settings.navigation.filter(item => item.enabled),
    features: settings.features,
    seo: settings.seo,
    updatedAt: settings.updatedAt,
    apiMode: settings.api.mode,
    mediaConfigured: Boolean(settings.api.playbackBase || (settings.api.mode === 'api' && (settings.api.serverBase || settings.api.publicBase)))
  }
}
