<script setup lang="ts">
import type { PublicSiteSettings, SiteSettings } from '~/types/site-settings'
definePageMeta({ layout: false, middleware: 'admin' })

type Tab = 'overview' | 'content' | 'api' | 'site' | 'navigation' | 'features' | 'seo'
const tabs: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'overview', label: 'Vue d’ensemble', icon: 'grid' },
  { id: 'content', label: 'Catalogue CMS', icon: 'database' },
  { id: 'api', label: 'Sources API', icon: 'layers' },
  { id: 'site', label: 'Identité du site', icon: 'star' },
  { id: 'navigation', label: 'Navigation', icon: 'compass' },
  { id: 'features', label: 'Fonctionnalités', icon: 'settings' },
  { id: 'seo', label: 'SEO & indexation', icon: 'search' }
]
const featureLabels: Record<keyof SiteSettings['features'], { title: string; text: string; icon: string }> = {
  search: { title: 'Recherche', text: 'Recherche globale et suggestions', icon: 'search' },
  favorites: { title: 'Favoris', text: 'Listes personnelles locales', icon: 'heart' },
  history: { title: 'Historique', text: 'Reprise de lecture', icon: 'clock' },
  trending: { title: 'Tendances', text: 'Classement quotidien', icon: 'trending' },
  collections: { title: 'Collections', text: 'Pages studios et plateformes', icon: 'layers' },
  player: { title: 'Lecteur', text: 'Lecture des sessions autorisées', icon: 'play' }
}

const activeTab = ref<Tab>('overview')
const sidebarOpen = ref(false)
const saving = ref(false)
const testing = ref(false)
const dirty = ref(false)
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const testResult = ref<any>(null)
const contentItems = ref<any[]>([]), contentLoading = ref(false), contentError = ref(''), editingContentId = ref<string | null>(null)
const emptyContent = () => ({ id:'', slug:'', subjectType:1, title:'', description:'', releaseDate:'', duration:0, genres:[] as string[], coverUrl:'', backdropUrl:'', countryName:'', rating:0, subtitles:['Français'], corner:'13+', quality:'HD', hasResource:false, popularity:0, featured:false, published:true })
const contentForm = reactive(emptyContent())
const contentGenres = ref('')
const { data: loaded } = await useFetch<SiteSettings>('/api/admin/settings', { key: 'admin-settings' })
const publicConfig = usePublicSiteSettings()
const cloneSettings = (value: SiteSettings) => JSON.parse(JSON.stringify(value)) as SiteSettings
const form = ref<SiteSettings>(cloneSettings(loaded.value!))
let ready = false

onMounted(() => { setTimeout(() => ready = true, 100) })
watch(form, () => { if (ready) dirty.value = true }, { deep: true })

const activeLabel = computed(() => tabs.find(tab => tab.id === activeTab.value)?.label)
const configuredEndpoints = computed(() => Object.values(form.value.api.endpoints).filter(Boolean).length)
const enabledFeatures = computed(() => Object.values(form.value.features).filter(Boolean).length)
const enabledNavigation = computed(() => form.value.navigation.filter(item => item.enabled).length)
const sourceLabel = computed(() => form.value.api.mode === 'database' ? 'PostgreSQL local' : form.value.api.mode === 'api' ? 'API externe' : 'Mode démonstration')
const sourceConfigured = computed(() => form.value.api.mode === 'database' || (form.value.api.mode === 'api' && Boolean(form.value.api.publicBase || form.value.api.serverBase)))

function notify(type: 'success' | 'error', message: string) {
  toast.value = { type, message }
  setTimeout(() => { toast.value = null }, 3200)
}

function toPublicSettings(settings: SiteSettings): PublicSiteSettings {
  return {
    site: settings.site,
    navigation: settings.navigation.filter(item => item.enabled),
    features: settings.features,
    seo: settings.seo,
    updatedAt: settings.updatedAt,
    apiMode: settings.api.mode,
    mediaConfigured: Boolean(settings.api.playbackBase || (settings.api.mode === 'api' && (settings.api.serverBase || settings.api.publicBase)))
  }
}

