import type { CatalogFilters, CatalogResult, ContentItem, HomePayload, PlatformCollection } from '~/types/content'

/**
 * Contrat unique consommé par l'interface.
 * Votre API peut avoir n'importe quel format : normalisez ses réponses dans
 * ApiContentAdapter sans toucher aux composants Vue.
 */
export interface ContentAdapter {
  getHome(): Promise<HomePayload>
  getBySlug(slug: string): Promise<ContentItem | null>
  search(query: string, limit?: number): Promise<ContentItem[]>
  getCatalog(filters: CatalogFilters): Promise<CatalogResult>
  getTrending(): Promise<ContentItem[]>
  getPlatforms(): Promise<PlatformCollection[]>
}
