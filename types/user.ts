export interface SessionUser {
  id: string
  email: string
  displayName: string
  role: 'user' | 'editor' | 'admin'
  preferredLanguage: string
  subtitlesEnabled: boolean
  autoplayEnabled: boolean
}
