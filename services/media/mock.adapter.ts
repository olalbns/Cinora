import type { MediaAdapter } from './contracts'

/** Le mode démo affiche l'image de fond et simule la progression. */
export class MockMediaAdapter implements MediaAdapter {
  async createSession() { return null }
}
