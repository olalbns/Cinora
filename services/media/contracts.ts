export interface SubtitleTrack {
  label: string
  language: string
  url: string
  default?: boolean
}

export interface PlaybackSession {
  /** URL MP4 signée ou manifeste HLS autorisé. Évitez les URL permanentes. */
  streamUrl: string
  format: 'mp4' | 'hls'
  expiresAt?: string
  subtitles?: SubtitleTrack[]
}

export interface PlaybackRequest {
  contentId: string
  season?: number
  episode?: number
}

export interface MediaAdapter {
  createSession(request: PlaybackRequest): Promise<PlaybackSession | null>
}
