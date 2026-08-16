// Contrats compatibles avec les réponses relevées dans les artefacts fournis.
// Ces types décrivent la forme des données, sans dépendre des hôtes analysés.

export interface ObservedApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface ObservedApiError {
  code: number
  message: string
  reason?: string
  metadata?: Record<string, unknown>
}

export interface ObservedImage {
  url: string
  width: number
  height: number
  size: number
  format: string
  thumbnail: string
  blurHash: string
  gif: string | null
  avgHueLight: string
  avgHueDark: string
  id: string
}

export interface ObservedVideoAddress {
  videoId: string
  definition: string
  url: string
  duration: number
  width: number
  height: number
  size: number
  fps: number
  bitrate: number
  type: number
}

export interface ObservedTrailer {
  videoAddress: ObservedVideoAddress
  cover: ObservedImage
}

export interface ObservedDub {
  subjectId: string
  lanName: string
  lanCode: string
  original: boolean
  type: number
  detailPath: string
}

export interface ObservedStaff {
  staffId: string
  staffType: number
  name: string
  character: string
  avatarUrl: string
  detailPath: string
}

/** subjectType relevé : 1 = film, 2 = série. */
export interface ObservedSubject {
  subjectId: string
  subjectType: number
  title: string
  description: string
  releaseDate: string
  /** Durée exprimée en secondes dans les réponses observées. */
  duration: number
  /** Liste de genres sous forme de chaîne séparée par des virgules. */
  genre: string
  cover: ObservedImage
  countryName: string
  imdbRatingValue: string
  subtitles: string
  /** Champ opaque conservé par compatibilité, mais non interprété par le frontend. */
  ops: string
  hasResource: boolean
  trailer: ObservedTrailer | null
  detailPath: string
  staffList: ObservedStaff[]
  appointmentCnt: number
  appointmentDate: string
  corner: string
  imdbRatingCount: number
  stills: ObservedImage | null
  postTitle: string
  season: number
  dubs: ObservedDub[]
  accessStrategy: unknown | null
}

export interface ObservedPager {
  hasMore: boolean
  nextPage: string
  page: string
  perPage: number
  totalCount: number
}

export interface ObservedSubjectListData {
  subjectList: ObservedSubject[]
  pager: ObservedPager
}

export interface ObservedPlatform {
  name: string
  uploadBy: string
}

export interface ObservedBannerItem {
  id: string
  title: string
  image: ObservedImage
  url: string
  subjectId: string
  subjectType: number
  subject: ObservedSubject | null
  detailPath: string
}

export interface ObservedBanner {
  items: ObservedBannerItem[]
}

export interface ObservedFilterItem {
  title: string
  url: string
  query: string
  image: ObservedImage
}

export interface ObservedCustomData {
  rowCount: number
  items: ObservedBannerItem[]
  hiddenTitle: boolean
}

export type ObservedOperatingType =
  | 'BANNER'
  | 'CUSTOM'
  | 'SUBJECTS_MOVIE'
  | 'FILTER'
  | 'APPOINTMENT_LIST'
  | 'SPORT_LIVE'
  | string

export interface ObservedOperatingItem {
  type: ObservedOperatingType
  position: number
  title: string
  subjects: ObservedSubject[]
  banner: ObservedBanner | null
  opId: string
  url: string
  liveList: unknown[]
  filters: ObservedFilterItem[]
  customData: ObservedCustomData | null
  genreTopId: string
  detailPath: string
}

export interface ObservedHomeData {
  platformList: ObservedPlatform[]
  operatingList: ObservedOperatingItem[]
}

export interface ObservedPageMetadata {
  title: string
  keywords?: string
  keyWords?: string
  description: string
  h1?: string
  imageUrl?: string
  image?: string
}

export interface ObservedResolution {
  resolution: number
  epNum: number
}

export interface ObservedResourceSeason {
  se: number
  maxEp: number
  /** Numéros disponibles, conservés sous la forme originale. */
  allEp: string
  resolutions: ObservedResolution[]
}

export interface ObservedResource {
  seasons: ObservedResourceSeason[]
  source: string
  uploadBy: string
}

export interface ObservedPostList {
  pager: ObservedPager
  items: Array<Record<string, unknown>>
}

export interface ObservedDetailData {
  subject: ObservedSubject
  stars: ObservedStaff[]
  resource: ObservedResource
  metadata: ObservedPageMetadata
  isForbid: boolean
  watchTimeLimit: number
  postList: ObservedPostList
  accessStrategy: unknown | null
}

export interface ObservedMonthGroup {
  pager: ObservedPager
  subjects: ObservedSubject[]
  platform: string
  /** Format observé : YYYYMM. */
  month: string
  allMonth: string[]
}

export interface ObservedPlatformPlaylistData {
  pager: ObservedPager
  monthList: ObservedMonthGroup[]
  platform: string
  platformList: ObservedPlatform[]
}
