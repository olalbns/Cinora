import type { CatalogFilters, CatalogResult, ContentItem, HomePayload, HomeSection, PlatformCollection, Season } from '~/types/content'
import type { ContentAdapter } from './contracts'

interface SubjectRow {
  id: string; slug: string; subject_type: number; title: string; description: string; release_date: string | null
  duration_seconds: number; genres: string[]; cover_url: string; backdrop_url: string; country_name: string
  rating: string | number; subtitles: string[]; corner: string; quality: string; popularity: number; featured: boolean
  platform_name?: string; cast_names?: string[]
}

export class DatabaseContentAdapter implements ContentAdapter {
  private normalize(row: SubjectRow, seasons?: Season[]): ContentItem {
    const year = row.release_date ? Number(String(row.release_date).slice(0, 4)) : new Date().getFullYear()
    const rating = Number(row.rating || 0)
    return {
      id: row.id, slug: row.slug, title: row.title, synopsis: row.description, year, rating,
      match: Math.min(99, Math.max(70, Math.round(80 + rating * 2))),
      duration: Math.max(1, Math.round(Number(row.duration_seconds || 0) / 60)),
      ageRating: row.corner || '13+', genres: row.genres || [], type: row.subject_type === 2 ? 'series' : 'movie',
      image: row.cover_url || '/images/poster-signal.jpg', backdrop: row.backdrop_url || row.cover_url || '/images/hero-eclipse.jpg',
      quality: ['HD','4K','4K HDR'].includes(row.quality) ? row.quality as ContentItem['quality'] : 'HD',
      isNew: year >= new Date().getFullYear() - 1, platform: row.platform_name || 'CINORA', cast: row.cast_names || [],
      director: 'Non renseigné', audio: row.subtitles?.length ? row.subtitles : ['Version originale'], seasons
    }
  }

  private async rowsToItems(rows: SubjectRow[]): Promise<ContentItem[]> { return rows.map(row => this.normalize(row)) }

  private baseSelect(): string {
    return `SELECT s.*, COALESCE((SELECT p.name FROM platforms p JOIN subject_platforms sp ON sp.platform_id=p.id WHERE sp.subject_id=s.id ORDER BY p.position LIMIT 1),'CINORA') platform_name,
      COALESCE((SELECT array_agg(st.name ORDER BY ss.credit_order) FROM staff st JOIN subject_staff ss ON ss.staff_id=st.id WHERE ss.subject_id=s.id),'{}') cast_names
      FROM subjects s`
  }

  async getHome(): Promise<HomePayload> {
    const sectionsResult = await dbQuery('SELECT * FROM home_sections WHERE active=true ORDER BY position')
    const sections: HomeSection[] = []
    let hero: ContentItem | undefined
    for (const section of sectionsResult.rows) {
      const result = await dbQuery<SubjectRow>(`${this.baseSelect()} JOIN home_section_items hi ON hi.subject_id=s.id WHERE hi.section_id=$1 AND s.published=true AND s.is_forbid=false ORDER BY hi.position`, [section.id])
      const items = await this.rowsToItems(result.rows)
      if (section.section_type === 'BANNER' && items[0]) hero = items[0]
      else if (items.length) sections.push({ id: section.id, title: section.title, items, ranked: String(section.title).toLowerCase().includes('top') })
    }
    if (!hero) {
      const result = await dbQuery<SubjectRow>(`${this.baseSelect()} WHERE s.published=true AND s.is_forbid=false ORDER BY s.featured DESC,s.popularity DESC LIMIT 1`)
      hero = this.normalize(result.rows[0]!)
    }
    return { hero, sections }
  }

  async getBySlug(slug: string): Promise<ContentItem | null> {
    const result = await dbQuery<SubjectRow>(`${this.baseSelect()} WHERE s.slug=$1 AND s.published=true AND s.is_forbid=false`, [slug])
    const row = result.rows[0]
    if (!row) return null
    let seasons: Season[] | undefined
    if (row.subject_type === 2) {
      const seasonRows = await dbQuery('SELECT * FROM seasons WHERE subject_id=$1 ORDER BY season_number', [row.id])
      seasons = []
      for (const season of seasonRows.rows) {
        const episodes = await dbQuery('SELECT * FROM episodes WHERE season_id=$1 AND published=true ORDER BY episode_number', [season.id])
        seasons.push({ number: season.season_number, title: season.title || `Saison ${season.season_number}`, episodes: episodes.rows.map(ep => ({ id: ep.id, number: ep.episode_number, title: ep.title, synopsis: ep.description, duration: Math.max(1,Math.round(ep.duration_seconds/60)), thumbnail: ep.thumbnail_url || row.backdrop_url })) })
      }
    }
    return this.normalize(row, seasons)
  }

