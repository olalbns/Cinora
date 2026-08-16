import { content, homePayload, platforms } from '~/data/mock'
import type { CatalogFilters, CatalogResult, ContentItem } from '~/types/content'
import type { ContentAdapter } from './contracts'

const wait = (ms = 90) => new Promise(resolve => setTimeout(resolve, ms))

export class MockContentAdapter implements ContentAdapter {
  async getHome() {
    await wait()
    return homePayload
  }

  async getBySlug(slug: string) {
    await wait()
    return content.find(item => item.slug === slug) || null
  }

  async search(query: string, limit = 20) {
    await wait(70)
    const needle = query.trim().toLocaleLowerCase('fr')
    if (!needle) return []
    return content.filter(item =>
      [item.title, item.synopsis, item.director, item.platform, ...item.genres, ...item.cast]
        .join(' ').toLocaleLowerCase('fr').includes(needle)
    ).slice(0, limit)
  }

  async getCatalog(filters: CatalogFilters): Promise<CatalogResult> {
    await wait()
    let items: ContentItem[] = [...content]
    if (filters.query) {
      const needle = filters.query.toLocaleLowerCase('fr')
      items = items.filter(item => `${item.title} ${item.synopsis} ${item.genres.join(' ')}`.toLocaleLowerCase('fr').includes(needle))
    }
    if (filters.type && filters.type !== 'all') items = items.filter(item => item.type === filters.type)
    if (filters.genre && filters.genre !== 'Tous') items = items.filter(item => item.genres.includes(filters.genre!))
    if (filters.year && filters.year !== 'Toutes') items = items.filter(item => String(item.year) === filters.year)
    if (filters.minRating) items = items.filter(item => item.rating >= filters.minRating!)

    const sort = filters.sort || 'popular'
    items.sort((a, b) => {
      if (sort === 'recent') return b.year - a.year
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'title') return a.title.localeCompare(b.title)
      return b.match - a.match
    })

    const page = filters.page || 1
    const perPage = filters.perPage || 24
    const total = items.length
    return { items: items.slice((page - 1) * perPage, page * perPage), total, page, perPage }
  }

  async getTrending() {
    await wait()
    return content.filter(item => item.trendingRank).sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99))
  }

  async getPlatforms() {
    await wait()
    return platforms
  }
}