function broadcastSettings(settings: SiteSettings) {
  const payload = toPublicSettings(settings)
  publicConfig.value = payload
  localStorage.setItem('cinora:settings-sync', JSON.stringify(payload))
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('cinora-settings')
    channel.postMessage(payload)
    channel.close()
  }
}

async function save() {
  saving.value = true
  try {
    const response = await $fetch<{ ok: boolean; settings: SiteSettings }>('/api/admin/settings', { method: 'PUT', body: form.value })
    ready = false
    form.value = cloneSettings(response.settings)
    dirty.value = false
    broadcastSettings(response.settings)
    await nextTick()
    ready = true
    notify('success', 'Configuration enregistrée et appliquée en direct.')
  } catch (cause: any) {
    notify('error', cause?.data?.statusMessage || 'Enregistrement impossible.')
  } finally { saving.value = false }
}

async function testApi() {
  testing.value = true
  testResult.value = null
  try { testResult.value = await $fetch('/api/admin/api-test', { method: 'POST', body: { api: form.value.api } }) }
  catch (cause: any) { testResult.value = { ok: false, message: cause?.data?.statusMessage || 'Test impossible' } }
  finally { testing.value = false }
}

async function logout() {
  await $fetch('/api/admin/auth/logout', { method: 'POST' })
  await navigateTo('/admin/login')
}

