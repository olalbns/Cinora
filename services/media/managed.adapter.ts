import type { MediaAdapter, PlaybackRequest, PlaybackSession } from './contracts'

type Fetcher = <T>(request: string, options?: Record<string, unknown>) => Promise<T>

export class ManagedMediaAdapter implements MediaAdapter {
  constructor(private readonly fetcher: Fetcher) {}
  async createSession(request: PlaybackRequest): Promise<PlaybackSession | null> {
    const response = await this.fetcher<{ session: PlaybackSession | null }>('/api/catalog/playback', { method: 'POST', body: request })
    return response.session
  }
}
