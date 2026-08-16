interface UserPreferences {
  name: string
  email: string
  language: string
  subtitles: boolean
  autoplay: boolean
}

export function usePreferences() {
  const preferences = useState<UserPreferences>('user-preferences', () => ({
    name: 'Alex Martin',
    email: 'alex@exemple.com',
    language: 'Français',
    subtitles: true,
    autoplay: true
  }))
  const hydrated = useState('preferences-hydrated', () => false)

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    try {
      const saved = JSON.parse(localStorage.getItem('cinora:preferences') || '{}')
      preferences.value = { ...preferences.value, ...saved }
    } catch { /* Conserver les valeurs par défaut. */ }
    hydrated.value = true
  }
  function save(next: UserPreferences) {
    preferences.value = { ...next }
    if (import.meta.client) localStorage.setItem('cinora:preferences', JSON.stringify(preferences.value))
  }
  if (import.meta.client) onMounted(hydrate)
  return { preferences, hydrate, save }
}
