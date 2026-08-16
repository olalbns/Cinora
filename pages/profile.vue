<script setup lang="ts">
const { preferences, hydrate, save } = usePreferences()
const { favorites, history, clearFavorites, clearHistory } = useLibrary()
const { user, load, update, logout } = useAuth()
const { setLocale } = useI18n()
const editing = ref(false), saved = ref(false), saving = ref(false)
const draft = reactive({ ...preferences.value })
const languageOptions = [{code:'fr',label:'Français'},{code:'en',label:'English'},{code:'ar',label:'العربية'},{code:'fil',label:'Filipino'},{code:'hi',label:'हिन्दी'},{code:'id',label:'Indonesia'},{code:'bn',label:'বাংলা'},{code:'ur',label:'اردو'}]
const initials = computed(() => preferences.value.name.split(/\s+/).map(value => value[0]).join('').slice(0, 2).toUpperCase())
function startEdit() { Object.assign(draft, preferences.value); editing.value = true }
async function saveProfile() {
  saving.value = true
  try {
    if (user.value) await update({ displayName: draft.name, preferredLanguage: preferences.value.language, subtitlesEnabled: preferences.value.subtitles, autoplayEnabled: preferences.value.autoplay })
    save({ ...draft }); editing.value = false; saved.value = true; setTimeout(() => saved.value = false, 2200)
  } finally { saving.value = false }
}
async function updatePreference(key: 'subtitles' | 'autoplay', value: boolean) {
  const next = { ...preferences.value, [key]: value }; save(next)
  if (user.value) await update({ displayName: next.name, preferredLanguage: next.language, subtitlesEnabled: next.subtitles, autoplayEnabled: next.autoplay })
}
async function updateLanguage(language: string) {
  const next={...preferences.value,language}; save(next); await setLocale(language as any)
  if(user.value)await update({displayName:next.name,preferredLanguage:language,subtitlesEnabled:next.subtitles,autoplayEnabled:next.autoplay})
}
function removeHistory() { if (confirm('Effacer tout l’historique de lecture ?')) clearHistory() }
function removeFavorites() { if (confirm('Vider entièrement votre liste ?')) clearFavorites() }
async function disconnect(){await logout();await navigateTo('/')}
onMounted(async()=>{hydrate();const session=await load();if(session)save({name:session.displayName,email:session.email,language:session.preferredLanguage,subtitles:session.subtitlesEnabled,autoplay:session.autoplayEnabled});Object.assign(draft,preferences.value)})
useSeoMeta({ title: 'Profil' })
</script>
<template><div class="profile-page page-top container"><header><p class="eyebrow">COMPTE</p><h1>Bonjour, {{ preferences.name.split(' ')[0] }}.</h1><p>{{ user ? 'Vos préférences sont synchronisées avec votre compte.' : 'Vos préférences sont enregistrées localement. Connectez-vous pour les synchroniser.' }}</p></header><section class="profile-card"><div class="profile-card__user"><span>{{ initials }}</span><div v-if="!editing"><h2>{{ preferences.name }}</h2><p>{{ preferences.email }}</p></div><div v-else class="profile-inline-form"><input v-model="draft.name" aria-label="Nom"><input v-model="draft.email" type="email" aria-label="Email" :disabled="Boolean(user)"></div><button v-if="!editing" class="btn btn--outline" @click="startEdit">Modifier</button><div v-else class="profile-edit-actions"><button class="btn btn--outline" @click="editing=false">Annuler</button><button class="btn btn--primary" :disabled="saving||!draft.name||!draft.email" @click="saveProfile">{{ saving?'Enregistrement…':'Enregistrer' }}</button></div></div><p v-if="saved" class="profile-saved"><AppIcon name="check" :size="15"/>Profil enregistré</p><div class="profile-divider"/><div class="settings-list settings-list--functional"><div class="setting-row"><span><AppIcon name="volume"/><span><strong>Langue de l’interface</strong><small>Appliquée immédiatement</small></span></span><div class="select-wrap"><select :value="preferences.language" @change="updateLanguage(($event.target as HTMLSelectElement).value)"><option v-for="language in languageOptions" :key="language.code" :value="language.code">{{ language.label }}</option></select><AppIcon name="chevron-down" :size="15"/></div></div><div class="setting-row"><span><AppIcon name="play"/><span><strong>Lecture automatique</strong><small>Lancer l’épisode suivant</small></span></span><button class="profile-switch" :class="{active:preferences.autoplay}" @click="updatePreference('autoplay',!preferences.autoplay)"><i/></button></div><div class="setting-row"><span><AppIcon name="info"/><span><strong>Sous-titres par défaut</strong><small>Activer la première piste disponible</small></span></span><button class="profile-switch" :class="{active:preferences.subtitles}" @click="updatePreference('subtitles',!preferences.subtitles)"><i/></button></div></div><div class="profile-account-actions"><NuxtLink v-if="!user" to="/login" class="btn btn--primary">Se connecter</NuxtLink><button v-else class="btn btn--outline" @click="disconnect">Se déconnecter</button></div></section><section class="profile-card profile-data-card"><div><p class="eyebrow">BIBLIOTHÈQUE</p><h2>Données personnelles</h2><p>{{ user ? 'Synchronisées dans PostgreSQL.' : 'Enregistrées uniquement dans ce navigateur.' }}</p></div><div class="profile-data-actions"><div><span><strong>{{ history.length }}</strong> éléments dans l’historique</span><button :disabled="!history.length" @click="removeHistory">Effacer</button></div><div><span><strong>{{ favorites.length }}</strong> titres dans ma liste</span><button :disabled="!favorites.length" @click="removeFavorites">Vider</button></div></div></section></div></template>
