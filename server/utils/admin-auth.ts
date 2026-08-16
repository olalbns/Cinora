import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'cinora_admin_session'
const SESSION_TTL = 60 * 60 * 8

function secret(): string {
  const config = useRuntimeConfig()
  const value = String(config.adminSessionSecret || '')
  if (value.length < 32) throw createError({ statusCode: 503, statusMessage: 'NUXT_ADMIN_SESSION_SECRET doit contenir au moins 32 caractères' })
  return value
}

function signature(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function passwordMatches(candidate: string): boolean {
  const expected = Buffer.from(String(useRuntimeConfig().adminPassword || ''))
  const actual = Buffer.from(candidate)
  if (!expected.length || expected.length !== actual.length) return false
  return timingSafeEqual(expected, actual)
}

export function createAdminSession(event: Parameters<typeof setCookie>[0]): void {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL })).toString('base64url')
  const forwardedProtocol = getHeader(event, 'x-forwarded-proto')?.split(',')[0]?.trim()
  const secureRequest = forwardedProtocol === 'https' || getRequestURL(event).protocol === 'https:'
  setCookie(event, COOKIE_NAME, `${payload}.${signature(payload)}`, {
    httpOnly: true,
    // HTTPS derrière un proxy/tunnel, mais autorise aussi http://localhost en preview locale.
    secure: secureRequest,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL
  })
}

export function clearAdminSession(event: Parameters<typeof deleteCookie>[0]): void {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function isAdmin(event: Parameters<typeof getCookie>[0]): boolean {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return false
  const [payload, supplied] = token.split('.')
  if (!payload || !supplied) return false
  const expected = signature(payload)
  const a = Buffer.from(supplied)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { exp: number }
    return Number(data.exp) > Math.floor(Date.now() / 1000)
  } catch { return false }
}

export function requireAdmin(event: Parameters<typeof getCookie>[0]): void {
  if (!isAdmin(event)) throw createError({ statusCode: 401, statusMessage: 'Authentification administrateur requise' })
}
