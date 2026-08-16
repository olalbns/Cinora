import { ManagedContentAdapter } from '~/services/content/managed.adapter'
import type { ContentAdapter } from '~/services/content/contracts'

/**
 * Le frontend parle uniquement aux routes Nitro locales. Nitro sélectionne à
 * chaque requête le mode mock ou l'API configurée depuis le dashboard privé.
 */
export function useContentService(): ContentAdapter {
  const requestFetch = useRequestFetch()
  return new ManagedContentAdapter(requestFetch as any)
}
