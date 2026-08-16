import type { MediaAdapter, PlaybackRequest, PlaybackSession } from './contracts'

/**
 * Connexion lecteur : adaptez uniquement ce fichier à votre backend autorisé.
 * Le backend devrait vérifier les droits, puis renvoyer une URL signée à durée
 * courte. Pour les flux HLS nécessitant hls.js, ajoutez un plugin client.
 */
export class ApiMediaAdapter implements MediaAdapter {
  constructor(private baseUrl: string, private timeout = 10000) {
    try {
      const hostname = new URL(baseUrl).hostname
      if (/(^|\.)(aoneroom\.com|123moviesfree\.club)$/i.test(hostname)) {
        throw new Error('Le lecteur accepte uniquement votre propre backend média autorisé.')
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('backend média autorisé')) throw error
    }
  }

  async createSession(request: PlaybackRequest) {
    const response = await $fetch<PlaybackSession | { data: PlaybackSession }>('/playback/session', {
      baseURL: this.baseUrl,
      method: 'POST',
      body: request,
      credentials: 'include',
      timeout: this.timeout,
      headers: { Accept: 'application/json' }
      // TODO AUTH : ajoutez votre jeton dans l'en-tête Authorization si requis.
    })
    return response && 'data' in response ? response.data : response
  }
}
