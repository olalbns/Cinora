import type { CatalogFilters, CatalogResult, ContentItem, HomePayload, HomeSection, PlatformCollection, Season } from '~/types/content'
import type {
  ObservedApiResponse,
  ObservedDetailData,
  ObservedHomeData,
  ObservedOperatingItem,
  ObservedPlatformPlaylistData,
  ObservedSubject,
  ObservedSubjectListData
} from '~/types/observed-api'
import type { ApiEndpointSettings } from '~/types/site-settings'
import type { ContentAdapter } from './contracts'

const defaultEndpoints: ApiEndpointSettings = {
  home: '/home',
  search: '/subject/search',
  filter: '/subject/filter',
  trending: '/subject/trending',
  detail: '/detail',
  platformPlaylist: '/platform/play-list',
  playbackSession: '/playback/session'
}

/**
 * Adaptateur compatible avec le format relevé dans les artefacts d'analyse.
 * Il doit pointer uniquement vers votre propre backend autorisé.
 *
 * Base conseillée : https://api.votre-domaine.tld/wefeed-h5api-bff
 * Les chemins consommés restent alors /home, /subject/search, etc.
 */
export class ApiContentAdapter implements ContentAdapter {
  constructor(
    private readonly baseUrl: string,
    private readonly timeout = 10000,
    private readonly callerSource = 'node-frontend',
    private readonly endpoints: ApiEndpointSettings = defaultEndpoints
  ) {
    if (!baseUrl) throw new Error('NUXT_PUBLIC_API_BASE est requis en mode api')
    try {
      const hostname = new URL(baseUrl).hostname
      if (/(^|\.)(aoneroom\.com|123moviesfree\.club)$/i.test(hostname)) {
        throw new Error('Cette intégration accepte uniquement votre propre backend autorisé, pas les hôtes analysés.')
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('hôtes analysés')) throw error
      // Une base relative reste permise lorsqu'un reverse proxy local est utilisé.
    }
  }

  private async request<T>(path: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const response = await $fetch<ObservedApiResponse<T>>(path, {
      baseURL: this.baseUrl,
      timeout: this.timeout,
      credentials: 'include',
      ...options,
      headers: {
        Accept: 'application/json',
        callerSource: this.callerSource,
        ...options.headers
        // TODO AUTH : ajoutez Authorization si votre API n'utilise pas de cookie HttpOnly.
      }
    })
    return this.unwrap(response)
  }

  private unwrap<T>(response: ObservedApiResponse<T>): T {
    if (!response || typeof response.code !== 'number') {
      throw new Error('Réponse API incompatible : enveloppe { code, message, data } attendue')
    }
    if (response.code !== 0) throw new Error(response.message || `Erreur API ${response.code}`)
    return response.data
  }

  private imageUrl(subject: ObservedSubject, preferBackdrop = false): string {
    if (preferBackdrop) return subject.stills?.url || subject.trailer?.cover?.url || subject.cover?.url || '/images/hero-eclipse.jpg'
    return subject.cover?.url || subject.cover?.thumbnail || '/images/poster-signal.jpg'
  }

  private genres(subject: ObservedSubject): string[] {
    return subject.genre.split(',').map(value => value.trim()).filter(Boolean)
  }

  private buildSeasons(subject: ObservedSubject, detail?: ObservedDetailData): Season[] | undefined {
    if (subject.subjectType !== 2) return undefined
    const source = detail?.resource?.seasons || []
    if (!source.length) return undefined
    return source.map((value, seasonIndex) => {
      const seasonNumber = value.se > 0 ? value.se : seasonIndex + 1
      const episodeCount = Math.min(Math.max(value.maxEp || 1, 1), 60)
      return {
        number: seasonNumber,
        title: `Saison ${seasonNumber}`,
        episodes: Array.from({ length: episodeCount }, (_, index) => ({
          id: `${subject.subjectId}-s${seasonNumber}-e${index + 1}`,
          number: index + 1,
          title: `Épisode ${index + 1}`,
          synopsis: subject.description,
          duration: subject.duration > 0 ? Math.max(1, Math.round(subject.duration / 60)) : 45,
          thumbnail: this.imageUrl(subject, true)
        }))
      }
    })
  }

  private normalizeSubject(subject: ObservedSubject, detail?: ObservedDetailData, platform?: string): ContentItem {
    const rating = Number.parseFloat(subject.imdbRatingValue) || 0
    const year = Number.parseInt(subject.releaseDate?.slice(0, 4), 10) || new Date().getFullYear()
    const resolutions = detail?.resource?.seasons.flatMap(season => season.resolutions.map(item => item.resolution)) || []
    const maxResolution = resolutions.length ? Math.max(...resolutions) : 0
    const stars = detail?.stars?.length ? detail.stars : subject.staffList
    const dubLanguages = subject.dubs?.map(dub => dub.lanName).filter(Boolean) || []
    const subtitleLanguages = subject.subtitles?.split(',').map(value => value.trim()).filter(Boolean) || []
    const audio = dubLanguages.length ? dubLanguages : subtitleLanguages

    return {
      id: subject.subjectId,
      slug: subject.detailPath,
      title: subject.title,
      synopsis: subject.description,
      year,
      rating,
      match: Math.min(99, Math.max(70, Math.round(80 + rating * 2))),
      duration: subject.duration > 0 ? Math.max(1, Math.round(subject.duration / 60)) : 45,
      ageRating: subject.corner || '13+',
      genres: this.genres(subject),
      type: subject.subjectType === 2 ? 'series' : 'movie',
      image: this.imageUrl(subject),
      backdrop: detail?.metadata?.image || this.imageUrl(subject, true),
      quality: maxResolution >= 2160 ? '4K' : 'HD',
      isNew: year >= new Date().getFullYear() - 1,
      platform: platform || detail?.resource?.uploadBy || subject.countryName || 'Catalogue',
      cast: stars.map(star => star.name).filter(Boolean).slice(0, 12),
      director: 'Non renseigné',
      audio: audio.length ? [...new Set(audio)] : ['Version originale'],
      seasons: this.buildSeasons(subject, detail)
    }
  }