function addNav() {
  form.value.navigation.push({ id: `link-${Date.now()}`, label: 'Nouveau lien', to: '/', enabled: true })
}
function removeNav(index: number) { form.value.navigation.splice(index, 1) }
function moveNav(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= form.value.navigation.length) return
  const [item] = form.value.navigation.splice(index, 1)
  form.value.navigation.splice(target, 0, item!)
}
async function loadContent(){contentLoading.value=true;contentError.value='';try{contentItems.value=(await $fetch<any>('/api/admin/content')).items}catch(error:any){contentError.value=error?.data?.statusMessage||'PostgreSQL indisponible. Lancez docker compose up -d.'}finally{contentLoading.value=false}}
function editContent(item:any){editingContentId.value=item.id;Object.assign(contentForm,{id:item.id,slug:item.slug,subjectType:item.subject_type,title:item.title,description:item.description||'',releaseDate:item.release_date?String(item.release_date).slice(0,10):'',duration:item.duration_seconds||0,genres:item.genres||[],coverUrl:item.cover_url||'',backdropUrl:item.backdrop_url||'',countryName:item.country_name||'',rating:Number(item.rating||0),subtitles:item.subtitles||['Français'],corner:item.corner||'13+',quality:item.quality||'HD',hasResource:Boolean(item.has_resource),popularity:item.popularity||0,featured:Boolean(item.featured),published:item.published!==false});contentGenres.value=(item.genres||[]).join(', ')}
function newContent(){editingContentId.value=null;Object.assign(contentForm,emptyContent());contentGenres.value=''}
async function saveContent(){const payload={...contentForm,genres:contentGenres.value.split(',').map(value=>value.trim()).filter(Boolean)};try{if(editingContentId.value)await $fetch(`/api/admin/content/${editingContentId.value}`,{method:'PUT',body:payload});else await $fetch('/api/admin/content',{method:'POST',body:payload});notify('success','Contenu enregistré dans PostgreSQL.');newContent();await loadContent()}catch(error:any){notify('error',error?.data?.statusMessage||'Enregistrement impossible')}}
async function deleteContent(id:string){if(!confirm('Supprimer définitivement ce contenu ?'))return;await $fetch(`/api/admin/content/${id}`,{method:'DELETE'});await loadContent()}
function selectTab(tab: Tab) { activeTab.value = tab; sidebarOpen.value = false; if(tab==='content'&&!contentItems.value.length)loadContent() }
useSeoMeta({ title: 'Dashboard', robots: 'noindex,nofollow' })
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar" :class="{ 'admin-sidebar--open': sidebarOpen }">
      <div class="admin-sidebar__brand"><span>{{ form.site.shortName }}</span><strong>{{ form.site.name }}</strong><small>CONTROL ROOM</small></div>
      <nav>
        <button v-for="tab in tabs" :key="tab.id" :class="{ active: activeTab === tab.id }" @click="selectTab(tab.id)"><AppIcon :name="tab.icon" :size="19" /><span>{{ tab.label }}</span><i /></button>
      </nav>
      <div class="admin-sidebar__bottom">
        <div class="admin-environment"><span :class="form.api.mode" /><div><small>ENVIRONNEMENT</small><strong>{{ sourceLabel }}</strong></div></div>
        <NuxtLink to="/" target="_blank"><AppIcon name="external" :size="18" />Voir le site<AppIcon name="arrow-right" :size="15" /></NuxtLink>
        <button @click="logout"><AppIcon name="arrow-left" :size="18" />Se déconnecter</button>
      </div>
    </aside>
    <button v-if="sidebarOpen" class="admin-sidebar-backdrop" @click="sidebarOpen = false" />

    <main class="admin-main">
      <header class="admin-topbar">
        <button class="admin-menu-btn" @click="sidebarOpen = true"><AppIcon name="menu" /></button>
        <div><p>ADMINISTRATION</p><h1>{{ activeLabel }}</h1></div>
        <div class="admin-topbar__actions"><span v-if="dirty" class="admin-unsaved">Modifications non enregistrées</span><button class="admin-save-btn" :disabled="saving || !dirty" @click="save"><span v-if="saving" class="spinner" /><AppIcon v-else name="check" :size="18" />{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button><div class="admin-avatar">AM</div></div>
      </header>

      <div class="admin-content">
        <section v-if="activeTab === 'overview'" class="admin-view">
          <div class="admin-welcome"><div><p class="admin-kicker">BONJOUR, ALEX</p><h2>Votre plateforme,<br><em>sous contrôle.</em></h2><p>Surveillez la configuration, connectez vos sources et personnalisez l’expérience sans modifier le code.</p></div><div class="admin-welcome__orb"><span>{{ form.site.shortName }}</span></div></div>
          <div class="admin-stats">
            <article><span><AppIcon name="layers" /></span><div><small>SOURCES</small><strong>{{ sourceLabel }}</strong><p><i :class="form.api.mode" />{{ sourceConfigured ? 'Configuration active' : 'Données locales sans base' }}</p></div></article>
            <article><span><AppIcon name="grid" /></span><div><small>ENDPOINTS</small><strong>{{ configuredEndpoints }}/7</strong><p>Format compatible configuré</p></div></article>
            <article><span><AppIcon name="settings" /></span><div><small>FONCTIONNALITÉS</small><strong>{{ enabledFeatures }}/6</strong><p>{{ enabledFeatures }} modules disponibles</p></div></article>
            <article><span><AppIcon name="compass" /></span><div><small>NAVIGATION</small><strong>{{ enabledNavigation }}</strong><p>Liens actuellement visibles</p></div></article>
          </div>
          <div class="admin-two-columns">
            <section class="admin-panel"><div class="admin-panel__heading"><div><p class="admin-kicker">ÉTAT DU SYSTÈME</p><h3>Configuration active</h3></div><span class="admin-status-pill">OPÉRATIONNEL</span></div><div class="admin-health-list"><div><span><i class="ok" />Frontend Nuxt</span><strong>Disponible</strong></div><div><span><i :class="sourceConfigured ? 'ok' : 'idle'" />API catalogue</span><strong>{{ sourceConfigured ? sourceLabel : 'En attente' }}</strong></div><div><span><i class="ok" />Stockage des réglages</span><strong>Local sécurisé</strong></div><div><span><i :class="form.seo.indexable ? 'ok' : 'idle'" />Indexation SEO</span><strong>{{ form.seo.indexable ? 'Autorisée' : 'Bloquée' }}</strong></div></div></section>
            <section class="admin-panel"><div class="admin-panel__heading"><div><p class="admin-kicker">ACCÈS RAPIDE</p><h3>Actions fréquentes</h3></div></div><div class="admin-quick-actions"><button @click="activeTab = 'api'"><span><AppIcon name="layers" /></span><div><strong>Configurer les API</strong><small>URLs, endpoints et connexion</small></div><AppIcon name="chevron-right" /></button><button @click="activeTab = 'site'"><span><AppIcon name="star" /></span><div><strong>Modifier l’identité</strong><small>Nom, couleur et coordonnées</small></div><AppIcon name="chevron-right" /></button><button @click="activeTab = 'navigation'"><span><AppIcon name="compass" /></span><div><strong>Organiser le menu</strong><small>{{ enabledNavigation }} liens visibles</small></div><AppIcon name="chevron-right" /></button></div></section>
          </div>
        </section>

        <section v-else-if="activeTab === 'content'" class="admin-view">
          <div class="admin-section-intro"><div><p class="admin-kicker">POSTGRESQL</p><h2>Catalogue CMS</h2><p>Créez, modifiez et publiez les contenus réellement servis par les API locales.</p></div><button class="admin-secondary-btn" @click="newContent"><AppIcon name="plus"/>Nouveau contenu</button></div>
          <div v-if="contentError" class="admin-test-result error"><span><AppIcon name="info"/></span><div><strong>Base indisponible</strong><p>{{ contentError }}</p></div><button class="admin-secondary-btn" @click="loadContent">Réessayer</button></div>
          <div class="admin-cms-layout"><section class="admin-panel admin-content-list"><div class="admin-panel__heading"><div><h3>Contenus</h3><p>{{ contentItems.length }} entrées</p></div><button @click="loadContent"><AppIcon name="refresh"/></button></div><div v-if="contentLoading" class="admin-cms-loading"><span class="spinner"/>Chargement…</div><article v-for="item in contentItems" :key="item.id" :class="{active:editingContentId===item.id}" @click="editContent(item)"><img :src="item.cover_url||'/images/poster-room.jpg'" :alt="item.title"><div><strong>{{ item.title }}</strong><span>{{ item.subject_type===2?'Série':'Film' }} · {{ item.release_date?String(item.release_date).slice(0,4):'—' }}</span><small :class="{published:item.published}">{{ item.published?'Publié':'Brouillon' }}</small></div><button aria-label="Supprimer" @click.stop="deleteContent(item.id)"><AppIcon name="close"/></button></article></section>
          <section class="admin-panel admin-form-panel"><div class="admin-panel__heading"><div><h3>{{ editingContentId?'Modifier le contenu':'Nouveau contenu' }}</h3><p>Les champs sont persistés immédiatement dans PostgreSQL.</p></div></div><div class="admin-form-grid"><label><span>Titre</span><input v-model="contentForm.title"></label><label><span>Slug</span><input v-model="contentForm.slug" placeholder="mon-film"></label><label><span>Format</span><select v-model.number="contentForm.subjectType"><option :value="1">Film</option><option :value="2">Série</option></select></label><label><span>Date de sortie</span><input v-model="contentForm.releaseDate" type="date"></label><label class="wide"><span>Synopsis</span><textarea v-model="contentForm.description" rows="4"/></label><label class="wide"><span>Genres séparés par des virgules</span><input v-model="contentGenres" placeholder="Drame, Thriller"></label><label class="wide"><span>URL de l’affiche</span><input v-model="contentForm.coverUrl"></label><label class="wide"><span>URL de l’arrière-plan</span><input v-model="contentForm.backdropUrl"></label><label><span>Durée en secondes</span><input v-model.number="contentForm.duration" type="number" min="0"></label><label><span>Note</span><input v-model.number="contentForm.rating" type="number" min="0" max="10" step="0.1"></label><label><span>Popularité</span><input v-model.number="contentForm.popularity" type="number" min="0"></label><label><span>Qualité</span><select v-model="contentForm.quality"><option>HD</option><option>4K</option><option>4K HDR</option></select></label><label class="admin-check"><input v-model="contentForm.published" type="checkbox"><span>Publié</span></label><label class="admin-check"><input v-model="contentForm.featured" type="checkbox"><span>À la une</span></label></div><div class="admin-cms-actions"><button class="admin-secondary-btn" @click="newContent">Réinitialiser</button><button class="admin-save-btn" :disabled="!contentForm.title||!contentForm.slug" @click="saveContent"><AppIcon name="check"/>Enregistrer le contenu</button></div></section></div>
        </section>

        <section v-else-if="activeTab === 'api'" class="admin-view">
          <div class="admin-section-intro"><div><p class="admin-kicker">SOURCES DE DONNÉES</p><h2>Connexion aux API</h2><p>Configurez votre propre backend compatible. Les URL restent côté serveur et les hôtes analysés sont refusés.</p></div><button class="admin-secondary-btn" :disabled="testing" @click="testApi"><span v-if="testing" class="spinner" /><AppIcon v-else name="activity" />{{ testing ? 'Test en cours…' : 'Tester /home' }}</button></div>
          <div v-if="testResult" class="admin-test-result" :class="testResult.ok ? 'success' : 'error'"><span><AppIcon :name="testResult.ok ? 'check' : 'info'" /></span><div><strong>{{ testResult.ok ? 'Connexion réussie' : 'Échec du test' }}</strong><p>{{ testResult.message }}</p></div><dl v-if="testResult.ok"><div><dt>Latence</dt><dd>{{ testResult.latency }} ms</dd></div><div><dt>Rangées</dt><dd>{{ testResult.operations }}</dd></div><div><dt>Plateformes</dt><dd>{{ testResult.platforms }}</dd></div></dl></div>
          <section class="admin-panel admin-form-panel"><div class="admin-panel__heading"><div><h3>Environnement</h3><p>Le changement de mode est appliqué au prochain chargement des pages.</p></div></div><div class="admin-mode-picker"><button :class="{ active: form.api.mode === 'mock' }" @click="form.api.mode = 'mock'"><span><AppIcon name="grid" /></span><div><strong>Mode démonstration</strong><small>Données locales sans base de données</small></div><i /></button><button :class="{ active: form.api.mode === 'database' }" @click="form.api.mode = 'database'"><span><AppIcon name="database" /></span><div><strong>PostgreSQL local</strong><small>Backend complet fourni avec Docker</small></div><i /></button><button :class="{ active: form.api.mode === 'api' }" @click="form.api.mode = 'api'"><span><AppIcon name="layers" /></span><div><strong>API externe</strong><small>Votre BFF compatible devient la source</small></div><i /></button></div></section>
          <section class="admin-panel admin-form-panel"><div class="admin-panel__heading"><div><h3>Adresses principales</h3><p>Ne placez jamais de jeton ou de mot de passe dans ces URL.</p></div></div><div class="admin-form-grid"><label class="wide"><span>URL publique du BFF <small>OBLIGATOIRE EN MODE API</small></span><div class="admin-input-with-icon"><AppIcon name="link" /><input v-model="form.api.publicBase" type="url" placeholder="https://api.votre-domaine.com/wefeed-h5api-bff"></div><small>Utilisée comme base pour tous les endpoints compatibles.</small></label><label class="wide"><span>URL serveur privée <small>FACULTATIF</small></span><div class="admin-input-with-icon"><AppIcon name="layers" /><input v-model="form.api.serverBase" placeholder="http://content-bff.production"></div><small>Prioritaire côté SSR. Cette adresse n’est jamais exposée au navigateur.</small></label><label class="wide"><span>Base de l’API média <small>LECTURE RÉELLE</small></span><div class="admin-input-with-icon"><AppIcon name="play" /><input v-model="form.api.playbackBase" placeholder="https://media-api.votre-domaine.com"></div><small>Utilisée uniquement pour créer les sessions de lecture signées.</small></label><label><span>Timeout</span><div class="admin-input-suffix"><input v-model.number="form.api.timeout" type="number" min="1000" max="60000"><b>ms</b></div></label><label><span>callerSource</span><input v-model="form.api.callerSource" placeholder="node-frontend"></label></div></section>
          <section class="admin-panel admin-form-panel"><div class="admin-panel__heading"><div><h3>Routes compatibles</h3><p>Chaque chemin doit commencer par <code>/</code>.</p></div><span>{{ configuredEndpoints }} endpoints</span></div><div class="admin-endpoint-list"><label v-for="(value, key) in form.api.endpoints" :key="key"><span><i :class="key === 'search' || key === 'filter' || key === 'playbackSession' ? 'post' : 'get'">{{ key === 'search' || key === 'filter' || key === 'playbackSession' ? 'POST' : 'GET' }}</i><strong>{{ key }}</strong></span><input v-model="form.api.endpoints[key]" /></label></div></section>
        </section>

        <section v-else-if="activeTab === 'site'" class="admin-view">
          <div class="admin-section-intro"><div><p class="admin-kicker">MARQUE & APPARENCE</p><h2>Identité du site</h2><p>Les changements enregistrés apparaissent sur le frontend au prochain chargement.</p></div></div>
          <div class="admin-two-columns admin-two-columns--form"><section class="admin-panel admin-form-panel"><div class="admin-panel__heading"><div><h3>Informations principales</h3><p>Utilisées dans l’en-tête, le pied de page et les métadonnées.</p></div></div><div class="admin-form-grid"><label><span>Nom de la plateforme</span><input v-model="form.site.name" maxlength="40"></label><label><span>Monogramme</span><input v-model="form.site.shortName" maxlength="3"></label><label class="wide"><span>Slogan</span><input v-model="form.site.tagline" maxlength="120"></label><label class="wide"><span>Email de support</span><input v-model="form.site.supportEmail" type="email"></label><label class="wide"><span>URL du logo <small>FACULTATIF</small></span><input v-model="form.site.logoUrl" type="url" placeholder="https://cdn.votre-domaine.com/logo.svg"></label></div></section><aside class="admin-brand-preview" :style="{ '--preview-accent': form.site.accent }"><p>APERÇU</p><div class="admin-brand-preview__nav"><span>{{ form.site.shortName }}</span><strong>{{ form.site.name }}</strong><i /><small>Accueil</small><small>Films</small><b>AM</b></div><div class="admin-brand-preview__hero"><em>UNE CRÉATION {{ form.site.name }}</em><h3>Votre histoire<br>commence ici.</h3><p>{{ form.site.tagline }}</p><button><AppIcon name="play" :size="15" />Regarder</button></div></aside></div>
          <section class="admin-panel admin-form-panel"><div class="admin-panel__heading"><div><h3>Couleur de marque</h3><p>Utilisée pour les boutons, indicateurs et éléments actifs.</p></div></div><div class="admin-color-setting"><input v-model="form.site.accent" type="color"><div><strong>{{ form.site.accent }}</strong><small>Format hexadécimal</small></div><div class="admin-color-swatches"><button v-for="color in ['#e5092b','#ff5a1f','#7c3aed','#2563eb','#059669','#d6a43b']" :key="color" :style="{ background: color }" :class="{ active: form.site.accent === color }" @click="form.site.accent = color" /></div></div></section>
        </section>

        <section v-else-if="activeTab === 'navigation'" class="admin-view">
          <div class="admin-section-intro"><div><p class="admin-kicker">STRUCTURE</p><h2>Navigation principale</h2><p>Modifiez les libellés, destinations et liens visibles dans l’en-tête.</p></div><button class="admin-secondary-btn" @click="addNav"><AppIcon name="plus" />Ajouter un lien</button></div>
          <section class="admin-panel admin-form-panel"><div class="admin-nav-list"><article v-for="(item, index) in form.navigation" :key="item.id"><div class="admin-order-buttons"><button :disabled="index === 0" aria-label="Monter" @click="moveNav(index, -1)">↑</button><button :disabled="index === form.navigation.length - 1" aria-label="Descendre" @click="moveNav(index, 1)">↓</button></div><label><span>Libellé</span><input v-model="item.label"></label><label><span>Destination</span><input v-model="item.to"></label><label class="admin-switch-label"><span>Visible</span><button class="admin-switch" :class="{ active: item.enabled }" @click="item.enabled = !item.enabled"><i /></button></label><button class="admin-delete" aria-label="Supprimer" @click="removeNav(index)"><AppIcon name="close" /></button></article></div></section>
        </section>

        <section v-else-if="activeTab === 'features'" class="admin-view">
          <div class="admin-section-intro"><div><p class="admin-kicker">MODULES</p><h2>Fonctionnalités</h2><p>Activez uniquement les fonctions nécessaires à votre expérience.</p></div></div>
          <div class="admin-feature-grid"><button v-for="(meta, key) in featureLabels" :key="key" :class="{ active: form.features[key] }" @click="form.features[key] = !form.features[key]"><span><AppIcon :name="meta.icon" /></span><div><strong>{{ meta.title }}</strong><small>{{ meta.text }}</small></div><i><b /></i></button></div>
          <div class="admin-notice"><AppIcon name="info" /><div><strong>À savoir</strong><p>Désactiver une fonctionnalité masque ses accès dans la navigation. Les données déjà enregistrées dans le navigateur ne sont pas supprimées.</p></div></div>
        </section>

        <section v-else-if="activeTab === 'seo'" class="admin-view">
          <div class="admin-section-intro"><div><p class="admin-kicker">VISIBILITÉ</p><h2>SEO & indexation</h2><p>Définissez les métadonnées globales et contrôlez l’accès des moteurs de recherche.</p></div></div>
          <section class="admin-panel admin-form-panel"><div class="admin-panel__heading"><div><h3>Métadonnées générales</h3><p>Valeurs de repli pour les pages sans métadonnées spécifiques.</p></div></div><div class="admin-form-grid"><label class="wide"><span>Suffixe des titres</span><input v-model="form.seo.titleSuffix" maxlength="60"><small>Exemple : « Accueil · {{ form.seo.titleSuffix }} »</small></label><label class="wide"><span>Description</span><textarea v-model="form.seo.description" rows="4" maxlength="240" /><small>{{ form.seo.description.length }}/240 caractères</small></label></div></section>
          <section class="admin-panel admin-indexing"><div><span :class="{ active: form.seo.indexable }"><AppIcon :name="form.seo.indexable ? 'check' : 'close'" /></span><div><h3>Indexation publique</h3><p>{{ form.seo.indexable ? 'Les moteurs de recherche peuvent indexer le site.' : 'Les pages envoient actuellement noindex, nofollow.' }}</p></div></div><button class="admin-switch" :class="{ active: form.seo.indexable }" @click="form.seo.indexable = !form.seo.indexable"><i /></button></section>
        </section>
      </div>
    </main>

    <Transition name="admin-toast"><div v-if="toast" class="admin-toast" :class="toast.type"><AppIcon :name="toast.type === 'success' ? 'check' : 'info'" /><span>{{ toast.message }}</span></div></Transition>
  </div>
</template>
