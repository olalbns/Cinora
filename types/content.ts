export type ContentType = 'movie' | 'series'

export interface Episode {
  id: string
  number: number
  title: string
  synopsis: string
  duration: number
  thumbnail: string
}

export interface Season {
  number: number
  title: string
  episodes: Episode[]
}

export interface ContentItem {
  id: string
  slug: string
  title: string
  eyebrow?: string
  synopsis: string
  year: number
  rating: number
  match: number
  duration: number
  ageRating: string
  genres: string[]
  type: ContentType
  image: string
  backdrop: string
  logo?: string
  quality: 'HD' | '4K' | '4K HDR'
  isNew?: boolean
  trendingRank?: number
  platform: string
  cast: string[]
  director: string
  audio: string[]
  seasons?: Season[]
}

export interface HomeSection {
  id: string
  title: string
  subtitle?: string
  items: ContentItem[]
  ranked?: boolean
}

export interface HomePayload {
  hero: ContentItem
  sections: HomeSection[]
}

export interface CatalogFilters {
  query?: string
  type?: ContentType | 'all'
  genre?: string
  year?: string
  minRating?: number
  sort?: 'popular' | 'recent' | 'rating' | 'title'
  page?: number
  perPage?: number
}

export interface CatalogResult {
  items: ContentItem[]
  total: number
  page: number
  perPage: number
}

export interface PlatformCollection {
  id: string
  name: string
  description: string
  color: string
  itemCount: number
  items: ContentItem[]
}
