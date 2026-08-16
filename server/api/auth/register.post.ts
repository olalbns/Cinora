export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'register', 5, 3600)
  const body = await readBody<{ email?: string; password?: string; displayName?: string }>(event)
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')
  const displayName = String(body?.displayName || '').trim().slice(0, 80)
  if (!/^\S+@\S+\.\S+$/.test(email)) throw createError({ statusCode: 400, statusMessage: 'Adresse email invalide' })
  if (password.length < 10 || password.length > 200) throw createError({ statusCode: 400, statusMessage: 'Le mot de passe doit contenir au moins 10 caractères' })
  if (displayName.length < 2) throw createError({ statusCode: 400, statusMessage: 'Nom incomplet' })
  try {
    const result = await dbQuery('INSERT INTO users(email,password_hash,display_name) VALUES($1,$2,$3) RETURNING id,email,display_name,role,preferred_language,subtitles_enabled,autoplay_enabled', [email, await hashPassword(password), displayName])
    const row = result.rows[0]
    const user = { id: row.id, email: row.email, displayName: row.display_name, role: row.role, preferredLanguage: row.preferred_language, subtitlesEnabled: row.subtitles_enabled, autoplayEnabled: row.autoplay_enabled }
    await createUserSession(event, user)
    return { user }
  } catch (error: any) {
    if (error?.code === '23505') throw createError({ statusCode: 409, statusMessage: 'Un compte existe déjà avec cet email' })
    throw error
  }
})