  private subjectsForOperation(operation: ObservedOperatingItem): ObservedSubject[] {
    if (operation.subjects?.length) return operation.subjects
    return (operation.customData?.items || [])
      .map(item => item.subject)
      .filter((subject): subject is ObservedSubject => Boolean(subject))
  }

  private normalizeHome(data: ObservedHomeData): HomePayload {
    const bannerSubject = data.operatingList
      .find(operation => operation.type === 'BANNER')
      ?.banner?.items.find(item => item.subject)?.subject

    const sections: HomeSection[] = data.operatingList
      .map((operation, index) => {
        const subjects = this.subjectsForOperation(operation)
        return {
          id: operation.opId || `operation-${index}`,
          title: operation.title,
          items: subjects.map(subject => this.normalizeSubject(subject, undefined, operation.title)),
          ranked: operation.title.toLocaleLowerCase().includes('top')
        }
      })
      .filter(section => section.items.length > 0)

    const heroSubject = bannerSubject || data.operatingList.flatMap(item => this.subjectsForOperation(item))[0]
    if (!heroSubject) throw new Error('Réponse /home incompatible : aucun subject dans operatingList/banner')
    return { hero: this.normalizeSubject(heroSubject), sections }
  }

  async getHome(): Promise<HomePayload> {
    return this.normalizeHome(await this.request<ObservedHomeData>(this.endpoints.home))
  }

  async getBySlug(slug: string): Promise<ContentItem | null> {
    const detail = await this.request<ObservedDetailData>(this.endpoints.detail, { query: { detailPath: slug } })
    return detail?.subject ? this.normalizeSubject(detail.subject, detail) : null
  }

  async search(query: string, limit = 20): Promise<ContentItem[]> {
    const data = await this.request<ObservedSubjectListData>(this.endpoints.search, {
      method: 'POST',
      body: { keyword: query, page: 1, perPage: limit, subjectType: 0 }
    })
    return data.subjectList.map(subject => this.normalizeSubject(subject))
  }

  async getCatalog(filters: CatalogFilters): Promise<CatalogResult> {
    const page = filters.page || 1
    const perPage = filters.perPage || 24
    const data = await this.request<ObservedSubjectListData>(this.endpoints.filter, {
      method: 'POST',
      body: {
        keyword: filters.query || '',
        page,
        perPage,
        subjectType: filters.type === 'movie' ? 1 : filters.type === 'series' ? 2 : 0,
        genre: filters.genre === 'Tous' ? '' : filters.genre || '',
        year: filters.year === 'Toutes' ? '' : filters.year || '',
        sort: filters.sort || 'popular'
      }
    })
    return {
      items: data.subjectList.map(subject => this.normalizeSubject(subject)),
      total: data.pager.totalCount,
      page: Number(data.pager.page) || page,
      perPage: data.pager.perPage || perPage
    }
  }

  async getTrending(): Promise<ContentItem[]> {
    const data = await this.request<ObservedSubjectListData>(this.endpoints.trending, {
      query: { page: 1, perPage: 20 }
    })
    return data.subjectList.map((subject, index) => ({
      ...this.normalizeSubject(subject),
      trendingRank: index + 1
    }))
  }

  async getPlatforms(): Promise<PlatformCollection[]> {
    const home = await this.request<ObservedHomeData>(this.endpoints.home)
    const platformNames = home.platformList.slice(0, 6)
    const playlists = await Promise.all(platformNames.map(platform =>
      this.request<ObservedPlatformPlaylistData>(this.endpoints.platformPlaylist, {
        query: { page: 1, perPage: 24, platform: platform.name }
      }).catch(() => null)
    ))

    return platformNames.map((platform, index) => {
      const playlist = playlists[index]
      const unique = new Map<string, ObservedSubject>()
      playlist?.monthList.forEach(month => month.subjects.forEach(subject => unique.set(subject.subjectId, subject)))
      return {
        id: platform.name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: platform.name,
        description: `Les nouveautés et sélections ${platform.name}.`,
        color: ['#e5092b', '#376bff', '#e5a833', '#8d5cff', '#19a974', '#d85b26'][index % 6]!,
        itemCount: playlist?.pager.totalCount || unique.size,
        items: [...unique.values()].map(subject => this.normalizeSubject(subject, undefined, platform.name))
      }
    })
  }
}
