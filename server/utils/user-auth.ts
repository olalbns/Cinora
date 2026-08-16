import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { SessionUser } from '~/types/user'
const scrypt = promisify(scryptCallback)
const USER_COOKIE = 'cinora_user_session'
const USER_TTL = 60 * 60 * 24 * 30

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = await scrypt(password, salt, 64) as Buffer
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, saltHex, hashHex] = stored.split(':')
  if (algorithm !== 'scrypt' || !saltHex || !hashHex) return false
  const expected = Buffer.from(hashHex, 'hex')
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length) as Buffer
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function tokenKey(token: string): string {
  return `session:user:${createHash('sha256').update(token).digest('hex')}`
}

export async function createUserSession(event: any, user: SessionUser): Promise<void> {
  const token = randomBytes(32).toString('base64url')
  await (await ensureRedis()).set(tokenKey(token), JSON.stringify(user), 'EX', USER_TTL)
  const forwarded = getHeader(event, 'x-forwarded-proto')?.split(',')[0]?.trim()
  const secure = forwarded === 'https' || getRequestURL(event).protocol === 'https:'
  setCookie(event, USER_COOKIE, token, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: USER_TTL })
}

export async function currentUser(event: any): Promise<SessionUser | null> {
  const token = getCookie(event, USER_COOKIE)
  if (!token) return null
  try {
    const value = await (await ensureRedis()).get(tokenKey(token))
    return value ? JSON.parse(value) : null
  } catch { return null }
}

export async function requireUser(event: any): Promise<SessionUser> {
  const user = await currentUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Connexion requise' })
  return user
}

export async function requireRole(event: any, roles: SessionUser['role'][]): Promise<SessionUser> {
  const user = await requireUser(event)
  if (!roles.includes(user.role)) throw createError({ statusCode: 403, statusMessage: 'Droits insuffisants' })
  return user
}

export async function destroyUserSession(event: any): Promise<void> {
  const token = getCookie(event, USER_COOKIE)
  if (token) {
    try { await (await ensureRedis()).del(tokenKey(token)) } catch { /* no-op */ }
  }
  deleteCookie(event, USER_COOKIE, { path: '/' })
}
