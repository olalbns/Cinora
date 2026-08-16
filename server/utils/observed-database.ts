import type { ObservedApiResponse, ObservedDetailData, ObservedImage, ObservedPager, ObservedSubject } from '~/types/observed-api'

export function apiOk<T>(data: T): ObservedApiResponse<T> { return { code: 0, message: 'ok', data } }
export function apiPager(page: number, perPage: number, total: number): ObservedPager {
  const hasMore = page * perPage < total
  return { hasMore, nextPage: hasMore ? String(page + 1) : '', page: String(page), perPage, totalCount: total }
}
function image(url: string, id = '0'): ObservedImage {
  return { url: url || '', width: 0, height: 0, size: 0, format: url?.split('.').pop() || '', thumbnail: '', blurHash: '', gif: null, avgHueLight: '', avgHueDark: '', id }
}

export function observedSubject(row: any): ObservedSubject {
  const release = row.release_date ? new Date(row.release_date).toISOString().slice(0,10) : ''
  const subtitles = Array.isArray(row.subtitles) ? row.subtitles.join(',') : String(row.subtitles || '')
  return {
    subjectId: row.id,
    subjectType: Number(row.subject_type),
    title: row.title,
    description: row.description || '',
    releaseDate: release,
    duration: Number(row.duration_seconds || 0),
    genre: Array.isArray(row.genres) ? row.genres.join(',') : '',
    cover: image(row.cover_url, `${row.id}-cover`),
    countryName: row.country_name || '',
    imdbRatingValue: String(row.rating || '0'),
    subtitles,
    ops: '',
    hasResource: Boolean(row.has_resource),
    trailer: row.trailer || null,
    detailPath: row.slug,
    staffList: [],
    appointmentCnt: 0,
    appointmentDate: release,
    corner: row.corner || '',
    imdbRatingCount: Number(row.rating_count || 0),
    stills: row.backdrop_url ? image(row.backdrop_url, `${row.id}-backdrop`) : null,
    postTitle: row.title,
    season: Number(row.season_count || 0),
    dubs: Array.isArray(row.dubs) ? row.dubs : [],
    accessStrategy: row.access_strategy || null
  }
}

export async function listObservedSubjects(where = 's.published=true', values: unknown[] = [], order = 's.popularity DESC', page = 1, perPage = 20) {
  const count = await dbQuery(`SELECT count(*)::int total FROM subjects s WHERE ${where}`, values)
  const queryValues = [...values, perPage, (page - 1) * perPage]
  const rows = await dbQuery(`SELECT s.*, (SELECT count(*)::int FROM seasons se WHERE se.subject_id=s.id) season_count FROM subjects s WHERE ${where} ORDER BY ${order} LIMIT $${queryValues.length-1} OFFSET $${queryValues.length}`, queryValues)
  const total = count.rows[0]?.total || 0
  return { subjectList: rows.rows.map(observedSubject), pager: apiPager(page, perPage, total) }
}

export async function observedDetail(detailPath: string): Promise<ObservedDetailData | null> {
  const result = await dbQuery('SELECT s.*, (SELECT count(*)::int FROM seasons se WHERE se.subject_id=s.id) season_count FROM subjects s WHERE s.slug=$1 AND s.published=true', [detailPath])
  const row = result.rows[0]
  if (!row) return null
  const subject = observedSubject(row)
  const staffResult = await dbQuery('SELECT st.*,ss.character_name FROM staff st JOIN subject_staff ss ON ss.staff_id=st.id WHERE ss.subject_id=$1 ORDER BY ss.credit_order', [row.id])
  const stars = staffResult.rows.map(staff => ({ staffId: staff.id, staffType: staff.staff_type, name: staff.name, character: staff.character_name, avatarUrl: staff.avatar_url, detailPath: staff.slug }))
  subject.staffList = stars
  const seasonsResult = await dbQuery('SELECT * FROM seasons WHERE subject_id=$1 ORDER BY season_number', [row.id])
  const seasons = []
  for (const season of seasonsResult.rows) {
    const episodes = await dbQuery('SELECT episode_number,resolutions FROM episodes WHERE season_id=$1 AND published=true ORDER BY episode_number', [season.id])
    const resolutions = new Map<number, number>()
    for (const episode of episodes.rows) for (const resolution of episode.resolutions || []) resolutions.set(resolution, (resolutions.get(resolution) || 0) + 1)
    seasons.push({ se: season.season_number, maxEp: episodes.rowCount || 0, allEp: episodes.rows.map(value => value.episode_number).join(','), resolutions: [...resolutions].map(([resolution,epNum]) => ({ resolution, epNum })) })
  }
  const comments = await dbQuery('SELECT c.*,u.display_name,u.email FROM comments c JOIN users u ON u.id=c.user_id WHERE c.subject_id=$1 AND c.status=$2 ORDER BY c.created_at DESC LIMIT 20', [row.id,'published'])
  return {
    subject,
    stars,
    resource: { seasons, source: 'cinora.database', uploadBy: 'CINORA' },
    metadata: { title: row.title, description: row.description, keyWords: (row.genres || []).join(','), image: row.backdrop_url || row.cover_url },
    isForbid: Boolean(row.is_forbid),
    watchTimeLimit: Number(row.watch_time_limit || 0),
    postList: {
      pager: apiPager(1, 20, comments.rowCount || 0),
      items: comments.rows.map(comment => ({ postId: comment.id, userId: comment.user_id, title: '', content: comment.content, subjectId: row.id, isSubjectRate: comment.rating != null, subjectRate: comment.rating || 0, status: 1, createdAt: comment.created_at, updatedAt: comment.updated_at, user: { userId: comment.user_id, username: comment.email, nickname: comment.display_name, avatar: '' } }))
    },
    accessStrategy: row.access_strategy || null
  }
}