  async search(query: string, limit = 20): Promise<ContentItem[]> {
    const result = await dbQuery<SubjectRow>(`${this.baseSelect()} WHERE s.published=true AND s.is_forbid=false AND (s.title ILIKE $1 OR s.description ILIKE $1 OR $2=ANY(s.genres)) ORDER BY similarity(s.title,$3) DESC NULLS LAST,s.popularity DESC LIMIT $4`, [`%${query}%`, query, query, limit]).catch(() => dbQuery<SubjectRow>(`${this.baseSelect()} WHERE s.published=true AND s.is_forbid=false AND (s.title ILIKE $1 OR s.description ILIKE $1) ORDER BY s.popularity DESC LIMIT $2`, [`%${query}%`, limit]))
    return this.rowsToItems(result.rows)
  }

  async getCatalog(filters: CatalogFilters): Promise<CatalogResult> {
    const clauses = ['s.published=true','s.is_forbid=false']
    const values: unknown[] = []
    const param = (value: unknown) => { values.push(value); return `$${values.length}` }
    if (filters.query) { const p = param(`%${filters.query}%`); clauses.push(`(s.title ILIKE ${p} OR s.description ILIKE ${p})`) }
    if (filters.type && filters.type !== 'all') clauses.push(`s.subject_type=${param(filters.type === 'movie' ? 1 : 2)}`)
    if (filters.genre && filters.genre !== 'Tous') clauses.push(`${param(filters.genre)}=ANY(s.genres)`)
    if (filters.year && filters.year !== 'Toutes') clauses.push(`EXTRACT(YEAR FROM s.release_date)=${param(Number(filters.year))}`)
    if (filters.minRating) clauses.push(`s.rating>=${param(filters.minRating)}`)
    const where = clauses.join(' AND ')
    const count = await dbQuery(`SELECT count(*)::int total FROM subjects s WHERE ${where}`, values)
    const page = filters.page || 1, perPage = filters.perPage || 24
    const sort = filters.sort === 'recent' ? 's.release_date DESC' : filters.sort === 'rating' ? 's.rating DESC' : filters.sort === 'title' ? 's.title ASC' : 's.popularity DESC'
    values.push(perPage, (page - 1) * perPage)
    const result = await dbQuery<SubjectRow>(`${this.baseSelect()} WHERE ${where} ORDER BY ${sort} LIMIT $${values.length-1} OFFSET $${values.length}`, values)
    return { items: await this.rowsToItems(result.rows), total: count.rows[0]?.total || 0, page, perPage }
  }

  async getTrending(): Promise<ContentItem[]> {
    const result = await dbQuery<SubjectRow>(`${this.baseSelect()} WHERE s.published=true AND s.is_forbid=false ORDER BY s.popularity DESC LIMIT 20`)
    return (await this.rowsToItems(result.rows)).map((item,index) => ({ ...item, trendingRank: index + 1 }))
  }

  async getPlatforms(): Promise<PlatformCollection[]> {
    const platformRows = await dbQuery('SELECT * FROM platforms WHERE active=true ORDER BY position')
    const output: PlatformCollection[] = []
    for (const platform of platformRows.rows) {
      const result = await dbQuery<SubjectRow>(`${this.baseSelect()} JOIN subject_platforms sx ON sx.subject_id=s.id WHERE sx.platform_id=$1 AND s.published=true AND s.is_forbid=false ORDER BY sx.added_at DESC`, [platform.id])
      output.push({ id: platform.id, name: platform.name, description: platform.description, color: platform.color, itemCount: result.rowCount || 0, items: await this.rowsToItems(result.rows) })
    }
    return output
  }
}
