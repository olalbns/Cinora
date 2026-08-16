export default defineNuxtRouteMiddleware(async () => {
  const requestFetch = useRequestFetch()
  try {
    const session = await requestFetch<{ authenticated: boolean }>('/api/admin/auth/session')
    if (!session.authenticated) return navigateTo('/admin/login')
  } catch {
    return navigateTo('/admin/login')
  }
})
