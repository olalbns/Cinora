export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'user-login', 8, 900)
  const body = await readBody<{ email?: string; password?: string }>(event)
  const email = String(body?.email || '').trim().toLowerCase()
  const result = await dbQuery('SELECT id,email,password_hash,display_name,role,preferred_language,subtitles_enabled,autoplay_enabled FROM users WHERE email=$1', [email])
  const row = result.rows[0]
  if (!row || !await verifyPassword(String(body?.password || ''), row.password_hash)) {
    await new Promise(resolve => setTimeout(resolve, 300))
    throw createError({ statusCode: 401, statusMessage: 'Email ou mot de passe incorrect' })
  }
  const user = { id: row.id, email: row.email, displayName: row.display_name, role: row.role, preferredLanguage: row.preferred_language, subtitlesEnabled: row.subtitles_enabled, autoplayEnabled: row.autoplay_enabled }
  await createUserSession(event, user)
  return { user }
})
