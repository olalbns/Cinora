export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ displayName?: string; preferredLanguage?: string; subtitlesEnabled?: boolean; autoplayEnabled?: boolean }>(event)
  const result = await dbQuery('UPDATE users SET display_name=$2, preferred_language=$3, subtitles_enabled=$4, autoplay_enabled=$5, updated_at=now() WHERE id=$1 RETURNING id,email,display_name,role,preferred_language,subtitles_enabled,autoplay_enabled', [user.id, String(body.displayName || user.displayName).slice(0,80), String(body.preferredLanguage || user.preferredLanguage).slice(0,10), body.subtitlesEnabled ?? user.subtitlesEnabled, body.autoplayEnabled ?? user.autoplayEnabled])
  const row = result.rows[0]
  const updated = { id: row.id, email: row.email, displayName: row.display_name, role: row.role, preferredLanguage: row.preferred_language, subtitlesEnabled: row.subtitles_enabled, autoplayEnabled: row.autoplay_enabled }
  await destroyUserSession(event)
  await createUserSession(event, updated)
  return { user: updated }
})
