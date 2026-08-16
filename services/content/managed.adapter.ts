import type { CatalogFilters, CatalogResult, ContentItem, HomePayload, PlatformCollection } from '~/types/content'
import type { ContentAdapter } from './contracts'

type Fetcher = <T>(request: string, options?: Record<string, unknown>) => Promise<T>

/**
 * Adaptateur utilisé par l'UI. Tous les appels passent par Nitro afin que les
 * URL privées et la configuration du dashboard ne soient jamais exposées.
 */
export class ManagedContentAdapter implements ContentAdapter {
  constructor(private readonly fetcher: Fetcher) {}

  getHome() { return this.fetcher<HomePayload>('/api/catalog/home') }
  getBySlug(slug: string) { return this.fetcher<ContentItem | null>('/api/catalog/detail', { query: { slug } }) }
  search(query: string, limit = 20) { return this.fetcher<ContentItem[]>('/api/catalog/search', { method: 'POST', body: { query, limit } }) }
  getCatalog(filters: CatalogFilters) { return this.fetcher<CatalogResult>('/api/catalog/filter', { method: 'POST', body: filters }) }
  getTrending() { return this.fetcher<ContentItem[]>('/api/catalog/trending') }
  getPlatforms() { return this.fetcher<PlatformCollection[]>('/api/catalog/platforms') }
}
