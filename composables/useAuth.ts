import type { SessionUser } from '~/types/user'

export function useAuth() {
  const user = useState<SessionUser | null>('session-user', () => null)
  const loaded = useState('session-user-loaded', () => false)
  async function load() {
    if (loaded.value) return user.value
    try { user.value = (await $fetch<{ user: SessionUser | null }>('/api/auth/session')).user }
    catch { user.value = null }
    loaded.value = true
    return user.value
  }
  async function login(email: string, password: string) {
    const response = await $fetch<{ user: SessionUser }>('/api/auth/login', { method: 'POST', body: { email, password } })
    user.value = response.user; loaded.value = true; return response.user
  }
  async function register(displayName: string, email: string, password: string) {
    const response = await $fetch<{ user: SessionUser }>('/api/auth/register', { method: 'POST', body: { displayName, email, password } })
    user.value = response.user; loaded.value = true; return response.user
  }
  async function logout() { await $fetch('/api/auth/logout', { method: 'POST' }); user.value = null; loaded.value = true }
  async function update(payload: Partial<SessionUser>) {
    const response = await $fetch<{ user: SessionUser }>('/api/auth/profile', { method: 'PUT', body: payload })
    user.value = response.user; return response.user
  }
  if (import.meta.client) onMounted(load)
  return { user, loaded, load, login, register, logout, update }
}
