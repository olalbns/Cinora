import { ManagedMediaAdapter } from '~/services/media/managed.adapter'
import type { MediaAdapter } from '~/services/media/contracts'

export function useMediaService(): MediaAdapter {
  return new ManagedMediaAdapter(useRequestFetch() as any)
}
